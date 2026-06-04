import Link from "next/link";
import { redirect } from "next/navigation";
import { ReservationCalendar } from "@/components/ReservationCalendar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MyReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!["CLIENT", "AGENCY", "GUIDE"].includes(user.role)) redirect("/catalogo");

  return (
    <main className="page">
      <section className="section">
        <div className="section-head">
          <div>
            <h1 className="page-title">Mis reservas</h1>
            <p className="muted">Consulta el estado de tus solicitudes y da seguimiento con los proveedores.</p>
          </div>
          <Link className="ghost-button" href="/catalogo">Volver al catalogo</Link>
        </div>

        <ReservationCalendar title={user.role === "GUIDE" ? "Calendario operativo de reservas" : "Mis reservas"} />
      </section>
    </main>
  );
}
