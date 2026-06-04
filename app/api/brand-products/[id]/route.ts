import { NextResponse } from "next/server";
import { ServiceStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { deleteDemoBrandProduct, demoMode, updateDemoBrandProduct } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  if (body.status && !Object.values(ServiceStatus).includes(body.status)) {
    return NextResponse.json({ error: "Estado invalido" }, { status: 400 });
  }
  if (demoMode) {
    const product = updateDemoBrandProduct(id, body);
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ product });
  }
  const product = await prisma.brandProduct.update({
    where: { id },
    data: {
      name: body.name,
      price: body.price ? Number(body.price) : undefined,
      originMunicipality: body.originMunicipality,
      status: body.status
    },
    include: { images: true, brandProfile: true }
  });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  if (demoMode) {
    const deleted = deleteDemoBrandProduct(id);
    if (!deleted) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  await prisma.brandProduct.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
