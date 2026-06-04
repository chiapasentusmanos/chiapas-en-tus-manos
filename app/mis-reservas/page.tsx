import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { demoMode, getDemoReservations } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ReservationView = {
  id: string;
  code?: string | null;
  serviceId: string;
  name: string;
  phone?: string | null;
  message: string;
  travelDate?: string | Date | null;
  people: number;
  paymentMethod: string;
  status: string;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  service?: { name: string; municipality: string } | null;
};

export default async function MyReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CLIENT" && user.role !== "AGENCY") redirect("/catalogo");

  const reservations: ReservationView[] = demoMode
    ? getDemoReservations().filter((reservation) => reservation.userId === user.id)
    : await prisma.reservationRequest.findMany({
        where: { userId: user.id },
        include: { service: { select: { name: true, municipality: true } } },
        orderBy: { createdAt: "desc" }
      });

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

        {reservations.length === 0 ? (
          <div className="panel">
            <strong>No tienes solicitudes registradas.</strong>
            <p className="muted">Cuando guardes una solicitud desde la pagina de un servicio aparecera aqui.</p>
          </div>
        ) : (
          <div className="table-list">
            {reservations.map((reservation) => (
              <div className="row-item" key={reservation.id}>
                <div>
                  <strong>{reservation.service?.name || "Servicio turistico"}</strong>
                  <div className="muted">Folio: {reservation.code || reservation.id}</div>
                  <div className="muted">
                    {reservation.service?.municipality || "Chiapas"} · {reservation.people} persona(s) · {paymentLabel(reservation.paymentMethod)}
                  </div>
                  <div className="muted">
                    Solicitante: {reservation.name} · {reservation.phone || "Sin telefono"}
                  </div>
                  {reservation.travelDate && <div className="muted">Fecha deseada: {new Date(reservation.travelDate).toLocaleDateString("es-MX")}</div>}
                  <div className="muted">Ultima actualizacion: {new Date(reservation.updatedAt || reservation.createdAt).toLocaleDateString("es-MX")}</div>
                  <p style={{ margin: "8px 0 0" }}>{reservation.message}</p>
                </div>
                <div className="actions">
                  <span className={`badge ${reservation.status === "NEW" ? "pending" : reservation.status === "CANCELLED" ? "rejected" : ""}`}>
                    {statusLabel(reservation.status)}
                  </span>
                  <Link className="ghost-button" href={`/servicios/${reservation.serviceId}`}>Ver servicio</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function paymentLabel(value: string) {
  return value === "CARD" ? "Tarjeta Visa / Mastercard" : "Transferencia";
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    NEW: "Nueva",
    CONTACTED: "Contactada",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada"
  };
  return labels[value] || value;
}
