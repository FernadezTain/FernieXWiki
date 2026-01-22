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
    });
  });

// =========================
// Закрытие профиля
// =========================
document.addEventListener("click", () => {
  profileCard.classList.remove("show");
  setTimeout(() => profileCard.style.display = "none", 200);
});

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
// Переходы между страницами с затемнением
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
