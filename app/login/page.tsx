import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ pendiente?: string }> }) {
  const params = await searchParams;
  return (
    <main className="auth-shell">
      <section className="auth-box">
        <h1 className="page-title">Entrar</h1>
        <p className="muted">Accede con tu cuenta. El administrador entra aqui con el correo y contrasena asignados.</p>
        {params?.pendiente === "cliente" && (
          <div className="message" style={{ marginTop: 16 }}>
            Tu cuenta de cliente turista fue registrada y esta pendiente de aprobacion por administracion.
          </div>
        )}
        <AuthForm mode="login" />
        <Link className="muted-link" href="/recuperar-contrasena">
          Recuperar contrasena por correo o telefono
        </Link>
      </section>
    </main>
  );
}
