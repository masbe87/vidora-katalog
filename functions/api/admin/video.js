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

function readVideo(body) {
  const video = {
    title: String(body.title || "").trim(),
    category: String(body.category || "Terbaru").trim(),
    duration: String(body.duration || "").trim(),
    poster: String(body.poster || "").trim(),
    embedUrl: String(body.embedUrl || "").trim(),
    pageUrl: String(body.pageUrl || "").trim()
  };

  if (!video.title || !video.embedUrl) {
    return { error: "Judul dan URL video wajib diisi" };
  }

  try {
    const parsed = new URL(video.embedUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { error: "URL video tidak valid" };
    }
  } catch {
    return { error: "URL video tidak valid" };
  }

  for (const field of ["poster", "pageUrl"]) {
    if (!video[field]) continue;
    try {
      const parsed = new URL(video[field]);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { error: "URL poster atau halaman sumber tidak valid" };
      }
    } catch {
      return { error: "URL poster atau halaman sumber tidak valid" };
    }
  }

  return { video };
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) {
    return json({ error: "Akses ditolak" }, 401);
  }

  try {
    const parsed = readVideo(await request.json());
    if (parsed.error) return json({ error: parsed.error }, 400);
    const { title, category, duration, poster, embedUrl, pageUrl } = parsed.video;

    const result = await env.DB.prepare(
      `INSERT INTO videos
       (title, category, duration, poster, embed_url, page_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(title, category, duration, poster, embedUrl, pageUrl).run();

    return json({
      success: true,
      id: result.meta?.last_row_id ?? null,
      message: "Video berhasil ditambahkan"
    }, 201);
  } catch {
    return json({
      error: "Gagal menyimpan video. Periksa koneksi database."
    }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!authorized(request, env)) {
    return json({ error: "Akses ditolak" }, 401);
  }

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return json({ error: "ID video tidak valid" }, 400);
  }

  try {
    const parsed = readVideo(await request.json());
    if (parsed.error) return json({ error: parsed.error }, 400);
    const { title, category, duration, poster, embedUrl, pageUrl } = parsed.video;

    const result = await env.DB.prepare(
      `UPDATE videos
       SET title = ?, category = ?, duration = ?, poster = ?, embed_url = ?, page_url = ?
       WHERE id = ?`
    ).bind(title, category, duration, poster, embedUrl, pageUrl, id).run();

    if (!result.meta?.changes) {
      return json({ error: "Video tidak ditemukan" }, 404);
    }

    return json({ success: true, message: "Video berhasil diperbarui" });
  } catch {
    return json({
      error: "Gagal memperbarui video. Periksa koneksi database."
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
  } catch {
    return json({
      error: "Gagal menghapus video. Periksa koneksi database."
    }, 500);
  }
}
