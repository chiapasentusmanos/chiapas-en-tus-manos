"use client";

import { useMemo, useState } from "react";
import { Download, Mail, MessageCircle, Plus, Printer, Trash2 } from "lucide-react";
import { money } from "@/lib/utils";

type QuoteService = {
  id: string;
  name: string;
  municipality: string;
  price: number;
};

type QuoteItem = {
  serviceId: string;
  concept: string;
  quantity: number;
  unitPrice: number;
};

type AgencyQuoteBuilderProps = {
  agencyName: string;
  agentName: string;
  services: QuoteService[];
};

const IVA_RATE = 0.16;

export function AgencyQuoteBuilder({ agencyName, agentName, services }: AgencyQuoteBuilderProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("Precios sujetos a disponibilidad. Cotizacion expresada en MXN con impuestos incluidos.");
  const [items, setItems] = useState<QuoteItem[]>([
    {
      serviceId: services[0]?.id || "manual",
      concept: services[0]?.name || "",
      quantity: 1,
      unitPrice: services[0]?.price || 0
    }
  ]);

  const totals = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const subtotal = total / (1 + IVA_RATE);
    const tax = total - subtotal;
    return { subtotal, tax, total };
  }, [items]);

  const quoteCode = useMemo(() => `CETM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`, []);

  const quoteText = useMemo(() => {
    const lines = [
      `Cotizacion ${quoteCode}`,
      "Chiapas En Tus Manos",
      `Agencia: ${agencyName}`,
      `Agente: ${agentName}`,
      "",
      `Cliente: ${clientName || "Por definir"}`,
      clientEmail ? `Correo: ${clientEmail}` : "",
      clientWhatsapp ? `WhatsApp: ${clientWhatsapp}` : "",
      travelDate ? `Fecha de viaje: ${travelDate}` : "",
      validUntil ? `Vigencia: ${validUntil}` : "",
      "",
      "Servicios cotizados:"
    ].filter(Boolean);

    items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.concept || "Concepto"} | Cantidad: ${item.quantity} | Unitario: ${money(item.unitPrice)} | Importe: ${money(item.quantity * item.unitPrice)}`);
    });

    lines.push(
      "",
      `Subtotal sin IVA: ${money(totals.subtotal)}`,
      `IVA incluido 16%: ${money(totals.tax)}`,
      `Total con impuestos incluidos: ${money(totals.total)}`,
      "",
      notes,
      "",
      "Para confirmar esta cotizacion responde por WhatsApp o correo."
    );

    return lines.join("\n");
  }, [agencyName, agentName, clientEmail, clientName, clientWhatsapp, items, notes, quoteCode, totals, travelDate, validUntil]);

  function updateItem(index: number, patch: Partial<QuoteItem>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function selectService(index: number, serviceId: string) {
    const service = services.find((item) => item.id === serviceId);
    updateItem(index, {
      serviceId,
      concept: service?.name || "",
      unitPrice: service?.price || 0
    });
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { serviceId: "manual", concept: "", quantity: 1, unitPrice: 0 }
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
  }

  function downloadQuote() {
    const blob = new Blob([quoteText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quoteCode.toLowerCase()}-cotizacion.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const whatsappHref = `https://wa.me/${clientWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(quoteText)}`;
  const mailHref = `mailto:${clientEmail}?subject=${encodeURIComponent(`Cotizacion ${quoteCode} - Chiapas En Tus Manos`)}&body=${encodeURIComponent(quoteText)}`;

  return (
    <div className="quote-shell">
      <div className="panel quote-form">
        <div className="form-grid">
          <div className="field">
            <label>Cliente</label>
            <input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Nombre del cliente" required />
          </div>
          <div className="field">
            <label>WhatsApp del cliente</label>
            <input value={clientWhatsapp} onChange={(event) => setClientWhatsapp(event.target.value)} placeholder="Ej. 529611234567" />
          </div>
          <div className="field">
            <label>Correo del cliente</label>
            <input value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="cliente@correo.com" type="email" />
          </div>
          <div className="field">
            <label>Fecha de viaje</label>
            <input value={travelDate} onChange={(event) => setTravelDate(event.target.value)} type="date" />
          </div>
          <div className="field">
            <label>Vigencia de cotizacion</label>
            <input value={validUntil} onChange={(event) => setValidUntil(event.target.value)} type="date" />
          </div>
        </div>

        <div className="quote-items">
          {items.map((item, index) => (
            <div className="quote-item" key={`${item.serviceId}-${index}`}>
              <div className="field">
                <label>Servicio o concepto</label>
                <select value={item.serviceId} onChange={(event) => selectService(index, event.target.value)}>
                  <option value="manual">Concepto manual</option>
                  {services.map((service) => (
                    <option value={service.id} key={service.id}>{service.name} - {service.municipality}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Descripcion</label>
                <input value={item.concept} onChange={(event) => updateItem(index, { concept: event.target.value })} placeholder="Tour, hotel, traslado..." />
              </div>
              <div className="field">
                <label>Cantidad</label>
                <input value={item.quantity} min="1" type="number" onChange={(event) => updateItem(index, { quantity: Number(event.target.value) || 1 })} />
              </div>
              <div className="field">
                <label>Precio unitario con IVA</label>
                <input value={item.unitPrice} min="0" type="number" onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) || 0 })} />
              </div>
              <button className="ghost-button icon-button" type="button" onClick={() => removeItem(index)} aria-label="Eliminar concepto">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <button className="ghost-button" type="button" onClick={addItem}>
          <Plus size={17} /> Agregar concepto
        </button>

        <div className="field">
          <label>Notas y condiciones</label>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
      </div>

      <aside className="panel quote-preview">
        <div>
          <span className="badge">Cotizacion</span>
          <h2>{quoteCode}</h2>
          <p className="muted">{agencyName} · {agentName}</p>
        </div>
        <div className="quote-total-box">
          <div><span>Subtotal sin IVA</span><strong>{money(totals.subtotal)}</strong></div>
          <div><span>IVA incluido 16%</span><strong>{money(totals.tax)}</strong></div>
          <div><span>Total</span><strong>{money(totals.total)}</strong></div>
        </div>
        <pre className="quote-text">{quoteText}</pre>
        <div className="actions">
          <button className="button" type="button" onClick={downloadQuote}><Download size={17} /> Descargar</button>
          <button className="ghost-button" type="button" onClick={() => window.print()}><Printer size={17} /> PDF</button>
          <a className={`button secondary ${clientWhatsapp ? "" : "disabled-link"}`} href={clientWhatsapp ? whatsappHref : "#"} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a>
          <a className={`ghost-button ${clientEmail ? "" : "disabled-link"}`} href={clientEmail ? mailHref : "#"}><Mail size={17} /> Correo</a>
        </div>
      </aside>
    </div>
  );
}
