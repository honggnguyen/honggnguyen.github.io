/* ==========================================================================
   CARTE (CALCIFER) - NGƯỜI GIỮ LỬA CỦA LÂU ĐÀI
   - Idle: 8 frame ngọn lửa bập bùng tự nhiên từ Flame_1_8.png (chu kỳ mượt 120ms).
   - Thức tỉnh: Mở mắt giật mình, vươn 2 tay reo vui, bung tia lửa và mở khung thoại.
   - Hội thoại: 16 biểu cảm nói chuyện, cười, giơ tay sinh động từ Flame_smile & Flame_smile2.
   - Khớp vòm đá: Căn chuẩn tâm cx=389px, rx=162px, xóa sạch ngọn lửa tĩnh của nền phòng.
   - Hạt tia lửa (Embers): Canvas hạt than hồng và bụi sao lửa bay lơ lửng tự nhiên.
   - Âm thanh lò sưởi: Bộ tổng hợp Web Audio tiếng lửa nổ lách tách và sound cues khi nói.
   - Cử chỉ sống động: Micro-breathing thở nhẹ và phản ứng khi hover/click trong lúc đọc.
   - Gõ chữ uyển chuyển: Hiệu ứng typewriter mượt mà với tính năng click để đọc nhanh.
   ========================================================================== */

