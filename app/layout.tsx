import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LanguageSelector } from "@/components/LanguageSelector";
import { T } from "@/components/T";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chiapas En Tus Manos",
  description: "Plataforma turistica para Chiapas",
  applicationName: "Chiapas En Tus Manos",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Chiapas En Tus Manos",
    statusBarStyle: "default"
  },
  icons: {
    icon: "/app-icon.svg",
    apple: "/app-icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="es" data-lang="es">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            <span className="brand-mark"><Compass size={22} /></span>
            <span>Chiapas En Tus Manos</span>
          </Link>
          <nav className="nav">
            {!user && <LanguageSelector />}
            <Link href="/catalogo"><T es="Catalogo" en="Catalog" /></Link>
            <Link href="/guias">Guias</Link>
            <Link href="/marca-chiapas">Marca Chiapas</Link>
            {(user?.role === "CLIENT" || user?.role === "AGENCY") && <Link href="/mis-reservas">Mis reservas</Link>}
            {user?.role === "PROVIDER" && <Link href="/proveedor">Panel proveedor</Link>}
            {user?.role === "BRAND_CHIAPAS" && <Link href="/marca-chiapas/panel">Panel Marca Chiapas</Link>}
            {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
            {user ? (
              <form action="/api/auth/logout" method="post">
                <button type="submit">Salir</button>
              </form>
            ) : (
              <>
                <Link href="/login"><T es="Entrar" en="Sign in" /></Link>
                <Link href="/registro"><T es="Registro" en="Register" /></Link>
              </>
            )}
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <span>Chiapas En Tus Manos</span>
          <nav>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Terminos</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
