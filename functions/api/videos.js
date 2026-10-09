
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(
      `SELECT id, title, category, duration, poster,
              embed_url AS embedUrl, page_url AS pageUrl
       FROM videos ORDER BY id DESC`
    ).all();

    return json({ videos: result.results || [] });
  } catch (error) {
    return json({ error: "Gagal mengambil daftar video" }, 500);
  }
}

