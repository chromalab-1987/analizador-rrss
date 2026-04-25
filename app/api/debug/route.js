import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.META_ACCESS_TOKEN;
  const groq  = process.env.GROQ_API_KEY;

  let metaTest = null;
  if (token) {
    try {
      const r = await fetch(
        `https://graph.facebook.com/v19.0/cocacola?fields=name,followers_count&access_token=${token}`
      );
      metaTest = await r.json();
    } catch (e) {
      metaTest = { fetchError: e.message };
    }
  }

  return NextResponse.json({
    META_ACCESS_TOKEN: token
      ? `✅ Cargado (${token.length} chars, empieza: ${token.slice(0, 8)}...)`
      : "❌ NO configurado",
    GROQ_API_KEY: groq ? `✅ Cargado (${groq.length} chars)` : "❌ NO configurado",
    meta_api_test: metaTest,
  });
}
