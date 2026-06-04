import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { demoMode, getDemoUser } from "@/lib/demo-data";

const COOKIE_NAME = "chiapas_en_tus_manos_session";

type SessionPayload = {
  userId: string;
  role: "CLIENT" | "PROVIDER" | "AGENCY" | "GUIDE" | "BRAND_CHIAPAS" | "ADMIN";
  exp: number;
};

function secret() {
  return process.env.APP_SECRET || "dev-secret-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token?: string): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSession(userId: string, role: SessionPayload["role"]) {
  const cookieStore = await cookies();
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;
  cookieStore.set(COOKIE_NAME, encode({ userId, role, exp: expires }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires)
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  return decode(cookieStore.get(COOKIE_NAME)?.value);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  if (demoMode) return getDemoUser(session.userId);
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { providerProfile: true, agencyProfile: true, guideProfile: true, brandChiapasProfile: true }
  });
}

export async function requireRole(roles: SessionPayload["role"][]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    return null;
  }
  return user;
}
