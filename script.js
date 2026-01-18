document.addEventListener("DOMContentLoaded", () => {
  const currentSection = document.querySelector(".current-section");
  const postsContainer = document.getElementById("posts-container");
  const hint = document.querySelector(".main-content .hint");
  const logoLink = document.getElementById("logo-link");
  const banner = document.getElementById("dev-banner");
  const closeBannerBtn = document.getElementById("close-banner");

  // --- Закрытие баннера разработки ---
  if (banner && closeBannerBtn) {
    closeBannerBtn.addEventListener("click", () => banner.remove());
  }

  // --- Навигация по разделам ---
  document.querySelectorAll(".side-item").forEach(item => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      currentSection.textContent = section;
      if (hint) hint.style.display = "none";
      loadPosts(section);
    });
  });

  // --- Клик на логотип ---
  if (logoLink) {
    logoLink.addEventListener("click", e => {
      e.preventDefault();
      currentSection.textContent = "Главная";
      if (hint) hint.style.display = "block";
      postsContainer.innerHTML = "";
    });
  }

  // --- Проверка логотипа ---
  const logoImg = document.getElementById("logo");
  if (logoImg) {
    logoImg.onerror = () => {
      logoImg.style.display = "none";
      const logoText = document.getElementById("logo-text");
      if (logoText) logoText.style.display = "inline-block";
    };
  }

  // =========================
  // Загрузка постов
  // =========================
  async function loadPosts(category) {
    postsContainer.innerHTML = "";
    try {
      const res = await fetch(`posts/${category}.json`);
      if (!res.ok) throw new Error("Файл не найден");
      const posts = await res.json();

      if (!posts.length) {
        postsContainer.innerHTML = "<p class='hint'>Пока нет постов</p>";
        return;
      }

      posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
          ${post.photo ? `<img src="${post.photo}" alt="Фото от ${post.author}">` : ""}
          <div class="post-text collapsed">${post.text}</div>
          <div class="post-info">
            <span class="author">${post.author}</span>
            <span class="date">${post.date}</span>
          </div>
        `;

        // Раскрытие текста по клику
        const textEl = div.querySelector(".post-text");
        textEl.addEventListener("click", () => textEl.classList.toggle("collapsed"));

        // Клик на автора открывает баннер
        const authorEl = div.querySelector(".author");
        authorEl.addEventListener("click", e => {
          e.stopPropagation();
          showAuthorBanner(post.author);
        });

        postsContainer.appendChild(div);
      });

    } catch (err) {
      postsContainer.innerHTML = "<p class='hint'>Ошибка загрузки постов</p>";
      console.error(err);
    }
  }

  // =========================
  // Баннер автора
  // =========================
  function showAuthorBanner(nick) {
    if (document.getElementById("author-banner")) return;

    const banner = document.createElement("div");
    banner.id = "author-banner";
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.height = "100%";
    banner.style.background = "rgba(10,10,10,0.95)";
    banner.style.display = "flex";
    banner.style.alignItems = "center";
    banner.style.justifyContent = "center";
    banner.style.zIndex = "9999";

    banner.innerHTML = `
      <div style="background: #141414; padding: 30px 25px; border-radius: 20px; text-align:center; max-width: 350px; width:90%; box-shadow:0 10px 40px rgba(0,234,255,0.4);">
        <h2 style="color:#00eaff; margin-bottom:15px;">Администрация сайта</h2>
        <p style="color:#ccc; margin-bottom:10px;">Имя: ${nick}</p>
        <button id="profile-btn" style="background:#00eaff; color:#000; border:none; border-radius:30px; padding:12px 25px; font-weight:bold; cursor:pointer;">Перейти в профиль</button>
        <button id="close-author-banner" style="margin-top:15px; background:#ff6b6b; color:#fff; border:none; border-radius:30px; padding:10px 25px; cursor:pointer;">Закрыть</button>
      </div>
    `;

    document.body.appendChild(banner);

    // --- Переход на универсальный профиль ---
    document.getElementById("profile-btn").addEventListener("click", () => {
      // Теперь открывается profile.html с параметром ?nick=
      window.open(`profile.html?nick=${encodeURIComponent(nick)}`, "_blank");
    });

    document.getElementById("close-author-banner").addEventListener("click", () => banner.remove());
  }
});

