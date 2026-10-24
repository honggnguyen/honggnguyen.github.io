/* Trình quản lý Thẻ Ký Ức Bí Mật (Secret Easter Egg Card) khi bắt trúng Sao Băng Ký Ức */
const MemoryModal = (() => {
  const $ = id => document.getElementById(id);
  const modal = $('memoryModal');
  let memories = [];
  let lastIdx = -1;
  let isOpen = false;

  async function init() {
    try {
      const res = await fetch('data/memories.json');
      if (res.ok) {
        memories = await res.json();
      }
    } catch (e) {
      console.warn('Could not load memories.json', e);
    }

    $('closeMemory').addEventListener('click', close);
    $('closeMemory2').addEventListener('click', close);
    modal.addEventListener('click', e => {
      if (e.target === modal) close();
    });
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  function openRandom() {
    if (!memories.length) return;
    let idx;
    do {
      idx = Math.floor(Math.random() * memories.length);
    } while (memories.length > 1 && idx === lastIdx);
    lastIdx = idx;
    show(memories[idx]);
  }

  function show(item) {
    if (!item) return;
    isOpen = true;

    $('memBadge').textContent = item.badge || '✦ Ký Ức Bí Mật · Sao Băng';
    $('memTitle').textContent = item.title;
    $('memDate').textContent = item.date || '';

    const polaroid = $('memPolaroid');
    if (item.image) {
      $('memImg').src = item.image;
      $('memCaption').textContent = item.caption || '';
      polaroid.style.display = 'block';
    } else {
      polaroid.style.display = 'none';
    }

    const contentBox = $('memContent');
    contentBox.innerHTML = '';
    const paragraphs = item.content.split('\n\n');
    paragraphs.forEach(para => {
      const p = document.createElement('p');
      p.innerHTML = para.replace(/\n/g, '<br>');
      contentBox.appendChild(p);
    });

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    const card = modal.querySelector('.card.memory-card') || modal.querySelector('.card');
    if (card) {
      card.scrollTop = 0;
    }
  }

  function close() {
    isOpen = false;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Hiệu ứng pháo sáng bụi sao (Star Dust Burst) khi click trúng sao băng
  function spawnSparkleBurst(x, y) {
    const burst = document.createElement('div');
    burst.className = 'sparkle-burst';
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';

    const count = 14;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'sparkle-particle';
      const rad = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const dist = 35 + Math.random() * 45;
      p.style.setProperty('--tx', Math.cos(rad) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(rad) * dist + 'px');
      burst.appendChild(p);
    }

    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 1200);
  }

  return { init, openRandom, show, close, spawnSparkleBurst };
})();

document.addEventListener('DOMContentLoaded', () => {
  MemoryModal.init();
});
