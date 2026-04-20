/**
 * lib/groq.js
 * Helper para Groq API (compatible con OpenAI)
 * Docs: https://console.groq.com/docs
 */

const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY   = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Genera insights de marketing a partir de datos de una red social.
 * @param {object} profileData - datos normalizados del perfil
 * @returns {Promise<string>} - texto con 4 insights numerados
 */
export async function generateInsights(profileData) {
  const {
    platform, handle, followers,
    engagement, avg_likes, avg_comments,
    posts_count, recent_posts = [],
  } = profileData;

  // Calcular mix de tipos de contenido (solo Instagram devuelve media_type)
  const typeCount = {};
  recent_posts.forEach(p => {
    if (p.type) typeCount[p.type] = (typeCount[p.type] || 0) + 1;
  });
  const mixStr = Object.entries(typeCount)
    .map(([t, n]) => `${t}: ${n}`)
    .join(", ") || "no disponible";

  const prompt = `Sos un experto en marketing digital y redes sociales. Analizá estos datos reales de una cuenta de ${platform} y generá exactamente 4 insights accionables en español argentino. Sé concreto, directo y práctico.

DATOS DEL PERFIL:
- Cuenta: ${handle}
- Seguidores: ${followers?.toLocaleString("es-AR") || "N/D"}
- Engagement rate: ${engagement}%
- Promedio likes por post: ${avg_likes || "N/D"}
- Promedio comentarios por post: ${avg_comments || "N/D"}
- Total publicaciones: ${posts_count || "N/D"}
- Mix de contenido: ${mixStr}

FORMATO DE RESPUESTA (obligatorio):
1. [insight + recomendación práctica]
2. [insight + recomendación práctica]
3. [insight + recomendación práctica]
4. [insight + recomendación práctica]

Máximo 2 oraciones por insight. Sin markdown, sin títulos, solo los 4 puntos numerados.`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model:      GROQ_MODEL,
      max_tokens: 600,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Groq API: ${data.error.message}`);
  }

  return data.choices?.[0]?.message?.content || "";
}
