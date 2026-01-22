const reviewsContainer = document.getElementById("reviews");
const profileCard = document.getElementById("profileCard");
const profileNick = document.getElementById("profileNick");
const profileTelegram = document.getElementById("profileTelegram");

// =========================
// Функция рисования звёзд
// =========================
function renderStars(rating) {
  const container = document.createElement("div");
  container.className = "review-rating";
  
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  
  // Полные звёзды
  for (let i = 0; i < fullStars; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "★";
    container.appendChild(star);
  }
  
  // Половинка звезды
  if (hasHalf) {
    const halfStar = document.createElement("span");
    halfStar.className = "star";
    halfStar.textContent = "★";
    halfStar.style.background = "linear-gradient(90deg, #ffd700 50%, transparent 50%)";
    halfStar.style.webkitBackgroundClip = "text";
    halfStar.style.webkitTextFillColor = "transparent";
    halfStar.style.backgroundClip = "text";
    container.appendChild(halfStar);
  }
  
  // Пустые звёзды
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    const star = document.createElement("span");
    star.className = "star empty";
    star.textContent = "★";
    container.appendChild(star);
  }
  
  return container;
}

// =========================
// Загрузка отзывов
// =========================
fetch("rewieves.json")
  .then(res => res.json())
  .then(data => {
    Object.keys(data).forEach((nick, index) => {
      const review = data[nick];
      
      // ---- Карточка отзыва ----
      const card = document.createElement("div");
      card.className = "review-card";
      card.style.animationDelay = `${index * 0.08}s`;
      card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
      card.style.transformStyle = "preserve-3d";
      
      // ---- Заголовок (Ник + Тип) ----
      const headerEl = document.createElement("div");
      headerEl.className = "review-header";
      
      const nickEl = document.createElement("div");
      nickEl.className = "review-nick";
      nickEl.textContent = nick;
      nickEl.addEventListener("click", e => {
        e.stopPropagation();
        profileNick.textContent = nick;
        profileTelegram.href = review.Telegram;
        profileCard.style.left = e.pageX + "px";
        profileCard.style.top = e.pageY + "px";
        profileCard.classList.add("show");
        profileCard.style.display = "flex";
      });
      
      const typeEl = document.createElement("div");
      typeEl.className = "review-type";
      typeEl.textContent = review.type;
      
      headerEl.append(nickEl, typeEl);
      
      // ---- Рейтинг (звёзды) ----
      const ratingEl = renderStars(review.rating);
      
      // ---- Дата ----
      const dateEl = document.createElement("div");
      dateEl.className = "review-date";
      dateEl.textContent = review.date;
      
      // ---- Текст ----
      const textEl = document.createElement("div");
      textEl.className = "review-text";
      textEl.textContent = review.text;
      
      card.append(nickEl, ratingEl, dateEl, textEl);
      reviewsContainer.appendChild(card);
      
      // ======================
      // 3D Perspective Tilt
      // ======================
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const maxTilt = 12;
        const rotateY = ((x - centerX) / centerX) * maxTilt;
        const rotateX = -((y - centerY) / centerY) * maxTilt;
        card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 35px rgba(138,43,226,0.35)`;
      });
      
      card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(600px) rotateX(0deg) rotateY(0deg)`;
        card.style.boxShadow = "0 0 15px rgba(0,234,255,0.15)";
      });
    });
  })
  .catch(err => {
    console.error("Ошибка загрузки отзывов:", err);
  });

// =========================
// Закрытие профиля (глобально)
// =========================
document.addEventListener("click", () => {
  profileCard.classList.remove("show");
  setTimeout(() => profileCard.style.display = "none", 200);
});

// =========================
// Верхние menu-btn переходы
// =========================
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const link = btn.dataset.link;
    if (!link) return;
    document.body.style.opacity = "0";
    setTimeout(() => {
      window.location.href = link;
    }, 300);
  });
});

// =========================
// Переходы между page-btn с затемнением
// =========================
document.querySelectorAll(".page-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const link = btn.dataset.link;
    if (!link || btn.classList.contains("active")) return;
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = link;
    }, 350);
  });
});
