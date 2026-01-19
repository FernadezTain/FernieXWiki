const avatars = document.querySelectorAll('.avatar');
const center = document.querySelector('.center-object');

let angle = 0;
let activeAvatar = null;
let profiles = {};

// ---------- загрузка профилей ----------
function rotateAvatars() {
  avatars.forEach((avatar, i) => {
    if (avatar === activeAvatar) return; // ← Это уже есть, но проверьте!
    
    const step = (Math.PI * 2) / avatars.length;
    const a = angle + step * i;
    const x = Math.cos(a) * 220;
    const y = Math.sin(a) * 90;
    const z = Math.sin(a) * 200;
    const depth = (z + 200) / 400;
    const scale = 0.8 + depth * 0.4;
    const blur = (1 - depth) * 4;
    const brightness = 0.6 + depth * 0.4;
    
    avatar.style.transform = `
      translate3d(${x}px, ${y}px, ${z}px)
      scale(${scale})
    `;
    avatar.style.filter = `blur(${blur}px) brightness(${brightness})`;
    avatar.style.zIndex = Math.round(depth * 50);
  });
  angle += 0.01;
  requestAnimationFrame(rotateAvatars);
}


rotateAvatars();

// ---------- клик по аватарке ----------
avatars.forEach(avatar => {
  avatar.addEventListener('click', e => {
    e.stopPropagation();
    if (activeAvatar) return;
    activeAvatar = avatar;
    
    // Получаем текущую позицию элемента
    const rect = avatar.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Вычисляем смещение
    const offsetX = centerX - (rect.left + rect.width / 2);
    const offsetY = centerY - (rect.top + rect.height / 2);
    
    // ВАЖНО: очищаем старый transform и применяем новый
    avatar.style.transform = 
      `translate3d(${offsetX}px, ${offsetY}px, 320px) scale(1.4)`;
    avatar.style.zIndex = 100;
    avatar.style.filter = 'none';
    avatar.style.transition = 'transform 0.6s ease-out'; // плавная анимация
    
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
