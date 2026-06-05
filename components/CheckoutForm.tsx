"use client";

import { useState } from "react";
import { CreditCard, LockKeyhole } from "lucide-react";
import { money } from "@/lib/utils";

type CheckoutFormProps = {
  type: "service" | "product";
  id: string;
  title: string;
  amount: number;
  stock?: number;
};

export function CheckoutForm({ type, id, title, amount, stock }: CheckoutFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const total = amount * quantity;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        id,
        quantity,
        people: quantity,
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        travelDate: formData.get("travelDate"),
        paymentMethod: formData.get("paymentMethod")
      })
    });
    const payload = await response.json();
    setMessage(response.ok ? `Pago registrado al 100%. Folio: ${payload.code}` : payload.error || "No se pudo procesar el pago");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form className="panel form-grid checkout-box" onSubmit={submit}>
      <div className="full">
        <span className="badge"><LockKeyhole size={15} /> Pago protegido</span>
        <h1 className="page-title" style={{ marginTop: 12 }}>{title}</h1>
        <p className="muted">Los datos directos del proveedor se liberan solo despues de confirmar pago al 100%.</p>
      </div>
      <div className="field">
        <label>Nombre</label>
        <input name="name" required />
      </div>
      <div className="field">
        <label>Telefono de seguimiento</label>
        <input name="phone" required />
      </div>
      <div className="field">
        <label>Correo</label>
        <input name="email" type="email" />
      </div>
      {type === "service" && (
        <div className="field">
          <label>Fecha deseada</label>
          <input name="travelDate" type="date" />
        </div>
      )}
      <div className="field">
        <label>{type === "product" ? "Cantidad" : "Personas"}</label>
        <input value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} type="number" min="1" max={stock || undefined} />
      </div>
      <div className="field">
        <label>Metodo de pago</label>
        <select name="paymentMethod" defaultValue="CARD">
          <option value="CARD">Tarjeta Visa / Mastercard</option>
          <option value="TRANSFER">Transferencia validada</option>
        </select>
      </div>
      <div className="message full">
        <strong>Total a pagar: {money(total)}</strong>
        {typeof stock === "number" && <div>Stock disponible: {stock} pza(s)</div>}
      </div>
      {message && <div className={`message full ${message.startsWith("No ") || message.includes("insuficiente") ? "error" : ""}`}>{message}</div>}
      <button className="button full" type="submit" disabled={typeof stock === "number" && stock <= 0}>
        <CreditCard size={18} /> {typeof stock === "number" && stock <= 0 ? "Sin stock" : "Pagar 100%"}
      </button>
    </form>
  );
}
