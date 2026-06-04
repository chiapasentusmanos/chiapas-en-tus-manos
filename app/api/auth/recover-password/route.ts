import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.email && !body.phone) {
    return NextResponse.json({ error: "Ingresa correo electronico o telefono" }, { status: 400 });
  }

  return NextResponse.json({
    message: "Si la cuenta existe, enviaremos instrucciones de recuperacion por correo electronico o telefono."
  });
}
