/* Hệ thống âm nhạc thiên hà mở (Celestial Ambient Sound System)
   - Tự do, không giới hạn 12 cung hoàng đạo.
   - Hỗ trợ thêm file nhạc riêng (.mp3) vào assets/audio/ tùy ý.
*/
const Ambience = (() => {
  const DEFAULT_SYNTH = [
    { chords: [[261.63, 329.63, 392.00, 523.25], [293.66, 369.99, 440.00, 587.33], [220.00, 277.18, 329.63, 440.00]], penta: [523.25, 659.25, 783.99, 880.00, 1046.50], padType: 'triangle', filterFreq: 1100, tempo: 4800 },
    { chords: [[174.61, 220.00, 261.63, 329.63], [220.00, 261.63, 329.63, 392.00], [196.00, 246.94, 293.66, 392.00]], penta: [440.00, 523.25, 587.33, 659.25, 783.99], padType: 'sine', filterFreq: 750, tempo: 6000 },
    { chords: [[220.00, 261.63, 329.63, 392.00], [246.94, 293.66, 369.99, 440.00], [261.63, 329.63, 392.00, 493.88]], penta: [587.33, 659.25, 739.99, 880.00, 1174.66], padType: 'triangle', filterFreq: 1250, tempo: 4400 },
    { chords: [[220.00, 261.63, 329.63, 392.00], [174.61, 220.00, 261.63, 349.23], [164.81, 196.00, 246.94, 329.63]], penta: [523.25, 587.33, 659.25, 783.99, 880.00], padType: 'sine', filterFreq: 680, tempo: 6800 },
    { chords: [[261.63, 329.63, 392.00, 493.88], [329.63, 392.00, 493.88, 587.33], [220.00, 277.18, 329.63, 440.00]], penta: [659.25, 783.99, 987.77, 1046.50, 1318.51], padType: 'triangle', filterFreq: 1400, tempo: 5000 },
    { chords: [[130.81, 164.81, 196.00, 246.94], [164.81, 196.00, 246.94, 293.66], [146.83, 174.61, 220.00, 261.63]], penta: [392.00, 440.00, 493.88, 587.33, 659.25], padType: 'sine', filterFreq: 600, tempo: 7000 }
  ];

  let TRACKS = [
    { id: 'track_1', title: 'Nguyện Cầu Dưới Sao', mood: 'Ambient · Êm dịu', ...DEFAULT_SYNTH[0] },
    { id: 'track_2', title: 'Đêm Thung Lũng Mù Sương', mood: 'Acoustic · Bình yên', ...DEFAULT_SYNTH[1] },
    { id: 'track_3', title: 'Gió Nguyện Cầu', mood: 'Chuông gió · Bay bổng', ...DEFAULT_SYNTH[2] },
    { id: 'track_4', title: 'Ánh Trăng Mặt Hồ', mood: 'Lullaby · Dịu ngọt', ...DEFAULT_SYNTH[3] },
    { id: 'track_5', title: 'Bình Minh Tinh Cầu', mood: 'Hào quang · Tươi sáng', ...DEFAULT_SYNTH[4] }
  ];

  let ctx, master, padTimer, bellTimer, started = false, muted = false, fileAudio = null;
  let currentTrackIdx = 0;
  let step = 0;
  let listeners = [];

  async function loadPlaylist() {
    try {
      const res = await fetch('data/playlist.json?v=' + Date.now());
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          TRACKS = list.map((t, i) => {
            const synth = DEFAULT_SYNTH[i % DEFAULT_SYNTH.length];
            return { ...synth, ...t };
          });
          if (currentTrackIdx >= TRACKS.length) currentTrackIdx = 0;
          notify();
          if (window.ZodiacPlayer && typeof window.ZodiacPlayer.rebuild === 'function') {
            window.ZodiacPlayer.rebuild();
          }
        }
      }
    } catch (e) {
      console.warn('Could not load custom playlist.json, using default.', e);
    }
  }

  // Auto load playlist on script load
  loadPlaylist();

  function pad(freqs, t, dur, type, filterFreq) {
    if (!ctx || muted) return;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = type === 'sawtooth' ? (i === 0 ? 'sawtooth' : 'sine') : (i % 2 ? 'triangle' : 'sine');
      o.frequency.value = f; o.detune.value = (Math.random() - .5) * 8;
      lp.type = 'lowpass'; lp.frequency.value = filterFreq || 900;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.045, t + dur * .35);
      g.gain.linearRampToValueAtTime(0, t + dur + 1.2);
      o.connect(lp); lp.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 1.3);
    });
  }

  function bell(t, penta) {
    if (!ctx || muted || !penta) return;
    const f = penta[Math.floor(Math.random() * penta.length)];
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.055, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + 2.6);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 2.8);
  }

  function wind() {
    if (!ctx) return;
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = .6;
    const g = ctx.createGain(); g.gain.value = .015;
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = .08; lg.gain.value = .01; lfo.connect(lg); lg.connect(g.gain); lfo.start();
    src.connect(bp); bp.connect(g); g.connect(master); src.start();
  }

  function tick() {
    if (!started || muted || fileAudio) return;
    const t = TRACKS[currentTrackIdx];
    if (!t || !t.chords) return;
    const time = ctx.currentTime + .05;
    pad(t.chords[step++ % t.chords.length], time, t.tempo / 1000, t.padType, t.filterFreq);
  }

  function scheduleBells() {
    if (!started) return;
    const t = TRACKS[currentTrackIdx];
    if (t && !muted && !fileAudio) bell(ctx.currentTime + .05, t.penta);
    bellTimer = setTimeout(scheduleBells, 1600 + Math.random() * 3200);
  }

  async function checkCustomTrack(idx) {
    const t = TRACKS[idx];
    if (!t) return null;
    if (t.src) return encodeURI(t.src);
    const paths = [`assets/audio/${t.id}.mp3`, `assets/audio/track_${idx + 1}.mp3`, `assets/audio/${idx + 1}.mp3`];
    for (const p of paths) {
      try {
        const r = await fetch(p, { method: 'HEAD' });
        if (r.ok) return encodeURI(p);
      } catch (e) {}
    }
    return null;
  }

  let isShuffle = false;
  let isRepeat = 'all'; // 'all' (lặp danh sách), 'one' (lặp 1 bài), false (không lặp)
  let trackTimer = null;

  function handleTrackEnd() {
    if (isRepeat === 'one') {
      setTrack(currentTrackIdx);
    } else if (isShuffle) {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * TRACKS.length);
      } while (TRACKS.length > 1 && nextIdx === currentTrackIdx);
      setTrack(nextIdx);
    } else {
      if (!isRepeat && currentTrackIdx === TRACKS.length - 1) {
        return; // Hết danh sách và không lặp
      }
      setTrack((currentTrackIdx + 1) % TRACKS.length);
    }
  }

  async function setTrack(idx) {
    currentTrackIdx = (idx + TRACKS.length) % TRACKS.length;
    step = 0;
    if (trackTimer) clearTimeout(trackTimer);
    if (fileAudio) {
      fileAudio.pause();
      fileAudio = null;
    }
    const custom = await checkCustomTrack(currentTrackIdx);
    if (custom) {
      fileAudio = new Audio(custom);
      fileAudio.loop = (isRepeat === 'one');
      fileAudio.volume = muted ? 0 : .6;
      fileAudio.onended = () => { handleTrackEnd(); };
      if (started && !muted) fileAudio.play();
    } else {
      if (padTimer) clearInterval(padTimer);
      const t = TRACKS[currentTrackIdx];
      tick();
      padTimer = setInterval(tick, t.tempo);

      // Tự động chuyển bài mượt mà sau ~2.5 phút nghe để việc đọc thơ/nhật ký luôn liền mạch
      trackTimer = setTimeout(() => {
        if (started && !muted) handleTrackEnd();
      }, 150000);
    }
    notify();
  }

  async function start() {
    if (started) return;
    started = true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(muted ? 0 : .9, ctx.currentTime + 3);
    wind();
    await setTrack(currentTrackIdx);
    scheduleBells();
  }

  function toggle() {
    muted = !muted;
    if (fileAudio) {
      muted ? fileAudio.pause() : fileAudio.play();
    } else if (master && ctx) {
      master.gain.linearRampToValueAtTime(muted ? 0 : .9, ctx.currentTime + .5);
    }
    notify();
    return muted;
  }

  function next() {
    if (isShuffle) {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * TRACKS.length);
      } while (TRACKS.length > 1 && nextIdx === currentTrackIdx);
      setTrack(nextIdx);
    } else {
      setTrack((currentTrackIdx + 1) % TRACKS.length);
    }
  }

  function prev() {
    setTrack((currentTrackIdx - 1 + TRACKS.length) % TRACKS.length);
  }

  function toggleShuffle() {
    isShuffle = !isShuffle;
    notify();
    return isShuffle;
  }

  function toggleRepeat() {
    // Luân chuyển: 'all' -> 'one' -> false -> 'all'
    if (isRepeat === 'all') isRepeat = 'one';
    else if (isRepeat === 'one') isRepeat = false;
    else isRepeat = 'all';

    if (fileAudio) {
      fileAudio.loop = (isRepeat === 'one');
    }
    notify();
    return isRepeat;
  }

  function subscribe(fn) { listeners.push(fn); fn(getState()); }
  function notify() { const s = getState(); listeners.forEach(fn => fn(s)); }
  function getState() {
    return {
      started,
      muted,
      currentIdx: currentTrackIdx,
      currentTrack: TRACKS[currentTrackIdx],
      tracks: TRACKS,
      isShuffle,
      isRepeat
    };
  }

  function playChime() {
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((f, i) => {
      const t = ctx.currentTime + i * 0.07;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 2.0);
    });
  }

  return {
    start,
    toggle,
    next,
    prev,
    toggleShuffle,
    toggleRepeat,
    setTrack,
    playChime,
    subscribe,
    getState,
    get muted() { return muted; },
    get currentTrack() { return TRACKS[currentTrackIdx]; },
    get tracks() { return TRACKS; },
    loadPlaylist
  };
})();
