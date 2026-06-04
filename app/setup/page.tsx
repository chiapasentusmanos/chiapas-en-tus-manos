import { Database, ExternalLink, Terminal } from "lucide-react";
import { getDatabaseHealth } from "@/lib/db-health";
import { demoMode } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const health = await getDatabaseHealth();

  return (
    <main className="page">
      <section className="section">
        <div className="panel" style={{ display: "grid", gap: 18 }}>
          <span className={`badge ${health.ok ? "" : "rejected"}`}>
            {health.ok ? "Conectado" : demoMode ? "Modo demo activo" : "Base de datos pendiente"}
          </span>
          <h1 className="page-title">Configuracion local</h1>
          <p className="muted">
            El codigo ya compila y el servidor Next esta listo. Para activar registro, paneles y catalogo dinamico falta conectar PostgreSQL.
          </p>
          {!health.ok && (
            <div className="message error">
              No se pudo conectar a `localhost:5432`. Ahora `DEMO_MODE=true` permite navegar con datos de prueba; para produccion conecta PostgreSQL y cambia `DEMO_MODE=false`.
            </div>
          )}
          <div className="info-list">
            <div>
              <h2><Database size={20} /> Opcion A: Docker local</h2>
              <pre><code>{`docker compose up -d
npm run prisma:migrate
npm run db:seed
npm run dev:wasm`}</code></pre>
            </div>
            <div>
              <h2><ExternalLink size={20} /> Opcion B: Supabase</h2>
              <pre><code>{`# .env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?schema=public"

npm run prisma:deploy
npm run db:seed
npm run dev:wasm`}</code></pre>
            </div>
            <div>
              <h2><Terminal size={20} /> Estado tecnico</h2>
              <pre><code>{health.message}</code></pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
