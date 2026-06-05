export default function PrivacyPage() {
  return (
    <main className="page">
      <section className="section legal-page">
        <h1 className="page-title">Politica de privacidad</h1>
        <p className="muted">Ultima actualizacion: 4 de junio de 2026.</p>

        <div className="panel legal-content">
          <h2>Responsable</h2>
          <p>
            Chiapas En Tus Manos opera como plataforma digital para conectar turistas, agencias, proveedores,
            guias certificados y marcas Marca Chiapas.
          </p>

          <h2>Datos que podemos recopilar</h2>
          <p>
            Podemos recopilar nombre, correo electronico, telefono, datos de registro, documentos de
            verificacion, informacion de servicios, productos, solicitudes de reserva y datos necesarios para administrar
            la cuenta.
          </p>

          <h2>Uso de la informacion</h2>
          <p>
            Usamos la informacion para crear cuentas, validar registros, mostrar catalogos aprobados, procesar pagos,
            notificar al administrador, dar seguimiento a reservas y operar la plataforma.
          </p>

          <h2>Documentos y verificacion</h2>
          <p>
            Los documentos cargados por proveedores, agencias, guias y registros Marca Chiapas se usan solo para revision
            administrativa y aceptacion o rechazo del registro.
          </p>

          <h2>Servicios externos</h2>
          <p>
            La plataforma puede usar servicios externos como correo electronico, SMS, Google/Apple OAuth,
            Vercel, Supabase y proveedores de pago. Cada servicio puede aplicar sus propias politicas.
          </p>

          <h2>Derechos del usuario</h2>
          <p>
            Los usuarios pueden solicitar correccion, actualizacion o baja de sus datos a traves del correo de soporte
            que se publique para la operacion de la plataforma.
          </p>

          <h2>Contacto</h2>
          <p>
            Antes del lanzamiento publico debe configurarse un correo oficial de soporte y privacidad para recibir
            solicitudes de usuarios.
          </p>
        </div>
      </section>
    </main>
  );
}
