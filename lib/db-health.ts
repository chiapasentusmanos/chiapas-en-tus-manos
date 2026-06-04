import { prisma } from "@/lib/prisma";

export async function getDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true as const, message: "Base de datos conectada" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo conectar a la base de datos";
    return { ok: false as const, message };
  }
}
