// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBc6Bf4oHrTyWsQp9CrrRPNyGSqm4w8J_M",
  authDomain: "ferniexwiki.firebaseapp.com",
  projectId: "ferniexwiki",
  storageBucket: "ferniexwiki.firebasestorage.app",
  messagingSenderId: "451396973595",
  appId: "1:451396973595:web:f31a19ade2b8b6c5f374be"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== НАСТРОЙКИ =====
const ADMIN_PASSWORD = "12345";

// ===== ЭЛЕМЕНТЫ =====
const modal = document.getElementById("post-modal");
const postBar = document.getElementById("post-bar");
const closeModal = document.getElementById("close-modal");
const submitPost = document.getElementById("submit-post");
const postsContainer = document.getElementById("posts-container");
const currentSection = document.querySelector(".current-section");

// ===== МОДАЛКА =====
postBar.onclick = () => modal.classList.add("active");
closeModal.onclick = () => modal.classList.remove("active");

// ===== ДОБАВЛЕНИЕ ПОСТА =====
submitPost.onclick = async () => {
  const password = document.getElementById("post-password").value;
  if (password !== ADMIN_PASSWORD) {
    alert("Неверный пароль");
    return;
  }

  const category = document.getElementById("post-category").value;
  const text = document.getElementById("post-text").value.trim();
  const photo = document.getElementById("post-photo").value.trim();

  if (!text) {
    alert("Пустой текст");
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
};

// ===== ЗАГРУЗКА ПОСТОВ =====
async function loadPosts(category) {
  postsContainer.innerHTML = "";

  const q = query(
    collection(db, "posts"),
    where("category", "==", category),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const post = doc.data();

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      ${post.photo ? `<img src="${post.photo}">` : ""}
      <div class="post-text collapsed">${post.text}</div>
    `;

    div.querySelector(".post-text").onclick = e => {
      e.target.classList.toggle("collapsed");
    };

    postsContainer.appendChild(div);
  });
}

// ===== НАВИГАЦИЯ =====
document.querySelectorAll(".side-item").forEach(item => {
  item.onclick = () => {
    const section = item.dataset.section;
    currentSection.textContent = section;
    loadPosts(section);
  };
});
