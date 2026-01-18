const avatars = document.querySelectorAll('.avatar');
let angle = 0; // общий угол вращения

function rotateAvatars() {
  const step = 360 / avatars.length;
  avatars.forEach((avatar, i) => {
    const a = angle + step * i;
    const rad = a * Math.PI / 180;
    const z = Math.cos(rad) * 200; // координата Z для эффекта глубины
    const x = Math.sin(rad) * 200;

    avatar.style.transform = `translateX(${x}px) translateZ(${z}px)`;

    // Эффект размытия, если аватарка позади
    const behind = Math.cos(rad) < 0;
    avatar.style.filter = behind ? 'blur(4px) brightness(0.6)' : 'blur(0px) brightness(1)';
    avatar.style.zIndex = behind ? 1 : 10;
  });

  angle += 0.2; // скорость вращения
  requestAnimationFrame(rotateAvatars);
}

rotateAvatars();

// --- Клик на FernieX в верхней панели ---
document.getElementById('logo-link').addEventListener('click', () => {
  window.location.href = "index.html"; // перейти на главную
});

const links = document.querySelectorAll(".nav-link");
const indicator = document.querySelector(".nav-indicator");

function moveIndicator(el) {
  const rect = el.getBoundingClientRect();
  const parentRect = el.parentElement.getBoundingClientRect();
  indicator.style.width = rect.width + "px";
  indicator.style.left = (rect.left - parentRect.left) + "px";
}

links.forEach(link => {
  link.addEventListener("click", () => moveIndicator(link));
});

// Инициализация
window.addEventListener("load", () => moveIndicator(links[1])); // team.html => Команда активна
window.addEventListener("resize", () => moveIndicator(links[1]));
