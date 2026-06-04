import { redirect } from "next/navigation";
import { BrandChiapasDashboard } from "@/components/BrandChiapasDashboard";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BrandChiapasPanelPage() {
  const user = await requireRole(["BRAND_CHIAPAS", "ADMIN"]);
  if (!user) redirect("/login");
  return (
    <main className="page">
      <section className="section">
        <h1 className="page-title">Panel Marca Chiapas</h1>
        <p className="muted">Publica productos de origen chiapaneco. La administracion debe aprobarlos antes de que aparezcan en el catalogo.</p>
        <BrandChiapasDashboard />
      </section>
    </main>
  );
}
