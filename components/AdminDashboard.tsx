"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

type VerificationDocs = {
  rfcDocumentUrl?: string;
  rntDocumentUrl?: string;
  ineDocumentUrl?: string;
  fiscalAddressProofUrl?: string;
};

type Summary = {
  stats: Record<string, number>;
  users: Array<{ id: string; name: string; email: string; role: string; status?: string; verificationCode?: string; authProvider?: string | null }>;
  providers: Array<{ id: string; businessName: string; rfc?: string; rnt?: string; municipality?: string; status: string; verificationCode?: string; user: { name: string; email: string } } & VerificationDocs>;
  agencies?: Array<{ id: string; agencyName: string; rfc: string; rnt: string; status: string; verificationCode?: string; user: { name: string; email: string } } & VerificationDocs>;
  guides?: Array<{ id: string; guideType: string; scope: string; certificationNumber: string; certificationDocumentUrl?: string; ineDocumentUrl?: string; languages: string; municipalities: string; yearsExperience: number; status: string; verificationCode?: string; user: { name: string; email: string } }>;
  brandProfiles?: Array<{ id: string; businessName: string; rfc: string; registrationNumber: string; municipality: string; description: string; whatsapp: string; status: string; verificationCode?: string; user: { name: string; email: string } }>;
  services: Array<{ id: string; name: string; municipality: string; price: string; netPrice: string; status: string; category: { name: string } }>;
  brandProducts?: Array<{ id: string; name: string; productCategory: string; originMunicipality: string; price: string; stock: number; status: string; brandProfile: { businessName: string; registrationNumber: string } }>;
  reservations?: Reservation[];
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
  status: string;
  isAgency: boolean;
  createdAt: string;
  updatedAt?: string | null;
  service?: { id: string; name: string; municipality: string };
};

