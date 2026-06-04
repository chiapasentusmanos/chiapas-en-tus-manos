import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="auth-shell">
      <section className="auth-box">
        <h1 className="page-title">Registro</h1>
        <p className="muted">Crea tu cuenta para reservar, publicar servicios, identificarte como agencia, registrarte como guia certificado o Marca Chiapas. El administrador ingresa solo con credenciales asignadas.</p>
        <AuthForm mode="register" />
      </section>
    </main>
  );
}
