import { MessageCircle } from "lucide-react";
import { demoMode, getDemoGuides } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GuideView = {
  id: string;
  guideType: string;
  scope: string;
  certificationNumber: string;
  languages: string;
  municipalities: string;
  yearsExperience: number;
  bio: string;
  whatsapp: string;
  user: { name: string; email: string };
};

export default async function GuidesPage({
  searchParams
}: {
  searchParams: Promise<{ guideType?: string; scope?: string; q?: string }>;
}) {
  const params = await searchParams;
  const guides: GuideView[] = demoMode
    ? getDemoGuides()
        .filter((guide) => guide.status === "APPROVED")
        .filter((guide) => !params.guideType || guide.guideType === params.guideType)
        .filter((guide) => !params.scope || guide.scope === params.scope)
        .filter((guide) => {
          const query = params.q?.toLowerCase();
          return !query || guide.user.name.toLowerCase().includes(query) || guide.municipalities.toLowerCase().includes(query) || guide.languages.toLowerCase().includes(query);
        })
    : await prisma.guide.findMany({
        where: {
          status: "APPROVED",
          guideType: params.guideType || undefined,
          scope: params.scope || undefined,
          OR: params.q
            ? [
                { user: { name: { contains: params.q, mode: "insensitive" } } },
                { municipalities: { contains: params.q, mode: "insensitive" } },
                { languages: { contains: params.q, mode: "insensitive" } },
                { bio: { contains: params.q, mode: "insensitive" } }
              ]
            : undefined
        },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" }
      });

  return (
    <main className="page">
      <section className="section">
        <h1 className="page-title">Guias de turistas certificados</h1>
        <p className="muted">Consulta guias NOM-08 y NOM-09, locales y nacionales, aprobados por administracion.</p>

        <form className="filters">
          <input name="q" placeholder="Buscar por nombre, idioma o municipio" defaultValue={params.q || ""} />
          <select name="guideType" defaultValue={params.guideType || ""}>
            <option value="">Todos los tipos</option>
            <option value="NOM-08">Guias NOM-08</option>
            <option value="NOM-09">Guias NOM-09</option>
          </select>
          <select name="scope" defaultValue={params.scope || ""}>
            <option value="">Local y nacional</option>
            <option value="LOCAL">Locales</option>
            <option value="NATIONAL">Nacionales</option>
          </select>
          <button className="button" type="submit">Aplicar filtros</button>
        </form>

        {guides.length === 0 ? (
          <div className="panel">No hay guias aprobados con esos filtros.</div>
        ) : (
          <div className="card-grid">
            {guides.map((guide) => (
              <article className="service-card" key={guide.id}>
                <div className="card-body">
                  <span className="badge">{guide.guideType} · {guide.scope === "LOCAL" ? "Local" : "Nacional"}</span>
                  <h3 style={{ margin: 0 }}>{guide.user.name}</h3>
                  <div className="muted">Certificacion: {guide.certificationNumber}</div>
                  <div className="muted">Idiomas: {guide.languages}</div>
                  <div className="muted">Zonas: {guide.municipalities}</div>
                  <div className="muted">{guide.yearsExperience} anos de experiencia</div>
                  <p className="muted" style={{ margin: 0 }}>{guide.bio}</p>
                  <a className="button" href={whatsappGuideUrl(guide.whatsapp, guide.user.name)} target="_blank" rel="noreferrer">
                    <MessageCircle size={17} /> Contactar guia
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

function whatsappGuideUrl(phone: string, name: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const text = `Hola. Me interesa contactar al guia certificado ${name} para un servicio turistico en Chiapas.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
