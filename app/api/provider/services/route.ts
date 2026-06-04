import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { demoMode, getDemoServices } from "@/lib/demo-data";

export async function GET() {
  const user = await requireRole(["PROVIDER", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (demoMode) {
    const services = getDemoServices().filter((service) => user.role === "ADMIN" || service.ownerId === user.id);
    return NextResponse.json({ services });
  }
  const services = await prisma.service.findMany({
    where: user.role === "ADMIN" ? undefined : { ownerId: user.id },
    include: { category: true, images: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ services });
}
