const avatars = document.querySelectorAll('.avatar');
let angle = 0;
const radius = 200; // радиус вращения
const centerRadius = 60; // радиус круга (center-object)

function rotateAvatars() {
  const step = 360 / avatars.length;

  avatars.forEach((avatar, i) => {
    const a = angle + step * i;
    const rad = a * Math.PI / 180;

    const z = Math.cos(rad) * radius;
    const x = Math.sin(rad) * radius;

    // Позиция
    avatar.style.transform = `translateX(${x}px) translateZ(${z}px)`;

    // Центр круга
    const avatarSize = avatar.offsetWidth;
    const distFromCenter = Math.hypot(x, 0); // расстояние по X от центра

    if (z >= 0) {
      // перед кругом: полностью видно
      avatar.style.filter = 'none';
      avatar.style.zIndex = 20 + i;
      avatar.style.clipPath = 'circle(50% at 50% 50%)';
    } else {
      // задняя часть
      const overlap = Math.max(0, avatarSize/2 + centerRadius - Math.abs(x));
      if (overlap <= 0) {
        // полностью за кругом
        avatar.style.filter = 'blur(4px) brightness(0.6)';
        avatar.style.zIndex = 1;
        avatar.style.clipPath = 'circle(50% at 50% 50%)';
      } else {
        // частично за кругом
        // создаём маску: верхняя часть аватарки видима, нижняя (за кругом) размазывается
        const perc = 100 - (overlap / avatarSize) * 100;
        avatar.style.filter = `blur(4px) brightness(0.6)`;
        avatar.style.zIndex = 1;
        avatar.style.clipPath = `inset(0 0 ${perc}% 0 round 50%)`;
      }
    }
  });

  angle += 0.2;
  requestAnimationFrame(rotateAvatars);
}

rotateAvatars();

// --- Верхняя панель ---
const logoLink = document.getElementById('logo-link');
const teamLink = document.querySelector('.team-link');

logoLink.addEventListener('click', () => window.location.href = "index.html");

// Цвета
logoLink.style.color = '#00eaff'; // синий
teamLink.style.color = '#a14fff'; // фиолетовый
