(() => {
  const videos = Array.isArray(window.VIDEOS) ? window.VIDEOS : [];
  const grid = document.getElementById("videoGrid");
  const filters = document.getElementById("filters");
  const search = document.getElementById("search");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("resultCount");
  const sectionTitle = document.getElementById("sectionTitle");
  const modal = document.getElementById("playerModal");
  const frame = document.getElementById("playerFrame");
  const playerTitle = document.getElementById("playerTitle");
  const providerLink = document.getElementById("openProvider");
  let category = "Semua";
  document.getElementById("year").textContent = new Date().getFullYear();

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const categories = ["Semua", ...new Set(videos.map(v => v.category).filter(Boolean))];

  filters.innerHTML = categories.map(c =>
    `<button class="filter ${c === category ? "active" : ""}" type="button" data-category="${esc(c)}">${esc(c)}</button>`
  ).join("");

  function filteredVideos() {
    const q = search.value.trim().toLowerCase();
    return videos.filter(v => (category === "Semua" || v.category === category) &&
      `${v.title} ${v.category}`.toLowerCase().includes(q));
  }

  function card(v, index) {
    const placeholderColors = ["#7c2d53","#303f72","#6c3c27","#28584f","#523b76"];
    const poster = v.poster ? `<img src="${esc(v.poster)}" alt="" loading="lazy" onerror="this.remove()">` : "";
    return `<article class="video-card" tabindex="0" role="button" aria-label="Putar ${esc(v.title)}" data-id="${esc(v.id)}">
      <div class="poster">
        <div class="poster-placeholder" style="--glow:${placeholderColors[index % placeholderColors.length]}"><span>▶</span></div>
        ${poster}
        <div class="play-overlay"><span>▶</span></div>
        ${v.duration ? `<span class="duration">${esc(v.duration)}</span>` : ""}
      </div>
      <div class="card-info">
        <div class="card-category">${esc(v.category || "Video")}</div>
        <h3 class="card-title">${esc(v.title || "Video tanpa judul")}</h3>
        <div class="card-meta">Klik untuk menonton</div>
      </div>
    </article>`;
  }

  function render() {
    const list = filteredVideos();
    grid.innerHTML = list.map(card).join("");
    empty.hidden = list.length > 0;
    count.textContent = `${list.length} video`;
    sectionTitle.textContent = category === "Semua" ? "Semua video" : category;
  }

  function openVideo(id) {
    const v = videos.find(item => String(item.id) === String(id));
    if (!v) return;
    const url = String(v.embedUrl || "");
    if (!url || url.includes("ISI_ID_EMBED")) {
      alert("Ini masih video contoh. Edit videos.js dan masukkan URL embed video lo terlebih dahulu.");
      return;
    }
    try {
      const parsed = new URL(url);
      if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
    } catch {
      alert("URL embed belum valid. Periksa kembali videos.js.");
      return;
    }
    playerTitle.textContent = v.title || "Video";
    frame.src = url;
    providerLink.href = v.pageUrl || url;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeVideo() {
    modal.hidden = true;
    frame.src = "about:blank";
    document.body.style.overflow = "";
  }

  filters.addEventListener("click", e => {
    const button = e.target.closest("[data-category]");
    if (!button) return;
    category = button.dataset.category;
    filters.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === button));
    render();
  });
  search.addEventListener("input", render);
  grid.addEventListener("click", e => {
    const item = e.target.closest("[data-id]");
    if (item) openVideo(item.dataset.id);
  });
  grid.addEventListener("keydown", e => {
    const item = e.target.closest("[data-id]");
    if (item && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openVideo(item.dataset.id); }
  });
  document.getElementById("closePlayer").addEventListener("click", closeVideo);
  modal.addEventListener("click", e => { if (e.target.dataset.close === "true") closeVideo(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeVideo(); });
  render();
})();
