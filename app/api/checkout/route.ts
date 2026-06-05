import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createReservationCode, notifyReservationStatusChanged } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

function cleanPaymentMethod(value: unknown) {
  return value === "TRANSFER" ? "TRANSFER" : "CARD";
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await getCurrentUser();
  const type = body.type === "product" ? "product" : "service";
  const quantity = Math.max(1, Number(body.quantity || body.people || 1));
  const name = String(body.name || user?.name || "");
  const email = String(body.email || user?.email || "");
  const phone = String(body.phone || user?.phone || "");

  if (!body.id || !name || !phone) {
    return NextResponse.json({ error: "Faltan datos para procesar el pago" }, { status: 400 });
  }

  if (type === "service") {
    const service = await prisma.service.findUnique({
      where: { id: String(body.id) },
      include: { owner: { select: { email: true } } }
    });
    if (!service || service.status !== "APPROVED") {
      return NextResponse.json({ error: "Servicio no disponible para pago" }, { status: 404 });
    }
    const code = createReservationCode();
    const reservation = await prisma.reservationRequest.create({
      data: {
        code,
        serviceId: service.id,
        userId: user?.id || null,
        name,
        email: email || null,
        phone,
        message: "Reserva pagada al 100% por pasarela de pagos.",
        travelDate: body.travelDate ? new Date(body.travelDate) : null,
        people: quantity,
        paymentMethod: cleanPaymentMethod(body.paymentMethod),
        paymentStatus: "PAID",
        paidAt: new Date(),
        status: "CONFIRMED",
        isAgency: user?.role === "AGENCY"
      },
      include: { service: { select: { name: true, owner: { select: { email: true } } } }, user: { select: { email: true, role: true } } }
    });
    await notifyReservationStatusChanged({
      to: reservation.email,
      customerName: reservation.name,
      code,
      serviceName: reservation.service.name,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      providerEmail: reservation.service.owner.email,
      agencyEmail: reservation.user?.role === "AGENCY" ? reservation.user.email : null
    });
    return NextResponse.json({ ok: true, code, kind: "reservation" });
  }

  const product = await prisma.brandProduct.findUnique({
    where: { id: String(body.id) },
    include: { brandProfile: { include: { user: { select: { email: true } } } } }
  });
  if (!product || product.status !== "APPROVED") {
    return NextResponse.json({ error: "Producto no disponible para pago" }, { status: 404 });
  }
  if (product.stock < quantity) {
    return NextResponse.json({ error: "Stock insuficiente para completar la compra" }, { status: 409 });
  }
  const code = createReservationCode();
  const total = Number(product.price) * quantity;
  await prisma.$transaction([
    prisma.brandProduct.update({
      where: { id: product.id },
      data: { stock: { decrement: quantity } }
    }),
    prisma.brandProductOrder.create({
      data: {
        code,
        productId: product.id,
        userId: user?.id || null,
        name,
        email: email || null,
        phone,
        quantity,
        total,
        paymentMethod: cleanPaymentMethod(body.paymentMethod),
        paymentStatus: "PAID",
        paidAt: new Date()
      }
    })
  ]);
  console.info("[orden Marca Chiapas pagada]", {
    code,
    product: product.name,
    quantity,
    total,
    providerEmail: product.brandProfile.user.email,
    customerEmail: email || null
  });
  return NextResponse.json({ ok: true, code, kind: "product-order" });
}
