const reviewsContainer = document.getElementById("reviews");
const profileCard = document.getElementById("profileCard");
const profileNick = document.getElementById("profileNick");
const profileTelegram = document.getElementById("profileTelegram");

fetch("rewieves.json")
    .then(res => res.json())
    .then(data => {
        Object.keys(data).forEach(nick => {
            const review = data[nick];

            const card = document.createElement("div");
            card.className = "review-card";

            // ник
            const nickEl = document.createElement("div");
            nickEl.className = "review-nick";
            nickEl.textContent = nick;

            nickEl.addEventListener("click", (e) => {
                e.stopPropagation();

                profileNick.textContent = nick;
                profileTelegram.href = review.Telegram;
                profileTelegram.textContent = "[Telegram]";

                profileCard.style.left = e.pageX + "px";
                profileCard.style.top = e.pageY + "px";
                profileCard.style.display = "flex";
            });

            // дата
            const dateEl = document.createElement("div");
            dateEl.className = "review-date";
            dateEl.textContent = review.date;

            // текст
            const textEl = document.createElement("div");
            textEl.className = "review-text";
            textEl.textContent = review.text;

            card.appendChild(nickEl);
            card.appendChild(dateEl);
            card.appendChild(textEl);

            reviewsContainer.appendChild(card);
        });
    })
    .catch(err => {
        console.error("Ошибка загрузки отзывов:", err);
    });

// скрытие профиля при клике вне
document.addEventListener("click", () => {
    profileCard.style.display = "none";
});
