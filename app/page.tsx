import Link from "next/link";
import { BadgeCheck, BedDouble, Bus, ChefHat, Map, PackageCheck, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/ServiceCard";
import { getCurrentUser } from "@/lib/auth";
import { getDatabaseHealth } from "@/lib/db-health";
import { demoCategories, demoMode, getDemoServices } from "@/lib/demo-data";
import { T } from "@/components/T";

export const dynamic = "force-dynamic";

const categoryIcons = {
  hoteles: BedDouble,
  tours: Map,
  restaurantes: ChefHat,
  traslados: Bus,
  experiencias: Sparkles
};

export default async function HomePage() {
  const health = await getDatabaseHealth();
  if (!health.ok && !demoMode) {
    return (
      <main className="page">
        <section className="section">
          <div className="panel" style={{ display: "grid", gap: 14 }}>
            <span className="badge rejected">Base de datos pendiente</span>
            <h1 className="page-title">Chiapas En Tus Manos</h1>
            <p className="muted">
              La web ya esta compilada y el servidor esta activo. Falta conectar PostgreSQL para cargar categorias, servicios, registros y paneles.
            </p>
            <Link className="button" href="/setup">Ver pasos de configuracion</Link>
          </div>
        </section>
      </main>
    );
  }

  const [categories, featured, user] =
    !health.ok && demoMode
      ? [demoCategories, getDemoServices().filter((service) => service.status === "APPROVED"), null]
      : await Promise.all([
          prisma.category.findMany({ orderBy: { name: "asc" } }),
          prisma.service.findMany({
            where: { status: "APPROVED" },
            include: { category: true, images: true },
            take: 6,
            orderBy: { createdAt: "desc" }
          }),
          getCurrentUser()
        ]);

  return (
    <>
      <section className="hero">
        <div>
          <h1><T es="Chiapas reservado con comunidad, cultura y naturaleza." en="Chiapas booked with community, culture, and nature." /></h1>
          <p>
            <T
              es="Hoteles, tours, restaurantes, traslados, experiencias locales, guias certificados y productos Marca Chiapas en un catalogo verificable para turistas y agencias."
              en="Hotels, tours, restaurants, transfers, local experiences, certified guides, and Marca Chiapas products in a verifiable catalog for travelers and agencies."
            />
          </p>
          {!health.ok && demoMode && <p className="badge rejected"><T es="Modo demo sin PostgreSQL activo" en="Demo mode without PostgreSQL active" /></p>}
          <form className="search-bar" action="/catalogo">
            <input name="q" placeholder="Busca Canon del Sumidero, San Cristobal, textiles..." />
            <select name="category" defaultValue="">
              <option value="">Categoria / Category</option>
              {categories.map((category) => (
                <option value={category.slug} key={category.id}>{category.name}</option>
              ))}
            </select>
            <button className="button" type="submit"><T es="Buscar" en="Search" /></button>
          </form>
        </div>
      </section>

      <main className="page">
        <section className="section">
          <div className="section-head">
            <div>
              <h2><T es="Categorias" en="Categories" /></h2>
              <p className="muted"><T es="Encuentra servicios por tipo de viaje." en="Find services by travel style." /></p>
            </div>
            {!user && <Link className="button secondary" href="/registro"><T es="Registrar proveedor" en="Register provider" /></Link>}
          </div>
          <div className="category-grid">
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug as keyof typeof categoryIcons] || Sparkles;
              return (
                <Link className="category-tile" href={`/catalogo?category=${category.slug}`} key={category.id}>
                  <Icon size={24} />
                  <div style={{ marginTop: 18 }}>{category.name}</div>
                </Link>
              );
            })}
            <Link className="category-tile" href="/guias">
              <BadgeCheck size={24} />
              <div style={{ marginTop: 18 }}>Guias certificados</div>
            </Link>
            <Link className="category-tile" href="/marca-chiapas">
              <PackageCheck size={24} />
              <div style={{ marginTop: 18 }}>Marca Chiapas</div>
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2><T es="Servicios destacados" en="Featured services" /></h2>
              <p className="muted"><T es="Servicios aprobados por la administracion." en="Services approved by administration." /></p>
            </div>
            <Link className="ghost-button" href="/catalogo"><T es="Ver catalogo" en="View catalog" /></Link>
          </div>
          <div className="card-grid">
            {featured.map((service) => (
              <ServiceCard key={service.id} service={service} agency={user?.role === "AGENCY"} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