export function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/summary");
    setSummary(await response.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setMessage(status === "APPROVED" ? "Servicio aprobado." : "Servicio rechazado.");
    await load();
  }

  async function updateRegistration(type: "client" | "provider" | "agency" | "guide" | "brand", id: string, status: "APPROVED" | "REJECTED") {
    await fetch("/api/admin/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, status })
    });
    setMessage(status === "APPROVED" ? "Registro aprobado y bienvenida enviada." : "Registro rechazado y notificado.");
    await load();
  }

  async function updateReservation(id: string, status: "CONTACTED" | "CONFIRMED" | "CANCELLED") {
    await fetch(`/api/reservation-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setMessage("Solicitud de reserva actualizada.");
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setMessage("Servicio eliminado.");
    await load();
  }

  async function updateBrandProductStatus(id: string, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/brand-products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setMessage(status === "APPROVED" ? "Producto Marca Chiapas aprobado." : "Producto Marca Chiapas rechazado.");
    await load();
  }

  async function removeBrandProduct(id: string) {
    await fetch(`/api/brand-products/${id}`, { method: "DELETE" });
    setMessage("Producto Marca Chiapas eliminado.");
    await load();
  }

  async function edit(service: Summary["services"][number]) {
    const name = window.prompt("Nombre del servicio", service.name);
    if (!name) return;
    const price = window.prompt("Precio MXN", String(Number(service.price)));
    if (!price) return;
    const netPrice = window.prompt("Tarifa neta MXN", String(Number(service.netPrice)));
    if (!netPrice) return;
    const municipality = window.prompt("Municipio", service.municipality);
    if (!municipality) return;
    await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, netPrice, municipality })
    });
    setMessage("Servicio editado.");
    await load();
  }

  if (!summary) return <div className="panel" style={{ marginTop: 24 }}>Cargando panel...</div>;

  return (
    <div style={{ display: "grid", gap: 24, marginTop: 24 }}>
      <div className="stats-grid">
        {Object.entries(summary.stats).map(([key, value]) => (
          <div className="stat" key={key} style={{ padding: 16 }}>
            <strong style={{ fontSize: 28 }}>{value}</strong>
            <div className="muted">{label(key)}</div>
          </div>
        ))}
      </div>
      {message && <div className="message">{message}</div>}
      <div className="dashboard">
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Proveedores</h2>
          <div className="table-list">
            {summary.providers.map((provider) => (
              <div className="row-item" key={provider.id}>
                <div>
                  <strong>{provider.businessName}</strong>
                  <div className="muted">
                    {provider.user.email} · {provider.municipality || "Sin municipio"} · RFC {provider.rfc || "Pendiente"} · RNT {provider.rnt || "Pendiente"}
                  </div>
                  <RegistrationMeta status={provider.status} code={provider.verificationCode} />
                  <DocumentLinks item={provider} />
                </div>
                <RegistrationActions
                  status={provider.status}
                  onApprove={() => updateRegistration("provider", provider.id, "APPROVED")}
                  onReject={() => updateRegistration("provider", provider.id, "REJECTED")}
                />
              </div>
            ))}
          </div>
          {summary.agencies && summary.agencies.length > 0 && (
            <>
              <h2>Agencias</h2>
              <div className="table-list">
                {summary.agencies.map((agency) => (
                  <div className="row-item" key={agency.id}>
                    <div>
                      <strong>{agency.agencyName}</strong>
                      <div className="muted">{agency.user.email} · RFC {agency.rfc} · RNT {agency.rnt}</div>
                      <RegistrationMeta status={agency.status} code={agency.verificationCode} />
                      <DocumentLinks item={agency} />
                    </div>
                    <RegistrationActions
                      status={agency.status}
                      onApprove={() => updateRegistration("agency", agency.id, "APPROVED")}
                      onReject={() => updateRegistration("agency", agency.id, "REJECTED")}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
          {summary.guides && summary.guides.length > 0 && (
            <>
              <h2>Guias certificados</h2>
              <div className="table-list">
                {summary.guides.map((guide) => (
                  <div className="row-item" key={guide.id}>
                    <div>
                      <strong>{guide.user.name}</strong>
                      <div className="muted">
                        {guide.user.email} · {guide.guideType} · {guide.scope === "LOCAL" ? "Local" : "Nacional"} · Cert. {guide.certificationNumber}
                      </div>
                      <div className="muted">{guide.languages} · {guide.municipalities} · {guide.yearsExperience} anos</div>
                      <RegistrationMeta status={guide.status} code={guide.verificationCode} />
                      <GuideDocumentLinks certificationUrl={guide.certificationDocumentUrl} ineUrl={guide.ineDocumentUrl} />
                    </div>
                    <RegistrationActions
                      status={guide.status}
                      onApprove={() => updateRegistration("guide", guide.id, "APPROVED")}
                      onReject={() => updateRegistration("guide", guide.id, "REJECTED")}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
          {summary.brandProfiles && summary.brandProfiles.length > 0 && (
            <>
              <h2>Marca Chiapas</h2>
              <div className="table-list">
                {summary.brandProfiles.map((brand) => (
                  <div className="row-item" key={brand.id}>
                    <div>
                      <strong>{brand.businessName}</strong>
                      <div className="muted">
                        {brand.user.email} · RFC {brand.rfc} · Reg. {brand.registrationNumber} · {brand.municipality}
                      </div>
                      <div className="muted">{brand.description}</div>
                      <RegistrationMeta status={brand.status} code={brand.verificationCode} />
                    </div>
                    <RegistrationActions
                      status={brand.status}
                      onApprove={() => updateRegistration("brand", brand.id, "APPROVED")}
                      onReject={() => updateRegistration("brand", brand.id, "REJECTED")}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
          <h2>Usuarios</h2>
          <div className="table-list">
            {summary.users.map((user) => (
              <div className="row-item" key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <div className="muted">{user.email}{user.authProvider ? ` · ${user.authProvider}` : ""}</div>
                  {user.role === "CLIENT" && <RegistrationMeta status={user.status || "APPROVED"} code={user.verificationCode} />}
                </div>
                {user.role === "CLIENT" && user.status === "PENDING" ? (
                  <RegistrationActions
                    status={user.status}
                    onApprove={() => updateRegistration("client", user.id, "APPROVED")}
                    onReject={() => updateRegistration("client", user.id, "REJECTED")}
                  />
                ) : (
                  <span className="badge">{user.role}</span>
                )}
              </div>
            ))}
          </div>
          <h2>Solicitudes de reserva</h2>
          <ReservationList reservations={summary.reservations || []} onUpdate={updateReservation} />
        </section>
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Servicios</h2>
          <div className="table-list">
            {summary.services.map((service) => (
              <div className="row-item" key={service.id}>
                <div>
                  <strong>{service.name}</strong>
                  <div className="muted">
                    {service.category.name} · {service.municipality} · Publica ${Number(service.price).toLocaleString("es-MX")} · Neta ${Number(service.netPrice).toLocaleString("es-MX")}
                  </div>
                  <span className={`badge ${service.status === "PENDING" ? "pending" : service.status === "REJECTED" ? "rejected" : ""}`}>
                    {service.status}
                  </span>
                </div>
                <div className="actions">
                  <button className="button" onClick={() => updateStatus(service.id, "APPROVED")} title="Aprobar"><Check size={16} /></button>
                  <button className="button danger" onClick={() => updateStatus(service.id, "REJECTED")} title="Rechazar"><X size={16} /></button>
                  <button className="ghost-button" onClick={() => edit(service)} title="Editar"><Pencil size={16} /></button>
                  <button className="ghost-button" onClick={() => remove(service.id)} title="Eliminar"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <h2>Productos Marca Chiapas</h2>
          <div className="table-list">
            {(summary.brandProducts || []).map((product) => (
              <div className="row-item" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <div className="muted">
                    {product.brandProfile.businessName} · Reg. {product.brandProfile.registrationNumber}
                  </div>
                  <div className="muted">
                    {product.productCategory} · {product.originMunicipality} · ${Number(product.price).toLocaleString("es-MX")} · {product.stock} pza(s)
                  </div>
                  <span className={`badge ${product.status === "PENDING" ? "pending" : product.status === "REJECTED" ? "rejected" : ""}`}>
                    {product.status}
                  </span>
                </div>
                <div className="actions">
                  <button className="button" onClick={() => updateBrandProductStatus(product.id, "APPROVED")} title="Aprobar producto"><Check size={16} /></button>
                  <button className="button danger" onClick={() => updateBrandProductStatus(product.id, "REJECTED")} title="Rechazar producto"><X size={16} /></button>
                  <button className="ghost-button" onClick={() => removeBrandProduct(product.id)} title="Eliminar producto"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {(!summary.brandProducts || summary.brandProducts.length === 0) && <p className="muted">Aun no hay productos Marca Chiapas.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function RegistrationMeta({ status, code }: { status: string; code?: string }) {
  return (
    <div className="actions" style={{ marginTop: 8 }}>
      <span className={`badge ${status === "PENDING" ? "pending" : status === "REJECTED" ? "rejected" : ""}`}>
        {status === "PENDING" ? "Pendiente de aceptacion" : status === "APPROVED" ? "Aceptado" : "Rechazado"}
      </span>
      {code && <span className="badge">Codigo {code}</span>}
    </div>
  );
}

function RegistrationActions({ status, onApprove, onReject }: { status: string; onApprove: () => void; onReject: () => void }) {
  if (status !== "PENDING") return null;
  return (
    <div className="actions">
      <button className="button" onClick={onApprove} title="Aceptar registro"><Check size={16} /></button>
      <button className="button danger" onClick={onReject} title="Rechazar registro"><X size={16} /></button>
    </div>
  );
}

function ReservationList({
  reservations,
  onUpdate
}: {
  reservations: Reservation[];
  onUpdate: (id: string, status: "CONTACTED" | "CONFIRMED" | "CANCELLED") => void;
}) {
  if (reservations.length === 0) return <p className="muted">Aun no hay solicitudes.</p>;
  return (
    <div className="table-list">
      {reservations.map((reservation) => (
        <div className="row-item" key={reservation.id}>
          <div>
            <strong>{reservation.name}</strong>
            <div className="muted">Folio: {reservation.code || reservation.id}</div>
            <div className="muted">
              {reservation.service?.name || "Servicio"} · {reservation.people} persona(s) · {paymentLabel(reservation.paymentMethod)}
            </div>
            <div className="muted">
              {reservation.phone || "Sin telefono"} · {reservation.email || "Sin correo"}{reservation.isAgency ? " · Agencia" : ""}
            </div>
            {reservation.travelDate && <div className="muted">Fecha deseada: {new Date(reservation.travelDate).toLocaleDateString("es-MX")}</div>}
            <div className="muted">Ultima actualizacion: {new Date(reservation.updatedAt || reservation.createdAt).toLocaleDateString("es-MX")}</div>
            <p style={{ margin: "8px 0 0" }}>{reservation.message}</p>
            <span className={`badge ${reservation.status === "NEW" ? "pending" : reservation.status === "CANCELLED" ? "rejected" : ""}`}>
              {reservationStatusLabel(reservation.status)}
            </span>
          </div>
          <div className="actions">
            <button className="ghost-button" onClick={() => onUpdate(reservation.id, "CONTACTED")}>Contactada</button>
            <button className="button" onClick={() => onUpdate(reservation.id, "CONFIRMED")}>Confirmar</button>
            <button className="button danger" onClick={() => onUpdate(reservation.id, "CANCELLED")}>Cancelar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentLinks({ item }: { item: VerificationDocs }) {
  const links = [
    ["RFC", item.rfcDocumentUrl],
    ["RNT", item.rntDocumentUrl],
    ["INE", item.ineDocumentUrl],
    ["Domicilio fiscal", item.fiscalAddressProofUrl]
  ].filter(([, href]) => Boolean(href));

  if (links.length === 0) return <div className="muted">Documentos pendientes</div>;

  return (
    <div className="actions" style={{ marginTop: 8 }}>
      {links.map(([label, href]) => (
        <a className="ghost-button" href={href} target="_blank" rel="noreferrer" key={label}>
          {label}
        </a>
      ))}
    </div>
  );
}

function GuideDocumentLinks({ certificationUrl, ineUrl }: { certificationUrl?: string; ineUrl?: string }) {
  const links = [
    ["Certificacion", certificationUrl],
    ["INE", ineUrl]
  ].filter(([, href]) => Boolean(href));

  if (links.length === 0) return <div className="muted">Documentos pendientes</div>;

  return (
    <div className="actions" style={{ marginTop: 8 }}>
      {links.map(([label, href]) => (
        <a className="ghost-button" href={href} target="_blank" rel="noreferrer" key={label}>
          {label}
        </a>
      ))}
    </div>
  );
}

function paymentLabel(value: string) {
  return value === "CARD" ? "Tarjeta Visa / Mastercard" : "Transferencia";
}

function reservationStatusLabel(value: string) {
  const labels: Record<string, string> = {
    NEW: "Nueva",
    CONTACTED: "Contactada",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada"
  };
  return labels[value] || value;
}

function label(key: string) {
  const labels: Record<string, string> = {
    users: "Usuarios",
    providers: "Proveedores",
    agencies: "Agencias",
    guides: "Guias",
    brandChiapas: "Marca Chiapas",
    services: "Servicios",
    brandProducts: "Productos Marca Chiapas",
    pending: "Pendientes",
    approved: "Aprobados",
    pendingRegistrations: "Registros pendientes",
    reservations: "Solicitudes"
  };
  return labels[key] || key;
}
