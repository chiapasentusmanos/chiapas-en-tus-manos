import Link from "next/link";
import { CreditCard, MapPin, MessageCircle } from "lucide-react";
import { money, paymentMethodLabels, whatsappUrl, type ServiceCard as ServiceCardType } from "@/lib/utils";
import { T } from "@/components/T";

export function ServiceCard({ service, agency = false }: { service: ServiceCardType; agency?: boolean }) {
  const image = service.images[0]?.url || "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80";
  const netPrice = service.netPrice ?? Math.round(Number(service.price) * 0.85);

  return (
    <article className="service-card">
      <Link href={`/servicios/${service.id}`}>
        <img src={image} alt={service.name} />
      </Link>
      <div className="card-body">
        <span className="badge">{service.category.name}</span>
        <Link href={`/servicios/${service.id}`}>
          <h3 style={{ margin: 0 }}>{service.name}</h3>
        </Link>
        <span className="muted" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <MapPin size={16} /> {service.municipality}
        </span>
        <p className="muted" style={{ margin: 0 }}>{service.description.slice(0, 120)}...</p>
        <div>
          <strong className="price">{money(String(service.price))}</strong>
          {agency && (
            <div className="muted" style={{ marginTop: 4 }}>
              Tarifa neta agencia: <strong>{money(String(netPrice))}</strong>
            </div>
          )}
        </div>
        <span className="muted" style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <CreditCard size={16} /> {paymentMethodLabels(service.paymentMethods).join(" · ")}
        </span>
        <div className="actions">
          <Link className="ghost-button" href={`/servicios/${service.id}`}><T es="Ver detalle" en="View details" /></Link>
          <a className="button" href={whatsappUrl(service.whatsapp, service.name, agency)} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> <T es="Reservar" en="Book" />
          </a>
        </div>
      </div>
    </article>
  );
}
