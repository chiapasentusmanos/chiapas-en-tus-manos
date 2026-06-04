"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { ReservationCalendar } from "@/components/ReservationCalendar";

type Category = { id: string; name: string };
type Service = {
  id: string;
  name: string;
  municipality: string;
  price: string;
  netPrice: string;
  adminNetPrice: string;
  agencyDiscount: string;
  adminDiscount: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  category: Category;
};

export function ProviderDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [categoryResponse, serviceResponse] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/provider/services")
    ]);
    setCategories((await categoryResponse.json()).categories || []);
    setServices((await serviceResponse.json()).services || []);
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
    setMessage("Servicio guardado en tu catalogo de proveedor. Queda pendiente de aprobacion para el catalogo publico.");
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
          <input name="netPrice" type="number" min="0" step="1" placeholder="Se calcula con descuento agencia" />
        </div>
        <div className="field">
          <label>Descuento agencia %</label>
          <input name="agencyDiscount" type="number" min="25" max="35" step="1" defaultValue="25" required />
        </div>
        <div className="field">
          <label>Tarifa neta admin MXN</label>
          <input name="adminNetPrice" type="number" min="0" step="1" placeholder="Se calcula con descuento admin" />
        </div>
        <div className="field">
          <label>Descuento admin %</label>
          <input name="adminDiscount" type="number" min="25" max="35" step="1" defaultValue="35" required />
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
                  {service.category.name} · {service.municipality} · Publica ${Number(service.price).toLocaleString("es-MX")} · Agencia ${Number(service.netPrice).toLocaleString("es-MX")} ({Number(service.agencyDiscount || 25)}%) · Admin ${Number(service.adminNetPrice).toLocaleString("es-MX")} ({Number(service.adminDiscount || 35)}%)
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
      <div className="full">
        <ReservationCalendar canManage title="Calendario unificado de reservas" />
      </div>
    </div>
  );
}
