
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

export async function onRequestPost({ request, env }) {
  const expected = env.ADMIN_PASSWORD;
  const auth = request.headers.get("Authorization") || "";

  if (!expected || auth !== `Bearer ${expected}`) {
    return json({ error: "Akses ditolak" }, 401);
  }

  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const category = String(body.category || "Terbaru").trim();
    const duration = String(body.duration || "").trim();
    const poster = String(body.poster || "").trim();
    const embedUrl = String(body.embedUrl || "").trim();
    const pageUrl = String(body.pageUrl || "").trim();

    if (!title || !embedUrl) {
      return json({ error: "Judul dan link embed wajib diisi" }, 400);
    }

    const parsed = new URL(embedUrl);
    if (parsed.protocol !== "https:") {
      return json({ error: "Gunakan URL HTTPS" }, 400);
    }

    const result = await env.DB.prepare(
      `INSERT INTO videos
       (title, category, duration, poster, embed_url, page_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      title, category, duration, poster, embedUrl, pageUrl
    ).run();

    return json({ success: true, id: result.meta.last_row_id }, 201);
  } catch {
    return json({ error: "Data tidak valid atau gagal disimpan" }, 400);
  }
}
