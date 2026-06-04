import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";
import { createDemoUser, demoMode, findDemoUserByEmail } from "@/lib/demo-data";
import { createVerificationCode, notifyAdminRegistration } from "@/lib/notifications";
import { hasRnt, isValidRfc, normalizeIdentifier } from "@/lib/validation";

const DOCUMENT_FIELDS = [
  "rfcDocument",
  "rntDocument",
  "ineDocument",
  "fiscalAddressProof"
] as const;

const GUIDE_DOCUMENT_FIELDS = [
  "certificationDocument",
  "guideIneDocument"
] as const;

type RegisterBody = Record<string, FormDataEntryValue | string | undefined>;

function value(body: RegisterBody, key: string) {
  const item = body[key];
  return typeof item === "string" ? item : "";
}

function isPdfFile(item: FormDataEntryValue | string | undefined): item is File {
  if (!item || typeof item === "string") return false;
  return item.size > 0 && (item.type === "application/pdf" || item.name.toLowerCase().endsWith(".pdf"));
}

function cleanSegment(valueToClean: string) {
  return valueToClean
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function parseBody(request: Request): Promise<RegisterBody> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    return Object.fromEntries(await request.formData());
  }
  return request.json();
}

async function saveVerificationDocuments(body: RegisterBody, email: string) {
  const missing = DOCUMENT_FIELDS.filter((field) => !isPdfFile(body[field]));
  if (missing.length > 0) return null;

  const uploadDir = join(process.cwd(), "public", "uploads", "verification");
  await mkdir(uploadDir, { recursive: true });

  const saved: Record<(typeof DOCUMENT_FIELDS)[number], string> = {
    rfcDocument: "",
    rntDocument: "",
    ineDocument: "",
    fiscalAddressProof: ""
  };

  for (const field of DOCUMENT_FIELDS) {
    const file = body[field];
    if (!isPdfFile(file)) continue;
    const filename = `${Date.now()}-${cleanSegment(email)}-${field}.pdf`;
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    saved[field] = `/uploads/verification/${filename}`;
  }

  return {
    rfcDocumentUrl: saved.rfcDocument,
    rntDocumentUrl: saved.rntDocument,
    ineDocumentUrl: saved.ineDocument,
    fiscalAddressProofUrl: saved.fiscalAddressProof
  };
}

