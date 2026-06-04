import Link from "next/link";
import { redirect } from "next/navigation";
import { ReservationCalendar } from "@/components/ReservationCalendar";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function GuidePanelPage() {
  const user = await requireRole(["GUIDE", "ADMIN"]);
  if (!user) redirect("/login");

  return (
    <main className="page">
      <section className="section">
        <div className="section-head">
          <div>
            <h1 className="page-title">Panel de guia</h1>
            <p className="muted">Consulta el calendario operativo unificado de reservas para coordinar servicios confirmados y pendientes.</p>
          </div>
          <Link className="ghost-button" href="/guias">Ver catalogo de guias</Link>
        </div>
        <ReservationCalendar title="Calendario operativo de reservas" />
      </section>
    </main>
  );
}
