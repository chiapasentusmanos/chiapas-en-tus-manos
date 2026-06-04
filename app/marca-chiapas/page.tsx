import { CreditCard, MessageCircle, Package } from "lucide-react";
import { demoMode, getDemoBrandProducts } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type BrandProductView = {
  id: string;
  name: string;
  productCategory: string;
  originMunicipality: string;
  price: unknown;
  description: string;
  materials: string;
  presentation: string;
  stock: number;
  shipping: string;
  whatsapp: string;
  paymentMethods: string;
  images: Array<{ url: string; alt?: string | null }>;
  brandProfile: { businessName: string; registrationNumber: string; municipality: string };
};

export default async function BrandChiapasCatalogPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; productCategory?: string; originMunicipality?: string }>;
}) {
  const params = await searchParams;
  const products: BrandProductView[] = demoMode
    ? getDemoBrandProducts()
        .filter((product) => product.status === "APPROVED")
        .filter((product) => !params.productCategory || product.productCategory.toLowerCase().includes(params.productCategory.toLowerCase()))
        .filter((product) => !params.originMunicipality || product.originMunicipality.toLowerCase().includes(params.originMunicipality.toLowerCase()))
        .filter((product) => {
          const query = params.q?.toLowerCase();
          return !query || product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query) || product.productCategory.toLowerCase().includes(query);
        })
    : await prisma.brandProduct.findMany({
        where: {
          status: "APPROVED",
          productCategory: params.productCategory ? { contains: params.productCategory, mode: "insensitive" } : undefined,
          originMunicipality: params.originMunicipality ? { contains: params.originMunicipality, mode: "insensitive" } : undefined,
          OR: params.q
            ? [
                { name: { contains: params.q, mode: "insensitive" } },
                { description: { contains: params.q, mode: "insensitive" } },
                { productCategory: { contains: params.q, mode: "insensitive" } },
                { originMunicipality: { contains: params.q, mode: "insensitive" } }
              ]
            : undefined
        },
        include: { images: true, brandProfile: true },
        orderBy: { createdAt: "desc" }
      });

  return (
    <main className="page">
      <section className="section">
        <h1 className="page-title">Productos Marca Chiapas</h1>
        <p className="muted">Catalogo de productos de origen chiapaneco registrados y aprobados por administracion.</p>

        <form className="filters">
          <input name="q" placeholder="Buscar producto, marca o categoria" defaultValue={params.q || ""} />
          <select name="productCategory" defaultValue={params.productCategory || ""}>
            <option value="">Todas las categorias</option>
            <option value="Textiles">Textiles</option>
            <option value="Cafe y cacao">Cafe y cacao</option>
            <option value="Alimentos y bebidas">Alimentos y bebidas</option>
            <option value="Artesanias">Artesanias</option>
            <option value="Joyería y ambar">Joyeria y ambar</option>
            <option value="Cosmetica natural">Cosmetica natural</option>
            <option value="Moda y accesorios">Moda y accesorios</option>
            <option value="Decoracion">Decoracion</option>
          </select>
          <input name="originMunicipality" placeholder="Municipio de origen" defaultValue={params.originMunicipality || ""} />
          <button className="button" type="submit">Aplicar filtros</button>
        </form>

        {products.length === 0 ? (
          <div className="panel">No hay productos aprobados con esos filtros.</div>
        ) : (
          <div className="card-grid">
            {products.map((product) => (
              <article className="service-card" key={product.id}>
                {product.images[0] && <img src={product.images[0].url} alt={product.images[0].alt || product.name} />}
                <div className="card-body">
                  <span className="badge">{product.productCategory}</span>
                  <h3 style={{ margin: 0 }}>{product.name}</h3>
                  <div className="muted">{product.brandProfile.businessName} · Reg. {product.brandProfile.registrationNumber}</div>
                  <div className="muted"><Package size={16} /> {product.originMunicipality} · {product.presentation}</div>
                  <p className="muted" style={{ margin: 0 }}>{product.description}</p>
                  <strong className="price">${Number(product.price).toLocaleString("es-MX")}</strong>
                  <span className="muted" style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <CreditCard size={16} /> {paymentMethodsLabel(product.paymentMethods)}
                  </span>
                  <div className="muted">Materiales: {product.materials}</div>
                  <div className="muted">Envio: {product.shipping}</div>
                  <a className="button" href={whatsappProductUrl(product.whatsapp, product.name)} target="_blank" rel="noreferrer">
                    <MessageCircle size={17} /> Solicitar por WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function paymentMethodsLabel(value: string) {
  const methods = value.split(",");
  const labels = [];
  if (methods.includes("TRANSFER")) labels.push("Transferencia");
  if (methods.includes("CARD")) labels.push("Tarjeta Visa / Mastercard");
  return labels.join(" · ") || "Consultar forma de pago";
}

function whatsappProductUrl(phone: string, name: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const text = `Hola. Me interesa el producto Marca Chiapas "${name}". ¿Me compartes disponibilidad, envio y forma de compra?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
