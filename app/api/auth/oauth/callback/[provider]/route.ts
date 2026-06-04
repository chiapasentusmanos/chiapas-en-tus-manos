import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { setSession } from "@/lib/auth";
import { createDemoUser, demoMode, findDemoUserByEmail } from "@/lib/demo-data";
import { createVerificationCode, notifyAdminRegistration } from "@/lib/notifications";
import { decodeIdToken, exchangeCode, isOAuthProvider } from "@/lib/oauth";
import { prisma } from "@/lib/prisma";

async function finishOAuth(request: NextRequest, provider: string, form?: FormData) {
  if (!isOAuthProvider(provider)) return NextResponse.json({ error: "Proveedor no soportado" }, { status: 404 });
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("chiapas_oauth_state")?.value;
  const state = form ? String(form.get("state") || "") : request.nextUrl.searchParams.get("state") || "";
  const code = form ? String(form.get("code") || "") : request.nextUrl.searchParams.get("code") || "";
  if (!expectedState || state !== expectedState || !code) {
    return NextResponse.json({ error: "No se pudo validar el inicio de sesion externo" }, { status: 400 });
  }

  const token = await exchangeCode(provider, code);
  const profile = decodeIdToken(token?.id_token);
  if (!profile) return NextResponse.json({ error: "No se pudo obtener el perfil del usuario" }, { status: 400 });

  const verificationCode = createVerificationCode();
  const name = profile.name || profile.email.split("@")[0] || "Cliente turista";
  const email = profile.email;
  const accountId = profile.sub;

  if (demoMode) {
    let user = findDemoUserByEmail(email);
    if (!user) {
      user = createDemoUser({
        name,
        email,
        role: "CLIENT",
        status: "PENDING",
        verificationCode,
        authProvider: provider,
        providerAccountId: accountId
      });
      await notifyAdminRegistration({ role: "CLIENT", name, email, businessName: name, rfc: "", rnt: "", verificationCode });
    }
    if (user.status !== "APPROVED") return NextResponse.redirect(new URL("/login?pendiente=cliente", request.url));
    await setSession(user.id, user.role);
    return NextResponse.redirect(new URL("/catalogo", request.url));
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: "",
        role: UserRole.CLIENT,
        status: "PENDING",
        verificationCode,
        authProvider: provider,
        providerAccountId: accountId
      }
    });
    await notifyAdminRegistration({ role: "CLIENT", name, email, businessName: name, rfc: "", rnt: "", verificationCode });
  }

  if (user.role === "CLIENT" && user.status !== "APPROVED") {
    return NextResponse.redirect(new URL("/login?pendiente=cliente", request.url));
  }

  await setSession(user.id, user.role);
  return NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : user.role === "PROVIDER" ? "/proveedor" : "/catalogo", request.url));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return finishOAuth(request, provider);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return finishOAuth(request, provider, await request.formData());
}
