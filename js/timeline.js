/* Chế độ Nhật Ký Du Hành Không Gian (Cosmic Travel Timeline) - Chòm sao Viễn Du */
const TravelTimeline = (() => {
  const $ = id => document.getElementById(id);
  const modal = $('travelTimelineModal');
  const track = $('timelineScrollTrack');
  const routeFill = $('routeFill');
  const routeShip = $('routeShip');
  const routeDots = $('routeDots');

  let stars = [];
  let isOpen = false;
  let activeStationIdx = 0;

  async function init() {
    try {
      const res = await fetch('data/poems.json');
      if (res.ok) {
        const data = await res.json();
        // Tìm chòm sao Viễn Du
        const vienduCat = data.categories?.find(c => c.id === 'viendu');
        if (vienduCat && vienduCat.galaxies?.[0]?.stars) {
          stars = vienduCat.galaxies[0].stars;
        } else {
          const vd = data.constellations?.find(c => c.id === 'vien-du' || c.category === 'viendu');
          if (vd) stars = vd.stars || [];
        }
      }
    } catch (e) {
      console.warn('Could not load viendu stars for timeline', e);
    }

    buildTimelineUI();
    bindEvents();
  }

  function buildTimelineUI() {
    if (!stars.length) return;
    track.innerHTML = '';
    routeDots.innerHTML = '';

    const KEY = 'poem-read-v1';
    const read = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));

    stars.forEach((s, idx) => {
      // 1. Tạo dấu mốc trên thanh lộ trình (Route Dots)
      const dot = document.createElement('button');
      dot.className = 'station-dot' + (read.has(s.id) ? ' read' : '');
      dot.dataset.idx = idx;
      dot.setAttribute('title', `Trạm ${idx + 1}: ${s.title}`);
      dot.setAttribute('aria-label', `Chuyển tới Trạm ${idx + 1}: ${s.title}`);
      dot.innerHTML = `<span>${String(idx + 1).padStart(2, '0')}</span>`;
      dot.addEventListener('click', () => scrollToStation(idx));
      routeDots.appendChild(dot);

      // 2. Tạo thẻ trạm dừng chân (Station Card)
      const card = document.createElement('article');
      card.className = 'timeline-station-card' + (read.has(s.id) ? ' read' : '');
      card.dataset.idx = idx;
      card.id = `station_${s.id}`;

      // Ảnh bìa trạm dừng nếu có
      let coverHtml = '';
      if (s.coverImage) {
        coverHtml = `
          <div class="station-cover">
            <img src="${s.coverImage}" alt="${s.title}" loading="lazy">
            <span class="station-photo-badge">📷 Ký sự thực địa</span>
          </div>
        `;
      }

      // Format nội dung bài viết
      const bodyHtml = PoemRender.bodyHtml(s);

      card.innerHTML = `
        <div class="station-card-inner">
          <div class="station-top-bar">
            <span class="station-num">TRẠM ${String(idx + 1).padStart(2, '0')} / ${String(stars.length).padStart(2, '0')}</span>
            <span class="station-tag">${s.tag || 'Nhật ký du hành'}</span>
          </div>

          ${coverHtml}

          <div class="station-meta">
            ${s.location ? `<span class="station-loc">📍 ${s.location}</span>` : ''}
            ${s.weather ? `<span class="station-wt">· 🌤 ${s.weather}</span>` : ''}
            <span class="station-date">· 🗓 ${s.date}</span>
          </div>

          <h3 class="station-title">${s.title}</h3>
          <div class="station-body">${bodyHtml}</div>

          <div class="station-card-footer">
            <button class="pixel-btn small pick-star-btn" data-id="${s.id}">
              ${read.has(s.id) ? '✦ Đã hái vì sao này' : '✧ Hái vì sao này'}
            </button>
          </div>
        </div>
      `;

      // Nút hái sao ngay trên timeline
      const pickBtn = card.querySelector('.pick-star-btn');
      pickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        read.add(s.id);
        localStorage.setItem(KEY, JSON.stringify([...read]));
        card.classList.add('read');
        dot.classList.add('read');
        pickBtn.textContent = '✦ Đã hái vì sao này';
        pickBtn.classList.add('picked');

        // Đồng bộ với bầu trời sao chính
        const starNode = document.querySelector(`.star[data-id="${s.id}"]`);
        if (starNode) starNode.classList.add('read');
        const progressEl = $('progress');
        if (progressEl) {
          const total = document.querySelectorAll('.star').length;
          const r = document.querySelectorAll('.star.read').length;
          progressEl.textContent = `✦ ĐÃ HÁI ${r} / ${total} VÌ SAO`;
        }
        if (window.Ambience && Ambience.playChime) Ambience.playChime();
      });

      track.appendChild(card);
    });

    updateRouteProgress();
  }

  function bindEvents() {
    $('closeTravelTimeline').addEventListener('click', close);
    $('closeTravelTimeline2').addEventListener('click', close);
    modal.addEventListener('click', e => {
      if (e.target === modal) close();
    });

    // Chuyển con lăn chuột dọc thành cuộn ngang
    track.addEventListener('wheel', e => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        track.scrollLeft += e.deltaY * 1.5;
      }
    }, { passive: false });

    // Cập nhật thanh tiến trình lộ trình khi cuộn
    track.addEventListener('scroll', updateRouteProgress, { passive: true });

    // Nút mũi tên Prev / Next
    $('tlPrev').addEventListener('click', () => {
      scrollToStation(Math.max(0, activeStationIdx - 1));
    });
    $('tlNext').addEventListener('click', () => {
      scrollToStation(Math.min(stars.length - 1, activeStationIdx + 1));
    });

    // Phím mũi tên
    addEventListener('keydown', e => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToStation(Math.max(0, activeStationIdx - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToStation(Math.min(stars.length - 1, activeStationIdx + 1));
      } else if (e.key === 'Escape') {
        close();
      }
    });
  }

  function scrollToStation(idx) {
    if (idx < 0 || idx >= stars.length) return;
    activeStationIdx = idx;
    const cards = track.querySelectorAll('.timeline-station-card');
    if (cards[idx]) {
      const card = cards[idx];
      const targetLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
      track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  }

  function updateRouteProgress() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) {
      routeFill.style.width = '0%';
      routeShip.style.left = '0%';
      return;
    }

    const ratio = Math.max(0, Math.min(1, track.scrollLeft / maxScroll));
    const percent = (ratio * 100).toFixed(1);
    routeFill.style.width = percent + '%';
    routeShip.style.left = percent + '%';

    // Xác định trạm nào đang ở gần giữa khung hình nhất
    const center = track.scrollLeft + track.clientWidth / 2;
    const cards = track.querySelectorAll('.timeline-station-card');
    let nearestIdx = 0;
    let minDiff = Infinity;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const diff = Math.abs(center - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIdx = i;
      }
    });

    activeStationIdx = nearestIdx;
    const dots = routeDots.querySelectorAll('.station-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === nearestIdx);
    });
  }

  function open(targetStarId = null) {
    isOpen = true;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    if (targetStarId) {
      const targetIdx = stars.findIndex(s => s.id === targetStarId);
      if (targetIdx !== -1) {
        setTimeout(() => scrollToStation(targetIdx), 150);
        return;
      }
    }
    setTimeout(() => scrollToStation(0), 100);
  }

  function close() {
    isOpen = false;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  return { init, open, close, scrollToStation };
})();

document.addEventListener('DOMContentLoaded', () => {
  TravelTimeline.init();
});
