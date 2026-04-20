/**
 * lib/meta.js
 * Opción A — Datos públicos sin OAuth
 *
 * Facebook : cualquier página pública → funciona con App Token
 * Instagram: cuentas Business/Creator públicas → usa Business Discovery API
 *            requiere META_FB_PAGE_ID (ID de una página FB propia como pivot)
 *
 * Docs: https://developers.facebook.com/docs/graph-api
 */

const BASE  = "https://graph.facebook.com/v19.0";
const TOKEN = process.env.META_ACCESS_TOKEN;

// ─── FACEBOOK ────────────────────────────────────────────────────────────────

/**
 * Datos públicos de cualquier página de Facebook.
 * Solo requiere META_ACCESS_TOKEN (App Token).
 */
export async function getFacebookPage(handle) {
  const clean = handle.replace(/^@/, "").trim();

  const fields = [
    "id",
    "name",
    "username",
    "fan_count",
    "followers_count",
    "category",
    "about",
    "posts.limit(12){likes.summary(true),comments.summary(true),shares,created_time,message}",
  ].join(",");

  const url = `${BASE}/${encodeURIComponent(clean)}?fields=${fields}&access_token=${TOKEN}`;
  const res  = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API: ${data.error.message} (código ${data.error.code})`);
  }

  return transformFacebook(data);
}

function transformFacebook(raw) {
  const posts    = raw.posts?.data || [];
  const count    = posts.length || 1;
  const followers = raw.followers_count || raw.fan_count || 0;

  const totalLikes    = posts.reduce((s, p) => s + (p.likes?.summary?.total_count    || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.summary?.total_count || 0), 0);
  const totalShares   = posts.reduce((s, p) => s + (p.shares?.count || 0), 0);

  const engagement = followers > 0
    ? parseFloat(((totalLikes + totalComments) / count / followers * 100).toFixed(2))
    : 0;

  return {
    platform:     "facebook",
    id:           raw.id,
    name:         raw.name,
    handle:       `@${raw.username || raw.id}`,
    followers,
    following:    null,
    posts_count:  null,
    category:     raw.category || null,
    engagement,
    avg_likes:    Math.round(totalLikes    / count),
    avg_comments: Math.round(totalComments / count),
    avg_shares:   Math.round(totalShares   / count),
    avg_reach:    Math.round((totalLikes + totalComments + totalShares) / count),
    recent_posts: posts.map(p => ({
      date:     p.created_time,
      message:  p.message?.slice(0, 140) || "",
      likes:    p.likes?.summary?.total_count    || 0,
      comments: p.comments?.summary?.total_count || 0,
      shares:   p.shares?.count || 0,
    })),
  };
}

// ─── INSTAGRAM ───────────────────────────────────────────────────────────────

/**
 * Datos públicos de una cuenta Instagram Business/Creator.
 *
 * Opción A (sin OAuth del cliente):
 *   - Usa Business Discovery API con una página FB propia como "pivot"
 *   - Solo funciona con cuentas IG Business o Creator (no personales)
 *   - Requiere META_FB_PAGE_ID en las variables de entorno
 *
 * Si META_FB_PAGE_ID no está configurado, lanza un error descriptivo.
 */
export async function getInstagramAccount(username) {
  const clean       = username.replace(/^@/, "").trim();
  const pivotPageId = process.env.META_FB_PAGE_ID;

  if (!pivotPageId) {
    throw new Error(
      "META_FB_PAGE_ID no configurado. " +
      "Necesitás el ID de una página de Facebook propia conectada a una cuenta IG Business. " +
      "Agregala en las variables de entorno de Vercel."
    );
  }

  const fields = [
    "business_discovery.as(user)",
    "{id,name,username,biography,",
    "followers_count,media_count,",
    "media.limit(12){like_count,comments_count,timestamp,media_type}}",
  ].join("");

  const url = `${BASE}/${pivotPageId}?fields=${fields}&username=${encodeURIComponent(clean)}&access_token=${TOKEN}`;
  const res  = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API (IG): ${data.error.message} (código ${data.error.code})`);
  }

  const user = data.business_discovery;
  if (!user) {
    throw new Error(
      `No se encontró @${clean} o la cuenta no es Business/Creator. ` +
      "Las cuentas personales de Instagram no son accesibles por la API de Meta."
    );
  }

  return transformInstagram(user);
}

function transformInstagram(raw) {
  const media     = raw.media?.data || [];
  const count     = media.length || 1;
  const followers = raw.followers_count || 0;

  const totalLikes    = media.reduce((s, m) => s + (m.like_count     || 0), 0);
  const totalComments = media.reduce((s, m) => s + (m.comments_count || 0), 0);

  const engagement = followers > 0
    ? parseFloat(((totalLikes + totalComments) / count / followers * 100).toFixed(2))
    : 0;

  return {
    platform:     "instagram",
    id:           raw.id,
    name:         raw.name,
    handle:       `@${raw.username}`,
    followers,
    following:    null,
    posts_count:  raw.media_count || 0,
    bio:          raw.biography   || "",
    engagement,
    avg_likes:    Math.round(totalLikes    / count),
    avg_comments: Math.round(totalComments / count),
    avg_reach:    Math.round((totalLikes + totalComments) / count),
    recent_posts: media.map(m => ({
      date:     m.timestamp,
      type:     m.media_type,
      likes:    m.like_count     || 0,
      comments: m.comments_count || 0,
    })),
  };
}
