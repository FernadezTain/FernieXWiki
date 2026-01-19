const avatars = document.querySelectorAll('.avatar');
const center = document.querySelector('.center-object');
let angle = 0;
let activeAvatar = null;
let profiles = {};

// ---------- вращение аватарок ----------
function rotateAvatars() {
  avatars.forEach((avatar, i) => {
    if (avatar === activeAvatar) return;
    
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

    // Позиция аватарки на экране
    const avatarRect = avatar.getBoundingClientRect();
    const avatarCenterX = avatarRect.left + avatarRect.width / 2;
    const avatarCenterY = avatarRect.top + avatarRect.height / 2;

    // Целевая позиция (правый верхний угол, слева от блока информации)
    const targetX = window.innerWidth - 200;
    const targetY = 120;

    // Смещение от текущей позиции до целевой
    const offsetX = targetX - avatarCenterX;
    const offsetY = targetY - avatarCenterY;

    // Применяем анимацию
    avatar.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
    avatar.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 320px) scale(1)`;
    avatar.style.zIndex = 150;
    avatar.style.filter = 'none';
    avatar.style.position = 'fixed';

    // Показываем профиль после начала анимации
    setTimeout(() => showProfile(avatar), 100);
  });
});

// ---------- закрытие ----------
document.addEventListener('click', () => {
  if (!activeAvatar) return;
  
  const panel = document.querySelector('.profile-panel');
  if (panel) {
    panel.style.opacity = '0';
    setTimeout(() => panel.remove(), 300);
  }

  // Возвращаем аватарку в исходное состояние
  activeAvatar.style.transition = 'transform 0.6s ease-out';
  activeAvatar.style.transform = '';
  activeAvatar.style.filter = '';
  activeAvatar.style.zIndex = '';
  activeAvatar.style.position = '';
  activeAvatar = null;
});

// ---------- показ профиля ----------
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
    <div class="profile-content">
      <h3>${nick}</h3>
      <p>${data.About}</p>
      <button onclick="window.open('profile.html?nick=${nick}','_blank')">
        Открыть профиль
      </button>
    </div>
  `;
  
  panel.style.opacity = '0';
  document.body.appendChild(panel);
  
  // Анимируем появление панели
  setTimeout(() => {
    panel.style.opacity = '1';
  }, 50);
}
