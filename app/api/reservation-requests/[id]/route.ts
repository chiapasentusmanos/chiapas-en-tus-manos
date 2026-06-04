import { NextResponse } from "next/server";
import { PaymentStatus, ReservationStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { demoMode, getDemoReservations, updateDemoReservation } from "@/lib/demo-data";
import { notifyReservationStatusChanged } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "PROVIDER"].includes(user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = body.status && Object.values(ReservationStatus).includes(body.status) ? body.status : null;
  const paymentStatus = body.paymentStatus && Object.values(PaymentStatus).includes(body.paymentStatus) ? body.paymentStatus : null;
  if (!status && !paymentStatus) return NextResponse.json({ error: "Estado invalido" }, { status: 400 });

  if (demoMode) {
    const existing = getDemoReservations().find((item) => item.id === id);
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (user.role === "PROVIDER" && existing.ownerId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const updated = updateDemoReservation(id, status || existing.status, paymentStatus || existing.paymentStatus || "PENDING");
    if (updated) {
      await notifyReservationStatusChanged({
        to: updated.email,
        customerName: updated.name,
        code: updated.code || updated.id,
        serviceName: updated.service?.name || "Servicio turistico",
        status: status || updated.status,
        paymentStatus: paymentStatus || updated.paymentStatus
      });
    }
    return NextResponse.json({ reservation: updated });
  }

  const existing = await prisma.reservationRequest.findUnique({
    where: { id },
    include: { service: { select: { ownerId: true } } }
  });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (user.role === "PROVIDER" && existing.service.ownerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const reservation = await prisma.reservationRequest.update({
    where: { id },
    data: {
      status: paymentStatus === "PAID" ? "CONFIRMED" : status || undefined,
      paymentStatus: paymentStatus || undefined,
      paidAt: paymentStatus === "PAID" ? new Date() : paymentStatus === "PENDING" ? null : undefined
    },
    include: {
      service: { select: { id: true, name: true, municipality: true, ownerId: true, owner: { select: { email: true } } } },
      user: { select: { email: true, role: true } }
    }
  });
  await notifyReservationStatusChanged({
    to: reservation.email,
    customerName: reservation.name,
    code: reservation.code || reservation.id,
    serviceName: reservation.service.name,
    status: reservation.status,
    paymentStatus: reservation.paymentStatus,
    providerEmail: reservation.service.owner.email,
    agencyEmail: reservation.user?.role === "AGENCY" ? reservation.user.email : null
  });

  return NextResponse.json({ reservation });
}
