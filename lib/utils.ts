export type ServiceCard = {
  id: string;
  name: string;
  municipality: string;
  price: unknown;
  netPrice?: unknown;
  description: string;
  whatsapp: string;
  paymentMethods?: string | null;
  category: { name: string; slug?: string };
  images: Array<{ id: string; url: string; alt: string | null; serviceId?: string }>;
};

export function money(value: number | string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function whatsappUrl(phone: string, serviceName: string, isAgency = false) {
  const cleanPhone = phone.replace(/\D/g, "");
  const prefix = isAgency ? "Hola, soy una agencia de viajes" : "Hola";
  const text = `${prefix}. Me interesa reservar "${serviceName}" en Chiapas. ¿Me compartes disponibilidad y detalles?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function mapEmbed(latitude?: unknown, longitude?: unknown) {
  if (!latitude || !longitude) return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.015}%2C${lng + 0.015}%2C${lat + 0.015}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function paymentMethodLabels(value?: string | null) {
  const methods = String(value || "TRANSFER,CARD")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const labels: Record<string, string> = {
    TRANSFER: "Transferencia",
    CARD: "Tarjeta Visa / Mastercard"
  };
  return methods.map((method) => labels[method] || method);
}
