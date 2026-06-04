"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";

type Category = { id: string; name: string };
type Service = {
  id: string;
  name: string;
  municipality: string;
  price: string;
  netPrice: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  category: Category;
};
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
  status: "NEW" | "CONTACTED" | "CONFIRMED" | "CANCELLED";
  isAgency: boolean;
  createdAt: string;
  updatedAt?: string | null;
  service?: { name: string; municipality: string };
};

export function ProviderDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [categoryResponse, serviceResponse, reservationResponse] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/provider/services"),
      fetch("/api/reservation-requests")
    ]);
    setCategories((await categoryResponse.json()).categories || []);
    setServices((await serviceResponse.json()).services || []);
    setReservations((await reservationResponse.json()).reservations || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/services", {
      method: "POST",
      body: data
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(payload.error || "No se pudo crear el servicio");
      return;
    }
    event.currentTarget.reset();
    setMessage("Servicio creado. Queda pendiente de aprobacion.");
    await load();
  }

  async function updateReservation(id: string, status: Reservation["status"]) {
    await fetch(`/api/reservation-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setMessage("Solicitud actualizada.");
    await load();
  }

  return (
    <div className="dashboard" style={{ marginTop: 24 }}>
      <form className="panel form-grid" onSubmit={submit}>
        <h2 className="full" style={{ margin: 0 }}>Nuevo servicio</h2>
        <div className="field full">
          <label>Nombre</label>
          <input name="name" required />
        </div>
        <div className="field">
          <label>Categoria</label>
          <select name="categoryId" required defaultValue="">
            <option value="" disabled>Selecciona</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Municipio</label>
          <input name="municipality" required />
        </div>
        <div className="field full">
          <label>Direccion</label>
          <input name="address" required />
        </div>
        <div className="field">
          <label>Tarifa publica MXN</label>
          <input name="price" type="number" min="0" step="1" required />
        </div>
        <div className="field">
          <label>Tarifa neta MXN</label>
          <input name="netPrice" type="number" min="0" step="1" placeholder="15% menos si se deja vacia" />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input name="whatsapp" placeholder="529611234567" required />
        </div>
        <div className="field full">
          <label>Formas de pago</label>
          <div className="check-grid">
            <label><input name="paymentMethods" type="checkbox" value="TRANSFER" defaultChecked /> Transferencia</label>
            <label><input name="paymentMethods" type="checkbox" value="CARD" defaultChecked /> Tarjeta Visa / Mastercard</label>
          </div>
        </div>
        <div className="field">
          <label>Latitud</label>
          <input name="latitude" placeholder="16.7370" />
        </div>
        <div className="field">
          <label>Longitud</label>
          <input name="longitude" placeholder="-92.6376" />
        </div>
        <div className="field full">
          <label>Descripcion</label>
          <textarea name="description" required />
        </div>
        <div className="field full">
          <label>Fotos del servicio</label>
          <input name="photoFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        </div>
        <div className="field full">
          <label>Fotos por URL</label>
          <textarea name="images" placeholder="Una URL por linea" />
        </div>
        <div className="field">
          <label>Horarios</label>
          <textarea name="schedules" />
        </div>
        <div className="field">
          <label>Que incluye</label>
          <textarea name="includes" />
        </div>
        <div className="field">
          <label>Que no incluye</label>
          <textarea name="excludes" />
        </div>
        <div className="field">
          <label>Politicas</label>
          <textarea name="policies" />
        </div>
        {message && <div className={`message full ${message.includes("No ") ? "error" : ""}`}>{message}</div>}
        <button className="button full" disabled={loading} type="submit">
          <PlusCircle size={18} /> {loading ? "Guardando..." : "Crear servicio"}
        </button>
      </form>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Mis servicios</h2>
        <div className="table-list">
          {services.map((service) => (
            <div className="row-item" key={service.id}>
              <div>
                <strong>{service.name}</strong>
                <div className="muted">
                  {service.category.name} · {service.municipality} · Publica ${Number(service.price).toLocaleString("es-MX")} · Neta ${Number(service.netPrice).toLocaleString("es-MX")}
                </div>
              </div>
              <span className={`badge ${service.status === "PENDING" ? "pending" : service.status === "REJECTED" ? "rejected" : ""}`}>
                {service.status === "PENDING" ? "Pendiente" : service.status === "APPROVED" ? "Aprobado" : "Rechazado"}
              </span>
            </div>
          ))}
          {services.length === 0 && <p className="muted">Aun no tienes servicios.</p>}
        </div>
      </div>
      <div className="panel full">
        <h2 style={{ marginTop: 0 }}>Solicitudes de reserva</h2>
        <div className="table-list">
          {reservations.map((reservation) => (
            <div className="row-item" key={reservation.id}>
              <div>
                <strong>{reservation.name}</strong>
                <div className="muted">Folio: {reservation.code || reservation.id}</div>
                <div className="muted">
                  {reservation.service?.name || "Servicio"} · {reservation.people} persona(s) · {reservation.paymentMethod === "CARD" ? "Tarjeta Visa / Mastercard" : "Transferencia"}
                </div>
                <div className="muted">
                  {reservation.phone || "Sin telefono"} · {reservation.email || "Sin correo"}{reservation.isAgency ? " · Agencia" : ""}
                </div>
                {reservation.travelDate && <div className="muted">Fecha deseada: {new Date(reservation.travelDate).toLocaleDateString("es-MX")}</div>}
                <div className="muted">Ultima actualizacion: {new Date(reservation.updatedAt || reservation.createdAt).toLocaleDateString("es-MX")}</div>
                <p style={{ margin: "8px 0 0" }}>{reservation.message}</p>
                <span className={`badge ${reservation.status === "NEW" ? "pending" : reservation.status === "CANCELLED" ? "rejected" : ""}`}>
                  {reservation.status === "NEW" ? "Nueva" : reservation.status === "CONTACTED" ? "Contactada" : reservation.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}
                </span>
              </div>
              <div className="actions">
                <button className="ghost-button" onClick={() => updateReservation(reservation.id, "CONTACTED")}>Contactada</button>
                <button className="button" onClick={() => updateReservation(reservation.id, "CONFIRMED")}>Confirmar</button>
                <button className="button danger" onClick={() => updateReservation(reservation.id, "CANCELLED")}>Cancelar</button>
              </div>
            </div>
          ))}
          {reservations.length === 0 && <p className="muted">Aun no hay solicitudes.</p>}
        </div>
      </div>
    </div>
  );
}
