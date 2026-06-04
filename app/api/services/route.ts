import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { ServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { createDemoService, demoMode, filterDemoServices } from "@/lib/demo-data";

type ServiceBody = Record<string, string | string[]>;

function cleanSegment(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function isImageFile(item: FormDataEntryValue): item is File {
  return typeof item !== "string" && item.size > 0 && ["image/jpeg", "image/png", "image/webp"].includes(item.type);
}

function imageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function parseServiceBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return request.json() as Promise<ServiceBody>;
  }

  const form = await request.formData();
  const body: ServiceBody = {};
  for (const [key, value] of form.entries()) {
    if (key === "photoFiles") continue;
    if (typeof value !== "string") continue;
    if (body[key]) {
      body[key] = Array.isArray(body[key]) ? [...body[key], value] : [String(body[key]), value];
    } else {
      body[key] = value;
    }
  }

  const uploadedUrls = await saveServiceImages(form.getAll("photoFiles"), String(body.name || "servicio"));
  const externalUrls = String(body.images || "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  body.images = [...uploadedUrls, ...externalUrls].join("\n");
  return body;
}

async function saveServiceImages(files: FormDataEntryValue[], serviceName: string) {
  const images = files.filter(isImageFile).slice(0, 8);
  if (images.length === 0) return [];

  const uploadDir = join(process.cwd(), "public", "uploads", "services");
  await mkdir(uploadDir, { recursive: true });
  const saved: string[] = [];

  for (const [index, file] of images.entries()) {
    const filename = `${Date.now()}-${cleanSegment(serviceName)}-${index + 1}.${imageExtension(file)}`;
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    saved.push(`/uploads/services/${filename}`);
  }

  return saved;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const category = params.get("category");
  const municipality = params.get("municipality");
  const q = params.get("q");
  const maxPrice = params.get("maxPrice");
  const paymentMethod = params.get("paymentMethod");

  if (demoMode) {
    return NextResponse.json({
      services: filterDemoServices({
        q: q || undefined,
        category: category || undefined,
        municipality: municipality || undefined,
        maxPrice: maxPrice || undefined,
        paymentMethod: paymentMethod || undefined,
        status: status || undefined
      })
    });
  }

  const services = await prisma.service.findMany({
    where: {
      status: status === "all" ? undefined : ServiceStatus.APPROVED,
      category: category ? { slug: category } : undefined,
      municipality: municipality ? { contains: municipality, mode: "insensitive" } : undefined,
      price: maxPrice ? { lte: Number(maxPrice) } : undefined,
      paymentMethods: paymentMethod ? { contains: paymentMethod } : undefined,
      OR: q
        ? [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { municipality: { contains: q, mode: "insensitive" } }
          ]
        : undefined
    },
    include: { category: true, images: true, provider: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  if (demoMode) {
    const user = await getCurrentUser();
    if (!user || !["PROVIDER", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
      const service = createDemoService(user, await parseServiceBody(request));
      return NextResponse.json({ service }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo crear el servicio" }, { status: 403 });
    }
  }
  const user = await requireRole(["PROVIDER", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.role === "PROVIDER" && user.providerProfile?.status !== "APPROVED") {
    return NextResponse.json({ error: "Tu registro de proveedor debe ser aprobado por administracion antes de publicar servicios" }, { status: 403 });
  }

  const body = await parseServiceBody(request);
  const field = (key: string) => String(body[key] || "");
  const required = ["name", "categoryId", "municipality", "address", "price", "description", "whatsapp"];
  if (required.some((key) => !field(key))) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const baseSlug = slugify(field("name"));
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const imageUrls = field("images")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  const paymentMethods = Array.isArray(body.paymentMethods)
    ? body.paymentMethods.filter((item: string) => ["TRANSFER", "CARD"].includes(item)).join(",")
    : String(body.paymentMethods || "TRANSFER,CARD");

  const service = await prisma.service.create({
    data: {
      name: field("name"),
      slug,
      categoryId: field("categoryId"),
      municipality: field("municipality"),
      address: field("address"),
      price: Number(field("price")),
      description: field("description"),
      schedules: field("schedules") || "Consultar disponibilidad",
      includes: field("includes") || "Consultar con el proveedor",
      excludes: field("excludes") || "No especificado",
      policies: field("policies") || "Sujeto a disponibilidad y condiciones del proveedor",
      whatsapp: field("whatsapp"),
      paymentMethods: paymentMethods || "TRANSFER,CARD",
      latitude: field("latitude") ? Number(field("latitude")) : null,
      longitude: field("longitude") ? Number(field("longitude")) : null,
      status: user.role === "ADMIN" ? ServiceStatus.APPROVED : ServiceStatus.PENDING,
      ownerId: user.id,
      providerId: user.providerProfile?.id || null,
      images: {
        create: imageUrls.length
          ? imageUrls.map((url) => ({ url, alt: field("name") }))
          : [{ url: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80", alt: field("name") }]
      }
    },
    include: { category: true, images: true }
  });

  return NextResponse.json({ service }, { status: 201 });
}
