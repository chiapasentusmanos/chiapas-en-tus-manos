import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { updateDemoRegistrationStatus, updateDemoUserStatus, demoMode } from "@/lib/demo-data";
import { sendRejectionEmail, sendWelcomeEmail } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type RegistrationType = "client" | "provider" | "agency" | "guide" | "brand";
type ReviewStatus = "APPROVED" | "REJECTED";
type RegistrationRole = "CLIENT" | "PROVIDER" | "AGENCY" | "GUIDE" | "BRAND_CHIAPAS";

function isValidType(value: unknown): value is RegistrationType {
  return value === "client" || value === "provider" || value === "agency" || value === "guide" || value === "brand";
}

function roleFromType(type: RegistrationType): RegistrationRole {
  if (type === "provider") return "PROVIDER";
  if (type === "agency") return "AGENCY";
  if (type === "guide") return "GUIDE";
  if (type === "brand") return "BRAND_CHIAPAS";
  return "CLIENT";
}

function isValidStatus(value: unknown): value is ReviewStatus {
  return value === "APPROVED" || value === "REJECTED";
}

export async function PATCH(request: Request) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  if (!body.id || !isValidType(body.type) || !isValidStatus(body.status)) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  if (demoMode) {
    if (body.type === "client") {
      const updated = updateDemoUserStatus(body.id, body.status);
      if (!updated) return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
      if (body.status === "APPROVED") {
        await sendWelcomeEmail(updated.email, updated.name, "CLIENT");
      } else {
        await sendRejectionEmail(updated.email, updated.name, "CLIENT");
      }
      return NextResponse.json({ registration: updated });
    }
    const updated = updateDemoRegistrationStatus(body.type, body.id, body.status);
    if (!updated) return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    if (body.status === "APPROVED") {
      await sendWelcomeEmail(updated.user.email, updated.user.name, roleFromType(body.type));
    } else {
      await sendRejectionEmail(updated.user.email, updated.user.name, roleFromType(body.type));
    }
    return NextResponse.json({ registration: updated });
  }

  const reviewedAt = new Date();
  if (body.type === "client") {
    const registration = await prisma.user.update({
      where: { id: body.id },
      data: { status: body.status, reviewedAt },
      select: { id: true, name: true, email: true, role: true, status: true, verificationCode: true }
    });
    if (body.status === "APPROVED") {
      await sendWelcomeEmail(registration.email, registration.name, "CLIENT");
    } else {
      await sendRejectionEmail(registration.email, registration.name, "CLIENT");
    }
    return NextResponse.json({ registration });
  }

  const registration =
    body.type === "provider"
      ? await prisma.provider.update({
          where: { id: body.id },
          data: { status: body.status, reviewedAt },
          include: { user: { select: { email: true, name: true } } }
        })
      : body.type === "agency"
        ? await prisma.agency.update({
            where: { id: body.id },
            data: { status: body.status, reviewedAt },
            include: { user: { select: { email: true, name: true } } }
          })
        : body.type === "guide"
          ? await prisma.guide.update({
              where: { id: body.id },
              data: { status: body.status, reviewedAt },
              include: { user: { select: { email: true, name: true } } }
            })
          : await prisma.brandChiapasProfile.update({
              where: { id: body.id },
              data: { status: body.status, reviewedAt },
              include: { user: { select: { email: true, name: true } } }
            });

  if (body.status === "APPROVED") {
    await sendWelcomeEmail(registration.user.email, registration.user.name, roleFromType(body.type));
  } else {
    await sendRejectionEmail(registration.user.email, registration.user.name, roleFromType(body.type));
  }

  return NextResponse.json({ registration });
}
