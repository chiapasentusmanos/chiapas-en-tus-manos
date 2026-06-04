import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { buildOAuthUrl, isOAuthProvider } from "@/lib/oauth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isOAuthProvider(provider)) return NextResponse.json({ error: "Proveedor no soportado" }, { status: 404 });

  const state = crypto.randomUUID();
  const url = buildOAuthUrl(provider, state);
  if (!url) {
    return NextResponse.json(
      { error: `Configura las variables OAuth de ${provider === "google" ? "Google" : "Apple"} para habilitar este acceso.` },
      { status: 501 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("chiapas_oauth_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return NextResponse.redirect(url);
}
