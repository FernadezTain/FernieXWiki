document.addEventListener('DOMContentLoaded', () => {
  const avatars = document.querySelectorAll('.avatar');
  const center = document.querySelector('.center-object');
  let angle = 0;
  let activeAvatar = null;
  let profiles = {};
  let isAnimatingEntry = true;

  const isMobile = window.innerWidth <= 768;
  const RADIUS_X = isMobile ? 130 : 220;
  const RADIUS_Y = isMobile ? 55  : 90;
  const RADIUS_Z = isMobile ? 120 : 200;

  // ===== Загрузка JSON профилей =====
  let profilesPromise = fetch('profiles.json')
    .then(res => res.json())
    .then(data => { profiles = data || {}; return profiles; })
    .catch(err => { console.error(err); profiles = {}; return profiles; });

  function getFilenameFromSrc(src) {
    if (!src) return '';
    try { return decodeURIComponent(src.split('?')[0].split('/').pop()).toLowerCase(); }
    catch { return src.toLowerCase(); }
  }

  // ===== Анимация входа =====
  function animateAvatarsOnLoad() {
    isAnimatingEntry = true;
    const vw = window.innerWidth, vh = window.innerHeight;

    avatars.forEach((avatar, i) => {
      const step = (Math.PI * 2) / avatars.length;
      const a = angle + step * i;
      const targetX = Math.cos(a) * RADIUS_X;
      const targetY = Math.sin(a) * RADIUS_Y;
      const targetZ = Math.sin(a) * RADIUS_Z;

      let startX = 0, startY = 0;
      switch (Math.floor(Math.random()*4)) {
        case 0: startX=(Math.random()-0.5)*vw; startY=-vh; break;
        case 1: startX=vw; startY=(Math.random()-0.5)*vh; break;
        case 2: startX=(Math.random()-0.5)*vw; startY=vh; break;
        case 3: startX=-vw; startY=(Math.random()-0.5)*vh; break;
      }

      avatar.style.transform = `translate3d(${startX}px, ${startY}px, -400px) scale(0.2)`;
      avatar.style.opacity = '0';
      avatar.style.transition = `transform 2s cubic-bezier(0.34,1.56,0.64,1), opacity 1.6s ease`;

      setTimeout(() => {
        avatar.style.opacity = '1';
        avatar.style.transform = `translate3d(${targetX}px, ${targetY}px, ${targetZ}px) scale(1)`;
      }, i*80);
    });

    setTimeout(() => { avatars.forEach(a=>a.style.transition='none'); isAnimatingEntry=false; }, 2200);
  }
  animateAvatarsOnLoad();

  // ===== Вращение =====
  function rotateAvatars() {
    avatars.forEach((avatar,i)=>{
      const step=(Math.PI*2)/avatars.length;
      const a=angle+step*i;
      const x=Math.cos(a)*RADIUS_X;
      const y=Math.sin(a)*RADIUS_Y;
      const z=Math.sin(a)*RADIUS_Z;
      const depth=(z+RADIUS_Z)/(RADIUS_Z*2);
      const scale=0.8+depth*0.4;
      const blur=(1-depth)*4;
      const brightness=0.6+depth*0.4;
      avatar.style.transform=`translate3d(${x}px,${y}px,${z}px) scale(${scale})`;
      avatar.style.filter=`blur(${blur}px) brightness(${brightness})`;
      avatar.style.zIndex=Math.round(depth*50);
    });
    if(!isAnimatingEntry) angle+=0.01;
    requestAnimationFrame(rotateAvatars);
  }
  rotateAvatars();

  // ===== Профиль =====
  async function showProfile(avatar){
    await profilesPromise;
    if(!profiles || !Object.keys(profiles).length){ alert('Профили не загружены'); return; }

    const img=avatar.querySelector('img');
    const src=img ? (img.getAttribute('src')||img.src||'') : '';
    const filename=getFilenameFromSrc(src);

    const nick=Object.keys(profiles).find(k=>{
      const avatarName=(profiles[k].Avatar||'').toLowerCase();
      return avatarName && filename.includes(avatarName);
    });

    if(!nick){ alert('Профиль не найден'); return; }

    document.querySelectorAll('.profile-panel').forEach(p=>p.remove());

    const panel=document.createElement('div');
    panel.className='profile-panel';
    panel.style.top='20px'; panel.style.right='20px';
    panel.innerHTML=`
      <div style="display:flex;gap:12px">
        <div style="width:68px;height:68px;border-radius:12px;overflow:hidden">
          <img src="${src}" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div>
          <h3 style="color:#a14fff">${nick}</h3>
          <p style="color:#aaa">${profiles[nick].About||''}</p>
          <button class="open-profile-btn">Открыть профиль</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('.open-profile-btn').onclick=()=>window.open(`profile.html?nick=${encodeURIComponent(nick)}`,'_blank');
  }

  avatars.forEach(avatar=>{
    avatar.addEventListener('click', e=>{
      e.stopPropagation();
      if(activeAvatar) activeAvatar.classList.remove('active-glow');
      activeAvatar=avatar;
      avatar.classList.add('active-glow');
      showProfile(avatar);
    });
  });

  document.addEventListener('click', ()=>{
    document.querySelectorAll('.profile-panel').forEach(p=>p.remove());
    if(activeAvatar) activeAvatar.classList.remove('active-glow');
    activeAvatar=null;
  });

  // ===== Переходы между страницами с затемнением =====
function setupPageButtons(selector){
    document.querySelectorAll(selector).forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation(); // ← это главный фикс
        const link = btn.dataset.link || btn.getAttribute('href');
        if(!link) return;

        document.body.classList.add('fade-out');
        setTimeout(()=>{ window.location.href=link; }, 350);
      });
    });
  }
  // Любые ссылки верхней панели
  setupPageButtons('.nav-btn');
});