const Calcifer = (() => {
  // 8 frames ngọn lửa bập bùng tự nhiên từ Flame_1_8.png
  const IDLE_FRAMES = [
    'assets/img/calcifer/flame_idle_1.webp?v=20261019a',
    'assets/img/calcifer/flame_idle_2.webp?v=20261019a',
    'assets/img/calcifer/flame_idle_3.webp?v=20261019a',
    'assets/img/calcifer/flame_idle_4.webp?v=20261019a',
    'assets/img/calcifer/flame_idle_5.webp?v=20261019a',
    'assets/img/calcifer/flame_idle_6.webp?v=20261019a',
    'assets/img/calcifer/flame_idle_7.webp?v=20261019a',
    'assets/img/calcifer/flame_idle_8.webp?v=20261019a'
  ];

  // 9 phân đoạn hội thoại với biểu cảm và cử chỉ tương ứng
  const DIALOGUE_PAGES = [
    {
      title: 'Xin chào bạn!',
      text: 'Chào bạn,\nMình là **Carte** — người giữ lửa và canh gác cho tòa lâu đài cùng với chú chó siêu to tên **Bond**.\n\nNhờ có mình mà lâu đài mới chuyển động và đi bất kì nơi nào mà cô chủ muốn.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_3.webp?v=20261019a', // giơ tay chào mừng
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_3.webp?v=20261019a',
        'assets/img/calcifer/calcifer_talk_6.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_talk_2.webp?v=20261019a'
    },
    {
      title: 'Cô chủ của Carte',
      text: 'Cô chủ của mình là một người thích khám phá, tò mò và cũng mơ mộng nữa.',
      mainFrame: 'assets/img/calcifer/calcifer_smile_1.webp?v=20261019a', // cười dịu dàng
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_1.webp?v=20261019a',
        'assets/img/calcifer/calcifer_talk_4.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_smile_5.webp?v=20261019a'
    },
    {
      title: 'Những cái tên gắn liền từng chặng đường',
      text: 'Mình có được nghe cô chủ kể trước kia cô có khá nhiều tên, mỗi cái tên gắn liền với một giai đoạn...\n\nHiện tại cô chủ mình chọn **Vivi** làm tên tiếng Việt cũng như bút danh cho việc viết, còn **Vivian** là tên tiếng Anh.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_6.webp?v=20261019a', // mở miệng kể chuyện
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_6.webp?v=20261019a',
        'assets/img/calcifer/calcifer_talk_7.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_talk_5.webp?v=20261019a'
    },
    {
      title: 'Đưa cô gần hơn tới các vì sao',
      text: 'Mình hay gọi cô là **Vivi** luôn cho gọn.\n\nVivi rất thích các chòm sao nên mình đã luôn phải cháy rực rỡ để đưa cô gần hơn tới các vì sao ✨ — một góc nhỏ ấm áp nơi cô có thể quan sát, nhìn ngắm, chiêm nghiệm về những điều cô đọc được, cô đi qua hay những sáng tác của cô.',
      mainFrame: 'assets/img/calcifer/calcifer_smile_6.webp?v=20261019a', // giơ tay nhiệt huyết
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_6.webp?v=20261019a',
        'assets/img/calcifer/calcifer_talk_3.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_smile_7.webp?v=20261019a'
    },
    {
      title: 'Những khoảng ở giữa...',
      text: 'Vivi vừa hiền lành cũng vừa ghê gớm, vừa sâu sắc vừa vô tri, vừa chăm chỉ cũng vừa lười biếng, vừa thích đi nhưng cũng lười đi... 😊\n\nCô là sự kết hợp của nhiều khoảng ở giữa…',
      mainFrame: 'assets/img/calcifer/calcifer_smile_2.webp?v=20261019a', // cười tít mắt `> <`
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_2.webp?v=20261019a',
        'assets/img/calcifer/calcifer_smile_5.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_smile_4.webp?v=20261019a'
    },
    {
      title: 'Tình yêu dành cho nghệ thuật',
      text: 'Nhưng có lẽ điều mà cô luôn thích đó là **nghệ thuật**.\n\nCô thích khám phá về thế giới, thích ghi lại những chiêm nghiệm về cuộc đời.',
      mainFrame: 'assets/img/calcifer/calcifer_smile_5.webp?v=20261019a', // nụ cười điềm đạm
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_5.webp?v=20261019a',
        'assets/img/calcifer/calcifer_talk_4.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_smile_1.webp?v=20261019a'
    },
    {
      title: 'Phương châm viết của Vivi',
      text: 'Vivi hay nói với mình là cô:\n\n🔥 **« VIẾT ĐỂ KHÔNG QUÊN »** 🔥',
      mainFrame: 'assets/img/calcifer/calcifer_talk_8.webp?v=20261019a', // cười lớn vui vẻ
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_8.webp?v=20261019a',
        'assets/img/calcifer/calcifer_smile_8.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_talk_3.webp?v=20261019a'
    },
    {
      title: 'Những dấu chân con chữ',
      text: 'Vậy nên…\n\nNhiều khi các bài viết hay các sáng tác có thể như là một dấu chân cô đã đi và muốn lưu dấu thông qua vài con chữ lộn xộn.',
      mainFrame: 'assets/img/calcifer/calcifer_smile_7.webp?v=20261019a', // nụ cười rạng rỡ
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_7.webp?v=20261019a',
        'assets/img/calcifer/calcifer_talk_5.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_smile_1.webp?v=20261019a'
    },
    {
      title: 'Chinh phục những chân trời mới',
      text: 'Chẳng xô bồ hay cũng chẳng cần trau chuốt để ngóng chờ một chàng hoàng tử của đời.\n\nCác con chữ chỉ đơn giản vẫn ở đó và lớn dần từng ngày để tự chinh phục những điều thú vị tiếp theo. ✨',
      mainFrame: 'assets/img/calcifer/calcifer_smile_3.webp?v=20261019a', // giơ 2 tay hạnh phúc
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_3.webp?v=20261019a',
        'assets/img/calcifer/calcifer_talk_3.webp?v=20261019a'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_smile_6.webp?v=20261019a'
    }
  ];

  // DOM Elements
  let flameEl = null;
  let containerEl = null;
  let dialogEl = null;
  let titleEl = null;
  let textEl = null;
  let counterEl = null;
  let dotsEl = null;
  let prevBtn = null;
  let nextBtn = null;
  let closeBtn = null;
  let soundBtn = null;
  let embersCanvas = null;

  // State
  let idleTimer = null;
  let idleFrameIdx = 0;
  let isAwake = false;
  let currentPage = 0;
  let talkingInterval = null;
  let livingBreathTimer = null;
  let typingTimer = null;
  let isTyping = false;
  let currentRawText = '';

  // ==========================================================================
  // HỆ THỐNG ÂM THANH LÒ SƯỞI & SFX (WEB AUDIO API TỔNG HỢP PROCEDURAL)
  // ==========================================================================
  const CalciferAudio = (() => {
    let ctx = null;
    let masterGain = null;
    let crackleGain = null;
    let crackleTimer = null;
    let isFireSoundEnabled = true;
    let noiseBuffer = null;
    let noiseNode = null;
    let noiseFilter = null;

    function getAudioContext() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.22;
        masterGain.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      return ctx;
    }

    // Tạo bộ đệm tiếng rít hồng (pink noise) cho ngọn lửa
    function createPinkNoiseBuffer(c) {
      const bufferSize = c.sampleRate * 2.5;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }
      return buffer;
    }

    // Khởi động tiếng lửa bập bùng nổ lách tách ấm áp
    function startFireCrackle() {
      const c = getAudioContext();
      if (!c || !isFireSoundEnabled) return;

      if (!noiseBuffer) {
        noiseBuffer = createPinkNoiseBuffer(c);
      }

      if (!noiseNode) {
        noiseNode = c.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        noiseFilter = c.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 850;

        crackleGain = c.createGain();
        crackleGain.gain.setValueAtTime(0.001, c.currentTime);
        crackleGain.gain.linearRampToValueAtTime(0.16, c.currentTime + 1.2);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(crackleGain);
        crackleGain.connect(masterGain);
        noiseNode.start();
      }

      // Vòng lặp bắn các tia than nổ tí tách ngẫu nhiên
      scheduleCrackles();
    }

    function scheduleCrackles() {
      if (crackleTimer) clearTimeout(crackleTimer);
      if (!isFireSoundEnabled || !noiseNode) return;

      playSingleCrackle();
      const nextDelay = 70 + Math.random() * 220;
      crackleTimer = setTimeout(scheduleCrackles, nextDelay);
    }

    function playSingleCrackle() {
      const c = getAudioContext();
      if (!c || !isFireSoundEnabled || !masterGain) return;

      const isDeepWood = Math.random() < 0.15;
      const osc = c.createOscillator();
      const gain = c.createGain();
      const filter = c.createBiquadFilter();

      const t = c.currentTime;
      if (isDeepWood) {
        // Tiếng gỗ nổ thục sâu
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + Math.random() * 180, t);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0.045, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        osc.stop(t + 0.045);
      } else {
        // Tiếng than hồng nổ lách tách giòn tan
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2200 + Math.random() * 2500, t);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2800 + Math.random() * 1200, t);
        filter.Q.value = 3.5;
        gain.gain.setValueAtTime(0.028, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
        osc.stop(t + 0.02);
      }

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
    }

    function stopFireCrackle() {
      if (crackleTimer) {
        clearTimeout(crackleTimer);
        crackleTimer = null;
      }
      if (crackleGain && ctx) {
        try {
          crackleGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            if (noiseNode) {
              try { noiseNode.stop(); } catch (e) {}
              noiseNode.disconnect();
              noiseNode = null;
            }
          }, 550);
        } catch (e) {}
      }
    }

    // Âm thanh bừng sáng khi thức tỉnh Carte
    function playAwakenSFX() {
      const c = getAudioContext();
      if (!c || !isFireSoundEnabled) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((f, i) => {
        const t = c.currentTime + i * 0.06;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.065, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        o.connect(g);
        g.connect(masterGain);
        o.start(t);
        o.stop(t + 0.75);
      });
    }

    // Tiếng spark nhỏ khi lật trang
    function playPageSFX() {
      const c = getAudioContext();
      if (!c || !isFireSoundEnabled) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(1318.51, t + 0.08);
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g);
      g.connect(masterGain);
      o.start(t);
      o.stop(t + 0.22);
    }

    // Tiếng ru nhẹ nhàng khi Carte nhắm mắt ngủ
    function playDismissSFX() {
      const c = getAudioContext();
      if (!c || !isFireSoundEnabled) return;
      const notes = [1046.50, 783.99, 523.25];
      notes.forEach((f, i) => {
        const t = c.currentTime + i * 0.1;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.045, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(g);
        g.connect(masterGain);
        o.start(t);
        o.stop(t + 0.65);
      });
    }

    function toggleSound() {
      isFireSoundEnabled = !isFireSoundEnabled;
      if (isFireSoundEnabled) {
        startFireCrackle();
      } else {
        stopFireCrackle();
      }
      return isFireSoundEnabled;
    }

    return {
      startFireCrackle,
      stopFireCrackle,
      playAwakenSFX,
      playPageSFX,
      playDismissSFX,
      toggleSound,
      isEnabled: () => isFireSoundEnabled
    };
  })();

  // ==========================================================================
  // HỆ THỐNG HẠT TIA LỬA BAY (FLOATING EMBERS CANVAS)
  // ==========================================================================
  const CalciferEmbers = (() => {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let isRunning = false;
    let animId = null;

    const COLORS = [
      '#ffe58f', '#ffc069', '#ffa940', '#fa8c16', '#fa541c', '#ff7a45'
    ];

    class Ember {
      constructor(isBurst = false) {
        this.reset(isBurst);
      }

      reset(isBurst = false) {
        if (!canvas) return;
        const w = canvas.width;
        const h = canvas.height;

        // Điểm xuất phát ở lòng lò sưởi
        const cx = w * 0.52;
        const cy = h * 0.72;

        if (isBurst) {
          this.x = cx + (Math.random() - 0.5) * 40;
          this.y = cy + (Math.random() - 0.5) * 30;
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.2 + Math.random() * 2.8;
          this.vx = Math.cos(angle) * spd;
          this.vy = Math.sin(angle) * spd - 0.8;
          this.radius = 1.6 + Math.random() * 2.0;
          this.maxLife = 35 + Math.random() * 45;
        } else {
          this.x = cx + (Math.random() - 0.5) * 90;
          this.y = cy + Math.random() * 30;
          this.vx = (Math.random() - 0.5) * 0.55;
          this.vy = - (0.6 + Math.random() * 1.3);
          this.radius = 1.2 + Math.random() * 1.8;
          this.maxLife = 70 + Math.random() * 90;
        }

        this.life = 0;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.wobbleSpeed = 0.04 + Math.random() * 0.05;
        this.wobbleAmp = 0.35 + Math.random() * 0.45;
      }

      update() {
        this.life++;
        this.x += this.vx + Math.sin(this.life * this.wobbleSpeed) * this.wobbleAmp;
        this.y += this.vy;
        this.vy *= 0.99; // Lực cản không khí nhẹ
        return this.life <= this.maxLife;
      }

      draw(c) {
        const progress = this.life / this.maxLife;
        const alpha = Math.sin(progress * Math.PI) * (1 - progress * 0.3);
        if (alpha <= 0.01) return;

        c.save();
        c.globalAlpha = Math.max(0, Math.min(1, alpha));
        c.fillStyle = this.color;
        c.shadowColor = this.color;
        c.shadowBlur = 6;
        c.beginPath();
        c.arc(this.x, this.y, this.radius * (1 - progress * 0.3), 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    function init(canvasEl) {
      if (!canvasEl) return;
      canvas = canvasEl;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      start();
    }

    function resize() {
      if (!canvas || !containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }

    function burst(count = 16) {
      if (!canvas) return;
      for (let i = 0; i < count; i++) {
        particles.push(new Ember(true));
      }
    }

    function loop() {
      if (!isRunning || !ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Mục tiêu số lượng hạt: 12 khi idle, 30 khi Carte đang nói chuyện
      const targetCount = isAwake ? 28 : 12;
      while (particles.length < targetCount) {
        particles.push(new Ember(false));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.update()) {
          particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }

      animId = requestAnimationFrame(loop);
    }

    function start() {
      if (isRunning) return;
      isRunning = true;
      loop();
    }

    function stop() {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
    }

    return {
      init,
      burst,
      start,
      stop
    };
  })();

  // ==========================================================================
  // TIỀN TẢI HÌNH ẢNH (PRELOAD)
  // ==========================================================================
  function preloadImages() {
    const all = [
      ...IDLE_FRAMES,
      'assets/img/calcifer/calcifer_talk_1.webp?v=20261018s',
      'assets/img/calcifer/calcifer_talk_2.webp?v=20261018s',
      'assets/img/calcifer/calcifer_talk_3.webp?v=20261018s',
      'assets/img/calcifer/calcifer_talk_4.webp?v=20261018s',
      'assets/img/calcifer/calcifer_talk_5.webp?v=20261018s',
      'assets/img/calcifer/calcifer_talk_6.webp?v=20261018s',
      'assets/img/calcifer/calcifer_talk_7.webp?v=20261018s',
      'assets/img/calcifer/calcifer_talk_8.webp?v=20261018s',
      'assets/img/calcifer/calcifer_smile_1.webp?v=20261018s',
      'assets/img/calcifer/calcifer_smile_2.webp?v=20261018s',
      'assets/img/calcifer/calcifer_smile_3.webp?v=20261018s',
      'assets/img/calcifer/calcifer_smile_4.webp?v=20261018s',
      'assets/img/calcifer/calcifer_smile_5.webp?v=20261018s',
      'assets/img/calcifer/calcifer_smile_6.webp?v=20261018s',
      'assets/img/calcifer/calcifer_smile_7.webp?v=20261018s',
      'assets/img/calcifer/calcifer_smile_8.webp?v=20261018s'
    ];
    all.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  // Khởi động vòng lặp 8 frames lửa bập bùng tự nhiên (120ms/frame)
  function startIdleLoop() {
    stopIdleLoop();
    stopTalkingLoop();
    stopLivingBreath();
    isAwake = false;
    idleTimer = setInterval(() => {
      idleFrameIdx = (idleFrameIdx + 1) % IDLE_FRAMES.length;
      if (flameEl) {
        flameEl.src = IDLE_FRAMES[idleFrameIdx];
      }
    }, 120);
  }

  function stopIdleLoop() {
    if (idleTimer) {
      clearInterval(idleTimer);
      idleTimer = null;
    }
  }

  function stopTalkingLoop() {
    if (talkingInterval) {
      clearInterval(talkingInterval);
      talkingInterval = null;
    }
  }

  function stopLivingBreath() {
    if (livingBreathTimer) {
      clearTimeout(livingBreathTimer);
      livingBreathTimer = null;
    }
  }

  // Chuyển động miệng và ngọn lửa khi Carte nói
  function animateTalking(talkFrames, mainFrame, durationMs = 1400) {
    stopTalkingLoop();
    stopLivingBreath();

    if (!talkFrames || talkFrames.length === 0) {
      if (flameEl) flameEl.src = mainFrame;
      scheduleLivingBreath();
      return;
    }

    let idx = 0;
    talkingInterval = setInterval(() => {
      idx = (idx + 1) % talkFrames.length;
      if (flameEl) flameEl.src = talkFrames[idx];
    }, 190);

    setTimeout(() => {
      stopTalkingLoop();
      if (isAwake && flameEl) {
        flameEl.src = mainFrame;
        scheduleLivingBreath();
      }
    }, durationMs);
  }

  // Cử chỉ thở nhẹ và chớp mắt sống động khi người dùng đang đọc truyện
  function scheduleLivingBreath() {
    stopLivingBreath();
    if (!isAwake) return;

    const page = DIALOGUE_PAGES[currentPage];
    if (!page) return;

    const delay = 2400 + Math.random() * 1600;
    livingBreathTimer = setTimeout(() => {
      if (!isAwake || talkingInterval) return;

      const alt = page.breatheFrame || page.talkFrames[0];
      if (flameEl && alt) {
        flameEl.src = alt;
        // Bắn vài hạt tia lửa nhỏ khi Carte lay động
        CalciferEmbers.burst(4);
      }

      setTimeout(() => {
        if (!isAwake || talkingInterval) return;
        if (flameEl) flameEl.src = page.mainFrame;
        scheduleLivingBreath();
      }, 340);
    }, delay);
  }

  function formatText(raw) {
    let esc = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    esc = esc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    esc = esc.replace(/\n\n/g, '</p><p>');
    esc = esc.replace(/\n/g, '<br>');
    return '<p>' + esc + '</p>';
  }

  // Hiệu ứng Typewriter mượt mà có hỗ trợ click để hiện ngay
  function typewriteText(rawText, onComplete) {
    if (typingTimer) clearTimeout(typingTimer);
    if (!textEl) return;

    isTyping = true;
    textEl.classList.add('is-typing');
    currentRawText = rawText;

    const formattedFull = formatText(rawText);
    let charIdx = 0;
    const len = rawText.length;

    function step() {
      charIdx += 2; // Tốc độ đọc êm đềm
      if (charIdx >= len) {
        finishTyping();
        if (typeof onComplete === 'function') onComplete();
        return;
      }
      const partial = rawText.slice(0, charIdx);
      textEl.innerHTML = formatText(partial);
      typingTimer = setTimeout(step, 24);
    }

    step();
  }

  function finishTyping() {
    if (typingTimer) clearTimeout(typingTimer);
    isTyping = false;
    if (textEl) {
      textEl.classList.remove('is-typing');
      textEl.innerHTML = formatText(currentRawText);
    }
  }

  function renderPage(pageIdx) {
    if (pageIdx < 0) pageIdx = 0;
    if (pageIdx >= DIALOGUE_PAGES.length) pageIdx = DIALOGUE_PAGES.length - 1;
    currentPage = pageIdx;

    const page = DIALOGUE_PAGES[currentPage];

    if (titleEl) titleEl.textContent = page.title;
    if (counterEl) {
      counterEl.textContent = `${currentPage + 1} / ${DIALOGUE_PAGES.length}`;
    }

    if (dotsEl) {
      dotsEl.innerHTML = '';
      for (let i = 0; i < DIALOGUE_PAGES.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'c-dot' + (i === currentPage ? ' active' : '');
        dot.title = `Trang ${i + 1}`;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          renderPage(i);
        });
        dotsEl.appendChild(dot);
      }
    }

    if (prevBtn) {
      prevBtn.disabled = currentPage === 0;
      prevBtn.style.opacity = currentPage === 0 ? '0.4' : '1';
    }
    if (nextBtn) {
      if (currentPage === DIALOGUE_PAGES.length - 1) {
        nextBtn.innerHTML = 'Hoàn tất ✨';
        nextBtn.classList.add('is-finish');
      } else {
        nextBtn.innerHTML = 'Tiếp tục ▸';
        nextBtn.classList.remove('is-finish');
      }
    }

    // Âm thanh và hiệu ứng hạt bừng sáng
    CalciferAudio.playPageSFX();
    CalciferEmbers.burst(10);

    // Bắt đầu nói và gõ chữ đồng thời
    animateTalking(page.talkFrames, page.mainFrame, 1600);
    typewriteText(page.text);
  }

  // Thức tỉnh khi chạm vào lò sưởi
  function awaken() {
    if (isAwake) {
      if (isTyping) {
        finishTyping();
      } else {
        nextPage();
      }
      return;
    }

    if (window.Ambience && typeof window.Ambience.start === 'function') {
      window.Ambience.start();
    }

    stopIdleLoop();
    isAwake = true;

    // Kích hoạt âm thanh lò sưởi và tiếng thức tỉnh
    CalciferAudio.startFireCrackle();
    CalciferAudio.playAwakenSFX();
    CalciferEmbers.burst(24);

    if (containerEl) {
      containerEl.classList.add('is-awake');
    }

    // Chuỗi thức tỉnh sống động:
    // 1. Nhắm mắt ngủ
    if (flameEl) {
      flameEl.src = 'assets/img/calcifer/calcifer_talk_1.webp?v=20261018s';
    }

    // 2. Mở to mắt giật mình 'O'
    setTimeout(() => {
      if (!isAwake) return;
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_2.webp?v=20261018s';
      CalciferEmbers.burst(8);
    }, 200);

    // 3. Giơ 2 tay lên reo chào mừng
    setTimeout(() => {
      if (!isAwake) return;
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_3.webp?v=20261018s';
      CalciferEmbers.burst(14);
    }, 450);

    // 4. Mở khung thoại tinh tế
    setTimeout(() => {
      if (!isAwake) return;
      if (dialogEl) {
        dialogEl.classList.add('active');
        dialogEl.setAttribute('aria-hidden', 'false');
      }
      renderPage(0);
    }, 720);
  }

  function nextPage() {
    if (isTyping) {
      finishTyping();
      return;
    }
    if (currentPage < DIALOGUE_PAGES.length - 1) {
      renderPage(currentPage + 1);
    } else {
      dismiss();
    }
  }

  function prevPage() {
    if (isTyping) {
      finishTyping();
    }
    if (currentPage > 0) {
      renderPage(currentPage - 1);
    }
  }

  // Kết thúc nói chuyện -> về lại ngọn lửa bập bùng tự nhiên
  function dismiss() {
    if (!isAwake) return;
    stopTalkingLoop();
    stopLivingBreath();
    finishTyping();

    CalciferAudio.playDismissSFX();
    CalciferEmbers.burst(12);

    if (dialogEl) {
      dialogEl.classList.remove('active');
      dialogEl.setAttribute('aria-hidden', 'true');
    }

    if (containerEl) {
      containerEl.classList.remove('is-awake');
    }

    // Mỉm cười chào rồi nhắm mắt quay lại ngọn lửa bình thường
    if (flameEl) {
      flameEl.src = 'assets/img/calcifer/calcifer_talk_4.webp?v=20261018s';
    }

    setTimeout(() => {
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_1.webp?v=20261018s';
    }, 400);

    setTimeout(() => {
      startIdleLoop();
    }, 800);
  }

  function init() {
    flameEl = document.getElementById('calciferFlame');
    containerEl = document.getElementById('calciferContainer');
    dialogEl = document.getElementById('calciferDialog');
    titleEl = document.getElementById('calciferTitle');
    textEl = document.getElementById('calciferText');
    counterEl = document.getElementById('calciferCounter');
    dotsEl = document.getElementById('calciferDots');
    prevBtn = document.getElementById('calciferPrev');
    nextBtn = document.getElementById('calciferNext');
    closeBtn = document.getElementById('calciferClose');
    soundBtn = document.getElementById('calciferSoundBtn');
    embersCanvas = document.getElementById('calciferEmbers');

    preloadImages();

    // Khởi tạo Canvas tia lửa bay
    if (embersCanvas) {
      CalciferEmbers.init(embersCanvas);
    }

    if (containerEl) {
      containerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        awaken();
      });

      // Phản ứng khi rê chuột vào Carte
      containerEl.addEventListener('mouseenter', () => {
        CalciferEmbers.burst(6);
      });

      containerEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          awaken();
        }
      });
    }

    // Click vào thân dialog để chuyển trang (tiện cho đọc truyện)
    if (dialogEl) {
      dialogEl.addEventListener('click', (e) => {
        // Tránh kích hoạt khi bấm trúng các nút bấm
        if (e.target.closest('button') || e.target.closest('.c-dot')) return;
        nextPage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextPage();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevPage();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      });
    }

    // Nút bật/tắt tiếng lửa
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const enabled = CalciferAudio.toggleSound();
        if (enabled) {
          soundBtn.classList.remove('is-muted');
          soundBtn.innerHTML = '🔥 Tiếng lửa';
        } else {
          soundBtn.classList.add('is-muted');
          soundBtn.innerHTML = '🔇 Tắt tiếng';
        }
      });
    }

    // Phím tắt bàn phím
    document.addEventListener('keydown', (e) => {
      if (!isAwake) return;

      if (e.key === 'Escape') {
        dismiss();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      }
    });

    // Tạm dừng âm thanh và particles khi chuyển cảnh
    const observer = new MutationObserver(() => {
      const intro = document.getElementById('intro');
      if (intro && (intro.classList.contains('gone') || intro.classList.contains('zooming'))) {
        CalciferAudio.stopFireCrackle();
        CalciferEmbers.stop();
      } else {
        CalciferEmbers.start();
      }
    });

    const intro = document.getElementById('intro');
    if (intro) {
      observer.observe(intro, { attributes: true, attributeFilter: ['class'] });
    }

    startIdleLoop();
  }

  return {
    init,
    awaken,
    dismiss,
    nextPage,
    prevPage,
    toggleSound: CalciferAudio.toggleSound
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Calcifer.init);
} else {
  Calcifer.init();
}

window.Calcifer = Calcifer;
