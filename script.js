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
      if (hint) hint.style.display = "none";
      postsContainer.innerHTML = "";
    });
  });

  // --- Лого ---
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
});
