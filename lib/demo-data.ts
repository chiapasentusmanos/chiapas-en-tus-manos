import { ServiceStatus, UserRole } from "@prisma/client";
import { slugify } from "@/lib/utils";

export const demoMode = process.env.DEMO_MODE === "true";

export const demoCategories = [
  { id: "cat_hoteles", name: "Hoteles", slug: "hoteles" },
  { id: "cat_tours", name: "Tours", slug: "tours" },
  { id: "cat_restaurantes", name: "Restaurantes", slug: "restaurantes" },
  { id: "cat_traslados", name: "Traslados", slug: "traslados" },
  { id: "cat_experiencias", name: "Experiencias", slug: "experiencias" }
];

const now = new Date();

type DemoRole = "CLIENT" | "PROVIDER" | "AGENCY" | "GUIDE" | "BRAND_CHIAPAS" | "ADMIN";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verificationCode: string;
  authProvider: string | null;
  providerAccountId: string | null;
  reviewedAt: Date | null;
  providerProfile: DemoProvider | null;
  agencyProfile: DemoAgency | null;
  guideProfile: DemoGuide | null;
  brandChiapasProfile: DemoBrandChiapasProfile | null;
};

type DemoProvider = {
  id: string;
  userId: string;
  businessName: string;
  rfc: string;
  rnt: string;
  rfcDocumentUrl: string;
  rntDocumentUrl: string;
  ineDocumentUrl: string;
  fiscalAddressProofUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verificationCode: string;
  notifiedAt: Date | null;
  reviewedAt: Date | null;
  municipality: string | null;
  description: string | null;
  whatsapp: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DemoAgency = {
  id: string;
  userId: string;
  agencyName: string;
  rfc: string;
  rnt: string;
  rfcDocumentUrl: string;
  rntDocumentUrl: string;
  ineDocumentUrl: string;
  fiscalAddressProofUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verificationCode: string;
  notifiedAt: Date | null;
  reviewedAt: Date | null;
  contactName: string | null;
  whatsapp: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DemoGuide = {
  id: string;
  userId: string;
  guideType: string;
  scope: string;
  certificationNumber: string;
  certificationDocumentUrl: string;
  ineDocumentUrl: string;
  languages: string;
  municipalities: string;
  yearsExperience: number;
  bio: string;
  whatsapp: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verificationCode: string;
  notifiedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DemoBrandChiapasProfile = {
  id: string;
  userId: string;
  businessName: string;
  rfc: string;
  registrationNumber: string;
  municipality: string;
  description: string;
  whatsapp: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verificationCode: string;
  notifiedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DemoBrandProduct = {
  id: string;
  name: string;
  slug: string;
  productCategory: string;
  originMunicipality: string;
  price: string;
  description: string;
  materials: string;
  presentation: string;
  stock: number;
  shipping: string;
  whatsapp: string;
  paymentMethods: string;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  brandProfileId: string;
  brandProfile: DemoBrandChiapasProfile;
  images: Array<{ id: string; url: string; alt: string | null; productId: string }>;
};

type DemoService = {
  id: string;
  name: string;
  slug: string;
  municipality: string;
  address: string;
  price: string;
  netPrice: string;
  adminNetPrice: string;
  agencyDiscount: string;
  adminDiscount: string;
  description: string;
  schedules: string;
  includes: string;
  excludes: string;
  policies: string;
  whatsapp: string;
  paymentMethods: string;
  latitude: string | null;
  longitude: string | null;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  providerId: string | null;
  categoryId: string;
  category: (typeof demoCategories)[number];
  provider: DemoProvider | null;
  images: Array<{ id: string; url: string; alt: string | null; serviceId: string }>;
};

type DemoReservation = {
  id: string;
  code?: string;
  serviceId: string;
  userId?: string | null;
  ownerId?: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  travelDate?: string | null;
  people: number;
  paymentMethod: string;
  status: "NEW" | "CONTACTED" | "CONFIRMED" | "CANCELLED";
  isAgency: boolean;
  createdAt: string;
  updatedAt?: string;
  service?: { id: string; name: string; municipality: string; ownerId: string };
};

const initialProvider: DemoProvider = {
  id: "demo-provider",
  userId: "demo-provider-user",
  businessName: "Mundo Maya Operadora",
  rfc: "MMO010101AB1",
  rnt: "RNT-DEMO-002",
  rfcDocumentUrl: "/uploads/demo/rfc.pdf",
  rntDocumentUrl: "/uploads/demo/rnt.pdf",
  ineDocumentUrl: "/uploads/demo/ine.pdf",
  fiscalAddressProofUrl: "/uploads/demo/comprobante-domicilio-fiscal.pdf",
  status: "APPROVED",
  verificationCode: "123456",
  notifiedAt: now,
  reviewedAt: now,
  municipality: "San Cristobal de las Casas",
  description: "Tours culturales y de naturaleza con guias locales.",
  whatsapp: "529611234567",
  createdAt: now,
  updatedAt: now
};

const initialServices: DemoService[] = [
  {
    id: "demo-canon-sumidero",
    name: "Canon del Sumidero en lancha",
    slug: "canon-del-sumidero-en-lancha",
    municipality: "Chiapa de Corzo",
    address: "Embarcadero Cahuaré, Chiapa de Corzo",
    price: "650",
    netPrice: "487.50",
    adminNetPrice: "422.50",
    agencyDiscount: "25",
    adminDiscount: "35",
    description: "Recorrido por el Canon del Sumidero con visita panoramica a Chiapa de Corzo.",
    schedules: "Salidas 9:00, 11:00 y 13:00",
    includes: "Lancha compartida, guia local, seguro basico",
    excludes: "Alimentos, propinas, transporte desde hotel",
    policies: "Reservacion con 24 horas. Cambios sujetos a clima y disponibilidad.",
    whatsapp: "529611234567",
    paymentMethods: "TRANSFER,CARD",
    latitude: "16.8067000",
    longitude: "-93.0889000",
    status: ServiceStatus.APPROVED,
    createdAt: now,
    updatedAt: now,
    ownerId: "demo-provider-user",
    providerId: "demo-provider",
    categoryId: "cat_tours",
    category: demoCategories[1],
    provider: initialProvider,
    images: [
      {
        id: "img-canon",
        url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80",
        alt: "Canon del Sumidero en lancha",
        serviceId: "demo-canon-sumidero"
      }
    ]
  },
  {
    id: "demo-zinacantan",
    name: "Experiencia textil en Zinacantan",
    slug: "experiencia-textil-en-zinacantan",
    municipality: "Zinacantan",
    address: "Centro de Zinacantan",
    price: "480",
    netPrice: "360",
    adminNetPrice: "312",
    agencyDiscount: "25",
    adminDiscount: "35",
    description: "Taller con artesanas locales para conocer telar de cintura, simbolos y cocina tradicional.",
    schedules: "Lunes a sabado, 10:00 a 16:00",
    includes: "Anfitriona local, materiales, degustacion",
    excludes: "Traslado, compras personales",
    policies: "Grupos pequenos. Cancelacion gratis hasta 48 horas antes.",
    whatsapp: "529611234567",
    paymentMethods: "TRANSFER,CARD",
    latitude: "16.7605000",
    longitude: "-92.7223000",
    status: ServiceStatus.APPROVED,
    createdAt: now,
    updatedAt: now,
    ownerId: "demo-provider-user",
    providerId: "demo-provider",
    categoryId: "cat_experiencias",
    category: demoCategories[4],
    provider: null,
    images: [
      {
        id: "img-zinacantan",
        url: "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1200&q=80",
        alt: "Experiencia textil en Zinacantan",
        serviceId: "demo-zinacantan"
      }
    ]
  },
  {
    id: "demo-hotel-boutique",
    name: "Hotel boutique centro historico",
    slug: "hotel-boutique-centro-historico",
    municipality: "San Cristobal de las Casas",
    address: "Andador Guadalupano 12",
    price: "1450",
    netPrice: "1087.50",
    adminNetPrice: "942.50",
    agencyDiscount: "25",
    adminDiscount: "35",
    description: "Habitaciones comodas en casona restaurada, cerca de restaurantes y museos.",
    schedules: "Check-in 15:00, check-out 12:00",
    includes: "Desayuno continental, wifi, estacionamiento sujeto a disponibilidad",
    excludes: "Impuestos locales, alimentos extra",
    policies: "Tarifa sujeta a disponibilidad. No show cobra primera noche.",
    whatsapp: "529611234567",
    paymentMethods: "TRANSFER,CARD",
    latitude: "16.7370000",
    longitude: "-92.6376000",
    status: ServiceStatus.APPROVED,
    createdAt: now,
    updatedAt: now,
    ownerId: "demo-provider-user",
    providerId: "demo-provider",
    categoryId: "cat_hoteles",
    category: demoCategories[0],
    provider: null,
    images: [
      {
        id: "img-hotel",
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        alt: "Hotel boutique centro historico",
        serviceId: "demo-hotel-boutique"
      }
    ]
  }
];

const initialBrandProfile: DemoBrandChiapasProfile = {
  id: "demo-brand-chiapas",
  userId: "demo-brand-user",
  businessName: "Textiles Altos de Chiapas",
  rfc: "TAC010101AB1",
  registrationNumber: "MC-DEMO-001",
  municipality: "San Cristobal de las Casas",
  description: "Marca registrada de productos textiles elaborados por familias artesanas de los Altos de Chiapas.",
  whatsapp: "529616667788",
  status: "APPROVED",
  verificationCode: "456789",
  notifiedAt: now,
  reviewedAt: now,
  createdAt: now,
  updatedAt: now
};

const initialBrandProducts: DemoBrandProduct[] = [
  {
    id: "demo-product-rebozo",
    name: "Rebozo tejido en telar de cintura",
    slug: "rebozo-tejido-en-telar-de-cintura",
    productCategory: "Textiles",
    originMunicipality: "Zinacantan",
    price: "1250",
    description: "Pieza artesanal de algodon con brocado tradicional, elaborada en taller familiar.",
    materials: "Algodon, hilos teñidos, brocado artesanal",
    presentation: "Pieza individual empacada con ficha de origen",
    stock: 12,
    shipping: "Envio nacional disponible. Entrega local en San Cristobal.",
    whatsapp: "529616667788",
    paymentMethods: "TRANSFER,CARD",
    status: ServiceStatus.APPROVED,
    createdAt: now,
    updatedAt: now,
    ownerId: "demo-brand-user",
    brandProfileId: "demo-brand-chiapas",
    brandProfile: initialBrandProfile,
    images: [
      {
        id: "demo-product-image-rebozo",
        url: "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1200&q=80",
        alt: "Rebozo tejido en telar de cintura",
        productId: "demo-product-rebozo"
      }
    ]
  },
  {
    id: "demo-product-cafe",
    name: "Cafe de altura tostado artesanal",
    slug: "cafe-de-altura-tostado-artesanal",
    productCategory: "Cafe y cacao",
    originMunicipality: "Motozintla",
    price: "220",
    description: "Cafe chiapaneco de altura, tostado medio, con notas a cacao y piloncillo.",
    materials: "Cafe arabica 100% chiapaneco",
    presentation: "Bolsa de 500 g",
    stock: 40,
    shipping: "Envio nacional por paqueteria.",
    whatsapp: "529616667788",
    paymentMethods: "TRANSFER,CARD",
    status: ServiceStatus.APPROVED,
    createdAt: now,
    updatedAt: now,
    ownerId: "demo-brand-user",
    brandProfileId: "demo-brand-chiapas",
    brandProfile: initialBrandProfile,
    images: [
      {
        id: "demo-product-image-cafe",
        url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
        alt: "Cafe de altura tostado artesanal",
        productId: "demo-product-cafe"
      }
    ]
  }
];

const initialUsers: DemoUser[] = [
  {
    id: "demo-admin-user",
    name: "Admin Demo",
    email: "admin@demo.mx",
    role: UserRole.ADMIN,
    phone: null,
    status: "APPROVED",
    verificationCode: "",
    authProvider: null,
    providerAccountId: null,
    reviewedAt: now,
    providerProfile: null,
    agencyProfile: null,
    guideProfile: null,
    brandChiapasProfile: null
  },
  {
    id: "demo-provider-user",
    name: "Mundo Maya Operadora",
    email: "proveedor@demo.mx",
    role: UserRole.PROVIDER,
    phone: "9611234567",
    status: "APPROVED",
    verificationCode: "",
    authProvider: null,
    providerAccountId: null,
    reviewedAt: now,
    providerProfile: initialProvider,
    agencyProfile: null,
    guideProfile: null,
    brandChiapasProfile: null
  },
  {
    id: "demo-agency-user",
    name: "Agencia Demo",
    email: "agencia@demo.mx",
    role: UserRole.AGENCY,
    phone: null,
    status: "APPROVED",
    verificationCode: "",
    authProvider: null,
    providerAccountId: null,
    reviewedAt: now,
    providerProfile: null,
    agencyProfile: {
      id: "demo-agency",
      userId: "demo-agency-user",
      agencyName: "Agencia Demo",
      rfc: "ADE010101AB1",
      rnt: "RNT-DEMO-001",
      rfcDocumentUrl: "/uploads/demo/rfc-agencia.pdf",
      rntDocumentUrl: "/uploads/demo/rnt-agencia.pdf",
      ineDocumentUrl: "/uploads/demo/ine-agencia.pdf",
      fiscalAddressProofUrl: "/uploads/demo/comprobante-domicilio-fiscal-agencia.pdf",
      status: "APPROVED",
      verificationCode: "654321",
      notifiedAt: now,
      reviewedAt: now,
      contactName: "Agencia Demo",
      whatsapp: "529611234567",
      createdAt: now,
      updatedAt: now
    },
    guideProfile: null,
    brandChiapasProfile: null
  },
  {
    id: "demo-guide-user",
    name: "Guia Certificada Demo",
    email: "guia@demo.mx",
    role: UserRole.GUIDE,
    phone: "9615556677",
    status: "APPROVED",
    verificationCode: "",
    authProvider: null,
    providerAccountId: null,
    reviewedAt: now,
    providerProfile: null,
    agencyProfile: null,
    guideProfile: {
      id: "demo-guide",
      userId: "demo-guide-user",
      guideType: "NOM-08",
      scope: "LOCAL",
      certificationNumber: "NOM08-CHIAPAS-001",
      certificationDocumentUrl: "/uploads/demo/certificacion-guia.pdf",
      ineDocumentUrl: "/uploads/demo/ine-guia.pdf",
      languages: "Espanol, ingles",
      municipalities: "Palenque, San Cristobal de las Casas, Chiapa de Corzo",
      yearsExperience: 8,
      bio: "Guia certificado especializado en patrimonio cultural, zonas arqueologicas y naturaleza de Chiapas.",
      whatsapp: "529615556677",
      status: "APPROVED",
      verificationCode: "789123",
      notifiedAt: now,
      reviewedAt: now,
      createdAt: now,
      updatedAt: now
    },
    brandChiapasProfile: null
  },
  {
    id: "demo-brand-user",
    name: "Textiles Altos de Chiapas",
    email: "marca@demo.mx",
    role: UserRole.BRAND_CHIAPAS,
    phone: "9616667788",
    status: "APPROVED",
    verificationCode: "",
    authProvider: null,
    providerAccountId: null,
    reviewedAt: now,
    providerProfile: null,
    agencyProfile: null,
    guideProfile: null,
    brandChiapasProfile: initialBrandProfile
  }
];

type DemoStore = {
  users: DemoUser[];
  services: DemoService[];
  providers: DemoProvider[];
  brandProducts: DemoBrandProduct[];
  reservations: DemoReservation[];
};

const globalForDemo = globalThis as unknown as { chiapasEnTusManosDemoStore?: DemoStore };

function store() {
  if (!globalForDemo.chiapasEnTusManosDemoStore) {
    globalForDemo.chiapasEnTusManosDemoStore = {
      users: [...initialUsers],
      services: [...initialServices],
      providers: [initialProvider],
      brandProducts: [...initialBrandProducts],
      reservations: []
    };
  }
  return globalForDemo.chiapasEnTusManosDemoStore;
}

export function getDemoServices() {
  return store().services;
}

export function getDemoUsers() {
  return store().users;
}

export function getDemoProviders() {
  return store().providers;
}

export function getDemoGuides() {
  return store().users
    .map((user) => user.guideProfile && { ...user.guideProfile, user })
    .filter((guide): guide is DemoGuide & { user: DemoUser } => Boolean(guide));
}

export function getDemoBrandProfiles() {
  return store().users
    .map((user) => user.brandChiapasProfile && { ...user.brandChiapasProfile, user })
    .filter((brand): brand is DemoBrandChiapasProfile & { user: DemoUser } => Boolean(brand));
}

export function getDemoBrandProducts() {
  return store().brandProducts;
}

export function getDemoUser(userId?: string | null) {
  return store().users.find((user) => user.id === userId) || null;
}

export function findDemoUserByEmail(email?: string) {
  return store().users.find((user) => user.email.toLowerCase() === String(email || "").toLowerCase()) || null;
}

export function createDemoUser(input: {
  name: string;
  email: string;
  role: DemoRole;
  phone?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  verificationCode?: string;
  authProvider?: string;
  providerAccountId?: string;
  businessName?: string;
  brandBusinessName?: string;
  agencyName?: string;
  rfc?: string;
  rnt?: string;
  marcaChiapasRegistrationNumber?: string;
  rfcDocumentUrl?: string;
  rntDocumentUrl?: string;
  ineDocumentUrl?: string;
  fiscalAddressProofUrl?: string;
  municipality?: string;
  whatsapp?: string;
  description?: string;
  guideType?: string;
  guideScope?: string;
  certificationNumber?: string;
  certificationDocumentUrl?: string;
  guideIneDocumentUrl?: string;
  languages?: string;
  municipalities?: string;
  yearsExperience?: string;
  bio?: string;
}) {
  const existing = findDemoUserByEmail(input.email);
  if (existing) return existing;

  const id = `demo-user-${Date.now()}`;
  const providerProfile: DemoProvider | null =
    input.role === "PROVIDER"
      ? {
          id: `demo-provider-${Date.now()}`,
          userId: id,
          businessName: input.businessName || input.name,
          rfc: String(input.rfc || "").toUpperCase(),
          rnt: String(input.rnt || "").toUpperCase(),
          rfcDocumentUrl: input.rfcDocumentUrl || "",
          rntDocumentUrl: input.rntDocumentUrl || "",
          ineDocumentUrl: input.ineDocumentUrl || "",
          fiscalAddressProofUrl: input.fiscalAddressProofUrl || "",
          status: "PENDING",
          verificationCode: input.verificationCode || "",
          notifiedAt: new Date(),
          reviewedAt: null,
          municipality: input.municipality || null,
          description: input.description || null,
          whatsapp: input.whatsapp || input.phone || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      : null;
  const guideProfile: DemoGuide | null =
    input.role === "GUIDE"
      ? {
          id: `demo-guide-${Date.now()}`,
          userId: id,
          guideType: input.guideType || "NOM-08",
          scope: input.guideScope || "LOCAL",
          certificationNumber: input.certificationNumber || "",
          certificationDocumentUrl: input.certificationDocumentUrl || "",
          ineDocumentUrl: input.guideIneDocumentUrl || "",
          languages: input.languages || "",
          municipalities: input.municipalities || "",
          yearsExperience: Number(input.yearsExperience || 0),
          bio: input.bio || "",
          whatsapp: input.whatsapp || input.phone || "",
          status: "PENDING",
          verificationCode: input.verificationCode || "",
          notifiedAt: new Date(),
          reviewedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      : null;
  const agencyProfile: DemoAgency | null =
    input.role === "AGENCY"
      ? {
          id: `demo-agency-${Date.now()}`,
          userId: id,
          agencyName: input.agencyName || input.businessName || input.name,
          rfc: String(input.rfc || "").toUpperCase(),
          rnt: String(input.rnt || "").toUpperCase(),
          rfcDocumentUrl: input.rfcDocumentUrl || "",
          rntDocumentUrl: input.rntDocumentUrl || "",
          ineDocumentUrl: input.ineDocumentUrl || "",
          fiscalAddressProofUrl: input.fiscalAddressProofUrl || "",
          status: "PENDING",
          verificationCode: input.verificationCode || "",
          notifiedAt: new Date(),
          reviewedAt: null,
          contactName: input.name,
          whatsapp: input.whatsapp || input.phone || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      : null;
  const brandChiapasProfile: DemoBrandChiapasProfile | null =
    input.role === "BRAND_CHIAPAS"
      ? {
          id: `demo-brand-${Date.now()}`,
          userId: id,
          businessName: input.brandBusinessName || input.businessName || input.name,
          rfc: String(input.rfc || "").toUpperCase(),
          registrationNumber: String(input.marcaChiapasRegistrationNumber || "").toUpperCase(),
          municipality: input.municipality || "",
          description: input.description || "",
          whatsapp: input.whatsapp || input.phone || "",
          status: "PENDING",
          verificationCode: input.verificationCode || "",
          notifiedAt: new Date(),
          reviewedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      : null;

  const user: DemoUser = {
    id,
    name: input.name,
    email: input.email,
    role: input.role,
    phone: input.phone || null,
    status: input.status || (input.role === "ADMIN" ? "APPROVED" : "PENDING"),
    verificationCode: input.verificationCode || "",
    authProvider: input.authProvider || null,
    providerAccountId: input.providerAccountId || null,
    reviewedAt: input.role === "ADMIN" ? new Date() : null,
    providerProfile,
    agencyProfile,
    guideProfile,
    brandChiapasProfile
  };
  store().users.unshift(user);
  if (providerProfile) store().providers.unshift(providerProfile);
  return user;
}

export function createDemoBrandProduct(owner: DemoUser, body: Record<string, string | string[]>) {
  if (owner.role === "BRAND_CHIAPAS" && owner.brandChiapasProfile?.status !== "APPROVED") {
    throw new Error("Registro de Marca Chiapas pendiente de aprobacion");
  }
  if (!owner.brandChiapasProfile) throw new Error("No hay perfil de Marca Chiapas");
  const field = (key: string) => String(body[key] || "");
  const id = `demo-brand-product-${Date.now()}`;
  const images = field("images")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  const product: DemoBrandProduct = {
    id,
    name: field("name"),
    slug: `${slugify(field("name"))}-${Date.now().toString(36)}`,
    productCategory: field("productCategory"),
    originMunicipality: field("originMunicipality"),
    price: field("price"),
    description: field("description"),
    materials: field("materials") || "No especificado",
    presentation: field("presentation") || "Consultar presentacion",
    stock: Number(field("stock") || 0),
    shipping: field("shipping") || "Consultar opciones de envio",
    whatsapp: field("whatsapp"),
    paymentMethods: Array.isArray(body.paymentMethods)
      ? body.paymentMethods.filter((item) => ["TRANSFER", "CARD"].includes(item)).join(",") || "TRANSFER,CARD"
      : body.paymentMethods || "TRANSFER,CARD",
    status: owner.role === "ADMIN" ? ServiceStatus.APPROVED : ServiceStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: owner.id,
    brandProfileId: owner.brandChiapasProfile.id,
    brandProfile: owner.brandChiapasProfile,
    images: [
      {
        id: `demo-brand-product-image-${Date.now()}`,
        url: images[0] || "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80",
        alt: field("name"),
        productId: id
      }
    ]
  };
  store().brandProducts.unshift(product);
  return product;
}

export function createDemoService(owner: DemoUser, body: Record<string, string | string[]>) {
  if (owner.role === "PROVIDER" && owner.providerProfile?.status !== "APPROVED") {
    throw new Error("Registro de proveedor pendiente de aprobacion");
  }
  const field = (key: string) => String(body[key] || "");
  const category = demoCategories.find((item) => item.id === field("categoryId")) || demoCategories[1];
  const id = `demo-service-${Date.now()}`;
  const images = field("images")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  const service: DemoService = {
    id,
    name: field("name"),
    slug: `${slugify(field("name"))}-${Date.now().toString(36)}`,
    municipality: field("municipality"),
    address: field("address"),
    price: field("price"),
    netPrice: field("netPrice") || String(Math.round(Number(field("price")) * (100 - Number(field("agencyDiscount") || 25))) / 100),
    adminNetPrice: field("adminNetPrice") || String(Math.round(Number(field("price")) * (100 - Number(field("adminDiscount") || 35))) / 100),
    agencyDiscount: field("agencyDiscount") || "25",
    adminDiscount: field("adminDiscount") || "35",
    description: field("description"),
    schedules: field("schedules") || "Consultar disponibilidad",
    includes: field("includes") || "Consultar con el proveedor",
    excludes: field("excludes") || "No especificado",
    policies: field("policies") || "Sujeto a disponibilidad y condiciones del proveedor",
    whatsapp: field("whatsapp"),
    paymentMethods: Array.isArray(body.paymentMethods)
      ? body.paymentMethods.filter((item) => ["TRANSFER", "CARD"].includes(item)).join(",") || "TRANSFER,CARD"
      : body.paymentMethods || "TRANSFER,CARD",
    latitude: field("latitude") || null,
    longitude: field("longitude") || null,
    status: owner.role === "ADMIN" ? ServiceStatus.APPROVED : ServiceStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: owner.id,
    providerId: owner.providerProfile?.id || null,
    categoryId: category.id,
    category,
    provider: owner.providerProfile,
    images: [
      {
        id: `demo-image-${Date.now()}`,
        url: images[0] || "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80",
        alt: field("name"),
        serviceId: id
      }
    ]
  };
  store().services.unshift(service);
  return service;
}

export function updateDemoService(id: string, body: Record<string, string>) {
  const service = store().services.find((item) => item.id === id);
  if (!service) return null;
  if (body.name) service.name = body.name;
  if (body.price) service.price = String(body.price);
  if (body.netPrice) service.netPrice = String(body.netPrice);
  if (body.adminNetPrice) service.adminNetPrice = String(body.adminNetPrice);
  if (body.agencyDiscount) service.agencyDiscount = String(body.agencyDiscount);
  if (body.adminDiscount) service.adminDiscount = String(body.adminDiscount);
  if (body.municipality) service.municipality = body.municipality;
  if (body.status && Object.values(ServiceStatus).includes(body.status as ServiceStatus)) {
    service.status = body.status as ServiceStatus;
  }
  service.updatedAt = new Date();
  return service;
}

export function deleteDemoService(id: string) {
  const current = store().services;
  const next = current.filter((item) => item.id !== id);
  store().services = next;
  return next.length !== current.length;
}

export function updateDemoRegistrationStatus(type: "provider" | "agency" | "guide" | "brand", id: string, status: "APPROVED" | "REJECTED") {
  if (type === "provider") {
    const provider = store().providers.find((item) => item.id === id);
    if (!provider) return null;
    provider.status = status;
    provider.reviewedAt = new Date();
    provider.updatedAt = new Date();
    const user = store().users.find((item) => item.id === provider.userId);
    return user ? { ...provider, user } : null;
  }

  if (type === "agency") {
    const user = store().users.find((item) => item.agencyProfile?.id === id);
    if (!user?.agencyProfile) return null;
    user.agencyProfile.status = status;
    user.agencyProfile.reviewedAt = new Date();
    user.agencyProfile.updatedAt = new Date();
    return { ...user.agencyProfile, user };
  }

  if (type === "guide") {
    const user = store().users.find((item) => item.guideProfile?.id === id);
    if (!user?.guideProfile) return null;
    user.guideProfile.status = status;
    user.guideProfile.reviewedAt = new Date();
    user.guideProfile.updatedAt = new Date();
    return { ...user.guideProfile, user };
  }

  const user = store().users.find((item) => item.brandChiapasProfile?.id === id);
  if (!user?.brandChiapasProfile) return null;
  user.brandChiapasProfile.status = status;
  user.brandChiapasProfile.reviewedAt = new Date();
  user.brandChiapasProfile.updatedAt = new Date();
  return { ...user.brandChiapasProfile, user };
}

export function updateDemoUserStatus(id: string, status: "APPROVED" | "REJECTED") {
  const user = store().users.find((item) => item.id === id);
  if (!user) return null;
  user.status = status;
  user.reviewedAt = new Date();
  return user;
}

export function getDemoAdminSummary() {
  const current = store();
  const agencies = current.users
    .map((user) => user.agencyProfile && { ...user.agencyProfile, user })
    .filter(Boolean);
  const guides = getDemoGuides();
  const brandProfiles = getDemoBrandProfiles();
  return {
    stats: {
      users: current.users.length,
      providers: current.providers.length,
      agencies: current.users.filter((user) => user.role === "AGENCY").length,
      guides: current.users.filter((user) => user.role === "GUIDE").length,
      brandChiapas: current.users.filter((user) => user.role === "BRAND_CHIAPAS").length,
      services: current.services.length,
      brandProducts: current.brandProducts.length,
      pending: current.services.filter((service) => service.status === ServiceStatus.PENDING).length,
      approved: current.services.filter((service) => service.status === ServiceStatus.APPROVED).length,
      pendingRegistrations:
        current.users.filter((user) => user.role === "CLIENT" && user.status === "PENDING").length +
        current.providers.filter((provider) => provider.status === "PENDING").length +
        current.users.filter((user) => user.agencyProfile?.status === "PENDING").length +
        current.users.filter((user) => user.guideProfile?.status === "PENDING").length +
        current.users.filter((user) => user.brandChiapasProfile?.status === "PENDING").length,
      reservations: current.reservations.length
    },
    users: current.users.map(({ id, name, email, role, status, verificationCode, authProvider }) => ({
      id,
      name,
      email,
      role,
      status,
      verificationCode,
      authProvider,
      createdAt: now
    })),
    providers: current.providers.map((provider) => ({
      ...provider,
      user: current.users.find((user) => user.id === provider.userId) || { name: "Proveedor", email: "demo@demo.mx" }
    })),
    agencies,
    guides,
    brandProfiles,
    services: current.services,
    brandProducts: current.brandProducts,
    reservations: current.reservations
  };
}

export function updateDemoBrandProduct(id: string, body: Record<string, string>) {
  const product = store().brandProducts.find((item) => item.id === id);
  if (!product) return null;
  if (body.name) product.name = body.name;
  if (body.price) product.price = String(body.price);
  if (body.originMunicipality) product.originMunicipality = body.originMunicipality;
  if (body.status && Object.values(ServiceStatus).includes(body.status as ServiceStatus)) {
    product.status = body.status as ServiceStatus;
  }
  product.updatedAt = new Date();
  return product;
}

export function deleteDemoBrandProduct(id: string) {
  const current = store().brandProducts;
  const next = current.filter((item) => item.id !== id);
  store().brandProducts = next;
  return next.length !== current.length;
}

export function getDemoReservations() {
  return store().reservations;
}

export function addDemoReservation(input: DemoReservation) {
  const service = store().services.find((item) => item.id === input.serviceId);
  store().reservations.unshift({
    ...input,
    ownerId: service?.ownerId,
    service: service ? { id: service.id, name: service.name, municipality: service.municipality, ownerId: service.ownerId } : undefined
  });
}

export function updateDemoReservation(id: string, status: DemoReservation["status"]) {
  const reservation = store().reservations.find((item) => item.id === id);
  if (!reservation) return null;
  reservation.status = status;
  reservation.updatedAt = new Date().toISOString();
  return reservation;
}

export function filterDemoServices(params: {
  q?: string;
  category?: string;
  municipality?: string;
  maxPrice?: string;
  paymentMethod?: string;
  status?: string;
}) {
  return getDemoServices().filter((service) => {
    const query = params.q?.toLowerCase();
    const matchesQuery =
      !query ||
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.municipality.toLowerCase().includes(query);
    const matchesCategory = !params.category || service.category.slug === params.category;
    const matchesMunicipality =
      !params.municipality || service.municipality.toLowerCase().includes(params.municipality.toLowerCase());
    const matchesPrice = !params.maxPrice || Number(service.price) <= Number(params.maxPrice);
    const matchesPayment = !params.paymentMethod || service.paymentMethods.split(",").includes(params.paymentMethod);
    const matchesStatus = params.status === "all" || service.status === ServiceStatus.APPROVED;
    return matchesQuery && matchesCategory && matchesMunicipality && matchesPrice && matchesPayment && matchesStatus;
  });
}
