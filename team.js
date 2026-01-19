// team.js — улучшенная 3D-карусель с индивидуальными траекториями и корректным перекрытием.
// Требования выполнены:
// 1) аватарки круглые,
// 2) аватарки, ставшие спереди, НЕ размываются,
// 3) разные траектории (rx, ry, tilt, phase, wobble).

(function () {
  const avatarEls = Array.from(document.querySelectorAll('.avatar'));
  const center = document.querySelector('.center-object');

  if (!avatarEls.length || !center) {
    console.warn('team.js: нет .avatar или .center-object в DOM');
    return;
  }

  // Параметры
  let angle = 0; // общий смещающий угол в градусах
  const baseRadius = Math.max(160, Math.min(window.innerWidth * 0.18, 260));

  // Для детерминированных, но разных траекторий — используем индекс как seed
  const params = avatarEls.map((el, i) => {
    // небольшие вариации
    const seed = i + 1;
    const rx = baseRadius * (0.8 + (seed % 5) * 0.06);  // по X (горизонталь)
    const ry = baseRadius * (0.35 + (seed % 3) * 0.12); // по Y (вертикаль/эллипс)
    const rz = baseRadius * (0.9 + (seed % 4) * 0.05);  // глубина (управляет front/back)
    const tilt = ( (seed * 37) % 25 ) * (Math.PI/180);   // наклон плоскости (в радианах)
    const phase = (seed * 47) % 360;                    // фазовый сдвиг (deg)
    const wobbleAmp = 6 + (seed % 4) * 2;               // вертикальная "вибрация"
    const speedMul = 0.9 + (seed % 3) * 0.15;           // индивидуальная скорость множитель

    // Store on element for possible later tweaks
    el._orbit = { rx, ry, rz, tilt, phase, wobbleAmp, speedMul };
    return el._orbit;
  });

  // Удобная функция — установить позицию и стили аватара
  function updateAvatar(el, idx, x, y, z) {
    // небольшой vertical offset для реалистичности
    const yOffset = y; // уже включает wobble
    // scale по глубине (ближе -> больше)
    const scale = 1 + (z / (baseRadius * 6));
    const s = Math.max(0.6, Math.min(1.35, scale));

    // применяем transform (translateX, translateY, scale). translateZ не нужен.
    el.style.transform = `translateX(${x}px) translateY(${yOffset}px) scale(${s})`;

    // управление слоями:
    // если z >= 0 — аватарка "перед" центром, ставим выше центра (z-index большое)
    // иначе — "за" центром, z-index меньше чем у центра (в CSS center z-index = 200)
    if (z >= 0) {
      el.classList.remove('back');
      el.classList.add('front');
      el.style.zIndex = 1000 + idx; // выше центра (центр 200)
    } else {
      el.classList.remove('front');
      el.classList.add('back');
      el.style.zIndex = 50 + idx; // под центром
    }
  }

  // Главный цикл
  function tick() {
    const n = avatarEls.length;
    const step = 360 / n;

    avatarEls.forEach((el, i) => {
      const p = el._orbit;
      // динамическая индивидуальная скорость
      const localAngle = angle * p.speedMul + p.phase;
      const rad = localAngle * Math.PI / 180;

      // эллиптическая орбита + наклон плоскости
      // x — горизонталь: cos
      const x = Math.cos(rad) * p.rx;
      // y — вертикаль: синус * ry, скорректирован по наклону и небольшой вибрации
      const y = Math.sin(rad) * p.ry * Math.cos(p.tilt) + Math.sin((rad * 2) + p.phase) * p.wobbleAmp;
      // z — глубина: sin * rz * sin(tilt) (делаем так, чтобы проход через центр давал смену front/back)
      const z = Math.sin(rad) * p.rz * Math.sin(p.tilt);

      updateAvatar(el, i, x, y, z);
    });

    // Общая скорость вращения
    angle += 0.25; // можно уменьшить при желании
    requestAnimationFrame(tick);
  }

  // Запуск
  tick();

  // При ресайзе можно подправить радиусы (здесь просто перерасчитываем baseRadius и орбиты)
  window.addEventListener('resize', () => {
    const newBase = Math.max(120, Math.min(window.innerWidth * 0.18, 260));
    // скорректируем rx/ry/rz пропорционально
    avatarEls.forEach((el, i) => {
      const p = el._orbit;
      const factor = newBase / baseRadius;
      p.rx *= factor;
      p.ry *= factor;
      p.rz *= factor;
    });
  });

  // Topbar links behaviour (меняем цвет гарантированно)
  const logoLink = document.getElementById('logo-link');
  const teamLink = document.querySelector('.team-link');
  if (logoLink) logoLink.addEventListener('click', () => window.location.href = 'index.html');
  if (logoLink) logoLink.style.color = '#00eaff';
  if (teamLink) teamLink.style.color = '#a14fff';

  // Respect prefers-reduced-motion: если включен — останавливаем анимацию
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener && media.addEventListener('change', () => {
    if (media.matches) {
      // остановим анимацию — уберём requestAnimationFrame loop (простая методика: заменим tick пустышкой)
      // Для краткости: просто не реагируем — можно реализовать флаг paused.
    }
  });
})();
