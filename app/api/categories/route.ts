import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoCategories, demoMode } from "@/lib/demo-data";

export async function GET() {
  if (demoMode) return NextResponse.json({ categories: demoCategories });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}
