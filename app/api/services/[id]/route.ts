import { NextResponse } from "next/server";
import { ServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { deleteDemoService, demoMode, getDemoServices, updateDemoService } from "@/lib/demo-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (demoMode) {
    const service = getDemoServices().find((item) => item.id === id);
    if (!service) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ service });
  }
  const service = await prisma.service.findUnique({
    where: { id },
    include: { category: true, images: true, provider: { include: { user: true } } }
  });
  if (!service) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ service });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (demoMode) {
    const { id } = await params;
    const updated = updateDemoService(id, await request.json());
    if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ service: updated });
  }
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (user.role !== "ADMIN" && service.ownerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const status = body.status && Object.values(ServiceStatus).includes(body.status) ? body.status : undefined;
  const paymentMethods = Array.isArray(body.paymentMethods)
    ? body.paymentMethods.filter((item: string) => ["TRANSFER", "CARD"].includes(item)).join(",")
    : body.paymentMethods;
  const updated = await prisma.service.update({
    where: { id },
    data: {
      name: body.name,
      categoryId: body.categoryId,
      municipality: body.municipality,
      address: body.address,
      price: body.price ? Number(body.price) : undefined,
      netPrice: body.netPrice ? Number(body.netPrice) : undefined,
      description: body.description,
      schedules: body.schedules,
      includes: body.includes,
      excludes: body.excludes,
      policies: body.policies,
      whatsapp: body.whatsapp,
      paymentMethods,
      latitude: body.latitude === "" ? null : body.latitude ? Number(body.latitude) : undefined,
      longitude: body.longitude === "" ? null : body.longitude ? Number(body.longitude) : undefined,
      status: user.role === "ADMIN" ? status : undefined
    },
    include: { category: true, images: true }
  });

  return NextResponse.json({ service: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (demoMode) {
    const { id } = await params;
    deleteDemoService(id);
    return NextResponse.json({ ok: true });
  }
  const { id } = await params;
  const user = await requireRole(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
