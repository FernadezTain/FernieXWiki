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

            const textEl = document.createElement("div");
            textEl.className = "review-text";
            textEl.textContent = review.text;

            card.appendChild(nickEl);
            card.appendChild(textEl);
            reviewsContainer.appendChild(card);
        });
    });

document.addEventListener("click", () => {
    profileCard.style.display = "none";
});
