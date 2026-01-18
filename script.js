/* =========================
   DOM
========================= */
const modal = document.getElementById("post-modal");
const postBar = document.getElementById("post-bar");
const closeModal = document.getElementById("close-modal");
const submitPost = document.getElementById("submit-post");
const postsContainer = document.getElementById("posts-container");
const currentSection = document.querySelector(".current-section");

/* =========================
   МОДАЛКА
========================= */
postBar.addEventListener("click", () => modal.classList.add("active"));
closeModal.addEventListener("click", () => modal.classList.remove("active"));

/* =========================
   Локальное хранилище
========================= */
const STORAGE_KEY = "ferniex-posts";
let postsData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

/* =========================
   ДОБАВЛЕНИЕ ПОСТА
========================= */
submitPost.addEventListener("click", () => {
  const author = document.getElementById("post-author").value.trim() || "Аноним";
  const category = document.getElementById("post-category").value;
  const text = document.getElementById("post-text").value.trim();
  const photo = document.getElementById("post-photo").value.trim();

  if (!text) {
    alert("Текст пустой!");
    return;
  }

  const post = {
    author,
    category,
    text,
    photo: photo || null,
    date: new Date().toLocaleString()
  };

  postsData.unshift(post);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(postsData));

  modal.classList.remove("active");
  document.getElementById("post-author").value = "";
  document.getElementById("post-text").value = "";
  document.getElementById("post-photo").value = "";

  loadPosts(category);
});

/* =========================
   ЗАГРУЗКА ПОСТОВ
========================= */
function loadPosts(category) {
  postsContainer.innerHTML = "";

  const filtered = postsData.filter(p => p.category === category);

  if (!filtered.length) {
    postsContainer.innerHTML = "<p class='hint'>Пока нет постов</p>";
    return;
  }

  filtered.forEach(post => {
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
}

/* =========================
   НАВИГАЦИЯ ПО РАЗДЕЛАМ
========================= */
document.querySelectorAll(".side-item").forEach(item => {
  item.addEventListener("click", () => {
    const section = item.dataset.section;
    currentSection.textContent = section;
    loadPosts(section);
  });
});
