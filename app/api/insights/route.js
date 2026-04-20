/**
 * POST /api/insights
 * Llama a Groq para generar insights a partir de datos del perfil.
 * La GROQ_API_KEY queda solo en el servidor.
 */

import { NextResponse } from "next/server";
import { generateInsights } from "@/lib/groq";

export async function POST(request) {
  try {
    const profileData = await request.json();

    if (!profileData?.handle) {
      return NextResponse.json({ error: "Datos de perfil inválidos." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY no configurado en las variables de entorno." },
        { status: 500 }
      );
    }

    const insights = await generateInsights(profileData);
    return NextResponse.json({ success: true, insights });

  } catch (err) {
    console.error("[/api/insights]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
