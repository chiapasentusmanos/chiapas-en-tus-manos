import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ProviderDashboard } from "@/components/ProviderDashboard";

export const dynamic = "force-dynamic";

export default async function ProviderPage() {
  const user = await requireRole(["PROVIDER", "ADMIN"]);
  if (!user) redirect("/login");
  return (
    <main className="page">
      <section className="section">
        <h1 className="page-title">Panel de proveedor</h1>
        <p className="muted">Publica servicios. La administracion debe aprobarlos antes de que aparezcan en el catalogo.</p>
        <ProviderDashboard />
      </section>
    </main>
  );
}