async function saveGuideDocuments(body: RegisterBody, email: string) {
  const missing = GUIDE_DOCUMENT_FIELDS.filter((field) => !isPdfFile(body[field]));
  if (missing.length > 0) return null;

  const uploadDir = join(process.cwd(), "public", "uploads", "verification");
  await mkdir(uploadDir, { recursive: true });

  const saved: Record<(typeof GUIDE_DOCUMENT_FIELDS)[number], string> = {
    certificationDocument: "",
    guideIneDocument: ""
  };

  for (const field of GUIDE_DOCUMENT_FIELDS) {
    const file = body[field];
    if (!isPdfFile(file)) continue;
    const filename = `${Date.now()}-${cleanSegment(email)}-${field}.pdf`;
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    saved[field] = `/uploads/verification/${filename}`;
  }

  return {
    certificationDocumentUrl: saved.certificationDocument,
    ineDocumentUrl: saved.guideIneDocument
  };
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  const role = String(value(body, "role") || "CLIENT").toUpperCase() as UserRole;
  const name = value(body, "name");
  const email = value(body, "email");
  const password = value(body, "password");
  const phone = value(body, "phone");
  const whatsapp = value(body, "whatsapp");
  const businessName = value(body, "businessName");
  const brandBusinessName = value(body, "brandBusinessName");
  const agencyName = value(body, "agencyName");
  const municipality = value(body, "municipality");
  const description = value(body, "description");
  const marcaChiapasRegistrationNumber = normalizeIdentifier(value(body, "marcaChiapasRegistrationNumber"));
  const guideType = value(body, "guideType");
  const guideScope = value(body, "guideScope");
  const certificationNumber = value(body, "certificationNumber");
  const languages = value(body, "languages");
  const municipalities = value(body, "municipalities");
  const yearsExperience = value(body, "yearsExperience");
  const bio = value(body, "bio");

  if (!name || !email || !password || !Object.values(UserRole).includes(role)) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }
  if (role === "ADMIN") {
    return NextResponse.json({ error: "El registro de administradores esta deshabilitado. Usa el inicio de sesion asignado." }, { status: 403 });
  }
  if (!phone) {
    return NextResponse.json({ error: "El telefono es obligatorio" }, { status: 400 });
  }
  const rfc = normalizeIdentifier(value(body, "rfc"));
  const rnt = normalizeIdentifier(value(body, "rnt"));

  if (role === "PROVIDER" && (!businessName || !whatsapp || !municipality || !description || !isValidRfc(rfc) || !hasRnt(rnt))) {
    return NextResponse.json({ error: "Todos los campos son obligatorios para proveedores" }, { status: 400 });
  }
  if (role === "AGENCY" && (!agencyName || !whatsapp || !isValidRfc(rfc) || !hasRnt(rnt))) {
    return NextResponse.json({ error: "Todos los campos son obligatorios para agencias de viajes" }, { status: 400 });
  }
  if (role === "GUIDE" && (!guideType || !guideScope || !certificationNumber || !languages || !municipalities || !yearsExperience || !bio || !whatsapp)) {
    return NextResponse.json({ error: "Todos los campos son obligatorios para guias certificados" }, { status: 400 });
  }
  if (role === "BRAND_CHIAPAS" && (!brandBusinessName || !municipality || !description || !whatsapp || !isValidRfc(rfc) || !marcaChiapasRegistrationNumber)) {
    return NextResponse.json({ error: "Todos los campos son obligatorios para Marca Chiapas" }, { status: 400 });
  }
  const needsDocuments = role === "PROVIDER" || role === "AGENCY";
  const needsGuideDocuments = role === "GUIDE";
  const needsApproval = role === "CLIENT" || role === "PROVIDER" || role === "AGENCY" || role === "GUIDE" || role === "BRAND_CHIAPAS";
  const documents = needsDocuments ? await saveVerificationDocuments(body, email) : null;
  const guideDocuments = needsGuideDocuments ? await saveGuideDocuments(body, email) : null;
  const verificationCode = needsApproval ? createVerificationCode() : "";
  if (needsDocuments && !documents) {
    return NextResponse.json({ error: "Los documentos RFC, RNT, INE y comprobante de domicilio fiscal deben subirse en PDF" }, { status: 400 });
  }
  if (needsGuideDocuments && !guideDocuments) {
    return NextResponse.json({ error: "La certificacion y el INE deben subirse en PDF" }, { status: 400 });
  }

  if (demoMode) {
    const exists = findDemoUserByEmail(email);
    if (exists) return NextResponse.json({ error: "El correo ya esta registrado" }, { status: 409 });
    const user = createDemoUser({
      name,
      email,
      role,
      phone,
      status: "PENDING",
      verificationCode,
      businessName,
      brandBusinessName,
      agencyName,
      rfc,
      rnt,
      marcaChiapasRegistrationNumber,
      rfcDocumentUrl: documents?.rfcDocumentUrl,
      rntDocumentUrl: documents?.rntDocumentUrl,
      ineDocumentUrl: documents?.ineDocumentUrl,
      fiscalAddressProofUrl: documents?.fiscalAddressProofUrl,
      municipality,
      whatsapp,
      description,
      guideType,
      guideScope,
      certificationNumber,
      certificationDocumentUrl: guideDocuments?.certificationDocumentUrl,
      guideIneDocumentUrl: guideDocuments?.ineDocumentUrl,
      languages,
      municipalities,
      yearsExperience,
      bio
    });
    if (role === "CLIENT" || role === "PROVIDER" || role === "AGENCY" || role === "GUIDE" || role === "BRAND_CHIAPAS") {
      await notifyAdminRegistration({
        role,
        name,
        email,
        phone,
        businessName: role === "PROVIDER" ? businessName : role === "AGENCY" ? agencyName : role === "BRAND_CHIAPAS" ? brandBusinessName : name,
        rfc,
        rnt: role === "BRAND_CHIAPAS" ? marcaChiapasRegistrationNumber : rnt,
        verificationCode
      });
    }
    await setSession(user.id, user.role);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "El correo ya esta registrado" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      phone,
      status: "PENDING",
      verificationCode,
      providerProfile:
        role === "PROVIDER"
          ? {
              create: {
                businessName: businessName || name,
                rfc,
                rnt,
                verificationCode,
                rfcDocumentUrl: documents?.rfcDocumentUrl || "",
                rntDocumentUrl: documents?.rntDocumentUrl || "",
                ineDocumentUrl: documents?.ineDocumentUrl || "",
                fiscalAddressProofUrl: documents?.fiscalAddressProofUrl || "",
                municipality,
                whatsapp,
                description
              }
            }
          : undefined,
      agencyProfile:
        role === "AGENCY"
          ? {
              create: {
                agencyName: agencyName || businessName || name,
                rfc,
                rnt,
                verificationCode,
                rfcDocumentUrl: documents?.rfcDocumentUrl || "",
                rntDocumentUrl: documents?.rntDocumentUrl || "",
                ineDocumentUrl: documents?.ineDocumentUrl || "",
                fiscalAddressProofUrl: documents?.fiscalAddressProofUrl || "",
                contactName: name,
                whatsapp
              }
            }
          : undefined
      ,
      guideProfile:
        role === "GUIDE"
          ? {
              create: {
                guideType,
                scope: guideScope,
                certificationNumber,
                certificationDocumentUrl: guideDocuments?.certificationDocumentUrl || "",
                ineDocumentUrl: guideDocuments?.ineDocumentUrl || "",
                languages,
                municipalities,
                yearsExperience: Number(yearsExperience),
                bio,
                whatsapp,
                verificationCode
              }
            }
          : undefined
      ,
      brandChiapasProfile:
        role === "BRAND_CHIAPAS"
          ? {
              create: {
                businessName: brandBusinessName || name,
                rfc,
                registrationNumber: marcaChiapasRegistrationNumber,
                municipality,
                description,
                whatsapp,
                verificationCode
              }
            }
          : undefined
    }
  });

  if (role === "CLIENT" || role === "PROVIDER" || role === "AGENCY" || role === "GUIDE" || role === "BRAND_CHIAPAS") {
    await notifyAdminRegistration({
      role,
      name,
      email,
      phone,
      businessName: role === "PROVIDER" ? businessName : role === "AGENCY" ? agencyName : role === "BRAND_CHIAPAS" ? brandBusinessName : name,
      rfc,
      rnt: role === "BRAND_CHIAPAS" ? marcaChiapasRegistrationNumber : rnt,
      verificationCode
    });
    if (role === "CLIENT") {
      await prisma.user.update({ where: { id: user.id }, data: { reviewedAt: null } });
    } else if (role === "PROVIDER") {
      await prisma.provider.update({ where: { userId: user.id }, data: { notifiedAt: new Date() } });
    } else if (role === "AGENCY") {
      await prisma.agency.update({ where: { userId: user.id }, data: { notifiedAt: new Date() } });
    } else if (role === "GUIDE") {
      await prisma.guide.update({ where: { userId: user.id }, data: { notifiedAt: new Date() } });
    } else {
      await prisma.brandChiapasProfile.update({ where: { userId: user.id }, data: { notifiedAt: new Date() } });
    }
  }

  await setSession(user.id, user.role);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
