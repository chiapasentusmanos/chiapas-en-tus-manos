"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [role, setRole] = useState("CLIENT");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const endpoint = `/api/auth/${mode === "login" ? "login" : "register"}`;
    if (typeof formData.get("rfc") === "string") {
      formData.set("rfc", String(formData.get("rfc")).trim().toUpperCase());
    }
    if (typeof formData.get("rnt") === "string") {
      formData.set("rnt", String(formData.get("rnt")).trim().toUpperCase());
    }
    const response =
      mode === "login"
        ? await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(formData))
          })
        : await fetch(endpoint, {
            method: "POST",
            body: formData
          });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(payload.error || "No se pudo completar la accion");
      return;
    }
    const next = payload.user.role === "ADMIN" ? "/admin" : payload.user.role === "PROVIDER" ? "/proveedor" : payload.user.role === "AGENCY" ? "/agencia" : payload.user.role === "GUIDE" ? "/guias" : payload.user.role === "BRAND_CHIAPAS" ? "/marca-chiapas/panel" : "/catalogo";
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="form-grid" style={{ marginTop: 18 }}>
      {mode === "login" && (
        <div className="full social-login-grid">
          <a className="ghost-button full" href="/api/auth/oauth/google">Continuar con Google</a>
          <a className="ghost-button full" href="/api/auth/oauth/apple">Continuar con Apple / iOS</a>
          <div className="auth-divider">o entra con correo</div>
        </div>
      )}
      {mode === "register" && (
        <>
          <div className="field">
            <label>Tipo de usuario</label>
            <select name="role" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="CLIENT">Cliente / turista</option>
              <option value="PROVIDER">Proveedor</option>
              <option value="AGENCY">Agencia de viajes</option>
              <option value="GUIDE">Guia de turistas certificado</option>
              <option value="BRAND_CHIAPAS">Marca Chiapas</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="field">
            <label>Nombre</label>
            <input name="name" required />
          </div>
        </>
          )}
      <div className="field">
        <label>{mode === "register" && role === "ADMIN" ? "Usuario / correo electronico" : "Correo"}</label>
        <input name="email" type="email" required />
      </div>
      <div className="field">
        <label>Contrasena</label>
        <input name="password" type="password" minLength={8} required />
      </div>
      {mode === "register" && (
        <>
          {role !== "ADMIN" && (
            <div className="field">
              <label>Telefono</label>
              <input name="phone" required />
            </div>
          )}
          {(role === "PROVIDER" || role === "AGENCY") && (
            <>
              <div className="field">
                <label>{role === "PROVIDER" ? "Nombre comercial" : "Nombre de agencia"}</label>
                <input name={role === "PROVIDER" ? "businessName" : "agencyName"} required />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input name="whatsapp" placeholder="529611234567" required />
              </div>
            </>
          )}
          {role === "BRAND_CHIAPAS" && (
            <>
              <div className="field">
                <label>Nombre comercial</label>
                <input name="brandBusinessName" required />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input name="whatsapp" placeholder="529611234567" required />
              </div>
              <div className="field">
                <label>RFC</label>
                <input
                  name="rfc"
                  required
                  minLength={12}
                  maxLength={13}
                  pattern="[A-Za-z&Ññ]{3,4}[0-9]{6}[A-Za-z0-9]{3}"
                  placeholder="ABC010203AB1"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              <div className="field">
                <label>Numero de registro Marca Chiapas</label>
                <input name="marcaChiapasRegistrationNumber" required placeholder="MC-000000" style={{ textTransform: "uppercase" }} />
              </div>
              <div className="field">
                <label>Municipio</label>
                <input name="municipality" required />
              </div>
              <div className="field full">
                <label>Descripcion de la marca</label>
                <textarea name="description" required />
              </div>
            </>
          )}
          {(role === "PROVIDER" || role === "AGENCY") && (
            <>
              <div className="field">
                <label>RFC</label>
                <input
                  name="rfc"
                  required
                  minLength={12}
                  maxLength={13}
                  pattern="[A-Za-z&Ññ]{3,4}[0-9]{6}[A-Za-z0-9]{3}"
                  placeholder="ABC010203AB1"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              <div className="field">
                <label>Registro Nacional de Turismo (RNT)</label>
                <input name="rnt" required placeholder="RNT-000000" style={{ textTransform: "uppercase" }} />
              </div>
              <div className="field">
                <label>Documento RFC (PDF)</label>
                <input name="rfcDocument" type="file" accept="application/pdf,.pdf" required />
              </div>
              <div className="field">
                <label>Documento RNT (PDF)</label>
                <input name="rntDocument" type="file" accept="application/pdf,.pdf" required />
              </div>
              <div className="field">
                <label>INE (PDF)</label>
                <input name="ineDocument" type="file" accept="application/pdf,.pdf" required />
              </div>
              <div className="field">
                <label>Comprobante de domicilio fiscal (PDF)</label>
                <input name="fiscalAddressProof" type="file" accept="application/pdf,.pdf" required />
              </div>
            </>
          )}
          {role === "PROVIDER" && (
            <>
              <div className="field">
                <label>Municipio</label>
                <input name="municipality" required />
              </div>
              <div className="field full">
                <label>Descripcion</label>
                <textarea name="description" required />
              </div>
            </>
          )}
          {role === "GUIDE" && (
            <>
              <div className="field">
                <label>Tipo de guia</label>
                <select name="guideType" required defaultValue="">
                  <option value="" disabled>Selecciona</option>
                  <option value="NOM-08">Guia NOM-08</option>
                  <option value="NOM-09">Guia NOM-09</option>
                </select>
              </div>
              <div className="field">
                <label>Alcance</label>
                <select name="guideScope" required defaultValue="">
                  <option value="" disabled>Selecciona</option>
                  <option value="LOCAL">Local</option>
                  <option value="NATIONAL">Nacional</option>
                </select>
              </div>
              <div className="field">
                <label>Numero de certificacion</label>
                <input name="certificationNumber" required />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input name="whatsapp" placeholder="529611234567" required />
              </div>
              <div className="field">
                <label>Idiomas</label>
                <input name="languages" placeholder="Espanol, ingles" required />
              </div>
              <div className="field">
                <label>Municipios o zonas de trabajo</label>
                <input name="municipalities" placeholder="Palenque, San Cristobal..." required />
              </div>
              <div className="field">
                <label>Anos de experiencia</label>
                <input name="yearsExperience" type="number" min="0" step="1" required />
              </div>
              <div className="field">
                <label>Certificacion (PDF)</label>
                <input name="certificationDocument" type="file" accept="application/pdf,.pdf" required />
              </div>
              <div className="field">
                <label>INE (PDF)</label>
                <input name="guideIneDocument" type="file" accept="application/pdf,.pdf" required />
              </div>
              <div className="field full">
                <label>Semblanza profesional</label>
                <textarea name="bio" required />
              </div>
            </>
          )}
        </>
      )}
      {message && <div className="message error full">{message}</div>}
      <button className="button full" type="submit" disabled={loading}>
        {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>
    </form>
  );
}
