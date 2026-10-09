
(() => {
  let videos = [];
  let category = "Semua";

  const grid = document.getElementById("videoGrid");
  const filters = document.getElementById("filters");
  const search = document.getElementById("search");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("resultCount");
  const sectionTitle = document.getElementById("sectionTitle");

  document.getElementById("year").textContent =
    new Date().getFullYear();

  const esc = value =>
    String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));

  function normalizeVideo(v) {
    return {
      id: v.id,
      title: v.title || "Video tanpa judul",
      category: v.category || "Terbaru",
      duration: v.duration || "",
      poster: v.poster || "",
      embedUrl: v.embedUrl || v.embed_url || "",
      pageUrl: v.pageUrl || v.page_url || ""
    };
  }

  function renderFilters() {
    const categories = [
      "Semua",
      ...new Set(videos.map(v => v.category).filter(Boolean))
    ];

    if (!categories.includes(category)) category = "Semua";

    filters.innerHTML = categories.map(c =>
      `<button class="filter ${c === category ? "active" : ""}"
        type="button" data-category="${esc(c)}">${esc(c)}</button>`
    ).join("");
  }

  function filteredVideos() {
    const q = search.value.trim().toLowerCase();

    return videos.filter(v =>
      (category === "Semua" || v.category === category) &&
      `${v.title} ${v.category}`.toLowerCase().includes(q)
    );
  }

  function card(v, index) {
    const colors = [
      "#7c2d53", "#303f72", "#6c3c27",
      "#28584f", "#523b76"
    ];

    const poster = v.poster
      ? `<img src="${esc(v.poster)}" alt="${esc(v.title)}"
          loading="lazy"
          onerror="this.style.display='none'">`
      : "";

    return `
      <article class="video-card" tabindex="0" role="link"
        aria-label="Tonton ${esc(v.title)}"
        data-id="${esc(v.id)}">
        <div class="poster">
          <div class="poster-placeholder"
            style="--glow:${colors[index % colors.length]}">
            <span>▶</span>
          </div>
          ${poster}
          <div class="play-overlay"><span>▶</span></div>
          ${v.duration
            ? `<span class="duration">${esc(v.duration)}</span>`
            : ""}
        </div>
        <div class="card-info">
          <div class="card-category">${esc(v.category)}</div>
          <h3 class="card-title">${esc(v.title)}</h3>
          <div class="card-meta">Klik untuk menonton</div>
        </div>
      </article>`;
  }

  function render() {
    const list = filteredVideos();

    grid.innerHTML = list.map(card).join("");
    empty.hidden = list.length > 0;
    count.textContent = `${list.length} video`;
    sectionTitle.textContent =
      category === "Semua" ? "Semua video" : category;
  }

  async function loadVideos() {
    try {
      const response = await fetch("/api/videos", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`API video gagal: ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : data.videos || data.results;

      if (!Array.isArray(list)) {
        throw new Error("Format data API tidak sesuai");
      }

      videos = list.map(normalizeVideo);
      renderFilters();
      render();
    } catch (error) {
      console.error("Gagal memuat video:", error);
      grid.innerHTML = "";
      count.textContent = "Gagal memuat video";
      sectionTitle.textContent = "Katalog video";
      empty.hidden = false;
    }
  }

  function openWatchPage(id) {
    const video = videos.find(
      v => String(v.id) === String(id)
    );

    if (!video) return;

    window.location.href =
      `watch.html?id=${encodeURIComponent(video.id)}`;
  }

  filters.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    category = button.dataset.category;

    filters.querySelectorAll(".filter").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    render();
  });

  search.addEventListener("input", render);

  grid.addEventListener("click", event => {
    const item = event.target.closest("[data-id]");
    if (item) openWatchPage(item.dataset.id);
  });

  grid.addEventListener("keydown", event => {
    const item = event.target.closest("[data-id]");

    if (item && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openWatchPage(item.dataset.id);
    }
  });

  loadVideos();
})();
 
