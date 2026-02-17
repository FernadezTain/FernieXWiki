/* ============================================
   Сброс opacity при загрузке (fix чёрного экрана при history.back)
   ============================================ */
document.body.style.opacity = "0";
window.addEventListener("pageshow", () => {
  document.body.style.transition = "opacity 0.35s ease";
  document.body.style.opacity = "1";
});

document.addEventListener("DOMContentLoaded", () => {
  const currentSection = document.querySelector(".current-section");
  const postsContainer = document.getElementById("posts-container");
  const hint           = document.getElementById("main-hint");
  const logoLink       = document.getElementById("logo-link");
  const banner         = document.getElementById("dev-banner");
  const closeBannerBtn = document.getElementById("close-banner");
  const searchInput    = document.querySelector(".search-bar input");

  // =========================
  // Управление hint-блоком
  // =========================
  function hideHint() {
    if (hint) hint.style.display = "none";
  }
  function showHint() {
    if (hint) hint.style.display = "flex";
  }

  // Все категории сайта (должны совпадать с data-section в HTML)
  const ALL_CATEGORIES = [
    "Игровые функции",
    "Чат-менеджер",
    "Команды",
    "Статистика",
    "Настройки",
    "Дополнительно"
  ];

  // Текущая активная категория (null = главная / поиск)
  let activeCategory = null;

  // =========================
  // Закрытие баннера разработки
  // =========================
  if (banner && closeBannerBtn) {
    closeBannerBtn.addEventListener("click", () => banner.remove());
  }

  // =========================
  // Навигация по боковым разделам
  // =========================
  document.querySelectorAll(".side-item").forEach(item => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      activeCategory = section;
      if (currentSection) currentSection.textContent = section;
      if (searchInput) searchInput.value = "";
      clearSearchState();
      loadPosts(section);
    });
  });

  // =========================
  // Клик на логотип (Главная)
  // =========================
  if (logoLink) {
    logoLink.addEventListener("click", e => {
      e.preventDefault();
      activeCategory = null;
      if (currentSection) currentSection.textContent = "Главная";
      if (searchInput) searchInput.value = "";
      clearSearchState();
      postsContainer.innerHTML = "";
      showHint();
    });
  }

  // =========================
  // Проверка логотипа
  // =========================
  const logoImg = document.getElementById("logo");
  if (logoImg) {
    logoImg.onerror = () => {
      logoImg.style.display = "none";
      const logoText = document.getElementById("logo-text");
      if (logoText) logoText.style.display = "inline-block";
    };
  }

  // =========================
  // ПОИСК
  // =========================
  let searchTimer = null;
  let searchResultsEl = null;

  function clearSearchState() {
    if (searchResultsEl) {
      searchResultsEl.remove();
      searchResultsEl = null;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim();

      // Сброс таймера debounce
      clearTimeout(searchTimer);

      if (!q) {
        clearSearchState();
        // Восстанавливаем предыдущий вид
        if (activeCategory) {
          loadPosts(activeCategory);
        } else {
          postsContainer.innerHTML = "";
          showHint();
        }
        return;
      }

      // Debounce 300ms
      searchTimer = setTimeout(() => runSearch(q), 300);
    });

    // Очистка по Escape
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
      }
    });
  }

  async function runSearch(query) {
    hideHint();
    postsContainer.innerHTML = "";
    if (currentSection) currentSection.textContent = `🔍 "${query}"`;

    // Показываем спиннер
    showSearchSpinner();

    const q = query.toLowerCase();

    // Загружаем все категории параллельно
    const results = [];
    await Promise.allSettled(
      ALL_CATEGORIES.map(async (cat) => {
        try {
          const res = await fetch(`posts/${encodeURIComponent(cat)}.json`);
          if (!res.ok) return;
          const posts = await res.json();
          posts.forEach((post, index) => {
            const title  = (post.title  || getAutoTitle(post.text) || "").toLowerCase();
            const text   = (post.text   || "").toLowerCase();
            const author = (post.author || "").toLowerCase();

            if (title.includes(q) || text.includes(q) || author.includes(q)) {
              results.push({ post, cat, index });
            }
          });
        } catch { /* категория не существует — пропускаем */ }
      })
    );

    // Убираем спиннер
    clearSearchState();
    postsContainer.innerHTML = "";

    if (!results.length) {
      showSearchEmpty(query);
      return;
    }

    // Заголовок результатов
    const header = document.createElement("div");
    header.className = "search-header";
    header.innerHTML = `
      <span class="search-count">${results.length}</span>
      <span class="search-label">результат${plural(results.length)} по запросу</span>
      <span class="search-query">"${escapeHtml(query)}"</span>
    `;
    postsContainer.appendChild(header);

    // Рендерим карточки
    results.forEach(({ post, cat, index }) => {
      const div = buildPostCard(post, cat, index, query);
      postsContainer.appendChild(div);
    });
  }

  function showSearchSpinner() {
    clearSearchState();
    searchResultsEl = document.createElement("div");
    searchResultsEl.className = "search-spinner-wrap";
    searchResultsEl.innerHTML = `
      <div class="search-spinner"></div>
      <span>Поиск по всем разделам...</span>
    `;
    postsContainer.innerHTML = "";
    postsContainer.appendChild(searchResultsEl);
  }

  function showSearchEmpty(query) {
    postsContainer.innerHTML = `
      <div class="search-empty">
        <div class="search-empty-icon">🔍</div>
        <p>Ничего не найдено по запросу <strong>"${escapeHtml(query)}"</strong></p>
        <span>Попробуйте другое ключевое слово или имя автора</span>
      </div>
    `;
  }

  function plural(n) {
    if (n % 10 === 1 && n % 100 !== 11) return "";
    if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return "а";
    return "ов";
  }

  // =========================
  // Загрузка постов (превью)
  // =========================
  async function loadPosts(category) {
    hideHint();
    postsContainer.innerHTML = `<div class="posts-loading"><div class="search-spinner"></div></div>`;

    try {
      const res = await fetch(`posts/${encodeURIComponent(category)}.json`);
      if (!res.ok) throw new Error("Файл не найден");
      const posts = await res.json();

      postsContainer.innerHTML = "";

      if (!posts.length) {
        postsContainer.innerHTML = `
          <div class="hint-state empty">
            <span class="hint-icon">📭</span>
            <span class="hint-title">Пока нет постов</span>
            <span class="hint-sub">В этом разделе ещё нет материалов — загляни позже</span>
          </div>`;
        return;
      }

      posts.forEach((post, index) => {
        const div = buildPostCard(post, category, index, null);
        postsContainer.appendChild(div);
      });

    } catch (err) {
      postsContainer.innerHTML = `
        <div class="hint-state error">
          <span class="hint-icon">⚠️</span>
          <span class="hint-title">Не удалось загрузить посты</span>
          <span class="hint-sub">Проверь подключение или попробуй обновить страницу</span>
        </div>`;
      console.error(err);
    }
  }

  // =========================
  // Строим карточку поста
  // =========================
  function buildPostCard(post, category, index, searchQuery) {
    const articleId  = `${category}-${index}`;
    const articleUrl = `content.html?id=${encodeURIComponent(articleId)}`;
    const title      = post.title || getAutoTitle(post.text);
    const authorName = post.author || "?";
    const avatarLetter = authorName.charAt(0).toUpperCase();

    // Подсветка совпадений
    const displayTitle  = searchQuery ? highlight(title, searchQuery)      : escapeHtml(title);
    const displayAuthor = searchQuery ? highlight(authorName, searchQuery) : escapeHtml(authorName);

    // Цвет бейджа категории
    const badgeColor = getCategoryColor(category);

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <div class="post-inner">
        <div class="post-top">
          <span class="post-category-badge" style="--badge-color:${badgeColor}">${escapeHtml(category)}</span>
        </div>
        <div class="post-title">${displayTitle}</div>
        <div class="post-footer">
          <div class="post-meta-left">
            <div class="post-avatar">${avatarLetter}</div>
            <div class="post-meta-text">
              <div class="post-preview-meta">
                <span class="author">${displayAuthor}</span>
              </div>
              <div class="post-preview-meta">
                <span class="date">${formatDate(post.date)}</span>
              </div>
            </div>
          </div>
          <a class="read-btn" href="${articleUrl}">Читать статью</a>
        </div>
      </div>
    `;

    // Клик автор
    div.querySelector(".author").addEventListener("click", e => {
      e.stopPropagation();
      showAuthorBanner(post.author);
    });

    // Клик кнопка
    div.querySelector(".read-btn").addEventListener("click", e => {
      e.preventDefault();
      document.body.style.transition = "opacity 0.35s ease";
      document.body.style.opacity = "0";
      setTimeout(() => { window.location.href = articleUrl; }, 350);
    });

    return div;
  }

  // =========================
  // Цвет бейджа по категории
  // =========================
  function getCategoryColor(cat) {
    const map = {
      "Игровые функции": "#00c853",
      "Чат-менеджер":    "#ff9100",
      "Команды":         "#00eaff",
      "Статистика":      "#e040fb",
      "Настройки":       "#ff5252",
      "Дополнительно":   "#8e44ad"
    };
    return map[cat] || "#555";
  }

  // =========================
  // Подсветка совпадений
  // =========================
  function highlight(str, query) {
    if (!query) return escapeHtml(str);
    const escaped  = escapeHtml(str);
    const escapedQ = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escaped.replace(
      new RegExp(`(${escapedQ})`, "gi"),
      '<mark class="search-mark">$1</mark>'
    );
  }

  // =========================
  // Авто-заголовок из текста
  // =========================
  function getAutoTitle(text) {
    if (!text) return "Без названия";
    const firstLine = text.split("\n")[0].trim();
    return firstLine.length > 70
      ? firstLine.substring(0, 67) + "..."
      : firstLine || "Без названия";
  }

  // =========================
  // Экранирование HTML
  // =========================
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // =========================
  // Форматирование даты
  // =========================
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [datePart, timePart] = dateStr.split(" ");
    if (!datePart) return dateStr;
    const [y, m, d] = datePart.split("-");
    const months = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
    const monthName = months[parseInt(m, 10) - 1] || m;
    const base = `${parseInt(d, 10)} ${monthName} ${y}`;
    return timePart ? `${base}, ${timePart}` : base;
  }

  // =========================
  // Баннер автора
  // =========================
  function showAuthorBanner(nick) {
    if (document.getElementById("author-banner")) return;
    const b = document.createElement("div");
    b.id = "author-banner";
    b.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(10,10,10,0.95);display:flex;align-items:center;
      justify-content:center;z-index:9999;`;
    b.innerHTML = `
      <div style="background:#141414;padding:30px 25px;border-radius:20px;
                  text-align:center;max-width:350px;width:90%;
                  box-shadow:0 10px 40px rgba(0,234,255,0.4);">
        <h2 style="color:#00eaff;margin-bottom:15px;">Администрация сайта</h2>
        <p style="color:#ccc;margin-bottom:10px;">Имя: ${escapeHtml(nick)}</p>
        <button id="profile-btn" style="background:#00eaff;color:#000;border:none;border-radius:30px;
          padding:12px 25px;font-weight:bold;cursor:pointer;margin-bottom:10px;">Перейти в профиль</button>
        <br>
        <button id="close-author-banner" style="margin-top:10px;background:#ff6b6b;color:#fff;
          border:none;border-radius:30px;padding:10px 25px;cursor:pointer;">Закрыть</button>
      </div>`;
    document.body.appendChild(b);
    document.getElementById("profile-btn").addEventListener("click", () => {
      window.open(`profile.html?nick=${encodeURIComponent(nick)}`, "_blank");
    });
    document.getElementById("close-author-banner").addEventListener("click", () => b.remove());
  }

  // =========================
  // Фиолетовый индикатор верхней панели
  // =========================
  const links    = document.querySelectorAll(".nav-link");
  const indicator = document.querySelector(".nav-indicator");

  function moveIndicator(el) {
    if (!el || !indicator) return;
    const rect       = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();
    indicator.style.width = rect.width + "px";
    indicator.style.left  = (rect.left - parentRect.left) + "px";
  }

  function initIndicator() {
    const activeLink = document.querySelector(".nav-link.active") || links[0];
    moveIndicator(activeLink);
  }

  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      moveIndicator(link);
    });
  });

  window.addEventListener("load", initIndicator);
  window.addEventListener("resize", initIndicator);
});

// =========================
// Переключатель страниц
// =========================
document.querySelectorAll(".page-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const link = btn.dataset.link;
    if (!link || btn.classList.contains("active")) return;
    document.body.style.transition = "opacity 0.35s ease";
    document.body.style.opacity = "0";
    setTimeout(() => { window.location.href = link; }, 350);
  });
});
