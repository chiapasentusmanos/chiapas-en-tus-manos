import { PrismaClient, UserRole, ServiceStatus, VerificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  ["Hoteles", "hoteles"],
  ["Tours", "tours"],
  ["Restaurantes", "restaurantes"],
  ["Traslados", "traslados"],
  ["Experiencias", "experiencias"]
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug }
    });
  }

  const passwordHash = await bcrypt.hash("Demo1234!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@alianzachiapas.mx" },
    update: {},
    create: { name: "Administracion Demo", email: "admin@alianzachiapas.mx", passwordHash, role: UserRole.ADMIN, status: VerificationStatus.APPROVED, reviewedAt: new Date() }
  });

  const providerUser = await prisma.user.upsert({
    where: { email: "proveedor@alianzachiapas.mx" },
    update: {},
    create: { name: "Mundo Maya Operadora", email: "proveedor@alianzachiapas.mx", passwordHash, role: UserRole.PROVIDER, phone: "9611234567", status: VerificationStatus.APPROVED, reviewedAt: new Date() }
  });

  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {
      rfc: "MMO010101AB1",
      rnt: "RNT-DEMO-002",
      rfcDocumentUrl: "/uploads/demo/rfc-proveedor.pdf",
      rntDocumentUrl: "/uploads/demo/rnt-proveedor.pdf",
      ineDocumentUrl: "/uploads/demo/ine-proveedor.pdf",
      fiscalAddressProofUrl: "/uploads/demo/comprobante-domicilio-fiscal-proveedor.pdf",
      status: VerificationStatus.APPROVED,
      verificationCode: "123456",
      reviewedAt: new Date()
    },
    create: {
      userId: providerUser.id,
      businessName: "Mundo Maya Operadora",
      rfc: "MMO010101AB1",
      rnt: "RNT-DEMO-002",
      rfcDocumentUrl: "/uploads/demo/rfc-proveedor.pdf",
      rntDocumentUrl: "/uploads/demo/rnt-proveedor.pdf",
      ineDocumentUrl: "/uploads/demo/ine-proveedor.pdf",
      fiscalAddressProofUrl: "/uploads/demo/comprobante-domicilio-fiscal-proveedor.pdf",
      status: VerificationStatus.APPROVED,
      verificationCode: "123456",
      notifiedAt: new Date(),
      reviewedAt: new Date(),
      municipality: "San Cristobal de las Casas",
      description: "Tours culturales y de naturaleza con guias locales.",
      whatsapp: "529611234567"
    }
  });

  const agencyUser = await prisma.user.upsert({
    where: { email: "agencia@alianzachiapas.mx" },
    update: {},
    create: { name: "Agencia Ruta Sur", email: "agencia@alianzachiapas.mx", passwordHash, role: UserRole.AGENCY, status: VerificationStatus.APPROVED, reviewedAt: new Date() }
  });

  await prisma.agency.upsert({
    where: { userId: agencyUser.id },
    update: {
      rfc: "ARS010101AB1",
      rnt: "RNT-DEMO-001",
      rfcDocumentUrl: "/uploads/demo/rfc-agencia.pdf",
      rntDocumentUrl: "/uploads/demo/rnt-agencia.pdf",
      ineDocumentUrl: "/uploads/demo/ine-agencia.pdf",
      fiscalAddressProofUrl: "/uploads/demo/comprobante-domicilio-fiscal-agencia.pdf",
      status: VerificationStatus.APPROVED,
      verificationCode: "654321",
      reviewedAt: new Date()
    },
    create: {
      userId: agencyUser.id,
      agencyName: "Agencia Ruta Sur",
      contactName: "Agencia Ruta Sur",
      whatsapp: "529611234567",
      rfc: "ARS010101AB1",
      rnt: "RNT-DEMO-001",
      rfcDocumentUrl: "/uploads/demo/rfc-agencia.pdf",
      rntDocumentUrl: "/uploads/demo/rnt-agencia.pdf",
      ineDocumentUrl: "/uploads/demo/ine-agencia.pdf",
      fiscalAddressProofUrl: "/uploads/demo/comprobante-domicilio-fiscal-agencia.pdf",
      status: VerificationStatus.APPROVED,
      verificationCode: "654321",
      notifiedAt: new Date(),
      reviewedAt: new Date()
    }
  });

  const guideUser = await prisma.user.upsert({
    where: { email: "guia@alianzachiapas.mx" },
    update: {},
    create: { name: "Guia Certificada Demo", email: "guia@alianzachiapas.mx", passwordHash, role: UserRole.GUIDE, phone: "9615556677", status: VerificationStatus.APPROVED, reviewedAt: new Date() }
  });

  await prisma.guide.upsert({
    where: { userId: guideUser.id },
    update: {
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
      status: VerificationStatus.APPROVED,
      verificationCode: "789123",
      reviewedAt: new Date()
    },
    create: {
      userId: guideUser.id,
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
      status: VerificationStatus.APPROVED,
      verificationCode: "789123",
      notifiedAt: new Date(),
      reviewedAt: new Date()
    }
  });

  const brandUser = await prisma.user.upsert({
    where: { email: "marca@alianzachiapas.mx" },
    update: {},
    create: {
      name: "Textiles Altos de Chiapas",
      email: "marca@alianzachiapas.mx",
      passwordHash,
      role: UserRole.BRAND_CHIAPAS,
      phone: "9616667788",
      status: VerificationStatus.APPROVED,
      reviewedAt: new Date()
    }
  });

  const brandProfile = await prisma.brandChiapasProfile.upsert({
    where: { userId: brandUser.id },
    update: {
      businessName: "Textiles Altos de Chiapas",
      rfc: "TAC010101AB1",
      registrationNumber: "MC-DEMO-001",
      municipality: "San Cristobal de las Casas",
      description: "Marca registrada de productos textiles y artesanales elaborados por familias de Chiapas.",
      whatsapp: "529616667788",
      status: VerificationStatus.APPROVED,
      verificationCode: "456789",
      reviewedAt: new Date()
    },
    create: {
      userId: brandUser.id,
      businessName: "Textiles Altos de Chiapas",
      rfc: "TAC010101AB1",
      registrationNumber: "MC-DEMO-001",
      municipality: "San Cristobal de las Casas",
      description: "Marca registrada de productos textiles y artesanales elaborados por familias de Chiapas.",
      whatsapp: "529616667788",
      status: VerificationStatus.APPROVED,
      verificationCode: "456789",
      notifiedAt: new Date(),
      reviewedAt: new Date()
    }
  });

  const tours = await prisma.category.findUniqueOrThrow({ where: { slug: "tours" } });
  const experiencias = await prisma.category.findUniqueOrThrow({ where: { slug: "experiencias" } });
  const hoteles = await prisma.category.findUniqueOrThrow({ where: { slug: "hoteles" } });

  const serviceData = [
    {
      name: "Canon del Sumidero en lancha",
      slug: "canon-del-sumidero-en-lancha",
      municipality: "Chiapa de Corzo",
      address: "Embarcadero Cahuaré, Chiapa de Corzo",
      price: "650",
      netPrice: "552.50",
      description: "Recorrido por el Canon del Sumidero con visita panoramica a Chiapa de Corzo.",
      schedules: "Salidas 9:00, 11:00 y 13:00",
      includes: "Lancha compartida, guia local, seguro basico",
      excludes: "Alimentos, propinas, transporte desde hotel",
      policies: "Reservacion con 24 horas. Cambios sujetos a clima y disponibilidad.",
      whatsapp: "529611234567",
      latitude: "16.8067000",
      longitude: "-93.0889000",
      status: ServiceStatus.APPROVED,
      categoryId: tours.id,
      images: [
        "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      name: "Experiencia textil en Zinacantan",
      slug: "experiencia-textil-en-zinacantan",
      municipality: "Zinacantan",
      address: "Centro de Zinacantan",
      price: "480",
      netPrice: "408",
      description: "Taller con artesanas locales para conocer telar de cintura, simbolos y cocina tradicional.",
      schedules: "Lunes a sabado, 10:00 a 16:00",
      includes: "Anfitriona local, materiales, degustacion",
      excludes: "Traslado, compras personales",
      policies: "Grupos pequenos. Cancelacion gratis hasta 48 horas antes.",
      whatsapp: "529611234567",
      latitude: "16.7605000",
      longitude: "-92.7223000",
      status: ServiceStatus.APPROVED,
      categoryId: experiencias.id,
      images: [
        "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      name: "Hotel boutique centro historico",
      slug: "hotel-boutique-centro-historico",
      municipality: "San Cristobal de las Casas",
      address: "Andador Guadalupano 12",
      price: "1450",
      netPrice: "1232.50",
      description: "Habitaciones comodas en casona restaurada, cerca de restaurantes y museos.",
      schedules: "Check-in 15:00, check-out 12:00",
      includes: "Desayuno continental, wifi, estacionamiento sujeto a disponibilidad",
      excludes: "Impuestos locales, alimentos extra",
      policies: "Tarifa sujeta a disponibilidad. No show cobra primera noche.",
      whatsapp: "529611234567",
      latitude: "16.7370000",
      longitude: "-92.6376000",
      status: ServiceStatus.PENDING,
      categoryId: hoteles.id,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  ];

  for (const item of serviceData) {
    const { images, ...service } = item;
    await prisma.service.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        ...service,
        ownerId: providerUser.id,
        providerId: provider.id,
        images: { create: images.map((url) => ({ url, alt: item.name })) }
      }
    });
  }

  const productData = [
    {
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
      status: ServiceStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1200&q=80"]
    },
    {
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
      status: ServiceStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80"]
    }
  ];

  for (const item of productData) {
    const { images, ...product } = item;
    await prisma.brandProduct.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        ...product,
        ownerId: brandUser.id,
        brandProfileId: brandProfile.id,
        images: { create: images.map((url) => ({ url, alt: item.name })) }
      }
    });
  }

  console.log(`Seed listo. Admin: ${admin.email} / Demo1234!`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
