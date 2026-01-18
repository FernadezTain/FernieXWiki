import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   НАСТРОЙКИ
========================= */
const ADMIN_PASSWORD = "12345"; // временно, потом закроем

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
postBar.addEventListener("click", () => {
  modal.classList.add("active");
});

closeModal.addEventListener("click", () => {
  modal.classList.remove("active");
});

/* =========================
   ДОБАВЛЕНИЕ ПОСТА
========================= */
submitPost.addEventListener("click", async () => {
  // Получаем значения из формы
  const password = document.getElementById("post-password").value;
  const category = document.getElementById("post-category").value;
  const text = document.getElementById("post-text").value.trim();
  const photo = document.getElementById("post-photo").value.trim();

  // Проверка пароля
  if (password !== ADMIN_PASSWORD) {
    alert("Неверный пароль");
    return;
  }

  // Проверка текста
  if (!text) {
    alert("Текст пустой");
    return;
  }

  try {
    // Сохраняем пост в Firestore
    await addDoc(collection(db, "posts"), {
      category,
      text,
      photo: photo || null,
      createdAt: serverTimestamp()
    });

    // Закрываем модальное окно
    modal.classList.remove("active");

    // Сбрасываем поля формы
    document.getElementById("post-password").value = "";
    document.getElementById("post-text").value = "";
    document.getElementById("post-photo").value = "";

    // Переключаем текущий раздел на категорию поста
    currentSection.textContent = category;

    // Загружаем посты для выбранной категории
    await loadPosts(category);
  } catch (e) {
    alert("Ошибка публикации");
    console.error(e);
  }
});


/* =========================
   ЗАГРУЗКА ПОСТОВ
========================= */
async function loadPosts(category) {
  postsContainer.innerHTML = "";

  const q = query(
    collection(db, "posts"),
    where("category", "==", category),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    postsContainer.innerHTML = "<p class='hint'>Пока нет постов</p>";
    return;
  }

  snapshot.forEach(doc => {
    const post = doc.data();
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      ${post.photo ? `<img src="${post.photo}" alt="">` : ""}
      <div class="post-text collapsed">${post.text}</div>
    `;

    const textEl = div.querySelector(".post-text");
    textEl.addEventListener("click", () => {
      textEl.classList.toggle("collapsed");
    });

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
