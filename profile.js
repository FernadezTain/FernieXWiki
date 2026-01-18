// Получаем ник пользователя из URL
const url = window.location.href;
const nickMatch = url.match(/profile_(.+)$/);
const nick = nickMatch ? nickMatch[1] : "Unknown";

document.getElementById("profile-name").textContent = nick;
document.getElementById("profile-nick").textContent = nick;
