const reviewsContainer = document.getElementById("reviews");
const profileCard = document.getElementById("profileCard");
const profileNick = document.getElementById("profileNick");
const profileTelegram = document.getElementById("profileTelegram");

// =========================
// Загрузка отзывов
// =========================
fetch("rewieves.json")
  .then(res => res.json())
  .then(data => {
    Object.keys(data).forEach((nick, index) => {
      const review = data[nick];

      const card = document.createElement("div");
      card.className = "review-card";
      card.style.animationDelay = `${index * 0.08}s`;
      card.style.transition = "transform 0.25s ease, box-shadow 0.25s ease"; // tilt плавный

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

      const dateEl = document.createElement("div");
      dateEl.className = "review-date";
      dateEl.textContent = review.date;

      const textEl = document.createElement("div");
      textEl.className = "review-text";
      textEl.textContent = review.text;

      card.append(nickEl, dateEl, textEl);
      reviewsContainer.appendChild(card);

// ======================
// 3D Perspective Tilt
// ======================
card.style.transformStyle = "preserve-3d";
card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";

card.addEventListener("mousemove", e => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Максимальный угол наклона
  const maxTilt = 12; // градусов

  const rotateY = ((x - centerX) / centerX) * maxTilt;
  const rotateX = -((y - centerY) / centerY) * maxTilt;

  // применяем perspective для реального 3D эффекта
  card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  
  // динамическая тень (чуть реалистичнее)
  const shadowX = -rotateY * 2;
  const shadowY = rotateX * 2;
  card.style.boxShadow = `${shadowX}px ${shadowY}px 35px rgba(138,43,226,0.35)`;
});

card.addEventListener("mouseleave", () => {
  card.style.transform = `perspective(600px) rotateX(0deg) rotateY(0deg)`;
  card.style.boxShadow = "0 0 15px rgba(0,234,255,0.15)";
});


// =========================
// Закрытие профиля
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
