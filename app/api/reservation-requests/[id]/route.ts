import { NextResponse } from "next/server";
import { ReservationStatus } from "@prisma/client";
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
  if (!status) return NextResponse.json({ error: "Estado invalido" }, { status: 400 });

  if (demoMode) {
    const existing = getDemoReservations().find((item) => item.id === id);
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (user.role === "PROVIDER" && existing.ownerId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const updated = updateDemoReservation(id, status);
    if (updated) {
      await notifyReservationStatusChanged({
        to: updated.email,
        customerName: updated.name,
        code: updated.code || updated.id,
        serviceName: updated.service?.name || "Servicio turistico",
        status
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
    data: { status },
    include: { service: { select: { id: true, name: true, municipality: true, ownerId: true } } }
  });
  await notifyReservationStatusChanged({
    to: reservation.email,
    customerName: reservation.name,
    code: reservation.code || reservation.id,
    serviceName: reservation.service.name,
    status
  });

  return NextResponse.json({ reservation });
}
