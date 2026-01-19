const avatars = document.querySelectorAll('.avatar');
const center = document.querySelector('.center-object');

let angle = 0;
let activeAvatar = null;
let profiles = {};

// ---------- загрузка профилей ----------
fetch('profiles.json')
  .then(r => r.json())
  .then(d => profiles = d);

// ---------- вращение ----------
function rotateAvatars() {
  avatars.forEach((avatar, i) => {
    if (avatar === activeAvatar) return;

    const step = 360 / avatars.length;
    const a = angle + step * i;
    const rad = a * Math.PI / 180;

    const radiusX = 220;
    const radiusY = 90;

    const x = Math.cos(rad) * radiusX;
    const y = Math.sin(rad) * radiusY;
    const z = Math.sin(rad) * 200;

    avatar.style.transform = `
      translate3d(${x}px, ${y}px, ${z}px)
      scale(${z > 0 ? 1 : 0.85})
    `;

    avatar.style.zIndex = z > 0 ? 30 : 5;
    avatar.style.filter = z > 0
      ? 'none'
      : 'blur(3px) brightness(0.6)';
  });

  angle += 0.3;
  requestAnimationFrame(rotateAvatars);
}

rotateAvatars();

// ---------- клик по аватарке ----------
avatars.forEach(avatar => {
  avatar.addEventListener('click', e => {
    e.stopPropagation();
    if (activeAvatar) return;

    activeAvatar = avatar;

    avatar.style.transform =
      'translate3d(0px, 0px, 320px) scale(1.35)';
    avatar.style.zIndex = 100;
    avatar.style.filter = 'none';

    showProfile(avatar);
  });
});

// ---------- закрытие ----------
document.addEventListener('click', () => {
  if (!activeAvatar) return;

  const panel = document.querySelector('.profile-panel');
  if (panel) panel.remove();

  activeAvatar = null;
});

// ---------- профиль ----------
function showProfile(avatar) {
  const img = avatar.querySelector('img');
  const src = img.getAttribute('src');

  const nick = Object.keys(profiles)
    .find(k => profiles[k].Avatar === src);

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
