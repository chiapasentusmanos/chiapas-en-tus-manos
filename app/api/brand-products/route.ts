import { NextRequest, NextResponse } from "next/server";
import { ServiceStatus } from "@prisma/client";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { createDemoBrandProduct, demoMode, getDemoBrandProducts } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type ProductBody = Record<string, string | string[]>;

async function parseProductBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) return request.json() as Promise<ProductBody>;
  const form = await request.formData();
  const body: ProductBody = {};
  for (const [key, value] of form.entries()) {
    if (typeof value !== "string") continue;
    if (body[key]) {
      body[key] = Array.isArray(body[key]) ? [...body[key], value] : [String(body[key]), value];
    } else {
      body[key] = value;
    }
  }
  return body;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") || "";
  const productCategory = params.get("productCategory") || "";
  const originMunicipality = params.get("originMunicipality") || "";
  const status = params.get("status") || "";
  const currentUser = await getCurrentUser();

  if (demoMode) {
    const products = getDemoBrandProducts().filter((product) => {
      const query = q.toLowerCase();
      const matchesOwner = status === "mine" ? product.ownerId === currentUser?.id : true;
      const matchesStatus = status === "mine" || status === "all" ? true : product.status === ServiceStatus.APPROVED;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.productCategory.toLowerCase().includes(query) ||
        product.originMunicipality.toLowerCase().includes(query);
      const matchesCategory = !productCategory || product.productCategory.toLowerCase().includes(productCategory.toLowerCase());
      const matchesMunicipality = !originMunicipality || product.originMunicipality.toLowerCase().includes(originMunicipality.toLowerCase());
      return matchesOwner && matchesStatus && matchesQuery && matchesCategory && matchesMunicipality;
    });
    return NextResponse.json({ products });
  }

  const where =
    status === "mine"
      ? { ownerId: currentUser?.id || "__none__" }
      : {
          status: status === "all" ? undefined : ServiceStatus.APPROVED,
          productCategory: productCategory ? { contains: productCategory, mode: "insensitive" as const } : undefined,
          originMunicipality: originMunicipality ? { contains: originMunicipality, mode: "insensitive" as const } : undefined,
          OR: q
            ? [
                { name: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
                { productCategory: { contains: q, mode: "insensitive" as const } },
                { originMunicipality: { contains: q, mode: "insensitive" as const } }
              ]
            : undefined
        };

  const products = await prisma.brandProduct.findMany({
    where,
    include: { images: true, brandProfile: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (demoMode) {
    const user = await getCurrentUser();
    if (!user || !["BRAND_CHIAPAS", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
      const product = createDemoBrandProduct(user, await parseProductBody(request));
      return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo crear el producto" }, { status: 403 });
    }
  }

  const user = await requireRole(["BRAND_CHIAPAS", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.role === "BRAND_CHIAPAS" && user.brandChiapasProfile?.status !== "APPROVED") {
    return NextResponse.json({ error: "Tu registro de Marca Chiapas debe ser aprobado por administracion antes de publicar productos" }, { status: 403 });
  }
  if (!user.brandChiapasProfile) return NextResponse.json({ error: "No hay perfil de Marca Chiapas" }, { status: 400 });

  const body = await parseProductBody(request);
  const field = (key: string) => String(body[key] || "");
  const required = ["name", "productCategory", "originMunicipality", "price", "description", "whatsapp"];
  if (required.some((key) => !field(key))) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  const imageUrls = field("images").split("\n").map((url) => url.trim()).filter(Boolean);
  const paymentMethods = Array.isArray(body.paymentMethods)
    ? body.paymentMethods.filter((item: string) => ["TRANSFER", "CARD"].includes(item)).join(",")
    : String(body.paymentMethods || "TRANSFER,CARD");

  const product = await prisma.brandProduct.create({
    data: {
      name: field("name"),
      slug: `${slugify(field("name"))}-${Date.now().toString(36)}`,
      productCategory: field("productCategory"),
      originMunicipality: field("originMunicipality"),
      price: Number(field("price")),
      description: field("description"),
      materials: field("materials") || "No especificado",
      presentation: field("presentation") || "Consultar presentacion",
      stock: Number(field("stock") || 0),
      shipping: field("shipping") || "Consultar opciones de envio",
      whatsapp: field("whatsapp"),
      paymentMethods: paymentMethods || "TRANSFER,CARD",
      status: user.role === "ADMIN" ? ServiceStatus.APPROVED : ServiceStatus.PENDING,
      ownerId: user.id,
      brandProfileId: user.brandChiapasProfile.id,
      images: {
        create: imageUrls.length
          ? imageUrls.map((url) => ({ url, alt: field("name") }))
          : [{ url: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80", alt: field("name") }]
      }
    },
    include: { images: true, brandProfile: true }
  });

  return NextResponse.json({ product }, { status: 201 });
}
