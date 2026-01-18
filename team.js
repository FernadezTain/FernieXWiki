const avatars = document.querySelectorAll('.avatar');
let angle = 0; // общий угол вращения
const radius = 200; // радиус вращения

function rotateAvatars() {
  const step = 360 / avatars.length;

  avatars.forEach((avatar, i) => {
    const a = angle + step * i;
    const rad = a * Math.PI / 180;
    const z = Math.cos(rad) * radius;
    const x = Math.sin(rad) * radius;

    // Позиционирование
    avatar.style.transform = `translateX(${x}px) translateZ(${z}px)`;

    // Эффект размытия и z-index
    if (z >= 0) {
      // Перед центром (над кругом)
      avatar.style.filter = 'none';
      avatar.style.zIndex = 20 + i; // объекты сверху
    } else {
      // За кругом
      avatar.style.filter = 'blur(4px) brightness(0.6)';
      avatar.style.zIndex = 1; // объекты позади
    }
  });

  angle += 0.2; // скорость вращения
  requestAnimationFrame(rotateAvatars);
}

rotateAvatars();

// --- Клик на FernieX в верхней панели ---
const logoLink = document.getElementById('logo-link');
const teamLink = document.querySelector('.team-link');

logoLink.addEventListener('click', () => {
  window.location.href = "index.html"; // перейти на главную
});

// --- Установка цветов верхней панели ---
function updateTopBarColors() {
  logoLink.style.color = '#00eaff'; // синий
  teamLink.style.color = '#a14fff'; // фиолетовый (активная)
}

updateTopBarColors();
