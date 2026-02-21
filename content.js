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

    const bodyEl = document.getElementById("article-body");
    bodyEl.innerHTML = renderRichText(post.text || "");

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
    const lines = raw.split("\n");
    let html = "";
    let i = 0;

    // Состояние для группировки блоков
    let inQuoteBlock    = false;
    let inShopCategory  = false;
    let shopItemsBuffer = [];
    let quoteBuffer     = [];

    const flushQuote = () => {
      if (!quoteBuffer.length) return;
      html += '<div class="rt-quote-block">' +
        quoteBuffer.map(l => '<span class="rt-quote-line">' + escapeHtml(l) + '</span>').join("") +
        '</div>';
      quoteBuffer     = [];
      inQuoteBlock    = false;
    };

    const flushShopItems = () => {
      if (!shopItemsBuffer.length) return;
      html += '<div class="rt-shop-items">' +
        shopItemsBuffer.map(t => '<span class="rt-shop-tag">' + escapeHtml(t.trim()) + '</span>').join("") +
        '</div>';
      shopItemsBuffer = [];
    };

    while (i < lines.length) {
      const raw_line = lines[i];
      const line     = raw_line.trim();

      // --- Пустая строка ---
      if (!line) {
        flushQuote();
        flushShopItems();
        inShopCategory = false;
        i++; continue;
      }

      // --- Горизонтальный разделитель ---
      if (/^-{3,}$/.test(line)) {
        flushQuote();
        flushShopItems();
        inShopCategory = false;
        html += '<div class="rt-divider"></div>';
        i++; continue;
      }

      // --- Цитата / блок нарушений: "> Ст. 146 ..." ---
      if (/^>/.test(line)) {
        quoteBuffer.push(line.replace(/^>\s*/, ""));
        inQuoteBlock = true;
        i++; continue;
      } else if (inQuoteBlock) {
        flushQuote();
      }

      // --- Секция-бейдж: "📦 NEW" или "🔧 BugFix" ---
      const newSectionMatch = line.match(/^📦\s*NEW/i);
      const fixSectionMatch = line.match(/^🔧\s*BugFix/i);

      if (newSectionMatch) {
        html += '<div class="rt-section-badge new-section">' +
          '<span class="rt-section-badge-icon">📦</span>' +
          '<div class="rt-section-badge-content">' +
            '<span class="rt-section-badge-label">Новое</span>' +
            '<span class="rt-section-badge-title">NEW — Добавлено</span>' +
          '</div>' +
        '</div>';
        i++; continue;
      }

      if (fixSectionMatch) {
        html += '<div class="rt-section-badge fix-section">' +
          '<span class="rt-section-badge-icon">🔧</span>' +
          '<div class="rt-section-badge-content">' +
            '<span class="rt-section-badge-label">Исправления</span>' +
            '<span class="rt-section-badge-title">BugFix — Исправлено</span>' +
          '</div>' +
        '</div>';
        i++; continue;
      }

      // --- Чекмарк-пункт: "✅ Текст" ---
      if (/^✅/.test(line)) {
        flushShopItems();
        inShopCategory = false;

        let mainText = line.replace(/^✅\s*/, "");
        let hint = null;
        if (i + 1 < lines.length && /^\s*💕/.test(lines[i + 1])) {
          hint = lines[i + 1].trim();
          i++;
        }

        html += '<div class="rt-check-item">' +
          '<span class="rt-check-icon">✅</span>' +
          '<div class="rt-check-body">' +
            '<span class="rt-check-text">' + escapeHtml(mainText) + '</span>' +
            (hint ? '<span class="rt-check-hint">' + escapeHtml(hint) + '</span>' : '') +
          '</div>' +
        '</div>';
        i++; continue;
      }

      // --- Строка с хинтом 💕 ---
      if (/^💕/.test(line)) {
        html += '<div class="rt-check-hint">' + escapeHtml(line) + '</div>';
        i++; continue;
      }

      // --- Подкатегория товаров ---
      const shopCatMatch = raw_line.match(/^\s{2,}([\p{Emoji_Presentation}\p{Extended_Pictographic}]+)\s+(.+?):\s*$/u);
      if (shopCatMatch) {
        flushShopItems();
        const icon  = shopCatMatch[1].trim();
        const title = shopCatMatch[2].trim();
        html += '<div class="rt-shop-category">' +
          '<span class="rt-shop-category-icon">' + icon + '</span>' +
          '<span class="rt-shop-category-title">' + escapeHtml(title) + '</span>' +
        '</div>';
        inShopCategory = true;
        i++; continue;
      }

      // --- Субподкатегория ---
      const shopSubMatch = raw_line.match(/^\s{2,}(🇷🇺|🌍|[\p{Regional_Indicator}]{2})\s+(.+?):\s*$/u);
      if (shopSubMatch) {
        flushShopItems();
        html += '<div class="rt-shop-sub">' +
          shopSubMatch[1] + ' ' + escapeHtml(shopSubMatch[2]) +
        '</div>';
        inShopCategory = true;
        i++; continue;
      }

      // --- Строка товаров ---
      const shopItemsMatch = raw_line.match(/^\s{2,}[·•*]\s+(.+)/);
      if (shopItemsMatch && inShopCategory) {
        const items = shopItemsMatch[1].split(",");
        shopItemsBuffer.push(...items);
        i++; continue;
      }

      // --- Раздел верхнего уровня: "1. Раздел ..." ---
      const sectionMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (sectionMatch && !line.match(/^\d+\.\d+/)) {
        html += '<div class="rt-section-title">' +
          '<span class="rt-section-num">' + escapeHtml(sectionMatch[1]) + '</span>' +
          '<span class="rt-section-text">' + escapeHtml(sectionMatch[2]) + '</span>' +
        '</div>';
        i++; continue;
      }

      // --- Подпункт: "· 1.1. Название" ---
      const subMatch = line.match(/^[·•]?\s*(\d+\.\d+)\.?\s+(.+)/);
      if (subMatch) {
        html += '<div class="rt-subpoint-title">' +
          '<span class="rt-subpoint-num">' + escapeHtml(subMatch[1]) + '</span>' +
          '<span class="rt-subpoint-text">' + escapeHtml(subMatch[2]) + '</span>' +
        '</div>';
        i++; continue;
      }

      // --- Блок с меткой "· Описание:", "· Наказание:", "· Примечание:" ---
      const labelMatch = line.match(/^[·•]\s*(Описание|Наказание|Примечание)[:\s]/i);
      if (labelMatch) {
        const labelKey = labelMatch[1].toLowerCase();
        const labelColors = {
          описание:   { color: "#00eaff", icon: "📋" },
          наказание:  { color: "#ff6b6b", icon: "⚖️" },
          примечание: { color: "#ffd700", icon: "📌" },
        };
        const cfg  = labelColors[labelKey] || { color: "#aaa", icon: "ℹ️" };
        const rest = line.replace(/^[·•]\s*(Описание|Наказание|Примечание)[:\s]*/i, "").trim();
        html += '<div class="rt-labeled-block" style="--label-color:' + cfg.color + '">' +
          '<span class="rt-label-icon">' + cfg.icon + '</span>' +
          '<div class="rt-label-content">' +
            '<span class="rt-label-title">' + escapeHtml(labelMatch[1]) + '</span>' +
            (rest ? '<span class="rt-label-text">' + escapeHtml(rest) + '</span>' : '') +
          '</div>' +
        '</div>';
        i++; continue;
      }

      // --- Точка-маркер · текст ---
      if (/^[·•]\s/.test(line)) {
        const text = line.replace(/^[·•]\s/, "");
        html += '<div class="rt-dot-item"><span class="rt-dot">·</span><span>' + escapeHtml(text) + '</span></div>';
        i++; continue;
      }

      // --- Команда /cmd ---
      if (/^\/\w/.test(line)) {
        const match = line.match(/^(\/\S+)\s*[—–\-]?\s*(.*)/);
        if (match) {
          html += '<div class="rt-command">' +
            '<code class="rt-cmd-name">' + escapeHtml(match[1]) + '</code>' +
            (match[2] ? '<span class="rt-cmd-desc">' + escapeHtml(match[2]) + '</span>' : '') +
          '</div>';
        }
        i++; continue;
      }

      // --- 📌 Блок примечания с дочерними — строками ---
      if (/^📌/.test(line)) {
        const blockLines = [];
        let j = i + 1;
        while (j < lines.length && /^[—–]\s/.test(lines[j].trim())) {
          blockLines.push(lines[j].trim().replace(/^[—–]\s+/, ""));
          j++;
        }
        if (blockLines.length > 0) {
          const titleText = line.replace(/^📌\s*/, "");
          html += '<div class="rt-info-block">' +
            '<span class="rt-info-title">📌 ' + escapeHtml(titleText) + '</span>' +
            blockLines.map(l => '<span class="rt-info-line">— ' + escapeHtml(l) + '</span>').join("") +
          '</div>';
          i = j;
          continue;
        }
        // Если нет дочерних строк — рендерим как эмодзи-заголовок (ниже)
      }

      // --- Строка ограничения: "— Текст" или "– Текст" ---
      const restrictionMatch = line.match(/^[—–]\s+(.+)/);
      if (restrictionMatch) {
        html += '<div class="rt-restriction-item">' + escapeHtml(restrictionMatch[1]) + '</div>';
        i++; continue;
      }

      // --- Команда без слэша: "казино [сумма] — описание" / "+описание — desc" ---
      const plainCmdMatch = line.match(/^([+\-]?[а-яёa-z][а-яёa-z0-9_]*(?:\s+\[.+?\])*)\s*[—–]\s*(.+)/i);
      if (plainCmdMatch && line.length < 140) {
        html += '<div class="rt-plain-command">' +
          '<code class="rt-plain-cmd-name">' + escapeHtml(plainCmdMatch[1]) + '</code>' +
          '<span class="rt-plain-cmd-desc">' + escapeHtml(plainCmdMatch[2]) + '</span>' +
        '</div>';
        i++; continue;
      }

      // --- Эмодзи-заголовок ---
      if (startsWithEmoji(line) && line.length < 90) {
        flushShopItems();
        inShopCategory = false;
        const emojiLen = getLeadingEmojiLength(line);
        const emoji    = line.slice(0, emojiLen);
        const rest     = line.slice(emojiLen).trim();
        html += '<div class="rt-heading">' +
          '<span class="rt-heading-emoji">' + emoji + '</span>' +
          '<span class="rt-heading-text">' + escapeHtml(rest) + '</span>' +
        '</div>';
        i++; continue;
      }

      // --- Ранг (5️⃣) ---
      if (/^\d[\uFE0F]?\u20E3/.test(line)) {
        html += '<div class="rt-rank-item">' + escapeHtml(line) + '</div>';
        i++; continue;
      }

      // --- Обычный текст ---
      html += '<p class="rt-para">' + escapeHtml(line) + '</p>';
      i++;
    }

    // Сбрасываем незакрытые буферы
    flushQuote();
    flushShopItems();

    return html;
  }

  // ============================================
  // АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ
  // ============================================
  function animateBodyLines(container) {
    const blocks = container.querySelectorAll(
      ".rt-section-title, .rt-section-badge, .rt-subpoint-title, .rt-labeled-block, " +
      ".rt-dot-item, .rt-command, .rt-plain-command, .rt-heading, .rt-list-item, .rt-rank-item, " +
      ".rt-para, .rt-divider, .rt-check-item, .rt-quote-block, " +
      ".rt-shop-category, .rt-shop-sub, .rt-shop-items, " +
      ".rt-info-block, .rt-restriction-item"
    );
    blocks.forEach((el, i) => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(10px)";
      el.style.transition =
        `opacity 0.35s ease ${i * 0.028}s, transform 0.35s ease ${i * 0.028}s`;
      setTimeout(() => {
        el.style.opacity   = "1";
        el.style.transform = "translateY(0)";
      }, 40 + i * 28);
    });
  }

  // ============================================
  // УТИЛИТЫ
  // ============================================
  function startsWithEmoji(str) {
    const emojiRegex = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F100}-\u{1F1FF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/u;
    return emojiRegex.test(str);
  }

  function getLeadingEmojiLength(str) {
    let len = 0;
    const segments = [...str];
    for (let k = 0; k < Math.min(segments.length, 3); k++) {
      const code = segments[k].codePointAt(0);
      if (
        (code >= 0x1F300 && code <= 0x1FAFF) ||
        (code >= 0x2600  && code <= 0x27BF)  ||
        (code >= 0xFE00  && code <= 0xFE0F)  ||
        (code >= 0x1F900 && code <= 0x1F9FF) ||
        (code >= 0x1F100 && code <= 0x1F1FF)
      ) {
        len += segments[k].length;
      } else {
        break;
      }
    }
    return len || 2;
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
