/* Hệ thống sao băng nâng cao:
   - Sao băng thông thường với tần suất cao.
   - Sao băng siêu to (Giant Fireball / Bolide) phát sáng rực rỡ và bay dài.
   - Trận mưa sao băng (Meteor Storm) dồn dập sau mỗi chu kỳ ngẫu nhiên.
*/
function startShooting(container, opts = {}) {
  const { minGap = 600, maxGap = 1800, len = 150, dist = 480, angle = 28, area = [0, 0, 1, 0.55] } = opts;

  function createMeteor(isGiant = false, offsetAngle = 0, delay = 0, scaleMult = 1) {
    if (!container.isConnected || document.hidden) return;
    const r = container.getBoundingClientRect();
    if (r.width <= 0) return;

    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'shoot' + (isGiant ? ' giant' : '');
      const scale = Math.min(1, r.width / 700) * scaleMult;

      const meteorLen = isGiant
        ? (340 + Math.random() * 120) * Math.max(scale, .6)
        : (len + (Math.random() * 60 - 30)) * Math.max(scale, .45);

      const meteorDist = isGiant
        ? (dist * 1.8 + Math.random() * 200) * Math.max(scale, .6)
        : (dist * (0.85 + Math.random() * 0.35)) * Math.max(scale, .5);

      const meteorDur = isGiant
        ? (1.2 + Math.random() * 0.5)
        : (0.7 + Math.random() * 0.45);

      el.style.width = meteorLen + 'px';
      el.style.left = (r.width * (area[0] + Math.random() * (area[2] - area[0]))) + 'px';
      el.style.top = (r.height * (area[1] + Math.random() * (area[3] - area[1]))) + 'px';
      el.style.setProperty('--ang', (angle + offsetAngle + (Math.random() * 10 - 5)) + 'deg');
      el.style.setProperty('--dist', meteorDist + 'px');
      el.style.setProperty('--dur', meteorDur + 's');

      container.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, delay);
  }

  // Vòng lặp bắn sao băng thường & kiểm tra sao băng siêu to
  function spawn() {
    if (!container.isConnected) return;

    // 12% khả năng xuất hiện sao băng siêu to rực rỡ
    const isGiant = Math.random() < 0.12;
    createMeteor(isGiant);

    // 28% khả năng xuất hiện sao băng đôi
    if (!isGiant && Math.random() < 0.28) {
      createMeteor(false, Math.random() * 6 - 3, 100 + Math.random() * 180, 0.85);
    }

    setTimeout(spawn, minGap + Math.random() * (maxGap - minGap));
  }

  // Trận mưa sao băng (Meteor Storm): một đàn sao băng 7 - 12 vệt lao qua bầu trời
  function meteorStorm() {
    if (!container.isConnected || document.hidden) {
      setTimeout(meteorStorm, 20000);
      return;
    }
    const count = 7 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const delay = i * (140 + Math.random() * 180);
      const isG = i === Math.floor(count / 2) && Math.random() < 0.4;
      createMeteor(isG, Math.random() * 12 - 6, delay, 0.8 + Math.random() * 0.4);
    }
    // Lặp lại trận mưa sao băng sau 18 - 35 giây
    setTimeout(meteorStorm, 18000 + Math.random() * 17000);
  }

  // Sao băng Ký Ức (Secret Memory Shooting Star): xuất hiện định kỳ mỗi 30-45 giây
  function createMemoryMeteor() {
    if (!container.isConnected || document.hidden) return;
    const r = container.getBoundingClientRect();
    if (r.width <= 0) return;

    const el = document.createElement('div');
    el.className = 'shoot memory-star';
    const scale = Math.min(1, r.width / 700);

    const meteorLen = (280 + Math.random() * 80) * Math.max(scale, 0.65);
    const meteorDist = (dist * 1.5 + Math.random() * 140) * Math.max(scale, 0.65);
    const meteorDur = 2.8 + Math.random() * 0.7; // Tốc độ 2.8s - 3.5s để người đọc dễ dàng bấm trúng

    el.style.width = meteorLen + 'px';
    el.style.left = (r.width * (0.08 + Math.random() * 0.55)) + 'px';
    el.style.top = (r.height * (0.06 + Math.random() * 0.40)) + 'px';
    el.style.setProperty('--ang', (angle + (Math.random() * 8 - 4)) + 'deg');
    el.style.setProperty('--dist', meteorDist + 'px');
    el.style.setProperty('--dur', meteorDur + 's');

    // Nhãn gọi ý tương tác (Call to action)
    const tip = document.createElement('span');
    tip.className = 'memory-star-tip';
    tip.textContent = '✦ Bắt lấy sao! ✦';
    el.appendChild(tip);

    // Xử lý bắt trúng sao băng ký ức
    let caught = false;
    const onCatch = (e) => {
      if (caught) return;
      caught = true;
      e.stopPropagation();
      e.preventDefault();

      const cx = e.clientX || (r.left + parseFloat(el.style.left));
      const cy = e.clientY || (r.top + parseFloat(el.style.top));

      // Hiệu ứng pháo sáng bụi sao & mở thẻ ký ức
      if (window.MemoryModal) {
        MemoryModal.spawnSparkleBurst(cx, cy);
        MemoryModal.openRandom();
      }
      if (window.Ambience && Ambience.playChime) {
        Ambience.playChime();
      }

      el.classList.add('caught');
      setTimeout(() => el.remove(), 180);
    };

    el.addEventListener('pointerdown', onCatch);
    container.appendChild(el);
    el.addEventListener('animationend', () => { if (!caught) el.remove(); });
  }

  function scheduleMemoryStar() {
    if (container.id !== 'galaxyShoot') return;
    setTimeout(() => {
      createMemoryMeteor();
      scheduleMemoryStar();
    }, 28000 + Math.random() * 16000); // 28 - 44 giây
  }

  setTimeout(spawn, 800 + Math.random() * 1000);
  setTimeout(meteorStorm, 10000 + Math.random() * 8000);
  if (container.id === 'galaxyShoot') {
    setTimeout(createMemoryMeteor, 9000); // Lần đầu xuất hiện sớm sau 9s để người dùng dễ thử nghiệm
    scheduleMemoryStar();
  }
}
