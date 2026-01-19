const avatars = document.querySelectorAll('.avatar');
const center = document.querySelector('.center-object');

let angle = 0;
let activeAvatar = null;
let profiles = {};
let paused = false;

// ---------- Загрузка профилей ----------
fetch('profiles.json')
  .then(res => res.json())
  .then(data => profiles = data);

// ---------- Вращение ----------
function rotateAvatars() {
  if (!paused) {
    avatars.forEach((avatar, i) => {
      if (avatar === activeAvatar) return;

      const step = 360 / avatars.length;
      const a = angle + step * i;
      const rad = a * Math.PI / 180;

      const radiusX = 220;
      const radiusY = 80;

      const x = Math.cos(rad) * radiusX;
      const y = Math.sin(rad) * radiusY;
      const z = Math.sin(rad) * 200;

      avatar.dataset.x = x;
      avatar.dataset.y = y;
      avatar.dataset.z = z;

      avatar.style.transform = `
        translate3d(${x}px, ${y}px, ${z}px)
        scale(${z > 0 ? 1 : 0.85})
      `;

      avatar.style.zIndex = z > 0 ? 20 : 5;
      avatar.style.filter = z > 0
        ? 'none'
        : 'blur(3px) brightness(0.6)';
    });

    angle += 0.25;
  }

  requestAnimationFrame(rotateAvatars);
}

rotateAvatars();

// ---------- Клик по аватарке ----------
avatars.forEach(avatar => {
  avatar.addEventListener('click', e => {
    e.stopPropagation();
    activateAvatar(avatar);
  });
});

function activateAvatar(avatar) {
  if (activeAvatar) return;

  paused = true;
  activeAvatar = avatar;

  avatar.classList.add('active');
  avatar.style.transform = `
    translate(-50%, -50%) translateZ(300px) scale(1.3)
  `;
  avatar.style.top = '50%';
  avatar.style.left = '50%';
  avatar.style.filter = 'none';
  avatar.style.zIndex = 100;

  showProfile(avatar.getAttribute('src'));
}

// ---------- Закрытие по клику вне ----------
document.addEventListener('click', () => {
  if (!activeAvatar) return;

  activeAvatar.classList.remove('active');
  paused = false;

  const panel = document.querySelector('.profile-panel');
  if (panel) panel.remove();

  activeAvatar = null;
});

// ---------- Профиль ----------
function showProfile(avatarSrc) {
  const nick = Object.keys(profiles).find(
    key => profiles[key].Avatar === avatarSrc
  );
  if (!nick) return;

  const data = profiles[nick];

  const panel = document.createElement('div');
  panel.className = 'profile-panel';
  panel.addEventListener('click', e => e.stopPropagation());

  panel.innerHTML = `
    <h3>${nick}</h3>
    <p>${data.About}</p>
    <button onclick="window.open('profile.html?nick=${nick}','_blank')">
      Открыть профиль
    </button>
  `;

  document.body.appendChild(panel);
}
