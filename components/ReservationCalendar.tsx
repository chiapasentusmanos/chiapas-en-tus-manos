"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, CreditCard } from "lucide-react";

type Reservation = {
  id: string;
  code?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  travelDate?: string | null;
  people: number;
  paymentMethod: string;
  paymentStatus?: "PENDING" | "PAID";
  paidAt?: string | null;
  status: "NEW" | "CONTACTED" | "CONFIRMED" | "CANCELLED";
  isAgency: boolean;
  createdAt: string;
  updatedAt?: string | null;
  service?: { id: string; name: string; municipality: string };
  user?: { name: string; email: string; role: string } | null;
};

export function ReservationCalendar({ canManage = false, title = "Calendario de reservas" }: { canManage?: boolean; title?: string }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/reservation-requests");
    const payload = await response.json();
    setReservations(payload.reservations || []);
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    return reservations.reduce<Record<string, Reservation[]>>((acc, reservation) => {
      const key = reservation.travelDate ? new Date(reservation.travelDate).toISOString().slice(0, 10) : "Sin fecha";
      acc[key] = [...(acc[key] || []), reservation];
      return acc;
    }, {});
  }, [reservations]);

  async function update(id: string, patch: Partial<Pick<Reservation, "status" | "paymentStatus">>) {
    const response = await fetch(`/api/reservation-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    setMessage(response.ok ? "Reserva actualizada y notificaciones enviadas." : "No se pudo actualizar la reserva.");
    await load();
  }

  return (
    <section className="panel reservation-calendar">
      <div className="section-head compact-head">
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <p className="muted">Una sola agenda compartida para cliente, proveedor, agencia, guia y administracion.</p>
        </div>
        <span className="badge"><CalendarDays size={15} /> {reservations.length} reserva(s)</span>
      </div>
      {message && <div className={`message ${message.startsWith("No ") ? "error" : ""}`}>{message}</div>}
      {reservations.length === 0 ? (
        <p className="muted">Aun no hay reservas registradas.</p>
      ) : (
        <div className="calendar-list">
          {Object.entries(grouped).map(([date, items]) => (
            <div className="calendar-day" key={date}>
              <div className="calendar-date">{date === "Sin fecha" ? date : new Date(`${date}T12:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div className="table-list">
                {items.map((reservation) => (
                  <div className="row-item" key={reservation.id}>
                    <div>
                      <strong>{reservation.service?.name || "Servicio turistico"}</strong>
                      <div className="muted">Folio: {reservation.code || reservation.id} · {reservation.service?.municipality || "Chiapas"}</div>
                      <div className="muted">{reservation.name} · {reservation.people} persona(s) · {reservation.phone || "Sin telefono"}{reservation.isAgency ? " · Agencia" : ""}</div>
                      <div className="muted">{paymentLabel(reservation.paymentMethod)} · {reservation.paymentStatus === "PAID" ? "Pago 100%" : "Pendiente de pago"}</div>
                      <p style={{ margin: "8px 0 0" }}>{reservation.message}</p>
                    </div>
                    <div className="actions">
                      <span className={`badge ${reservation.status === "NEW" ? "pending" : reservation.status === "CANCELLED" ? "rejected" : ""}`}>{statusLabel(reservation.status)}</span>
                      <span className={`badge ${reservation.paymentStatus === "PAID" ? "" : "pending"}`}>
                        {reservation.paymentStatus === "PAID" ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                        {reservation.paymentStatus === "PAID" ? "Pagada" : "Pendiente"}
                      </span>
                      {canManage && (
                        <>
                          <button className="ghost-button" onClick={() => update(reservation.id, { paymentStatus: "PENDING" })}><CreditCard size={16} /> Pendiente pago</button>
                          <button className="button" onClick={() => update(reservation.id, { paymentStatus: "PAID" })}><CheckCircle2 size={16} /> Pagada 100%</button>
                          <button className="button danger" onClick={() => update(reservation.id, { status: "CANCELLED" })}>Cancelar</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
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
