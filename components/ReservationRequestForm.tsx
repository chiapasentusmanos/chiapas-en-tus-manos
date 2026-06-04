"use client";

import { useState } from "react";
import { T } from "@/components/T";

export function ReservationRequestForm({ serviceId, isAgency }: { serviceId: string; isAgency: boolean }) {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/reservation-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    setMessage(response.ok ? "Solicitud guardada para seguimiento." : "No se pudo guardar la solicitud.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10, margin: "16px 0" }}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="isAgency" value={String(isAgency)} />
      <input name="name" placeholder="Nombre / Name" required />
      <input name="email" placeholder="Correo / Email" type="email" />
      <input name="phone" placeholder="Telefono / Phone" required />
      <input name="travelDate" type="date" aria-label="Fecha deseada" />
      <input name="people" placeholder="Personas" type="number" min="1" defaultValue="1" required />
      <select name="paymentMethod" defaultValue="TRANSFER" required>
        <option value="TRANSFER">Transferencia</option>
        <option value="CARD">Tarjeta Visa / Mastercard</option>
      </select>
      <textarea name="message" placeholder="Mensaje para seguimiento interno" required defaultValue={isAgency ? "Solicitud de reserva de agencia." : "Solicitud de reserva de cliente."} />
      <button className="ghost-button" type="submit"><T es="Guardar solicitud" en="Save request" /></button>
      {message && <div className={`message ${message.startsWith("No ") ? "error" : ""}`}>{message}</div>}
    </form>
  );
}
