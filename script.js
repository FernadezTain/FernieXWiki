/* ============================= */
/* 🔹 БАННЕР "Сайт в разработке" */
const banner = document.getElementById('dev-banner');
const closeBtn = document.getElementById('close-banner');
closeBtn.addEventListener('click', () => {
  banner.classList.add('hide');
  setTimeout(() => banner.remove(), 500);
});

/* ============================= */
/* 🔹 НАВИГАЦИЯ ПО РАЗДЕЛАМ */
const sideItems = document.querySelectorAll('.side-item');
const mainContent = document.getElementById('main-content');
const topBar = document.querySelector('.top-bar');
const currentSection = document.querySelector('.current-section');

sideItems.forEach(item => {
  item.addEventListener('click', () => {
    const section = item.dataset.section;

    topBar.classList.add('active');
    currentSection.textContent = section;

    mainContent.style.opacity = 0;
    setTimeout(() => {
      mainContent.innerHTML = `<div id="section-content"></div>`;
      mainContent.style.opacity = 1;
    }, 300);
  });
});

/* ============================= */
/* 🔹 МОДАЛЬНОЕ ОКНО ПУБЛИКАЦИИ ПОСТОВ */
const postBar = document.getElementById('post-bar');
const modal = document.getElementById('post-modal');
const closeModal = document.getElementById('close-modal');
const submitPost = document.getElementById('submit-post');
const postsContainer = document.getElementById('posts-container');

const ADMIN_PASSWORD = "12345";

postBar.addEventListener('click', () => modal.classList.add('active'));
closeModal.addEventListener('click', () => modal.classList.remove('active'));

submitPost.addEventListener('click', () => {
  const password = document.getElementById('post-password').value;
  if(password !== ADMIN_PASSWORD){
    alert("Неверный пароль!");
    return;
  }

  const category = document.getElementById('post-category').value;
  const photo = document.getElementById('post-photo').value;
  const text = document.getElementById('post-text').value;

  if(!text.trim()) { alert("Введите текст поста!"); return; }

  const postDiv = document.createElement('div');
  postDiv.classList.add('post');
  postDiv.innerHTML = `
    <strong>Категория: ${category}</strong><br>
    ${photo ? `<img src="${photo}" alt="Фото">` : ''}
    <div class="post-text collapsed">${text}</div>
  `;

  const postText = postDiv.querySelector('.post-text');
  postText.addEventListener('click', () => postText.classList.toggle('collapsed'));

  postsContainer.prepend(postDiv);
  modal.classList.remove('active');

  document.getElementById('post-password').value = '';
  document.getElementById('post-photo').value = '';
  document.getElementById('post-text').value = '';
});
