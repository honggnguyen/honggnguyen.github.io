/* Màn hình mở đầu: mở cửa sổ sắc nét + chuyển cảnh xuyên không Starlight Portal Warp */
const Intro = (() => {
  const $ = id => document.getElementById(id);
  const intro = $('intro'), stage = $('introStage'), galaxy = $('galaxy'), warp = $('portalWarp');
  let busy = false;
  const WIN = { x: 0.265, y: 0.40 };   // tâm cửa sổ (tỉ lệ trong stage)

  // Mobile Room Camera: Cho phép người dùng điện thoại vuốt ngang khám phá phòng & chuyển góc nhìn
  const POSITIONS = {
    window: 0.265,     // Khung cửa sổ vòm ngắm sao
    center: 0.50,      // Bé gái & chú cún Bond
    fireplace: 0.82    // Lò sưởi & Carte
  };
  let currentTarget = 'center';
  let currentPanX = 0;
  let isDragging = false;
  let dragStartX = 0;
  let panStartX = 0;

  function isMobileViewport() {
    return window.innerWidth <= 860 || (window.innerHeight > window.innerWidth);
  }

  function getPanLimits() {
    const stageWidth = stage ? (stage.getBoundingClientRect().width || (window.innerHeight * 1.7917)) : (window.innerHeight * 1.7917);
    const viewWidth = window.innerWidth;
    const maxOffset = Math.max(0, (stageWidth - viewWidth) / 2);
    return { minX: -maxOffset, maxX: maxOffset, stageWidth };
  }

  function panTo(targetKey, smooth = true) {
    if (!stage || busy) return;
    if (POSITIONS[targetKey] === undefined) targetKey = 'center';
    currentTarget = targetKey;

    if (!isMobileViewport()) {
      currentPanX = 0;
      stage.style.transform = '';
      updateNavPills(targetKey);
      return;
    }

    const { minX, maxX, stageWidth } = getPanLimits();
    const ratio = POSITIONS[targetKey];
    let targetX = -(ratio - 0.5) * stageWidth;
    targetX = Math.max(minX, Math.min(maxX, targetX));
    currentPanX = targetX;

    stage.style.transition = smooth ? 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    stage.style.transform = `translate3d(${targetX}px, 0, 0)`;
    updateNavPills(targetKey);
  }

  function updateNavPills(activeKey) {
    const pills = document.querySelectorAll('.mrn-btn');
    pills.forEach(p => {
      if (p.getAttribute('data-target') === activeKey) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  function initMobileRoomCamera() {
    if (!intro || !stage) return;

    // Chạm vuốt ngang màn hình để lia camera trong phòng
    intro.addEventListener('touchstart', (e) => {
      if (busy || !isMobileViewport()) return;
      if (e.target.closest('button, .calcifer-dialog, .calcifer-container, input, a')) return;
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      panStartX = currentPanX;
      stage.style.transition = 'none';
    }, { passive: true });

    intro.addEventListener('touchmove', (e) => {
      if (!isDragging || busy || !isMobileViewport()) return;
      const dx = e.touches[0].clientX - dragStartX;
      const { minX, maxX } = getPanLimits();
      let nextX = panStartX + dx;
      if (nextX < minX) nextX = minX + (nextX - minX) * 0.3;
      if (nextX > maxX) nextX = maxX + (nextX - maxX) * 0.3;
      currentPanX = nextX;
      stage.style.transform = `translate3d(${nextX}px, 0, 0)`;
    }, { passive: true });

    intro.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const { minX, maxX, stageWidth } = getPanLimits();
      currentPanX = Math.max(minX, Math.min(maxX, currentPanX));
      
      // Snap về góc nhìn gần nhất
      const currentRatio = 0.5 - (currentPanX / stageWidth);
      let closest = 'center';
      let minDist = Infinity;
      for (const [key, ratio] of Object.entries(POSITIONS)) {
        const dist = Math.abs(currentRatio - ratio);
        if (dist < minDist) {
          minDist = dist;
          closest = key;
        }
      }
      panTo(closest, true);
    });

    // Bắt sự kiện click vào các nút trên thanh mobileRoomNav
    const nav = $('mobileRoomNav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        const btn = e.target.closest('.mrn-btn');
        if (!btn) return;
        const target = btn.getAttribute('data-target');
        if (target) {
          panTo(target, true);
          if (target === 'fireplace' && window.Calcifer && typeof window.Calcifer.awaken === 'function') {
            window.Calcifer.awaken();
          }
        }
      });
    }

    // Reset khi xoay màn hình (orientationchange / resize)
    window.addEventListener('resize', () => {
      if (!busy && !intro.classList.contains('gone')) {
        panTo(currentTarget, false);
      }
    });

    // Mặc định khởi động
    if (isMobileViewport()) {
      setTimeout(() => panTo('center', false), 150);
    }
  }

  function init() {
    startShooting($('windowSky'), { minGap: 3000, maxGap: 7000, len: 100, dist: 260, angle: 32, area: [0, 0, .7, .35] });
    const btn = $('enterBtn');
    btn.addEventListener('mouseenter', () => intro.classList.add('open'));
    btn.addEventListener('focus', () => intro.classList.add('open'));
    btn.addEventListener('mouseleave', () => { if (!busy) intro.classList.remove('open'); });
    btn.addEventListener('click', enter);
    addEventListener('keydown', e => { if (e.key === 'Enter' && !busy && !intro.classList.contains('gone')) enter(); });

    initMobileRoomCamera();
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
    if (isMobileViewport()) {
      panTo('center', false);
    }
  }

  function skipToGalaxy() {
    intro.style.display = 'none';
    intro.classList.add('gone', 'open', 'zooming');
    galaxy.classList.add('active');
    document.body.classList.add('in-galaxy');
    warp.classList.remove('active');
    busy = false;
  }

  function Audio_start() { try { Ambience.start(); } catch (e) { console.warn(e); } }
  return { init, back, skipToGalaxy, panTo, getCurrentTarget: () => currentTarget };
})();
