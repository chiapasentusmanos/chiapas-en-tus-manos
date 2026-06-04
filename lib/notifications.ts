type RegistrationRole = "CLIENT" | "PROVIDER" | "AGENCY" | "GUIDE" | "BRAND_CHIAPAS";
type RegistrationPayload = {
  role: RegistrationRole;
  name: string;
  email: string;
  phone?: string | null;
  businessName: string;
  rfc: string;
  rnt: string;
  verificationCode: string;
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "";
const adminPhone = process.env.ADMIN_NOTIFICATION_PHONE || "";

function roleLabel(role: RegistrationRole) {
  if (role === "CLIENT") return "Cliente turista";
  if (role === "GUIDE") return "Guia de turistas certificado";
  if (role === "BRAND_CHIAPAS") return "Marca Chiapas";
  return role === "PROVIDER" ? "Proveedor" : "Agencia de viajes";
}

async function postJson(url: string, payload: unknown, headers?: Record<string, string>) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("No se pudo enviar notificacion", error);
  }
}

async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Chiapas En Tus Manos <notificaciones@chiapasentusmanos.mx>";
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;

  if (resendKey) {
    await postJson(
      "https://api.resend.com/emails",
      { from, to: [to], subject, text, html },
      { Authorization: `Bearer ${resendKey}` }
    );
    return;
  }

  if (webhookUrl) {
    await postJson(webhookUrl, { to, subject, text, html, from });
    return;
  }

  console.info("[email pendiente de configurar]", { to, subject, text });
}

async function sendSms(to: string, body: string) {
  const webhookUrl = process.env.SMS_WEBHOOK_URL;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;

  if (accountSid && authToken && from) {
    const form = new URLSearchParams({ To: to, From: from, Body: body });
    try {
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: form
      });
    } catch (error) {
      console.error("No se pudo enviar SMS", error);
    }
    return;
  }

  if (webhookUrl) {
    await postJson(webhookUrl, { to, body });
    return;
  }

  console.info("[sms pendiente de configurar]", { to, body });
}

export function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createReservationCode() {
  return `CETM-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function notifyAdminRegistration(payload: RegistrationPayload) {
  const label = roleLabel(payload.role);
  const subject = `Nuevo registro pendiente: ${label}`;
  const text = [
    `Se registro un nuevo ${label.toLowerCase()} en Chiapas En Tus Manos.`,
    `Nombre: ${payload.name}`,
    `Negocio: ${payload.businessName}`,
    `Correo: ${payload.email}`,
    `Telefono: ${payload.phone || "No capturado"}`,
    `RFC: ${payload.rfc}`,
    `RNT: ${payload.rnt}`,
    `Codigo de confirmacion: ${payload.verificationCode}`,
    `Revisar en: ${appUrl}/admin`
  ].join("\n");

  if (adminEmail) {
    await sendEmail(adminEmail, subject, text);
  } else {
    console.info("[correo de administrador pendiente de configurar]", { subject, text });
  }
  if (adminPhone) {
    await sendSms(
      adminPhone,
      `Chiapas En Tus Manos: nuevo ${label.toLowerCase()} pendiente. Codigo ${payload.verificationCode}. Revisar ${appUrl}/admin`
    );
  } else {
    console.info("[telefono de administrador pendiente de configurar]", {
      body: `Chiapas En Tus Manos: nuevo ${label.toLowerCase()} pendiente. Codigo ${payload.verificationCode}.`
    });
  }
}

export async function sendWelcomeEmail(to: string, name: string, role: RegistrationRole) {
  const label = roleLabel(role).toLowerCase();
  const subject = "Bienvenido a Chiapas En Tus Manos";
  const text = [
    `Hola ${name},`,
    `Tu registro como ${label} fue aprobado.`,
    "Ya puedes ingresar a la plataforma y continuar con tus operaciones.",
    `Acceso: ${appUrl}/login`,
    "Gracias por formar parte de Chiapas En Tus Manos."
  ].join("\n\n");
  await sendEmail(to, subject, text);
}

export async function sendRejectionEmail(to: string, name: string, role: RegistrationRole) {
  const label = roleLabel(role).toLowerCase();
  const subject = "Actualizacion de registro en Chiapas En Tus Manos";
  const text = [
    `Hola ${name},`,
    `Tu registro como ${label} fue rechazado por administracion.`,
    "Puedes contactar al equipo para revisar documentos o datos capturados."
  ].join("\n\n");
  await sendEmail(to, subject, text);
}

export async function notifyReservationCreated(payload: {
  to?: string | null;
  providerName?: string | null;
  code: string;
  serviceName: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  travelDate?: string | Date | null;
  people: number;
  paymentMethod: string;
  message: string;
}) {
  const payment = payload.paymentMethod === "CARD" ? "Tarjeta Visa / Mastercard" : "Transferencia";
  const subject = `Nueva solicitud de reserva ${payload.code}`;
  const text = [
    `Hola ${payload.providerName || "proveedor"},`,
    `Recibiste una nueva solicitud de reserva en Chiapas En Tus Manos.`,
    `Folio: ${payload.code}`,
    `Servicio: ${payload.serviceName}`,
    `Cliente: ${payload.customerName}`,
    `Correo: ${payload.customerEmail || "No capturado"}`,
    `Telefono: ${payload.customerPhone || "No capturado"}`,
    `Fecha deseada: ${payload.travelDate ? new Date(payload.travelDate).toLocaleDateString("es-MX") : "No capturada"}`,
    `Personas: ${payload.people}`,
    `Forma de pago: ${payment}`,
    "Estado de pago: Pendiente de pago",
    `Mensaje: ${payload.message}`,
    `Revisar solicitudes: ${appUrl}/proveedor`
  ].join("\n");

  const recipients = [payload.to, adminEmail].filter(Boolean) as string[];
  if (recipients.length > 0) {
    await Promise.all([...new Set(recipients)].map((to) => sendEmail(to, subject, text)));
  } else {
    console.info("[correo de nueva reserva pendiente de destinatario]", { subject, text });
  }
}

function reservationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    NEW: "nueva",
    CONTACTED: "contactada",
    CONFIRMED: "confirmada",
    CANCELLED: "cancelada"
  };
  return labels[status] || status.toLowerCase();
}

export async function notifyReservationStatusChanged(payload: {
  to?: string | null;
  customerName: string;
  code: string;
  serviceName: string;
  status: string;
  paymentStatus?: string;
  providerEmail?: string | null;
  agencyEmail?: string | null;
}) {
  const paid = payload.paymentStatus === "PAID";
  const subject = paid ? `Reserva confirmada y pagada ${payload.code}` : `Reserva pendiente de pago ${payload.code}`;
  const text = [
    `Hola ${payload.customerName},`,
    paid
      ? `Tu reserva ${payload.code} para ${payload.serviceName} fue confirmada porque el pago esta cubierto al 100%.`
      : `Tu reserva ${payload.code} para ${payload.serviceName} esta ${reservationStatusLabel(payload.status)} y queda pendiente de pago.`,
    `Puedes revisar tus solicitudes en: ${appUrl}/mis-reservas`,
    "Gracias por usar Chiapas En Tus Manos."
  ].join("\n\n");

  const recipients = [payload.to, payload.providerEmail, payload.agencyEmail, adminEmail].filter(Boolean) as string[];
  if (recipients.length === 0) {
    console.info("[correo de estado de reserva pendiente de destinatario]", { subject, text, payload });
    return;
  }
  await Promise.all([...new Set(recipients)].map((to) => sendEmail(to, subject, text)));
}
