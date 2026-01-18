import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ADMIN_PASSWORD = "12345";

const modal = document.getElementById("post-modal");
const postBar = document.getElementById("post-bar");
const closeModal = document.getElementById("close-modal");
const submitPost = document.getElementById("submit-post");
const postsContainer = document.getElementById("posts-container");
const mainContent = document.getElementById("main-content");
const currentSection = document.querySelector(".current-section");

// открыть модалку
postBar.addEventListener("click", () => {
  modal.classList.add("active");
});

closeModal.addEventListener("click", () => {
  modal.classList.remove("active");
});

// добавить пост
submitPost.addEventListener("click", async () => {
  const password = document.getElementById("post-password").value;
  if (password !== ADMIN_PASSWORD) {
    alert("Неверный пароль");
    return;
  }

  const category = document.getElementById("post-category").value;
  const text = document.getElementById("post-text").value;
  const photo = document.getElementById("post-photo").value;

  if (!text.trim()) {
    alert("Текст пустой");
    return;
  }

  await addDoc(collection(db, "posts"), {
    category,
    text,
    photo: photo || null,
    createdAt: serverTimestamp()
  });

  modal.classList.remove("active");
  document.getElementById("post-password").value = "";
  document.getElementById("post-text").value = "";
  document.getElementById("post-photo").value = "";

  loadPosts(category);
});

// загрузка постов по категории
async function loadPosts(category) {
  postsContainer.innerHTML = "";

  const q = query(
    collection(db, "posts"),
    where("category", "==", category),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const post = doc.data();
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      ${post.photo ? `<img src="${post.photo}">` : ""}
      <div class="post-text collapsed">${post.text}</div>
    `;

    const textEl = div.querySelector(".post-text");
    textEl.addEventListener("click", () => {
      textEl.classList.toggle("collapsed");
    });

    postsContainer.appendChild(div);
  });
}

// навигация по разделам
document.querySelectorAll(".side-item").forEach(item => {
  item.addEventListener("click", () => {
    const section = item.dataset.section;
    currentSection.textContent = section;
    mainContent.innerHTML = "";
    postsContainer.innerHTML = "";
    loadPosts(section);
  });
});
