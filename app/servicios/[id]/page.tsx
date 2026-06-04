import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mapEmbed, money, paymentMethodLabels, whatsappUrl } from "@/lib/utils";
import { ReservationRequestForm } from "@/components/ReservationRequestForm";
import { demoMode, getDemoServices } from "@/lib/demo-data";
import { getDatabaseHealth } from "@/lib/db-health";
import { T } from "@/components/T";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const health = await getDatabaseHealth();
  const [service, user] =
    !health.ok && demoMode
      ? [getDemoServices().find((item) => item.id === id) || null, null]
      : await Promise.all([
          prisma.service.findUnique({
            where: { id },
            include: { category: true, images: true, provider: true }
          }),
          getCurrentUser()
        ]);

  if (!service || (service.status !== "APPROVED" && user?.role !== "ADMIN" && service.ownerId !== user?.id)) {
    notFound();
  }

  const mapUrl = mapEmbed(service.latitude, service.longitude);
  const image = service.images[0]?.url || "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80";
  const isAgency = user?.role === "AGENCY";

  return (
    <main className="page">
      <section className="section detail">
        <div>
          <img className="gallery-main" src={image} alt={service.name} />
          <div style={{ display: "flex", gap: 10, marginTop: 10, overflowX: "auto" }}>
            {service.images.slice(1).map((item) => (
              <img key={item.id} src={item.url} alt={item.alt || service.name} style={{ width: 150, height: 95, objectFit: "cover", borderRadius: 8 }} />
            ))}
          </div>
          <h1 className="page-title" style={{ marginTop: 24 }}>{service.name}</h1>
          <p className="muted">{service.category.name} en {service.municipality}</p>
          <p style={{ lineHeight: 1.7 }}>{service.description}</p>
          <div className="info-list">
            <div className="panel"><strong><T es="Horarios" en="Schedules" /></strong><p>{service.schedules}</p></div>
            <div className="panel"><strong><T es="Que incluye" en="Includes" /></strong><p>{service.includes}</p></div>
            <div className="panel"><strong><T es="Que no incluye" en="Not included" /></strong><p>{service.excludes}</p></div>
            <div className="panel"><strong><T es="Politicas" en="Policies" /></strong><p>{service.policies}</p></div>
          </div>
        </div>
        <aside className="panel">
          <span className="badge">{service.status === "APPROVED" ? "Aprobado" : service.status}</span>
          <h2 style={{ marginBottom: 6 }}>{money(String(service.price))}</h2>
          <p className="muted">{service.address}</p>
          <div className="message" style={{ margin: "12px 0" }}>
            <strong style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={18} /> Formas de pago
            </strong>
            <div style={{ marginTop: 8 }}>{paymentMethodLabels(service.paymentMethods).join(" · ")}</div>
          </div>
          <a className="button" href={whatsappUrl(service.whatsapp, service.name, isAgency)} target="_blank" rel="noreferrer" style={{ width: "100%", margin: "12px 0" }}>
            <MessageCircle size={18} /> <T es="Reservar por WhatsApp" en="Book via WhatsApp" />
          </a>
          <ReservationRequestForm serviceId={service.id} isAgency={isAgency} />
          {mapUrl ? (
            <iframe className="map" src={mapUrl} title={`Mapa de ${service.name}`} loading="lazy" />
          ) : (
            <div className="map" style={{ display: "grid", placeItems: "center" }}><T es="Mapa pendiente" en="Map pending" /></div>
          )}
          <Link className="ghost-button" href="/catalogo" style={{ display: "inline-flex", marginTop: 12 }}><T es="Volver al catalogo" en="Back to catalog" /></Link>
        </aside>
      </section>
    </main>
  );
}
