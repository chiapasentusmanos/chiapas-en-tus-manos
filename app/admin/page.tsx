import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");
  return (
    <main className="page">
      <section className="section">
        <h1 className="page-title">Panel administrador</h1>
        <p className="muted">Gestiona usuarios, proveedores, agencias, guias, Marca Chiapas, servicios y productos publicados.</p>
        <AdminDashboard />
      </section>
    </main>
  );
}
