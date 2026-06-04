import { NextResponse } from "next/server";
import { demoMode } from "@/lib/demo-data";
import { getDatabaseHealth } from "@/lib/db-health";

export async function GET() {
  const database = await getDatabaseHealth();

  return NextResponse.json({
    app: "Chiapas En Tus Manos",
    ok: demoMode || database.ok,
    mode: demoMode ? "demo" : "production",
    database: {
      ok: database.ok,
      message: database.ok ? database.message : "Base de datos no disponible"
    },
    checkedAt: new Date().toISOString()
  });
}
