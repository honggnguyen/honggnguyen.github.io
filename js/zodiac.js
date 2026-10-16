/* Trình phát nhạc Danh sách Cuộn Mở (Open Scrollable Music Playlist) */
const ZodiacPlayer = (() => {
  const $ = id => document.getElementById(id);
  const modal = $('musicModal');
  const scrollList = $('playlistScroll');
  const mascot = $('mascot');
  let open = false;

  function init() {
    buildPlaylist();
    $('musicBtn').addEventListener('click', e => {
      e.stopPropagation();
      toggleModal();
    });
    $('closeMusic').addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) closeModal();
    });

    $('npPlayBtn').addEventListener('click', () => {
      Ambience.toggle();
    });

    $('npPrev').addEventListener('click', () => {
      Ambience.prev();
    });

    $('npNext').addEventListener('click', () => {
      Ambience.next();
    });

    $('npShuffle').addEventListener('click', () => {
      Ambience.toggleShuffle();
    });

    $('npRepeat').addEventListener('click', () => {
      Ambience.toggleRepeat();
    });

    Ambience.subscribe(updateUI);
  }

  function buildPlaylist() {
    const tracks = Ambience.tracks;
    scrollList.innerHTML = '';

    tracks.forEach((t, i) => {
      const item = document.createElement('div');
      item.className = 'track-item';
      item.dataset.idx = i;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `${t.title} - ${t.mood}`);

      item.innerHTML = `
        <div class="track-left">
          <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="track-icon">♪</span>
          <div class="track-meta">
            <h4 class="track-title">${t.title}</h4>
            <span class="track-dates">${t.mood}</span>
          </div>
        </div>
        <div class="track-right">
          <div class="track-eq"><span></span><span></span><span></span></div>
          <span class="track-badge">Chọn phát</span>
        </div>
      `;

      const playTrack = async () => {
        Ambience.start();
        await Ambience.setTrack(i);
        if (Ambience.muted) Ambience.toggle();
      };

      item.addEventListener('click', playTrack);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playTrack();
        }
      });

      scrollList.appendChild(item);
    });
  }

  function updateUI(state) {
    const { muted, currentIdx, currentTrack, isShuffle, isRepeat } = state;
    mascot.classList.toggle('muted', muted);

    const items = scrollList.querySelectorAll('.track-item');
    items.forEach(it => {
      const isCur = +it.dataset.idx === currentIdx;
      it.classList.toggle('active', isCur);
      it.classList.toggle('playing', isCur && !muted);
      const badge = it.querySelector('.track-badge');
      if (badge) badge.textContent = isCur ? (muted ? 'Tạm dừng' : 'Đang phát ♪') : 'Chọn phát';
    });

    $('npSymbol').textContent = '♪';
    $('npTitle').textContent = currentTrack.title;
    $('npSub').textContent = currentTrack.mood;
    $('npPlayBtn').textContent = muted ? '▶ Tiếp tục phát' : '❚❚ Tạm dừng';
    $('npPlayBtn').classList.toggle('paused', muted);

    // Cập nhật trạng thái Shuffle (Phát ngẫu nhiên)
    const shuffleBtn = $('npShuffle');
    shuffleBtn.classList.toggle('active', !!isShuffle);
    shuffleBtn.title = isShuffle ? 'Đang phát ngẫu nhiên (Click để tắt)' : 'Bật phát ngẫu nhiên (Shuffle)';

    // Cập nhật trạng thái Repeat (Lặp bài)
    const repeatBtn = $('npRepeat');
    repeatBtn.classList.toggle('active', !!isRepeat);
    repeatBtn.textContent = isRepeat === 'one' ? '🔂' : '🔁';
    repeatBtn.title = isRepeat === 'one'
      ? 'Đang lặp 1 bài (Click để tắt)'
      : (isRepeat === 'all' ? 'Đang lặp toàn bộ danh sách (Click để lặp 1 bài)' : 'Bật lặp lại (Repeat)');
  }

  function toggleModal() {
    open ? closeModal() : openModal();
  }

  function openModal() {
    open = true;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    const activeItem = scrollList.querySelector('.track-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function closeModal() {
    open = false;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  return { init, openModal, closeModal };
})();
