import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.META_ACCESS_TOKEN;
  const groq  = process.env.GROQ_API_KEY;

  return NextResponse.json({
    META_ACCESS_TOKEN: token
      ? `✅ Cargado (${token.length} chars, empieza: ${token.slice(0, 8)}...)`
      : "❌ NO configurado",
    GROQ_API_KEY: groq
      ? `✅ Cargado (${groq.length} chars)`
      : "❌ NO configurado",
  });
}
