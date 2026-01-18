/* =========================
   DOM
========================= */
const currentSection = document.querySelector(".current-section");
const postsContainer = document.getElementById("posts-container");
const hint = document.querySelector(".main-content .hint");
const logoLink = document.getElementById("logo-link");

/* =========================
   НАВИГАЦИЯ ПО РАЗДЕЛАМ
========================= */
document.querySelectorAll(".side-item").forEach(item => {
  item.addEventListener("click", () => {
    const section = item.dataset.section;
    currentSection.textContent = section;

    // скрываем подсказку при открытии раздела
    if (hint) hint.style.display = "none";

    // очищаем контент (посты)
    postsContainer.innerHTML = "";
  });
});

/* =========================
   ЛОГО
========================= */
logoLink.addEventListener("click", e => {
  e.preventDefault();
  currentSection.textContent = "Главная";

  // возвращаем подсказку
  if (hint) hint.style.display = "block";

  // очищаем контент (посты)
  postsContainer.innerHTML = "";
});

/* Проверка на наличие картинки лого */
const logoImg = document.getElementById("logo");
if (logoImg) {
  logoImg.onerror = () => {
    logoImg.style.display = "none";
    const logoText = document.getElementById("logo-text");
    if (logoText) logoText.style.display = "inline-block";
  };
}
