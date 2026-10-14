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

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) {
    return json({ error: "Akses ditolak" }, 401);
  }

  try {
    const totals = await env.DB.prepare(
      `SELECT
         COUNT(*) AS total_views,
         COUNT(DISTINCT video_id) AS videos_viewed,
         COUNT(DISTINCT date(created_at)) AS active_days
       FROM analytics_events
       WHERE event = 'page_view'`
    ).first();

    const today = await env.DB.prepare(
      `SELECT COUNT(*) AS views_today
       FROM analytics_events
       WHERE event = 'page_view'
         AND date(created_at) = date('now')`
    ).first();

    const popular = await env.DB.prepare(
      `SELECT
         v.id,
         v.title,
         COUNT(a.id) AS views
       FROM analytics_events a
       INNER JOIN videos v ON v.id = a.video_id
       WHERE a.event = 'page_view'
       GROUP BY v.id, v.title
       ORDER BY views DESC, v.id DESC
       LIMIT 10`
    ).all();

    return json({
      totals: {
        totalViews: Number(totals?.total_views || 0),
        videosViewed: Number(totals?.videos_viewed || 0),
        activeDays: Number(totals?.active_days || 0),
        viewsToday: Number(today?.views_today || 0)
      },
      popular: popular?.results || []
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return json({ error: "Gagal mengambil statistik" }, 500);
  }
}
