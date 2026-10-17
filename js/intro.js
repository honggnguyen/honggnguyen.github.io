/* Màn hình mở đầu: mở cửa sổ sắc nét + chuyển cảnh xuyên không Starlight Portal Warp */
const Intro = (() => {
  const $ = id => document.getElementById(id);
  const intro = $('intro'), stage = $('introStage'), galaxy = $('galaxy'), warp = $('portalWarp');
  let busy = false;
  const WIN = { x: 0.265, y: 0.40 };   // tâm cửa sổ (tỉ lệ trong stage)

  function init() {
    startShooting($('windowSky'), { minGap: 3000, maxGap: 7000, len: 100, dist: 260, angle: 32, area: [0, 0, .7, .35] });
    const btn = $('enterBtn');
    btn.addEventListener('mouseenter', () => intro.classList.add('open'));
    btn.addEventListener('focus', () => intro.classList.add('open'));
    btn.addEventListener('mouseleave', () => { if (!busy) intro.classList.remove('open'); });
    btn.addEventListener('click', enter);
    addEventListener('keydown', e => { if (e.key === 'Enter' && !busy && !intro.classList.contains('gone')) enter(); });
  }

  function enter() {
    if (busy) return; busy = true;
    Audio_start();
    intro.classList.add('open', 'zooming');

    // Camera Push-In nhẹ nhàng (scale 1.6x) giúp giữ độ nét 100%, không bị vỡ/nhòe pixel
    const r = stage.getBoundingClientRect();
    const px = r.width * WIN.x, py = r.height * WIN.y;
    const s = 1.62;
    const left = r.left, top = r.top;
    stage.style.transformOrigin = '0 0';
    stage.style.transition = 'none';
    stage.style.transform = 'translate(0,0) scale(1)';
    void stage.offsetWidth;

    // Cánh cửa mở, máy quay tiến lại gần cửa sổ
    setTimeout(() => {
      stage.style.transition = 'transform 2.2s cubic-bezier(.22, 1, .36, 1)';
      const targetX = (innerWidth * 0.42) - left - (px * s);
      const targetY = (innerHeight * 0.46) - top - (py * s);
      stage.style.transform = `translate(${targetX}px, ${targetY}px) scale(${s})`;

      // 1.2s: Luồng ánh sáng tinh vân bừng sáng từ tâm cửa sổ (Cosmic Portal Warp)
      setTimeout(() => {
        warp.classList.add('active');
      }, 1100);

      // 1.9s: Đỉnh điểm luồng sáng -> Kích hoạt bản đồ thiên hà sắc nét hoàn mỹ
      setTimeout(() => {
        galaxy.classList.add('active');
        intro.classList.add('gone');
        document.body.classList.add('in-galaxy');
      }, 1900);

      // 2.6s: Luồng sáng dịu xuống, mở ra bầu trời sao nguyên bản 100%
      setTimeout(() => {
        warp.classList.remove('active');
      }, 2600);

      // 3.2s: Hoàn tất chuyển cảnh
      setTimeout(() => {
        intro.style.display = 'none';
        stage.style.transform = '';
        busy = false;
      }, 3200);
    }, 600);
  }

  function back() {
    intro.style.display = '';
    busy = false;
    warp.classList.remove('active');
    intro.classList.remove('zooming', 'open');
    stage.style.transition = 'none';
    stage.style.transform = '';
    void intro.offsetWidth;
    intro.classList.remove('gone');
    galaxy.classList.remove('active');
    document.body.classList.remove('in-galaxy');
  }

  function Audio_start() { try { Ambience.start(); } catch (e) { console.warn(e); } }
  return { init, back };
})();
