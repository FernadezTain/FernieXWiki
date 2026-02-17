/* ============================================
   Сброс opacity при загрузке (fix чёрного экрана при history.back)
   ============================================ */
document.body.style.opacity = "0";
window.addEventListener("pageshow", () => {
  document.body.style.transition = "opacity 0.35s ease";
  document.body.style.opacity = "1";
});

/* ============================================
   content.js — логика страницы статьи
   URL: content.html?id=CATEGORY-INDEX
   Пример: content.html?id=Команды-0
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // --- Навигационные кнопки ---
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
      // Плавный уход
      document.body.style.transition = "opacity 0.3s ease";
      document.body.style.opacity = "0";
      setTimeout(() => {
        if (document.referrer && document.referrer.includes(window.location.hostname)) {
          history.back();
        } else {
          window.location.href = "index.html";
        }
      }, 300);
    });
  }

  // --- Читаем параметр ?id= из URL ---
  const params   = new URLSearchParams(window.location.search);
  const rawId    = params.get("id");

  const skeleton = document.getElementById("article-skeleton");
  const card     = document.getElementById("article-card");
  const errorEl  = document.getElementById("article-error");

  if (!rawId) { showError(); return; }

  const lastDash = rawId.lastIndexOf("-");
  if (lastDash === -1) { showError(); return; }

  const category = rawId.substring(0, lastDash);
  const index    = parseInt(rawId.substring(lastDash + 1), 10);
  if (isNaN(index)) { showError(); return; }

  fetch(`posts/${encodeURIComponent(category)}.json`)
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(posts => {
      const post = posts[index];
      if (!post) throw new Error();
      renderArticle(post, category);
    })
    .catch(() => showError());

  // ============================================
  // РЕНДЕР СТАТЬИ
  // ============================================
  function renderArticle(post, category) {
    const title = post.title || getAutoTitle(post.text);
    document.title = `${title} — FernieX Wiki`;

    document.getElementById("article-category").textContent = category;
    document.getElementById("article-title").textContent    = title;
    document.getElementById("article-author").textContent   = post.author || "Неизвестно";
    document.getElementById("article-date").textContent     = formatDate(post.date);

    // Богатый рендер текста
    const bodyEl = document.getElementById("article-body");
    bodyEl.innerHTML = renderRichText(post.text || "");

    // Фото
    if (post.photo) {
      const photoWrap = document.getElementById("article-photo-wrap");
      const photoImg  = document.getElementById("article-photo");
      photoImg.src    = post.photo;
      photoWrap.style.display = "block";
      photoImg.style.opacity  = "0";
      photoImg.addEventListener("load", () => {
        photoImg.style.transition = "opacity 0.5s ease";
        photoImg.style.opacity    = "1";
      });
    }

    skeleton.style.display = "none";
    card.style.display     = "block";
    animateBodyLines(bodyEl);
  }

  // ============================================
  // ПАРСЕР ТЕКСТА -> HTML
  // ============================================
  function renderRichText(raw) {
    const paragraphs = raw.split(/\n{2,}/);

    return paragraphs.map(para => {
      const lines = para.split("\n").filter(l => l.trim() !== "");
      if (!lines.length) return "";
      const rendered = lines.map(line => renderLine(line.trim())).join("");
      return '<div class="rt-block">' + rendered + "</div>";
    }).join("");
  }

  function renderLine(line) {
    if (!line) return "";

    // Команда: строка начинается с /слово
    if (/^\/\w/.test(line)) {
      return renderCommandLine(line);
    }

    // Заголовок с эмодзи: эмодзи в начале, текст короткий (< 80 символов)
    if (startsWithEmoji(line) && line.length < 90) {
      return renderEmojiHeading(line);
    }

    // Ранги: цифра + эмодзи (типа 5️⃣)
    if (/^\d[\uFE0F]?\u20E3/.test(line)) {
      return renderRankItem(line);
    }

    // Маркер списка
    if (/^[•\-–—]\s/.test(line)) {
      return renderListItem(line);
    }

    // Обычный абзац
    return '<p class="rt-para">' + escapeHtml(line) + "</p>";
  }

  // /команда — описание
  function renderCommandLine(line) {
    const match = line.match(/^(\/\S+)\s*[—–\-]?\s*(.*)/);
    if (match) {
      const cmd  = match[1];
      const desc = match[2] || "";
      return (
        '<div class="rt-command">' +
          '<code class="rt-cmd-name">' + escapeHtml(cmd) + "</code>" +
          (desc ? '<span class="rt-cmd-desc">' + escapeHtml(desc) + "</span>" : "") +
        "</div>"
      );
    }
    return '<div class="rt-command"><code class="rt-cmd-name">' + escapeHtml(line) + "</code></div>";
  }

  // Эмодзи-заголовок
  function renderEmojiHeading(line) {
    const emojiLen = getLeadingEmojiLength(line);
    const emoji    = line.slice(0, emojiLen);
    const rest     = line.slice(emojiLen).trim();
    return (
      '<div class="rt-heading">' +
        '<span class="rt-heading-emoji">' + emoji + "</span>" +
        '<span class="rt-heading-text">' + escapeHtml(rest) + "</span>" +
      "</div>"
    );
  }

  // Ранговый пункт (5️⃣ Руководитель)
  function renderRankItem(line) {
    return '<div class="rt-rank-item">' + escapeHtml(line) + "</div>";
  }

  // Обычный пункт списка
  function renderListItem(line) {
    const text = line.replace(/^[•\-–—]\s/, "");
    return '<div class="rt-list-item"><span class="rt-bullet">▸</span>' + escapeHtml(text) + "</div>";
  }

  // ============================================
  // АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ
  // ============================================
  function animateBodyLines(container) {
    const blocks = container.querySelectorAll(
      ".rt-block, .rt-command, .rt-heading, .rt-list-item, .rt-rank-item, .rt-para"
    );
    blocks.forEach((el, i) => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(8px)";
      el.style.transition = "opacity 0.35s ease " + (i * 0.035) + "s, transform 0.35s ease " + (i * 0.035) + "s";
      setTimeout(() => {
        el.style.opacity   = "1";
        el.style.transform = "translateY(0)";
      }, 50 + i * 35);
    });
  }

  // ============================================
  // УТИЛИТЫ
  // ============================================
  function startsWithEmoji(str) {
    // Проверяем первый символ — эмодзи ли это
    const emojiRegex = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F100}-\u{1F1FF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/u;
    return emojiRegex.test(str);
  }

  function getLeadingEmojiLength(str) {
    // Грубый подсчёт: берём первые 4 символа как возможное эмодзи
    let len = 0;
    const segments = [...str];
    for (let i = 0; i < Math.min(segments.length, 3); i++) {
      const code = segments[i].codePointAt(0);
      if (
        (code >= 0x1F300 && code <= 0x1FAFF) ||
        (code >= 0x2600  && code <= 0x27BF)  ||
        (code >= 0xFE00  && code <= 0xFE0F)  ||
        (code >= 0x1F900 && code <= 0x1F9FF) ||
        (code >= 0x1F100 && code <= 0x1F1FF)
      ) {
        len += segments[i].length;
      } else {
        break;
      }
    }
    return len || 2; // минимум 2 байта
  }

  function showError() {
    if (skeleton) skeleton.style.display = "none";
    if (errorEl)  errorEl.style.display  = "block";
  }

  function getAutoTitle(text) {
    if (!text) return "Без названия";
    const firstLine = text.split("\n")[0].trim();
    return firstLine.length > 70 ? firstLine.substring(0, 67) + "..." : firstLine || "Без названия";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [datePart, timePart] = dateStr.split(" ");
    if (!datePart) return dateStr;
    const [y, m, d] = datePart.split("-");
    const months = ["января","февраля","марта","апреля","мая","июня",
                    "июля","августа","сентября","октября","ноября","декабря"];
    const monthName = months[parseInt(m, 10) - 1] || m;
    const base = `${parseInt(d, 10)} ${monthName} ${y}`;
    return timePart ? `${base} в ${timePart}` : base;
  }
});
