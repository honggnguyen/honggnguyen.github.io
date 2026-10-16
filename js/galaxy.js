/* Bản đồ thiên hà: chòm sao, ngôi sao, tooltip, modal blog & hiệu ứng hào quang linh vật */
const Galaxy = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1920, H = 1072, KEY = 'poem-read-v1';
  let rawData, constellations = [], categories = [];
  let cur = 0, read = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  const $ = id => document.getElementById(id);
  const svg = $('starLayer'), tip = $('tooltip'), modal = $('modal');
  let bgs = [];
  let lastFocus = null;

  async function init() {
    rawData = await (await fetch('data/poems.json')).json();
    constellations = rawData.constellations || [];
    categories = rawData.categories || [
      { id: 'mongmo', name: 'Mộng Mơ', shortName: 'Thơ', icon: '✦', galaxies: [constellations[0]] },
      { id: 'viendu', name: 'Viễn Du', shortName: 'Viễn Du', icon: '⟡', galaxies: [constellations[1]] },
      { id: 'kyniem', name: 'Kỷ Niệm', shortName: 'Kỷ Niệm', icon: '✧', galaxies: [constellations[2]] }
    ];

    buildBackgrounds();
    buildMinimap();
    buildStars();
    show(0, true);

    $('prevC').onclick = () => go(-1);
    $('nextC').onclick = () => go(1);
    $('closeBtn').onclick = $('closeBtn2').onclick = closeModal;
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    // Nút mở Hành Trình Viễn Du
    const travelBtn = $('travelBtn');
    if (travelBtn) {
      travelBtn.onclick = () => {
        if (window.TravelTimeline) TravelTimeline.open();
      };
    }

    addEventListener('keydown', e => {
      if (!modal.classList.contains('show')) {
        if (!$('galaxy').classList.contains('active')) return;
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      } else if (e.key === 'Escape') closeModal();
    });

    // Vuốt ngang để đổi chòm sao
    let sx = null;
    $('galaxy').addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    $('galaxy').addEventListener('touchend', e => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    });

    // Mưa sao băng dày và lung linh hơn
    startShooting($('galaxyShoot'), { minGap: 700, maxGap: 2200, len: 160, dist: 500, area: [0.02, 0, 0.98, 0.55] });

    // Khởi tạo hiệu ứng Parallax Đa tầng (Multi-layer Parallax)
    initParallax();
  }

  function buildBackgrounds() {
    const layerBg = $('layerBg') || $('galaxyStage');
    // Xóa các ảnh cũ nếu có
    layerBg.querySelectorAll('.galaxy-bg').forEach(e => e.remove());
    bgs = [];
    constellations.forEach((c, idx) => {
      const img = document.createElement('img');
      img.className = 'galaxy-bg';
      img.dataset.i = idx;
      img.src = c.bgImg || `assets/img/galaxy_${idx}.webp`;
      img.alt = c.name;
      layerBg.appendChild(img);
      bgs.push(img);
    });
  }

  function el(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent && parent.appendChild(e); return e;
  }

  function buildStars() {
    svg.innerHTML = '';
    constellations.forEach((c, ci) => {
      const g = el('g', { 'data-c': ci, class: 'cgroup' }, svg);
      g.style.display = 'none';

      c.stars.forEach(s => {
        const cx = s.x / 100 * W, cy = s.y / 100 * H;
        const sg = el('g', {
          class: 'star' + (read.has(s.id) ? ' read' : ''),
          tabindex: 0, role: 'button',
          'aria-label': s.title, 'data-id': s.id
        }, g);

        sg.style.setProperty('--tw', (2.2 + Math.random() * 2.8) + 's');
        sg.style.setProperty('--td', (-Math.random() * 4) + 's');
        el('circle', { class: 'hit', cx, cy, r: 28 }, sg);
        el('circle', { class: 'halo', cx, cy, r: 16 }, sg);
        el('circle', { class: 'ring', cx, cy, r: 12 }, sg);
        el('circle', { class: 'core', cx, cy, r: 5 }, sg);
        // Tia sáng 4 cánh
        el('path', { class: 'core', d: `M${cx} ${cy - 14}L${cx + 2} ${cy - 2}L${cx + 14} ${cy}L${cx + 2} ${cy + 2}L${cx} ${cy + 14}L${cx - 2} ${cy + 2}L${cx - 14} ${cy}L${cx - 2} ${cy - 2}Z` }, sg);

        const showTip = () => {
          const r = sg.getBoundingClientRect();
          tip.innerHTML = `<b>${s.title}</b><small>${s.date}</small>`;
          tip.style.left = (r.left + r.width / 2) + 'px';
          tip.style.top = (r.top + r.height / 2) + 'px';
          tip.classList.add('show');
        };

        // Gợi ý tương tác: Hào quang bừng sáng linh vật (cá/gấu/chim) khi rê chuột vào sao
        sg.addEventListener('mouseenter', () => {
          showTip();
          $('galaxyStage').classList.add('hover-aura');
        });
        sg.addEventListener('focus', () => {
          showTip();
          $('galaxyStage').classList.add('hover-aura');
        });
        sg.addEventListener('mouseleave', () => {
          tip.classList.remove('show');
          $('galaxyStage').classList.remove('hover-aura');
        });
        sg.addEventListener('blur', () => {
          tip.classList.remove('show');
          $('galaxyStage').classList.remove('hover-aura');
        });

        sg.addEventListener('click', () => open(s, c, sg));
        sg.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(s, c, sg);
          }
        });
      });
    });
  }

  const CATEGORY_ICONS = {
    'mongmo': `<svg viewBox="0 0 24 24" class="mm-icon-svg"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-5.4-5.4c0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" fill="currentColor"/><circle cx="18" cy="6" r="1.6" fill="#ffe9a8"/></svg>`,
    'viendu': `<svg viewBox="0 0 24 24" class="mm-icon-svg"><path d="M12 2L4 20l8-4 8 4L12 2z" stroke="currentColor" stroke-width="1.6" fill="rgba(255,143,207,0.3)"/><circle cx="12" cy="7" r="1.5" fill="#ffe9a8"/></svg>`,
    'kyniem': `<svg viewBox="0 0 24 24" class="mm-icon-svg"><path d="M12 2l2.8 6.2L21 11l-5.2 4.2L17.2 22 12 18.5 6.8 22l1.4-6.8L3 11l6.2-2.8L12 2z" stroke="currentColor" stroke-width="1.4" fill="rgba(255,233,168,0.3)"/></svg>`
  };

  function buildMinimap() {
    const mm = $('minimap');
    mm.innerHTML = '';

    categories.forEach(cat => {
      const b = document.createElement('button');
      b.className = 'mm-btn';
      b.dataset.cat = cat.id;
      b.setAttribute('aria-label', cat.name);

      const iconSvg = CATEGORY_ICONS[cat.id] || '✦';
      b.innerHTML = `
        <span class="mm-emblem">${iconSvg}</span>
        <span class="mm-label">${cat.shortName || cat.name}</span>
        <span class="mm-sub-count"></span>
      `;

      b.onclick = () => {
        // Chuyển tới galaxy đầu tiên của category này
        const firstIdx = constellations.findIndex(c => c.category === cat.id);
        if (firstIdx !== -1) show(firstIdx);
      };
      mm.appendChild(b);
    });
  }

  function show(i) {
    cur = (i + constellations.length) % constellations.length;
    const c = constellations[cur];

    // Bật ảnh nền tương ứng
    bgs.forEach((b, k) => b.classList.toggle('on', k === cur));

    // Hiển thị nhóm sao tương ứng
    svg.querySelectorAll('.cgroup').forEach(g => g.style.display = +g.dataset.c === cur ? '' : 'none');

    // Cập nhật tiêu đề chòm sao & linh vật
    const t = document.querySelector('.g-title');
    t.classList.remove('swap'); void t.offsetWidth; t.classList.add('swap');
    $('gTitle').textContent = c.name;

    // Tìm category của galaxy hiện tại
    const currentCat = categories.find(cat => cat.id === c.category) || categories[0];
    const catGalaxies = constellations.filter(g => g.category === currentCat.id);
    const subIdx = catGalaxies.findIndex(g => g.id === c.id) + 1;
    const subTotal = catGalaxies.length;

    $('gSub').textContent = subTotal > 1
      ? `${currentCat.name} · ${c.subtitle} (${subIdx}/${subTotal})`
      : `${currentCat.name} · ${c.subtitle}`;

    // Cập nhật trạng thái active cho menu 3 phần
    const mmButtons = $('minimap').querySelectorAll('.mm-btn');
    mmButtons.forEach(btn => {
      const isCatActive = btn.dataset.cat === currentCat.id;
      btn.classList.toggle('on', isCatActive);
      const countEl = btn.querySelector('.mm-sub-count');
      if (countEl) {
        countEl.textContent = (isCatActive && subTotal > 1) ? `· ${subIdx}/${subTotal}` : '';
      }
    });

    // Cập nhật trạng thái nút Hành Trình Viễn Du
    const tb = $('travelBtn');
    if (tb) {
      const isViendu = currentCat.id === 'viendu';
      tb.classList.toggle('highlight', isViendu);
      tb.style.display = isViendu ? 'inline-flex' : 'none';
    }

    updateProgress();
  }

  const go = d => {
    tip.classList.remove('show');
    $('galaxyStage').classList.remove('hover-aura');
    show(cur + d);
  };

  function updateProgress() {
    const total = constellations.reduce((a, c) => a + c.stars.length, 0);
    const r = constellations.reduce((a, c) => a + c.stars.filter(s => read.has(s.id)).length, 0);
    $('progress').textContent = `✦ ĐÃ HÁI ${r} / ${total} VÌ SAO`;
  }

  function open(s, c, node) {
    lastFocus = node; tip.classList.remove('show');
    $('mKind').textContent = s.tag || c.name;

    const loc = $('mLocation');
    if (loc) {
      loc.textContent = s.location ? `📍 ${s.location}` : '';
      loc.style.display = s.location ? 'inline-block' : 'none';
    }

    const wt = $('mWeather');
    if (wt) {
      wt.textContent = s.weather ? `· ${s.weather}` : '';
      wt.style.display = s.weather ? 'inline-block' : 'none';
    }

    const dot = $('mDotSep');
    if (dot) dot.style.display = (s.location || s.weather) ? 'inline-block' : 'none';

    const coverWrap = $('mCover');
    const coverImg = $('mCoverImg');
    if (coverWrap && coverImg) {
      if (s.coverImage) {
        coverImg.src = s.coverImage;
        coverImg.alt = s.title;
        coverWrap.style.display = 'block';
      } else {
        coverWrap.style.display = 'none';
        coverImg.src = '';
      }
    }

    $('mTitle').textContent = s.title;
    $('mDate').textContent = s.date;

    $('mBody').innerHTML = PoemRender.bodyHtml(s);

    // Thanh điều hướng trạm (Prev / Next / Timeline)
    const navBtns = $('mNavBtns');
    if (navBtns) {
      const isViendu = c.category === 'viendu';
      navBtns.style.display = 'flex';
      $('mTimelineBtn').style.display = isViendu ? 'inline-block' : 'none';

      const sIdx = c.stars.findIndex(st => st.id === s.id);
      const prevStar = c.stars[(sIdx - 1 + c.stars.length) % c.stars.length];
      const nextStar = c.stars[(sIdx + 1) % c.stars.length];

      $('mPrevBtn').onclick = () => {
        const pNode = svg.querySelector(`[data-id="${prevStar.id}"]`);
        open(prevStar, c, pNode || node);
      };
      $('mNextBtn').onclick = () => {
        const nNode = svg.querySelector(`[data-id="${nextStar.id}"]`);
        open(nextStar, c, nNode || node);
      };
      $('mTimelineBtn').onclick = () => {
        closeModal();
        if (window.TravelTimeline) TravelTimeline.open(s.id);
      };
    }

    modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
    read.add(s.id); localStorage.setItem(KEY, JSON.stringify([...read]));
    node.classList.add('read'); updateProgress();
    $('closeBtn2').focus();
  }

  function closeModal() {
    modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true');
    lastFocus && lastFocus.focus({ preventScroll: true });
  }

  /* ================= HIỆU ỨNG PARALLAX ĐA TẦNG (3 TẦNG KHÔNG GIAN) ================= */
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let fgCanvas, fgCtx, fgParticles = [];

  function initParallax() {
    const galaxyEl = $('galaxy');
    const layerBg = $('layerBg');
    const layerMid = $('layerMid');
    fgCanvas = $('layerFg');
    if (!layerBg || !layerMid || !fgCanvas) return;

    fgCtx = fgCanvas.getContext('2d');
    resizeFgCanvas();
    window.addEventListener('resize', resizeFgCanvas);

    // Tạo 42 hạt bụi sao lơ lửng cận cảnh (Foreground)
    const particleCount = 42;
    fgParticles = [];
    for (let i = 0; i < particleCount; i++) {
      fgParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 1.5 + Math.random() * 3.2,
        alpha: 0.15 + Math.random() * 0.65,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -0.2 - Math.random() * 0.3,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random() * Math.PI,
        color: Math.random() < 0.38 ? '255, 220, 130' : (Math.random() < 0.7 ? '255, 185, 235' : '255, 255, 255')
      });
    }

    // Di chuyển theo con trỏ chuột
    window.addEventListener('mousemove', e => {
      if (!galaxyEl.classList.contains('active')) return;
      targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    }, { passive: true });

    // Hỗ trợ cảm biến con quay hồi chuyển trên điện thoại (Gyroscope)
    window.addEventListener('deviceorientation', e => {
      if (!galaxyEl.classList.contains('active') || e.gamma == null || e.beta == null) return;
      targetX = Math.max(-1, Math.min(1, e.gamma / 25));
      targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    }, { passive: true });

    // Vòng lặp chuyển động mượt mà bằng requestAnimationFrame
    function renderLoop() {
      if (galaxyEl.classList.contains('active') && !document.hidden) {
        // Damping mượt mà (Lerp 0.055)
        currentX += (targetX - currentX) * 0.055;
        currentY += (targetY - currentY) * 0.055;

        // Lớp nền + lớp sao dùng CHUNG một transform để sao luôn khớp với ảnh nền
        const lockedTf = `translate3d(${currentX * 14}px, ${currentY * 11}px, 0) scale(1.05)`;
        layerBg.style.transform = lockedTf;
        layerMid.style.transform = lockedTf;

        // Tầng 3: Lớp gần nhất (Foreground) - di chuyển nhanh nhất theo hướng ngược lại
        fgCanvas.style.transform = `translate3d(${-currentX * 62}px, ${-currentY * 50}px, 0)`;

        // Vẽ các hạt bụi sao bay cận cảnh
        renderForeground();
      }
      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
  }

  function resizeFgCanvas() {
    if (!fgCanvas) return;
    fgCanvas.width = window.innerWidth;
    fgCanvas.height = window.innerHeight;
  }

  function renderForeground() {
    if (!fgCtx || !fgCanvas) return;
    fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);

    fgParticles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulseVal += p.pulseSpeed;

      // Vòng lặp khi trôi ra ngoài biên
      if (p.y < -10) p.y = fgCanvas.height + 10;
      if (p.x < -10) p.x = fgCanvas.width + 10;
      if (p.x > fgCanvas.width + 10) p.x = -10;

      const a = p.alpha * (0.7 + Math.sin(p.pulseVal) * 0.3);
      fgCtx.save();
      fgCtx.beginPath();
      fgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fgCtx.fillStyle = `rgba(${p.color}, ${a})`;
      fgCtx.shadowBlur = 10;
      fgCtx.shadowColor = `rgba(${p.color}, 0.8)`;
      fgCtx.fill();
      fgCtx.restore();
    });
  }

  return { init, go };
})();
window.Galaxy = Galaxy;
