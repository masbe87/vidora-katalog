const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const videoId = String(body?.video_id || "").trim();
    const event = String(body?.event || "").trim();

    if (!videoId || !["page_view", "play_start"].includes(event)) {
      return json({ error: "Data statistik tidak valid" }, 400);
    }

    const video = await env.DB.prepare(
      "SELECT id FROM videos WHERE id = ? LIMIT 1"
    ).bind(videoId).first();

    if (!video) {
      return json({ error: "Video tidak ditemukan" }, 404);
    }

    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id TEXT NOT NULL,
        event TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();

    await env.DB.prepare(
      "INSERT INTO analytics_events (video_id, event) VALUES (?, ?)"
    ).bind(videoId, event).run();

    return json({ ok: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return json({ error: "Gagal mencatat statistik" }, 500);
  }
}
