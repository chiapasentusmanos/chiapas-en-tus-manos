import { PasswordRecoveryForm } from "@/components/PasswordRecoveryForm";

export default function PasswordRecoveryPage() {
  return (
    <main className="auth-shell">
      <section className="auth-box">
        <h1 className="page-title">Recuperar contrasena</h1>
        <p className="muted">Ingresa tu correo electronico o telefono para iniciar la recuperacion.</p>
        <PasswordRecoveryForm />
      </section>
    </main>
  );
}
