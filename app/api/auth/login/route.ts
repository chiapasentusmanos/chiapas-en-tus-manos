import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";
import { demoMode, findDemoUserByEmail } from "@/lib/demo-data";

export async function POST(request: Request) {
  const body = await request.json();
  if (demoMode) {
    const user = findDemoUserByEmail(body.email);
    if (!user) return NextResponse.json({ error: "Usuario demo no encontrado" }, { status: 401 });
    if (user.role === "CLIENT" && user.status !== "APPROVED") {
      return NextResponse.json({ error: "Tu cuenta de cliente turista esta pendiente de aprobacion" }, { status: 403 });
    }
    await setSession(user.id, user.role);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }
  const user = await prisma.user.findUnique({ where: { email: body.email || "" } });
  if (!user || !(await bcrypt.compare(body.password || "", user.passwordHash))) {
    return NextResponse.json({ error: "Correo o contrasena incorrectos" }, { status: 401 });
  }
  if (user.role === "CLIENT" && user.status !== "APPROVED") {
    return NextResponse.json({ error: "Tu cuenta de cliente turista esta pendiente de aprobacion" }, { status: 403 });
  }

  await setSession(user.id, user.role);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
