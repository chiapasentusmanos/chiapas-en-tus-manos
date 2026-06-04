import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/ServiceCard";
import { getCurrentUser } from "@/lib/auth";
import { demoCategories, demoMode, filterDemoServices } from "@/lib/demo-data";
import { getDatabaseHealth } from "@/lib/db-health";
import { T } from "@/components/T";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; municipality?: string; maxPrice?: string; paymentMethod?: string }>;
}) {
  const params = await searchParams;
  const health = await getDatabaseHealth();
  const [categories, services, user] =
    !health.ok && demoMode
      ? [demoCategories, filterDemoServices(params), null]
      : await Promise.all([
          prisma.category.findMany({ orderBy: { name: "asc" } }),
          prisma.service.findMany({
            where: {
              status: "APPROVED",
              category: params.category ? { slug: params.category } : undefined,
              municipality: params.municipality ? { contains: params.municipality, mode: "insensitive" } : undefined,
              price: params.maxPrice ? { lte: Number(params.maxPrice) } : undefined,
              paymentMethods: params.paymentMethod ? { contains: params.paymentMethod } : undefined,
              OR: params.q
                ? [
                    { name: { contains: params.q, mode: "insensitive" } },
                    { description: { contains: params.q, mode: "insensitive" } },
                    { municipality: { contains: params.q, mode: "insensitive" } }
                  ]
                : undefined
            },
            include: { category: true, images: true },
            orderBy: { createdAt: "desc" }
          }),
          getCurrentUser()
        ]);

  return (
    <main className="page">
      <section className="section">
        <h1 className="page-title"><T es="Catalogo publico" en="Public catalog" /></h1>
        <p className="muted">
          {!health.ok && demoMode
            ? <T es="Modo demo activo con datos de prueba." en="Demo mode active with sample data." />
            : user?.role === "AGENCY"
              ? "Estas navegando identificado como agencia."
              : <T es="Filtra y reserva directo por WhatsApp." en="Filter and book directly via WhatsApp." />}
        </p>
        <form className="filters">
          <input name="q" placeholder="Buscar" defaultValue={params.q || ""} />
          <select name="category" defaultValue={params.category || ""}>
            <option value="">Todas las categorias / All categories</option>
            {categories.map((category) => (
              <option value={category.slug} key={category.id}>{category.name}</option>
            ))}
          </select>
          <input name="municipality" placeholder="Municipio / Municipality" defaultValue={params.municipality || ""} />
          <input name="maxPrice" placeholder="Precio max. / Max price" type="number" min="0" defaultValue={params.maxPrice || ""} />
          <select name="paymentMethod" defaultValue={params.paymentMethod || ""}>
            <option value="">Todas las formas de pago</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="CARD">Tarjeta Visa / Mastercard</option>
          </select>
          <button className="button" type="submit"><T es="Aplicar filtros" en="Apply filters" /></button>
        </form>

        {services.length === 0 ? (
          <div className="panel"><T es="No hay servicios aprobados con esos filtros." en="There are no approved services for those filters." /></div>
        ) : (
          <div className="card-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} agency={user?.role === "AGENCY"} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
