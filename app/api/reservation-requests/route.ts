import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createReservationCode, notifyReservationCreated } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { addDemoReservation, demoMode, getDemoReservations, getDemoServices, getDemoUsers } from "@/lib/demo-data";

function cleanPaymentMethod(value: unknown) {
  return value === "CARD" ? "CARD" : "TRANSFER";
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "PROVIDER"].includes(user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (demoMode) {
    const reservations = getDemoReservations().filter((reservation) => {
      if (user.role === "ADMIN") return true;
      return reservation.ownerId === user.id;
    });
    return NextResponse.json({ reservations });
  }

  const reservations = await prisma.reservationRequest.findMany({
    where: user.role === "PROVIDER" ? { service: { ownerId: user.id } } : undefined,
    include: { service: { select: { id: true, name: true, municipality: true, ownerId: true } }, user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return NextResponse.json({ reservations });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.serviceId || !body.name || !body.phone || !body.message) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const user = await getCurrentUser();
  const code = createReservationCode();
  if (demoMode) {
    const service = getDemoServices().find((item) => item.id === body.serviceId);
    const owner = getDemoUsers().find((item) => item.id === service?.ownerId);
    const reservationRequest = {
      id: `demo-${Date.now()}`,
      code,
      ...body,
      userId: user?.id || null,
      people: Number(body.people || 1),
      paymentMethod: cleanPaymentMethod(body.paymentMethod),
      status: "NEW",
      isAgency: user?.role === "AGENCY" || body.isAgency === true || body.isAgency === "true",
      createdAt: new Date().toISOString()
    };
    addDemoReservation(reservationRequest);
    await notifyReservationCreated({
      to: owner?.email,
      providerName: owner?.name,
      code,
      serviceName: service?.name || "Servicio turistico",
      customerName: body.name,
      customerEmail: body.email || user?.email || null,
      customerPhone: body.phone || user?.phone || null,
      travelDate: body.travelDate || null,
      people: Number(body.people || 1),
      paymentMethod: cleanPaymentMethod(body.paymentMethod),
      message: body.message
    });
    return NextResponse.json({
      reservationRequest
    }, { status: 201 });
  }

  const requestRecord = await prisma.reservationRequest.create({
    data: {
      code,
      serviceId: body.serviceId,
      userId: user?.id || null,
      name: body.name,
      email: body.email || user?.email || null,
      phone: body.phone || user?.phone || null,
      message: body.message,
      travelDate: body.travelDate ? new Date(body.travelDate) : null,
      people: Math.max(1, Number(body.people || 1)),
      paymentMethod: cleanPaymentMethod(body.paymentMethod),
      isAgency: user?.role === "AGENCY" || Boolean(body.isAgency)
    },
    include: { service: { include: { owner: { select: { name: true, email: true } } } } }
  });
  await notifyReservationCreated({
    to: requestRecord.service.owner.email,
    providerName: requestRecord.service.owner.name,
    code,
    serviceName: requestRecord.service.name,
    customerName: requestRecord.name,
    customerEmail: requestRecord.email,
    customerPhone: requestRecord.phone,
    travelDate: requestRecord.travelDate,
    people: requestRecord.people,
    paymentMethod: requestRecord.paymentMethod,
    message: requestRecord.message
  });

  return NextResponse.json({ reservationRequest: requestRecord }, { status: 201 });
}
