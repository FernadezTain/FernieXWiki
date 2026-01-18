// Получаем ник пользователя из URL
const params = new URLSearchParams(window.location.search);
const nick = params.get("nick");

if (!nick) {
  alert("Пользователь не найден");
} else {
  // Загружаем profiles.json
  fetch("profiles.json")
    .then(res => res.json())
    .then(data => {
      const profile = data[nick];
      if (!profile) {
        alert("Профиль не найден");
        return;
      }

      // Подставляем аватарку, ник и описание
      document.getElementById("profile-name").textContent = nick;
      document.getElementById("profile-avatar").src = profile.Avatar || "default-avatar.png";
      document.getElementById("profile-description").textContent = profile.About || "";

      // Подставляем кнопки соцсетей
      const buttonsContainer = document.querySelector(".profile-buttons");
      buttonsContainer.innerHTML = ""; // очищаем старые кнопки

      if (profile.Telegram && profile.Telegram !== "none") {
        const btn = document.createElement("a");
        btn.href = profile.Telegram;
        btn.target = "_blank";
        btn.textContent = "Перейти в Telegram";
        buttonsContainer.appendChild(btn);
      }

      if (profile.Discord && profile.Discord !== "none") {
        const btn = document.createElement("a");
        btn.href = profile.Discord;
        btn.target = "_blank";
        btn.textContent = "Перейти в Discord";
        buttonsContainer.appendChild(btn);
      }

      if (profile.VK && profile.VK !== "none") {
        const btn = document.createElement("a");
        btn.href = profile.VK;
        btn.target = "_blank";
        btn.textContent = "Перейти в VK";
        buttonsContainer.appendChild(btn);
      }

      if (profile.Odnoklasniki && profile.Odnoklasniki !== "none") {
        const btn = document.createElement("a");
        btn.href = profile.Odnoklasniki;
        btn.target = "_blank";
        btn.textContent = "Перейти в Одноклассники";
        buttonsContainer.appendChild(btn);
      }

    })
    .catch(err => {
      console.error(err);
      alert("Ошибка загрузки профиля");
    });
}
