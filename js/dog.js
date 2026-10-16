/* Chú chó Great Pyrenees đi dạo dọc đáy màn hình thiên hà khi bấm vào hình ở góc trái */
const WalkDog = (() => {
  const $ = id => document.getElementById(id);
  const FRAMES = [1, 2, 3, 4, 5, 6, 7, 8].map(i => `assets/img/dog_walk${i}.webp`);
  const FRAME_MS = 105, SPEED = 80;          // px / giây
  let dog, img, galaxy, mascot;
  let on = false, x = 0, dir = 1, target = 0, pauseUntil = 0;
  let frame = 0, lastFrame = 0, last = 0, raf = 0;

  function init() {
    dog = $('walkDog'); img = $('walkDogImg'); galaxy = $('galaxy'); mascot = $('mascot');
    if (!dog || !mascot) return;
    FRAMES.forEach(src => { const i = new Image(); i.src = src; });   // nạp sẵn cho mượt
    mascot.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  }

  const width = () => dog.offsetWidth || 200;
  const maxX = () => Math.max(0, innerWidth - width());

  function pickTarget() {
    target = Math.random() * maxX();
    if (Math.abs(target - x) < 120) target = Math.min(maxX(), Math.max(0, x + (Math.random() < .5 ? -1 : 1) * 300));
    dir = target >= x ? 1 : -1;
  }

  function toggle() {
    on = !on;
    mascot.classList.toggle('dog-out', on);
    if (on) {
      const r = mascot.getBoundingClientRect();
      x = Math.max(0, Math.min(maxX(), r.left));
      dog.classList.add('show');
      pickTarget(); last = performance.now();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    } else {
      dog.classList.remove('show');
    }
  }

  function tick(now) {
    if (!on) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!galaxy.classList.contains('active') || document.hidden) return;

    if (now < pauseUntil) {                       // đứng nghỉ, thở nhẹ
      img.src = FRAMES[0];
    } else {
      x += dir * SPEED * dt;
      if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) {
        x = Math.max(0, Math.min(maxX(), x));
        if (Math.random() < .6) pauseUntil = now + 1500 + Math.random() * 2500;
        pickTarget();
      }
      if (now - lastFrame > FRAME_MS) {
        frame = (frame + 1) % FRAMES.length; img.src = FRAMES[frame]; lastFrame = now;
      }
    }
    // ảnh gốc quay mặt sang phải → lật khi đi sang trái
    dog.style.transform = `translate3d(${x}px,0,0)`;
    img.style.transform = dir < 0 ? 'scaleX(-1)' : 'none';
  }

  return { init, toggle };
})();
window.WalkDog = WalkDog;
document.addEventListener('DOMContentLoaded', () => WalkDog.init());
