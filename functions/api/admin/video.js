const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

function authorized(request, env) {
  const expected = env.ADMIN_PASSWORD;
  const auth = request.headers.get("Authorization");

  return Boolean(expected) && auth === `Bearer ${expected}`;
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) {
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
      return json({
        error: "Judul dan URL video wajib diisi"
      }, 400);
    }

    let parsedEmbed;
    try {
      parsedEmbed = new URL(embedUrl);
    } catch {
      return json({ error: "URL video tidak valid" }, 400);
    }

    if (!["http:", "https:"].includes(parsedEmbed.protocol)) {
      return json({ error: "URL video tidak valid" }, 400);
    }

    const result = await env.DB.prepare(
      `INSERT INTO videos
       (title, category, duration, poster, embed_url, page_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      title,
      category,
      duration,
      poster,
      embedUrl,
      pageUrl
    ).run();

    return json({
      success: true,
      id: result.meta?.last_row_id ?? null,
      message: "Video berhasil ditambahkan"
    }, 201);

  } catch (error) {
    return json({
      error: "Gagal menyimpan video. Periksa koneksi database."
    }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!authorized(request, env)) {
    return json({ error: "Akses ditolak" }, 401);
  }

  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get("id"));

    if (!Number.isInteger(id) || id < 1) {
      return json({ error: "ID video tidak valid" }, 400);
    }

    const result = await env.DB.prepare(
      "DELETE FROM videos WHERE id = ?"
    ).bind(id).run();

    if (!result.meta?.changes) {
      return json({ error: "Video tidak ditemukan" }, 404);
    }

    return json({
      success: true,
      message: "Video berhasil dihapus"
    });

  } catch (error) {
    return json({
      error: "Gagal menghapus video. Periksa koneksi database."
    }, 500);
  }
}
