// team.js — плавная 3D-карусель с корректным перекрытием и локальным размытием
(function () {
  const avatarEls = Array.from(document.querySelectorAll('.avatar'));
  const center = document.querySelector('.center-object');

  if (!avatarEls.length || !center) {
    console.warn('team.js: аватарки или центр не найдены');
    return;
  }

  // Параметры
  let angle = 0;                       // общий угол (deg)
  const RPM = 0.03;                    // скорость (adjust)
  const radius = Math.max(160, Math.min(window.innerWidth * 0.18, 260)); // радиус вращения
  const centerRect = () => center.getBoundingClientRect();

  // Удобная функция для установки позиции/стиля аватара
  function placeAvatar(el, x, y, z, idx) {
    // tiny vertical offset to emphasize 3D
    const yOffset = Math.sin((angle + idx * (360 / avatarEls.length)) * Math.PI / 180) * 8;

    // scale by depth: closer (z positive) => slightly larger
    const scale = 1 + (z / (radius * 6)); // range roughly 0.833 -> 1.166
    // clamp scale
    const s = Math.max(0.6, Math.min(1.4, scale));

    // create transform (translateX/translateY + scale + small translateZ for hardware accel)
    el.style.transform = `translateX(${x}px) translateY(${yOffset + y}px) translateZ(0px) scale(${s})`;

    // set stacking order: front avatars (z >= 0) must be above center (z-index > center)
    if (z >= 0) {
      el.classList.remove('back');
      el.style.zIndex = 300 + idx; // big to always be above center
    } else {
      el.classList.add('back');
      el.style.zIndex = 10 + idx;  // low, center has z-index 20 in CSS — those will be underneath center
    }
  }

  // main loop
  function tick() {
    const step = 360 / avatarEls.length;
    // update centerBounds in case of resize/scroll
    const cr = centerRect();
    // compute center position in page coords (not directly needed here because we rely on backdrop-filter)
    // iterate avatars
    avatarEls.forEach((el, i) => {
      const a = angle + step * i;
      const rad = a * Math.PI / 180;

      // x: horizontal offset from center
      const x = Math.sin(rad) * radius;
      // small vertical drift around center
      const y = Math.cos(rad) * -8; // small vertical arc to add natural movement
      // z for depth (we use it to set front/back)
      const z = Math.cos(rad) * radius;

      // set background images if element contains <img> child or background-image usage
      // we keep element's own content — JS only sets transform and z-index
      placeAvatar(el, x, y, z, i);
    });

    angle += RPM * 360 * (1/60); // RPM-like speed converted to deg/tick; smooth and framerate-agnostic-ish
    requestAnimationFrame(tick);
  }

  // Kick off
  tick();

  // Resize handling — adjust radius slightly
  window.addEventListener('resize', () => {
    // The CSS transform-origin uses fixed values; we can recompute radius if needed (optional)
    // Currently radius is recomputed only on load; to keep it simple we leave it static here
  });

  // Topbar link behavior
  const logoLink = document.getElementById('logo-link');
  const teamLink = document.querySelector('.team-link');
  if (logoLink) {
    logoLink.addEventListener('click', () => { window.location.href = "index.html"; });
  }
  // color set via CSS; but ensure fallback
  if (logoLink) logoLink.style.color = '#00eaff';
  if (teamLink) teamLink.style.color = '#a14fff';

})();
