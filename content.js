/* ============================================
   content.js — логика страницы статьи
   URL: content.html?id=CATEGORY-INDEX
   Пример: content.html?id=Команды-0
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // --- Навигационные кнопки (те же что на index) ---
  document.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const link = btn.dataset.link;
      if (!link) return;
      document.body.style.transition = "opacity 0.35s ease";
      document.body.style.opacity = "0";
      setTimeout(() => { window.location.href = link; }, 350);
    });
  });

  // --- Кнопка "Назад" ---
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      // Если есть история — назад, иначе на главную
      if (document.referrer && document.referrer.includes(window.location.hostname)) {
        history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  }

  // --- Читаем параметр ?id= из URL ---
  const params  = new URLSearchParams(window.location.search);
  const rawId   = params.get("id");   // например: "Команды-0"

  const skeleton = document.getElementById("article-skeleton");
  const card     = document.getElementById("article-card");
  const errorEl  = document.getElementById("article-error");

  if (!rawId) {
    showError();
    return;
  }

  // Разбиваем: всё до последнего "-" = категория, после = индекс
  const lastDash = rawId.lastIndexOf("-");
  if (lastDash === -1) { showError(); return; }

  const category = rawId.substring(0, lastDash);   // "Команды"
  const index    = parseInt(rawId.substring(lastDash + 1), 10); // 0

  if (isNaN(index)) { showError(); return; }

  // --- Загружаем JSON постов нужной категории ---
  fetch(`posts/${encodeURIComponent(category)}.json`)
    .then(res => {
      if (!res.ok) throw new Error("not found");
      return res.json();
    })
    .then(posts => {
      const post = posts[index];
      if (!post) throw new Error("index out of range");
      renderArticle(post, category);
    })
    .catch(() => showError());

  // --- Рендер статьи ---
  function renderArticle(post, category) {
    // Заголовок страницы
    const title = post.title || getAutoTitle(post.text);
    document.title = `${title} — FernieX Wiki`;

    // Заполняем элементы
    document.getElementById("article-category").textContent = category;
    document.getElementById("article-title").textContent    = title;
    document.getElementById("article-author").textContent   = post.author || "Неизвестно";
    document.getElementById("article-date").textContent     = formatDate(post.date);
    document.getElementById("article-body").textContent     = post.text || "";

    // Фото
    if (post.photo) {
      const photoWrap = document.getElementById("article-photo-wrap");
      const photoImg  = document.getElementById("article-photo");
      photoImg.src    = post.photo;
      photoWrap.style.display = "block";
    }

    // Скрываем скелетон, показываем карточку
    skeleton.style.display = "none";
    card.style.display     = "block";
  }

  // --- Показать ошибку ---
  function showError() {
    if (skeleton) skeleton.style.display = "none";
    if (errorEl)  errorEl.style.display  = "block";
  }

  // --- Авто-заголовок из текста (первые ~60 символов) ---
  function getAutoTitle(text) {
    if (!text) return "Без названия";
    const firstLine = text.split("\n")[0].trim();
    return firstLine.length > 70
      ? firstLine.substring(0, 67) + "..."
      : firstLine || "Без названия";
  }

  // --- Форматирование даты ---
  function formatDate(dateStr) {
    if (!dateStr) return "";
    // Формат "2026-01-18 19:20"
    const [datePart, timePart] = dateStr.split(" ");
    if (!datePart) return dateStr;

    const [y, m, d] = datePart.split("-");
    const months = [
      "января","февраля","марта","апреля","мая","июня",
      "июля","августа","сентября","октября","ноября","декабря"
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    const base = `${parseInt(d, 10)} ${monthName} ${y}`;
    return timePart ? `${base} в ${timePart}` : base;
  }
});
