import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { demoMode, getDemoAdminSummary } from "@/lib/demo-data";

export async function GET() {
  const user = await requireRole(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (demoMode) return NextResponse.json(getDemoAdminSummary());

  const [users, providers, agencies, guides, brandChiapas, services, brandProducts, pending, approved, pendingRegistrations, reservations] = await Promise.all([
    prisma.user.count(),
    prisma.provider.count(),
    prisma.agency.count(),
    prisma.guide.count(),
    prisma.brandChiapasProfile.count(),
    prisma.service.count(),
    prisma.brandProduct.count(),
    prisma.service.count({ where: { status: "PENDING" } }),
    prisma.service.count({ where: { status: "APPROVED" } }),
    Promise.all([
      prisma.provider.count({ where: { status: "PENDING" } }),
      prisma.agency.count({ where: { status: "PENDING" } }),
      prisma.guide.count({ where: { status: "PENDING" } }),
      prisma.brandChiapasProfile.count({ where: { status: "PENDING" } })
    ]).then(async ([providerCount, agencyCount, guideCount, brandCount]) => {
      const clientCount = await prisma.user.count({ where: { role: "CLIENT", status: "PENDING" } });
      return providerCount + agencyCount + guideCount + brandCount + clientCount;
    }),
    prisma.reservationRequest.count()
  ]);

  const userList = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, verificationCode: true, authProvider: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const providerList = await prisma.provider.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const agencyList = await prisma.agency.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const guideList = await prisma.guide.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const brandProfileList = await prisma.brandChiapasProfile.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const serviceList = await prisma.service.findMany({
    include: { category: true, images: true, provider: true },
    orderBy: { createdAt: "desc" },
    take: 80
  });
  const brandProductList = await prisma.brandProduct.findMany({
    include: { images: true, brandProfile: true },
    orderBy: { createdAt: "desc" },
    take: 80
  });
  const reservationList = await prisma.reservationRequest.findMany({
    include: { service: { select: { id: true, name: true, municipality: true, ownerId: true } } },
    orderBy: { createdAt: "desc" },
    take: 40
  });

  return NextResponse.json({
    stats: { users, providers, agencies, guides, brandChiapas, services, brandProducts, pending, approved, pendingRegistrations, reservations },
    users: userList,
    providers: providerList,
    agencies: agencyList,
    guides: guideList,
    brandProfiles: brandProfileList,
    services: serviceList,
    brandProducts: brandProductList,
    reservations: reservationList
  });
}
