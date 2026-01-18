document.addEventListener("DOMContentLoaded", () => {
  const currentSection = document.querySelector(".current-section");
  const postsContainer = document.getElementById("posts-container");
  const hint = document.querySelector(".main-content .hint");
  const logoLink = document.getElementById("logo-link");
  const banner = document.getElementById("dev-banner");
  const closeBannerBtn = document.getElementById("close-banner");

  // --- Закрытие баннера ---
  if (banner && closeBannerBtn) {
    closeBannerBtn.addEventListener("click", () => {
      banner.remove();
    });
  }

  // --- Навигация по разделам ---
  document.querySelectorAll(".side-item").forEach(item => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      currentSection.textContent = section;

      if (hint) hint.style.display = "none"; // скрываем подсказку
      loadPosts(section);
    });
  });

  // --- Лого ---
  if (logoLink) {
    logoLink.addEventListener("click", e => {
      e.preventDefault();
      currentSection.textContent = "Главная";

      if (hint) hint.style.display = "block"; // показываем подсказку
      postsContainer.innerHTML = ""; // очищаем контент
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
  // Загрузка постов из JSON
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
          <strong>${post.author}</strong> <span class="date">${post.date}</span>
          ${post.photo ? `<img src="${post.photo}" alt="">` : ""}
          <div class="post-text collapsed">${post.text}</div>
        `;
        const textEl = div.querySelector(".post-text");
        textEl.addEventListener("click", () => textEl.classList.toggle("collapsed"));
        postsContainer.appendChild(div);
      });
    } catch (err) {
      postsContainer.innerHTML = "<p class='hint'>Ошибка загрузки постов</p>";
      console.error(err);
    }
  }
});
