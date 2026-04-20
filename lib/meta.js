/**
 * lib/meta.js
 * Funciones para interactuar con Meta Graph API v19.0
 * Documentación: https://developers.facebook.com/docs/graph-api
 */

const BASE = "https://graph.facebook.com/v19.0";
const TOKEN = process.env.META_ACCESS_TOKEN;

// ─── FACEBOOK ────────────────────────────────────────────────────────────────

/**
 * Obtiene datos públicos de una página de Facebook por username o ID.
 */
export async function getFacebookPage(handle) {
  const clean = handle.replace(/^@/, "");
  const fields = [
    "id", "name", "username",
    "fan_count", "followers_count",
    "about", "category",
    "posts.limit(10){likes.summary(true),comments.summary(true),shares,created_time,message}",
  ].join(",");

  const url = `${BASE}/${clean}?fields=${fields}&access_token=${TOKEN}`;
  const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API: ${data.error.message} (code ${data.error.code})`);
  }

  return transformFacebook(data);
}

function transformFacebook(raw) {
  const posts = raw.posts?.data || [];

  const totalLikes    = posts.reduce((s, p) => s + (p.likes?.summary?.total_count    || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.summary?.total_count || 0), 0);
  const totalShares   = posts.reduce((s, p) => s + (p.shares?.count || 0), 0);
  const count         = posts.length || 1;

  return {
    platform:     "facebook",
    id:           raw.id,
    name:         raw.name,
    handle:       `@${raw.username || raw.id}`,
    followers:    raw.followers_count || raw.fan_count || 0,
    following:    null, // no disponible en Graph API pública
    posts_count:  null,
    engagement:   count > 0
      ? parseFloat(((totalLikes + totalComments) / count / (raw.followers_count || 1) * 100).toFixed(2))
      : 0,
    avg_likes:    Math.round(totalLikes    / count),
    avg_comments: Math.round(totalComments / count),
    avg_shares:   Math.round(totalShares   / count),
    recent_posts: posts.map(p => ({
      date:     p.created_time,
      message:  p.message?.slice(0, 120) || "",
      likes:    p.likes?.summary?.total_count    || 0,
      comments: p.comments?.summary?.total_count || 0,
      shares:   p.shares?.count || 0,
    })),
  };
}

// ─── INSTAGRAM ───────────────────────────────────────────────────────────────

/**
 * Obtiene datos de una cuenta de Instagram Business/Creator
 * usando el Business Discovery API de Meta.
 *
 * Requiere:
 *   1. Una cuenta de Instagram Business o Creator
 *   2. Una página de Facebook conectada a esa cuenta IG
 *   3. Un token de acceso con permiso instagram_basic
 *
 * Docs: https://developers.facebook.com/docs/instagram-api/guides/business-discovery
 */
export async function getInstagramAccount(username) {
  const clean = username.replace(/^@/, "");

  // Step 1: buscar la cuenta IG via Business Discovery
  // Necesitamos el ID de una página FB propia que actúe como "pivot"
  const pivotPageId = process.env.META_FB_PAGE_ID;

  if (!pivotPageId) {
    throw new Error("META_FB_PAGE_ID no configurado. Necesario para Business Discovery.");
  }

  const fields = [
    "business_discovery.as(user){",
    "id,name,username,biography,",
    "followers_count,media_count,",
    "media.limit(12){like_count,comments_count,timestamp,media_type}",
    "}",
  ].join("");

  const url = `${BASE}/${pivotPageId}?fields=${fields.replace(/\s/g, "")}&access_token=${TOKEN}`;
  // Nota: esto busca el usuario ${clean} — necesitás pasarlo como query param
  const urlFinal = `${BASE}/${pivotPageId}?fields=business_discovery.as(user){id,name,username,followers_count,media_count,biography,media.limit(12){like_count,comments_count,timestamp,media_type}}&user=${clean}&access_token=${TOKEN}`;

  const res  = await fetch(urlFinal, { next: { revalidate: 300 } });
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API (IG): ${data.error.message} (code ${data.error.code})`);
  }

  const user = data.business_discovery;
  if (!user) throw new Error("No se encontró la cuenta de Instagram o no es Business/Creator.");

  return transformInstagram(user);
}

function transformInstagram(raw) {
  const media = raw.media?.data || [];
  const count = media.length || 1;

  const totalLikes    = media.reduce((s, m) => s + (m.like_count     || 0), 0);
  const totalComments = media.reduce((s, m) => s + (m.comments_count || 0), 0);

  return {
    platform:     "instagram",
    id:           raw.id,
    name:         raw.name,
    handle:       `@${raw.username}`,
    followers:    raw.followers_count || 0,
    following:    null,
    posts_count:  raw.media_count || 0,
    bio:          raw.biography || "",
    engagement:   parseFloat(((totalLikes + totalComments) / count / (raw.followers_count || 1) * 100).toFixed(2)),
    avg_likes:    Math.round(totalLikes    / count),
    avg_comments: Math.round(totalComments / count),
    recent_posts: media.map(m => ({
      date:       m.timestamp,
      type:       m.media_type,
      likes:      m.like_count     || 0,
      comments:   m.comments_count || 0,
    })),
  };
}
