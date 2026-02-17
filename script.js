document.addEventListener("DOMContentLoaded", () => {
  const currentSection = document.querySelector(".current-section");
  const postsContainer = document.getElementById("posts-container");
  const hint = document.querySelector(".main-content .hint");
  const logoLink = document.getElementById("logo-link");
  const banner = document.getElementById("dev-banner");
  const closeBannerBtn = document.getElementById("close-banner");

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
      if (currentSection) currentSection.textContent = section;
      if (hint) hint.style.display = "none";
      loadPosts(section);
    });
  });

  // =========================
  // Клик на логотип (Главная)
  // =========================
  if (logoLink) {
    logoLink.addEventListener("click", e => {
      e.preventDefault();
      if (currentSection) currentSection.textContent = "Главная";
      if (hint) hint.style.display = "block";
      postsContainer.innerHTML = "";
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
  // Загрузка постов (превью)
  // =========================
  async function loadPosts(category) {
    postsContainer.innerHTML = "";

    try {
      const res = await fetch(`posts/${encodeURIComponent(category)}.json`);
      if (!res.ok) throw new Error("Файл не найден");

      const posts = await res.json();

      if (!posts.length) {
        postsContainer.innerHTML = "<p class='hint'>Пока нет постов</p>";
        return;
      }

      posts.forEach((post, index) => {
        const articleId = `${category}-${index}`;
        const articleUrl = `content.html?id=${encodeURIComponent(articleId)}`;

        // Заголовок: если есть поле title — берём его, иначе — первая строка текста
        const title = post.title || getAutoTitle(post.text);

        const div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
          <div class="post-title">${escapeHtml(title)}</div>
          <div class="post-preview-meta">
            <span class="author">${escapeHtml(post.author || "Неизвестно")}</span>
            <span class="date">${formatDate(post.date)}</span>
          </div>
          <a class="read-btn" href="${articleUrl}">Читать статью</a>
        `;

        // Клик на автора — баннер профиля
        const authorEl = div.querySelector(".author");
        authorEl.addEventListener("click", e => {
          e.stopPropagation();
          showAuthorBanner(post.author);
        });

        // Клик на кнопку — плавный переход
        const readBtn = div.querySelector(".read-btn");
        readBtn.addEventListener("click", e => {
          e.preventDefault();
          document.body.style.transition = "opacity 0.35s ease";
          document.body.style.opacity = "0";
          setTimeout(() => { window.location.href = articleUrl; }, 350);
        });

        postsContainer.appendChild(div);
      });

    } catch (err) {
      postsContainer.innerHTML = "<p class='hint'>Ошибка загрузки постов</p>";
      console.error(err);
    }
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
    const months = [
      "янв","фев","мар","апр","мая","июн",
      "июл","авг","сен","окт","ноя","дек"
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    const base = `${parseInt(d, 10)} ${monthName} ${y}`;
    return timePart ? `${base}, ${timePart}` : base;
  }

  // =========================
  // Баннер автора
  // =========================
  function showAuthorBanner(nick) {
    if (document.getElementById("author-banner")) return;

    const banner = document.createElement("div");
    banner.id = "author-banner";
    banner.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(10,10,10,0.95);display:flex;
      align-items:center;justify-content:center;z-index:9999;
    `;

    banner.innerHTML = `
      <div style="background:#141414;padding:30px 25px;border-radius:20px;
                  text-align:center;max-width:350px;width:90%;
                  box-shadow:0 10px 40px rgba(0,234,255,0.4);">
        <h2 style="color:#00eaff;margin-bottom:15px;">Администрация сайта</h2>
        <p style="color:#ccc;margin-bottom:10px;">Имя: ${escapeHtml(nick)}</p>
        <button id="profile-btn"
          style="background:#00eaff;color:#000;border:none;border-radius:30px;
                 padding:12px 25px;font-weight:bold;cursor:pointer;margin-bottom:10px;">
          Перейти в профиль
        </button>
        <br>
        <button id="close-author-banner"
          style="margin-top:10px;background:#ff6b6b;color:#fff;border:none;
                 border-radius:30px;padding:10px 25px;cursor:pointer;">
          Закрыть
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("profile-btn").addEventListener("click", () => {
      window.open(`profile.html?nick=${encodeURIComponent(nick)}`, "_blank");
    });

    document.getElementById("close-author-banner").addEventListener("click", () => {
      banner.remove();
    });
  }

  // =========================
  // Фиолетовый индикатор верхней панели
  // =========================
  const links = document.querySelectorAll(".nav-link");
  const indicator = document.querySelector(".nav-indicator");

  function moveIndicator(el) {
    if (!el || !indicator) return;
    const rect = el.getBoundingClientRect();
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
