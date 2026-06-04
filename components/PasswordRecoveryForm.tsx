"use client";

import { useState } from "react";

export function PasswordRecoveryForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/auth/recover-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
    });
    const payload = await response.json();
    setLoading(false);
    setMessage(payload.message || payload.error || "Solicitud recibida");
  }

  return (
    <form onSubmit={submit} className="form-grid" style={{ marginTop: 18 }}>
      <div className="field">
        <label>Correo electronico</label>
        <input name="email" type="email" />
      </div>
      <div className="field">
        <label>Telefono</label>
        <input name="phone" />
      </div>
      {message && <div className="message full">{message}</div>}
      <button className="button full" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar recuperacion"}
      </button>
    </form>
  );
}
