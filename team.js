// ---------- Полный рабочий скрипт (заменить текущий) ----------
document.addEventListener('DOMContentLoaded', () => {
  const avatars = document.querySelectorAll('.avatar');
  const center = document.querySelector('.center-object');
  let angle = 0;
  let activeAvatar = null;
  let profiles = {};
  let isAnimatingEntry = true;

  // Промис загрузки JSON (чтобы можно было await)
  let profilesPromise = fetch('profiles.json')
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      profiles = data || {};
      console.log('Profiles loaded:', profiles);
      return profiles;
    })
    .catch(err => {
      console.error('Ошибка загрузки profiles.json', err);
      profiles = {};
      return profiles;
    });

  // Утилиты
  function getFilenameFromSrc(src) {
    if (!src) return '';
    // убираем параметры, decodе, возвращаем имя файла в нижнем регистре
    try {
      const noQuery = src.split('?')[0];
      const parts = noQuery.split('/');
      return decodeURIComponent(parts[parts.length - 1]).toLowerCase();
    } catch {
      return src.toLowerCase();
    }
  }

  // ---------- Анимация входа при загрузке ----------
  function animateAvatarsOnLoad() {
    isAnimatingEntry = true;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    avatars.forEach((avatar, i) => {
      const step = (Math.PI * 2) / avatars.length;
      const a = angle + step * i;

      // финальная позиция на орбите
      const targetX = Math.cos(a) * 220;
      const targetY = Math.sin(a) * 90;
      const targetZ = Math.sin(a) * 200;

      // случайная сторона экрана
      const side = Math.floor(Math.random() * 4);
      let startX = 0, startY = 0;

      switch (side) {
        case 0: startX = (Math.random() - 0.5) * vw; startY = -vh; break;
        case 1: startX = vw; startY = (Math.random() - 0.5) * vh; break;
        case 2: startX = (Math.random() - 0.5) * vw; startY = vh; break;
        case 3: startX = -vw; startY = (Math.random() - 0.5) * vh; break;
      }

      // Устанавливаем начальную позицию без дерганий
      avatar.style.transform = `translate3d(${startX}px, ${startY}px, -400px) scale(0.2)`;
      avatar.style.opacity = '0';
      avatar.style.transition = `transform 2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1.6s ease`;

      // Небольшая задержка для естественного эффекта
      setTimeout(() => {
        avatar.style.opacity = '1';
        avatar.style.transform = `translate3d(${targetX}px, ${targetY}px, ${targetZ}px) scale(1)`;
      }, i * 80); // можно уменьшить/увеличить
    });

    // После анимации убрать transition, чтобы вращение не конфликтовало
    setTimeout(() => {
      avatars.forEach(a => a.style.transition = 'none');
      isAnimatingEntry = false;
    }, 2200);
  }

  // Запускаем вход
  animateAvatarsOnLoad();

  // ---------- Вращение аватаров ----------
  function rotateAvatars() {
    avatars.forEach((avatar, i) => {
      const step = (Math.PI * 2) / avatars.length;
      const a = angle + step * i;

      const x = Math.cos(a) * 220;
      const y = Math.sin(a) * 90;
      const z = Math.sin(a) * 200;

      const depth = (z + 200) / 400;
      const scale = 0.8 + depth * 0.4;
      const blur = (1 - depth) * 4;
      const brightness = 0.6 + depth * 0.4;

      // IMPORTANT: не трогаем transition здесь — только transform
      avatar.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
      avatar.style.filter = `blur(${blur}px) brightness(${brightness})`;
      avatar.style.zIndex = Math.round(depth * 50);
    });

    if (!isAnimatingEntry) angle += 0.01;
    requestAnimationFrame(rotateAvatars);
  }
  rotateAvatars();

  // ---------- Показ панели профиля (полностью переработан) ----------
  // showProfile — асинхронная: дождётся загрузки profiles.json
  async function showProfile(avatar) {
    // ждём загрузки профилей (если ещё грузятся)
    await profilesPromise;

    // Если профили не загрузились — показываем сообщение об ошибке
    if (!profiles || !Object.keys(profiles).length) {
      showSimplePanel('Ошибка', 'Профили не загружены. Проверьте profiles.json в консоли.');
      return;
    }

    // получаем src и имя файла
    const img = avatar.querySelector('img');
    const src = img ? (img.getAttribute('src') || img.src || '') : '';
    const filename = getFilenameFromSrc(src);

    // Находим ник по имени файла (чувствительность к регистру убрана)
    const nick = Object.keys(profiles).find(k => {
      const avatarName = (profiles[k].Avatar || '').toString().toLowerCase();
      return avatarName && (avatarName === filename || filename.includes(avatarName));
    });

    if (!nick) {
      // Если не найден — покажем панель с отладочной информацией
      showSimplePanel('Профиль не найден', `Не найден профиль для файла: <b>${filename}</b>`);
      return;
    }

    const data = profiles[nick];

    // Удаляем старую панель, если есть
    const oldPanel = document.querySelector('.profile-panel');
    if (oldPanel) oldPanel.remove();

    // Создаём панель (фиксированная справа-сверху)
    const panel = document.createElement('div');
    panel.className = 'profile-panel';
    panel.style.position = 'fixed';
    panel.style.top = '20px';
    panel.style.right = '20px';
    panel.style.zIndex = '10000';
    panel.addEventListener('click', e => e.stopPropagation());

    // Собираем ссылки соцсетей (если есть)
    const links = [];
    if (data.Telegram && data.Telegram !== 'none') links.push(`<a href="${data.Telegram}" target="_blank" rel="noopener">Telegram</a>`);
    if (data.Discord && data.Discord !== 'none') links.push(`<a href="${data.Discord}" target="_blank" rel="noopener">Discord</a>`);
    if (data.VK && data.VK !== 'none') links.push(`<a href="${data.VK}" target="_blank" rel="noopener">VK</a>`);
    if (data.Odnoklasniki && data.Odnoklasniki !== 'none') links.push(`<a href="${data.Odnoklasniki}" target="_blank" rel="noopener">OK</a>`);

    // Вставляем HTML — можно расширить (аватар в панели, доп. поля и т.д.)
    panel.innerHTML = `
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <div style="width:68px;height:68px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#111;border:1px solid rgba(255,255,255,0.03)">
          <img src="${src}" alt="${nick}" style="width:100%;height:100%;object-fit:cover;display:block">
        </div>
        <div style="min-width:0">
          <h3 style="margin:0 0 6px 0;color:#a14fff;font-size:1.1rem">${nick}</h3>
          <p style="margin:0 0 10px 0;color:#aaa;font-size:0.95rem;line-height:1.3">${data.About || ''}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${links.join('')}</div>
          <div style="display:flex;gap:8px">
            <button class="open-profile-btn" style="flex:1;padding:8px 10px;border-radius:20px;border:none;background:linear-gradient(135deg,#7b3cff,#a14fff);color:#fff;cursor:pointer">
              Открыть профиль
            </button>
            <button class="close-panel-btn" style="padding:8px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:#fff;cursor:pointer">
              ✕
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // кнопки внутри панели
    panel.querySelector('.open-profile-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(`profile.html?nick=${encodeURIComponent(nick)}`, '_blank');
    });
    panel.querySelector('.close-panel-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      panel.style.opacity = '0';
      setTimeout(() => panel.remove(), 200);
      if (activeAvatar) {
        activeAvatar.classList.remove('active-glow');
        activeAvatar = null;
      }
    });

    // Плавное появление
    panel.style.opacity = '0';
    panel.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    // лёгкий подъём при появлении
    panel.style.transform = 'translateY(-6px)';
    requestAnimationFrame(() => {
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    });
  }

  // Вспомогательная простая панель с сообщением (ошибка/отладка)
  function showSimplePanel(title, htmlMessage) {
    const old = document.querySelector('.profile-panel');
    if (old) old.remove();
    const p = document.createElement('div');
    p.className = 'profile-panel';
    p.style.position = 'fixed';
    p.style.top = '20px';
    p.style.right = '20px';
    p.style.zIndex = '10000';
    p.addEventListener('click', e => e.stopPropagation());
    p.innerHTML = `
      <h3 style="color:#a14fff;margin:0 0 8px 0">${title}</h3>
      <div style="color:#aaa;font-size:0.95rem">${htmlMessage}</div>
      <div style="margin-top:10px"><button style="padding:8px 10px;border-radius:18px;border:none;background:#7b3cff;color:#fff;cursor:pointer">OK</button></div>
    `;
    document.body.appendChild(p);
    p.querySelector('button').addEventListener('click', () => {
      p.style.opacity = '0';
      setTimeout(() => p.remove(), 200);
    });
    p.style.opacity = '0';
    p.style.transition = 'opacity 0.2s ease';
    requestAnimationFrame(() => p.style.opacity = '1');
  }

  // ---------- Клик по аватарке ----------
  avatars.forEach(avatar => {
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      // снимаем старую подсветку
      if (activeAvatar && activeAvatar !== avatar) {
        activeAvatar.classList.remove('active-glow');
        const oldPanel = document.querySelector('.profile-panel');
        if (oldPanel) {
          oldPanel.style.opacity = '0';
          setTimeout(() => oldPanel.remove(), 200);
        }
      }
      activeAvatar = avatar;
      avatar.classList.add('active-glow');
      // запускаем асинхронный показ профиля
      showProfile(avatar);
    });
  });

  // ---------- Закрытие панели при клике вне ----------
  document.addEventListener('click', () => {
    const panel = document.querySelector('.profile-panel');
    if (panel) {
      panel.style.opacity = '0';
      setTimeout(() => panel.remove(), 200);
    }
    if (activeAvatar) {
      activeAvatar.classList.remove('active-glow');
      activeAvatar = null;
    }
  });

}); // end DOMContentLoaded
