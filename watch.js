
(async () => {
  const status = document.getElementById("watchStatus");
  const content = document.getElementById("watchContent");
  const frame = document.getElementById("watchFrame");

  document.getElementById("watchYear").textContent =
    new Date().getFullYear();

  const id = new URLSearchParams(location.search).get("id");

  if (!id) {
    status.textContent = "Video tidak ditemukan. Kembali ke katalog.";
    return;
  }

  try {
    const response = await fetch("/api/videos", {
      cache: "no-store"
    });

    if (!response.ok) throw new Error("Gagal mengambil katalog.");

    const data = await response.json();
    const videos = Array.isArray(data)
      ? data
      : data.videos || data.results;

    if (!Array.isArray(videos)) throw new Error("Data video tidak valid.");

    const video = videos.find(v => String(v.id) === String(id));

    if (!video) {
      status.textContent = "Video tidak ditemukan atau sudah dihapus.";
      return;
    }

    const title = video.title || "Video tanpa judul";
    const category = video.category || "Terbaru";
    const duration = video.duration || "";
    const embedUrl = video.embedUrl || video.embed_url || "";
    const pageUrl = video.pageUrl || video.page_url || "";

    let parsed;
    try {
      parsed = new URL(embedUrl);
    } catch {
      status.textContent = "URL embed video belum valid.";
      return;
    }

    if (!["https:", "http:"].includes(parsed.protocol)) {
      status.textContent = "URL video tidak diizinkan.";
      return;
    }

    document.title = `${title} | VIDORA`;
    document.getElementById("watchTitle").textContent = title;
    document.getElementById("watchCategory").textContent = category;
    document.getElementById("watchDuration").textContent = duration;

    const source = document.getElementById("watchSource");
    source.href = pageUrl || embedUrl;

    frame.src = parsed.href;
    status.hidden = true;
    content.hidden = false;
  } catch (error) {
    console.error(error);
    status.textContent = "Gagal memuat video. Coba muat ulang halaman.";
  }
})();
