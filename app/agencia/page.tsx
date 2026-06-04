import Link from "next/link";
import { redirect } from "next/navigation";
import { AgencyQuoteBuilder } from "@/components/AgencyQuoteBuilder";
import { ReservationCalendar } from "@/components/ReservationCalendar";
import { requireRole } from "@/lib/auth";
import { demoMode, filterDemoServices } from "@/lib/demo-data";
import { getDatabaseHealth } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencyPage() {
  const user = await requireRole(["AGENCY", "ADMIN"]);
  if (!user) redirect("/login");

  const health = await getDatabaseHealth();
  const services = !health.ok && demoMode
    ? filterDemoServices({}).map((service) => ({
        id: service.id,
        name: service.name,
        municipality: service.municipality,
        price: Number(service.price),
        netPrice: Number(service.netPrice || Math.round(Number(service.price) * 0.75))
      }))
    : await prisma.service.findMany({
        where: { status: "APPROVED" },
        select: { id: true, name: true, municipality: true, price: true, netPrice: true },
        orderBy: { name: "asc" }
      }).then((items) => items.map((service) => ({
        ...service,
        price: Number(service.price),
        netPrice: Number(service.netPrice)
      })));

  return (
    <main className="page">
      <section className="section">
        <div className="section-head">
          <div>
            <h1 className="page-title">Panel de agencia</h1>
            <p className="muted">Elabora cotizaciones con impuestos incluidos y compártelas por WhatsApp o correo.</p>
          </div>
          <div className="actions">
            <Link className="ghost-button" href="/catalogo">Ver catalogo</Link>
            <Link className="ghost-button" href="/mis-reservas">Mis reservas</Link>
          </div>
        </div>

        <AgencyQuoteBuilder
          agencyName={user.agencyProfile?.agencyName || "Agencia de viajes"}
          agentName={user.name}
          services={services}
        />
        <ReservationCalendar title="Calendario de reservas de agencia" />
      </section>
    </main>
  );
}
