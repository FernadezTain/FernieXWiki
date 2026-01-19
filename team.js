const avatars = document.querySelectorAll('.avatar');
const center = document.querySelector('.center-object');
let angle = 0;
let activeAvatar = null;
let profiles = {};
let isAnimating = false;

// ---------- загрузка профилей ----------
fetch('profiles.json')
  .then(r => r.json())
  .then(d => profiles = d);

// ---------- вращение ----------
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
    if (isAnimating) return;
    
    // Если клик на уже активную аватарку
    if (activeAvatar === avatar) return;
    
    isAnimating = true;
    
    // Если есть активная аватарка, её убираем
    if (activeAvatar) {
      removeActiveAvatar(activeAvatar, () => {
        activateAvatar(avatar);
      });
    } else {
      activateAvatar(avatar);
    }
  });
});

function activateAvatar(avatar) {
  activeAvatar = avatar;
  
  const rect = avatar.getBoundingClientRect();
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  const offsetX = centerX - (rect.left + rect.width / 2);
  const offsetY = centerY - (rect.top + rect.height / 2);
  
  avatar.style.transition = 'transform 0.6s ease-out';
  avatar.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 320px) scale(1.4)`;
  avatar.style.zIndex = 100;
  avatar.style.filter = 'none';
  
  // Показываем профиль с задержкой
  setTimeout(() => {
    showProfile(avatar);
    isAnimating = false;
  }, 300);
}

function removeActiveAvatar(avatar, callback) {
  // Скрываем панель
  const oldPanel = document.querySelector('.profile-panel');
  if (oldPanel) {
    oldPanel.style.opacity = '0';
    oldPanel.style.transform = 'translateX(40px)';
  }
  
  // Убираем аватарку
  avatar.style.transition = 'transform 0.4s ease-in';
  avatar.style.transform = 'translate3d(0, 0, -400px) scale(0.5)';
  
  setTimeout(() => {
    if (oldPanel) oldPanel.remove();
    avatar.style.transform = '';
    avatar.style.filter = '';
    avatar.style.zIndex = '';
    activeAvatar = null;
    callback();
  }, 400);
}

// ---------- закрытие по клику на пустое место ----------
document.addEventListener('click', () => {
  if (!activeAvatar) return;
  if (isAnimating) return;
  
  isAnimating = true;
  
  const panel = document.querySelector('.profile-panel');
  if (panel) {
    panel.style.opacity = '0';
    panel.style.transform = 'translateX(40px)';
  }
  
  activeAvatar.style.transition = 'transform 0.4s ease-in';
  activeAvatar.style.transform = 'translate3d(0, 0, -400px) scale(0.5)';
  
  setTimeout(() => {
    if (panel) panel.remove();
    activeAvatar.style.transform = '';
    activeAvatar.style.filter = '';
    activeAvatar.style.zIndex = '';
    activeAvatar = null;
    isAnimating = false;
  }, 400);
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
  
  panel.style.opacity = '0';
  panel.style.transform = 'translateX(40px)';
  document.body.appendChild(panel);
  
  // Триггерим анимацию появления
  setTimeout(() => {
    panel.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    panel.style.opacity = '1';
    panel.style.transform = 'translateX(0)';
  }, 10);
}
