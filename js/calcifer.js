/* ==========================================================================
   CARTE (CALCIFER) - NGƯỜI GIỮ LỬA CỦA LÂU ĐÀI
   - Ban đầu: 19 frame ngọn lửa bập bùng tự nhiên (flame_idle_1..19), không lộ mặt.
   - Thức tỉnh: Chạm vào lò sưởi -> mở mắt ngạc nhiên, vươn 2 tay reo vui, mở dòng kể.
   - Dòng kể điện ảnh (Cinematic Story Stream): 11 phân đoạn tự động cuộn mượt mà,
     Carte nói chuyện liên tục, đổi biểu cảm theo ngữ cảnh, không bị khựng hình.
   - Kết thúc câu chuyện: Carte ngáp mệt, mắt nhắm dần và chìm vào giấc ngủ say
     (flame_sleep_1..5) êm đềm với tiếng thở zZ...
   - Tương tác thông minh: Nút Dừng/Tiếp tục, tua nhanh, đánh thức nghe lại từ đầu.
   ========================================================================== */

const Calcifer = (() => {
  // 19 frame ngọn lửa bập bùng tự nhiên không lộ mặt
  const IDLE_FRAMES = Array.from({ length: 19 }, (_, i) => `assets/img/calcifer/flame_idle_${i + 1}.webp?v=20261021_dissolve`);

  // 4 frame Carte nhắm mắt ngủ say êm đềm (loại bỏ flame_sleep_5)
  const SLEEP_FRAMES = Array.from({ length: 4 }, (_, i) => `assets/img/calcifer/flame_sleep_${i + 1}.webp?v=20261021_dissolve`);

  const TIRED_FRAMES = Array.from({ length: 17 }, (_, i) => `assets/img/calcifer/calcifer_yawn_${String(i + 1).padStart(2, '0')}.webp?v=20261023_flame12_f9`);

  // 11 Phân đoạn câu chuyện chính xác theo lời dặn của người dùng
  const STORY_SEGMENTS = [
    {
      id: 1,
      marker: '👋',
      title: 'Xin chào bạn!',
      text: 'Chào bạn,\nMình là **Carte** — người giữ lửa và canh gác cho tòa lâu đài cùng với chú chó siêu to tên **Bond**.\n\nNhờ có mình mà lâu đài mới chuyển động và đi bất kì nơi nào mà cô chủ muốn.',
      mainFrame: 'assets/img/calcifer/frame_029.webp?v=20261021_dissolve',
      talkFrames: [
        'assets/img/calcifer/frame_029.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_030.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_033.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_smile_3.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_talk_4.webp?v=20261021_dissolve'
      ],
      breatheFrame: 'assets/img/calcifer/frame_031.webp?v=20261021_dissolve',
      delayAfter: 700
    },
    {
      id: 2,
      marker: '✨',
      title: 'Cô chủ của Carte',
      text: 'Cô chủ của mình là một người thích khám phá, tò mò và cũng mơ mộng nữa.',
      mainFrame: 'assets/img/calcifer/frame_025.webp?v=20261021_dissolve',
      talkFrames: [
        'assets/img/calcifer/frame_025.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_026.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_027.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_smile_8.webp?v=20261021_dissolve'
      ],
      breatheFrame: 'assets/img/calcifer/frame_028.webp?v=20261021_dissolve',
      delayAfter: 500
    },
    {
      id: 3,
      marker: '📖',
      title: 'Những cái tên',
      text: 'Mình có được nghe cô chủ kể trước kia cô có khá nhiều tên, mỗi cái tên gắn liền với một giai đoạn...\n\nHiện tại cô chủ mình chọn **Vivi** làm tên tiếng Việt cũng như bút danh cho việc viết, còn **Vivian** là tên tiếng Anh.',
      mainFrame: 'assets/img/calcifer/frame_041.webp?v=20261021_dissolve',
      talkFrames: [
        'assets/img/calcifer/frame_041.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_042.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_045.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_046.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_talk_5.webp?v=20261021_dissolve'
      ],
      breatheFrame: 'assets/img/calcifer/frame_043.webp?v=20261021_dissolve',
      delayAfter: 700
    },
    {
      id: 4,
      marker: '🌌',
      title: 'Gần hơn tới các vì sao',
      text: 'Mình hay gọi cô là **Vivi** luôn cho gọn.\n\nVivi rất thích các chòm sao nên tôi đã luôn phải cháy rực rỡ để đưa cô gần hơn tới các vì sao ✨ — một góc nhỏ ấm áp nơi cô có thể quan sát, nhìn ngắm, chiêm nghiệm về những điều cô đọc được, cô đi qua hay những sáng tác của cô.',
      mainFrame: 'assets/img/calcifer/frame_085.webp?v=20261021_dissolve',
      talkIntervalMs: 190,
      talkFrames: [
        'assets/img/calcifer/frame_085.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_086.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_087.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_smile_2.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_smile_6.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_spark_01.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_02.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_03.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_04.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_05.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_06.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_07.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_08.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_09.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_10.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_11.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_12.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_13.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_14.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_15.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_16.webp?v=20261023_spark_full_v3'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_spark_14.webp?v=20261023_spark_full_v3',
      breatheFrames: [
        'assets/img/calcifer/calcifer_spark_13.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_14.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_15.webp?v=20261023_spark_full_v3',
        'assets/img/calcifer/calcifer_spark_14.webp?v=20261023_spark_full_v3'
      ],
      delayAfter: 800
    },
    {
      id: 5,
      marker: '🎨',
      title: 'Những khoảng ở giữa & Nghệ thuật',
      text: 'Vivi vừa hiền lành cũng vừa ghê gớm, vừa sâu sắc vừa vô tri, vừa chăm chỉ cũng vừa lười biếng, vừa thích đi nhưng cũng lười đi,.... Cô là sự kết hợp của nhiều khoảng ở giữa….\n\nNhưng có lẽ điều mà cô luôn thích đó là **nghệ thuật**.\n\nCô thích khám phá về thế giới, thích ghi lại những chiêm nghiệm về cuộc đời.',
      mainFrame: 'assets/img/calcifer/calcifer_eat_01.webp?v=20261021_eat',
      talkIntervalMs: 230,
      playOnce: true,
      typeStep: 2,
      typeIntervalMs: 24,
      talkFrames: [
        'assets/img/calcifer/calcifer_eat_01.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_02.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_03.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_04.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_05.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_06.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_07.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_08.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_09.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_10.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_11.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_12.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_13.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_14.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_15.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_16.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_17.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_18.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_19.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_20.webp?v=20261021_eat'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_eat_19.webp?v=20261021_eat',
      breatheFrames: [
        'assets/img/calcifer/calcifer_eat_18.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_19.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_20.webp?v=20261021_eat',
        'assets/img/calcifer/calcifer_eat_19.webp?v=20261021_eat'
      ],
      delayAfter: 750
    },
    {
      id: 6,
      marker: '🔥',
      title: 'Phương châm viết',
      text: 'Vivi hay nói với mình là cô:\n\n🔥 **« VIẾT ĐỂ KHÔNG QUÊN »** 🔥',
      mainFrame: 'assets/img/calcifer/frame_053.webp?v=20261021_dissolve',
      talkFrames: [
        'assets/img/calcifer/frame_053.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_054.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_055.webp?v=20261021_dissolve',
        'assets/img/calcifer/frame_057.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_smile_6.webp?v=20261021_dissolve'
      ],
      breatheFrame: 'assets/img/calcifer/frame_056.webp?v=20261021_dissolve',
      delayAfter: 600
    },
    {
      id: 7,
      marker: '💭',
      title: 'Lắng đọng',
      text: 'Vậy nên….',
      mainFrame: 'assets/img/calcifer/calcifer_hide_01.webp?v=20261022_hide',
      talkIntervalMs: 180,
      playOnce: true,
      talkFrames: [
        'assets/img/calcifer/calcifer_hide_01.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_02.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_03.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_04.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_05.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_06.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_07.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_08.webp?v=20261022_hide'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_hide_08.webp?v=20261022_hide',
      breatheFrames: [
        'assets/img/calcifer/calcifer_hide_07.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_08.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_07.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_08.webp?v=20261022_hide'
      ],
      delayAfter: 500
    },
    {
      id: 8,
      marker: '🐾',
      title: 'Dấu chân con chữ',
      text: 'Nhiều khi các bài viết hay các sáng tác có thể như là một dấu chân cô đã đi và muốn lưu dấu thông qua vài con chữ lộn xộn.',
      mainFrame: 'assets/img/calcifer/calcifer_hide_08.webp?v=20261022_hide',
      talkIntervalMs: 220,
      playOnce: true,
      typeStep: 2,
      typeIntervalMs: 25,
      talkFrames: [
        'assets/img/calcifer/calcifer_hide_09.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_10.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_11.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_12.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_13.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_14.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_15.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_16.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_17.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_18.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_19.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_20.webp?v=20261022_hide'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_hide_18.webp?v=20261022_hide',
      breatheFrames: [
        'assets/img/calcifer/calcifer_hide_17.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_18.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_19.webp?v=20261022_hide',
        'assets/img/calcifer/calcifer_hide_18.webp?v=20261022_hide'
      ],
      delayAfter: 650
    },
    {
      id: 9,
      marker: '👑',
      title: 'Tự tại & Tự chinh phục',
      text: 'Chẳng xô bồ hay cũng chẳng cần trau chuốt để ngóng chờ một chàng hoàng tử của đời.\n\nCác con chữ chỉ đơn giản vẫn ở đó và lớn dần từng ngày để tự chinh phục những điều thú vị tiếp theo. ✨',
      mainFrame: 'assets/img/calcifer/calcifer_sneeze_01.webp?v=20261023_sneeze_v4',
      talkIntervalMs: 230,
      playOnce: true,
      typeStep: 1,
      typeIntervalMs: 25,
      talkFrames: [
        'assets/img/calcifer/calcifer_sneeze_01.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_02.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_03.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_04.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_05.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_06.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_07.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_08.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_09.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_10.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_11.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_12.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_13.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_14.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_15.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_16.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_17.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_18.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_19.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_20.webp?v=20261023_sneeze_v4'
      ],
      breatheFrame: 'assets/img/calcifer/calcifer_sneeze_17.webp?v=20261023_sneeze_v4',
      breatheFrames: [
        'assets/img/calcifer/calcifer_sneeze_14.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_17.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_19.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_20.webp?v=20261023_sneeze_v4',
        'assets/img/calcifer/calcifer_sneeze_17.webp?v=20261023_sneeze_v4'
      ],
      delayAfter: 850
    }
  ];

  // DOM Elements
  let flameEl = null;
  let containerEl = null;
  let dialogEl = null;
  let streamEl = null;
  let progressFillEl = null;
  let counterEl = null;
  let actionBtn = null;
  let pauseBtn = null;
  let soundBtn = null;
  let closeBtn = null;
  let tipEl = null;
  let embersCanvas = null;

  // Animation Engine State
  const MODE_IDLE = 'IDLE';
  const MODE_AWAKEN = 'AWAKEN';
  const MODE_TALK = 'TALK';
  const MODE_BREATHE = 'BREATHE';
  const MODE_TIRED = 'TIRED';
  const MODE_SLEEP = 'SLEEP';

  let currentMode = MODE_IDLE;
  let animTimer = null;
  let animFrameIdx = 0;
  let currentActiveFrames = [];
  let animIntervalMs = 120;

  // Cinematic Narrative State
  let currentSegmentIdx = 0;
  let isTyping = false;
  let typingTimer = null;
  let autoAdvanceTimer = null;
  let isPaused = false;
  let isSleeping = false;
  let currentRawText = '';
  let currentBlockContentEl = null;

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

    function startFireCrackle(targetVolume = 0.16) {
      try {
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
          crackleGain.gain.linearRampToValueAtTime(targetVolume, c.currentTime + 1.2);

          noiseNode.connect(noiseFilter);
          noiseFilter.connect(crackleGain);
          crackleGain.connect(masterGain);
          noiseNode.start();
        } else if (crackleGain) {
          crackleGain.gain.linearRampToValueAtTime(targetVolume, c.currentTime + 0.8);
        }

        scheduleCrackles();
      } catch (err) {}
    }

    function scheduleCrackles() {
      try {
        if (crackleTimer) clearTimeout(crackleTimer);
        if (!isFireSoundEnabled || !noiseNode) return;

        playSingleCrackle();
        const nextDelay = isSleeping ? 180 + Math.random() * 450 : 70 + Math.random() * 220;
        crackleTimer = setTimeout(scheduleCrackles, nextDelay);
      } catch (err) {}
    }

    function playSingleCrackle() {
      try {
        const c = getAudioContext();
        if (!c || !isFireSoundEnabled || !masterGain) return;

        const isDeepWood = Math.random() < 0.15;
        const osc = c.createOscillator();
        const gain = c.createGain();
        const filter = c.createBiquadFilter();
        const t = c.currentTime;

        if (isDeepWood) {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320 + Math.random() * 180, t);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, t);
          gain.gain.setValueAtTime(isSleeping ? 0.015 : 0.045, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
          osc.stop(t + 0.045);
        } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(2200 + Math.random() * 2500, t);
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2800 + Math.random() * 1200, t);
          filter.Q.value = 3.5;
          gain.gain.setValueAtTime(isSleeping ? 0.01 : 0.028, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
          osc.stop(t + 0.02);
        }

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
      } catch (err) {}
    }

    function stopFireCrackle() {
      try {
        if (crackleTimer) {
          clearTimeout(crackleTimer);
          crackleTimer = null;
        }
        if (crackleGain && ctx) {
          crackleGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            if (noiseNode) {
              try { noiseNode.stop(); } catch (e) {}
              noiseNode.disconnect();
              noiseNode = null;
            }
          }, 550);
        }
      } catch (e) {}
    }

    // Âm thanh bừng sáng khi thức tỉnh Carte
    function playAwakenSFX() {
      try {
        const c = getAudioContext();
        if (!c || !isFireSoundEnabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((f, i) => {
          const t = c.currentTime + i * 0.06;
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.065, t + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
          o.connect(g);
          g.connect(masterGain);
          o.start(t);
          o.stop(t + 0.75);
        });
      } catch (err) {}
    }

    // Tiếng bloop nhẹ ấm áp khi Carte nói chữ
    function playTalkBlip() {
      try {
        const c = getAudioContext();
        if (!c || !isFireSoundEnabled) return;
        const t = c.currentTime;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(340 + Math.random() * 120, t);
        g.gain.setValueAtTime(0.018, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
        o.connect(g);
        g.connect(masterGain);
        o.start(t);
        o.stop(t + 0.04);
      } catch (err) {}
    }

    // Tiếng ru êm đềm khi Carte chuẩn bị ngủ
    function playSleepSFX() {
      try {
        const c = getAudioContext();
        if (!c || !isFireSoundEnabled) return;
        const notes = [880, 783.99, 659.25, 523.25, 392]; // A5, G5, E5, C5, G4
        notes.forEach((f, i) => {
          const t = c.currentTime + i * 0.16;
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.04, t + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
          o.connect(g);
          g.connect(masterGain);
          o.start(t);
          o.stop(t + 0.95);
        });
      } catch (err) {}
    }

    function toggleSound() {
      isFireSoundEnabled = !isFireSoundEnabled;
      if (isFireSoundEnabled) {
        startFireCrackle(isSleeping ? 0.06 : 0.16);
      } else {
        stopFireCrackle();
      }
      return isFireSoundEnabled;
    }

    return {
      startFireCrackle,
      stopFireCrackle,
      playAwakenSFX,
      playTalkBlip,
      playSleepSFX,
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
    let animId = null;
    let isRunning = false;

    class Ember {
      constructor(isBurst = false) {
        this.reset(isBurst);
      }

      reset(isBurst = false) {
        const w = canvas ? canvas.width / (window.devicePixelRatio || 1) : 300;
        const h = canvas ? canvas.height / (window.devicePixelRatio || 1) : 400;

        const centerX = w * 0.52;
        const baseY = h * 0.88;

        if (isBurst) {
          this.x = centerX + (Math.random() - 0.5) * 50;
          this.y = baseY - Math.random() * 40;
          this.vx = (Math.random() - 0.5) * 3.2;
          this.vy = -(1.5 + Math.random() * 4.2);
          this.size = 1.6 + Math.random() * 2.8;
          this.alpha = 0.95;
          this.decay = 0.014 + Math.random() * 0.02;
        } else {
          this.x = centerX + (Math.random() - 0.5) * 115;
          this.y = baseY - Math.random() * 20;
          this.vx = (Math.random() - 0.5) * 0.7;
          this.vy = -(0.5 + Math.random() * 1.5);
          this.size = 1.0 + Math.random() * 2.2;
          this.alpha = 0.3 + Math.random() * 0.55;
          this.decay = 0.005 + Math.random() * 0.012;
        }

        const colors = [
          '255, 120, 30',
          '255, 175, 45',
          '255, 215, 90',
          '255, 75, 30',
          '255, 245, 180'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.03 + Math.random() * 0.06;
      }

      update() {
        this.x += this.vx + Math.sin(this.wobble) * 0.4;
        this.y += this.vy;
        this.wobble += this.wobbleSpeed;
        this.alpha -= this.decay;
        return this.alpha > 0 && this.y > 0;
      }

      draw(c) {
        c.save();
        c.globalAlpha = Math.max(0, this.alpha);
        c.shadowColor = `rgb(${this.color})`;
        c.shadowBlur = this.size * 3.5;
        c.fillStyle = `rgb(${this.color})`;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    function init(canvasEl) {
      canvas = canvasEl;
      if (!canvas) return;
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

      const targetCount = isSleeping ? 8 : (currentMode === MODE_TALK ? 30 : 12);
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

    return { init, burst, start, stop };
  })();

  // ==========================================================================
  // TIỀN TẢI HÌNH ẢNH TOÀN DIỆN (PRELOAD TẤT CẢ 41 FRAMES VÀO BỘ NHỚ TRÌNH DUYỆT)
  // ==========================================================================
  const preloadedImages = new Map();

  function preloadImages() {
    const urls = new Set([
      ...IDLE_FRAMES,
      ...SLEEP_FRAMES,
      ...TIRED_FRAMES,
      'assets/img/calcifer/calcifer_talk_1.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_talk_2.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_talk_3.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_talk_4.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_talk_5.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_talk_7.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_talk_8.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_smile_1.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_smile_2.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_smile_3.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_smile_4.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_smile_5.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_smile_6.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_smile_7.webp?v=20261021_dissolve',
      'assets/img/calcifer/calcifer_smile_8.webp?v=20261021_dissolve'
    ]);

    STORY_SEGMENTS.forEach(seg => {
      if (seg.mainFrame) urls.add(seg.mainFrame);
      if (seg.breatheFrame) urls.add(seg.breatheFrame);
      if (Array.isArray(seg.breatheFrames)) {
        seg.breatheFrames.forEach(f => urls.add(f));
      }
      if (Array.isArray(seg.talkFrames)) {
        seg.talkFrames.forEach(f => urls.add(f));
      }
    });

    urls.forEach(src => {
      const img = new Image();
      img.src = src;
      // Giải pháp 2: Tiền giải mã ảnh vào GPU để Carte đổi frame siêu mượt 60fps
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
      preloadedImages.set(src, img);
    });
  }

  // ==========================================================================
  // ĐỘNG CƠ CHUYỂN ĐỘNG LIÊN TỤC KHÔNG KHỰNG (CONTINUOUS ANIMATION ENGINE)
  // ==========================================================================
  function setMode(mode, customFrames = null, intervalMs = 120, options = {}) {
    currentMode = mode;
    animIntervalMs = intervalMs;
    animFrameIdx = 0;
    const shouldLoop = options.loop !== undefined ? options.loop : true;

    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
    }

    if (mode === MODE_IDLE) {
      currentActiveFrames = IDLE_FRAMES;
      animIntervalMs = 140;
    } else if (mode === MODE_SLEEP) {
      // Ping-pong loop cho 4 frame ngủ (không dùng flame_sleep_5): 0, 1, 2, 3, 2, 1
      currentActiveFrames = [
        SLEEP_FRAMES[0],
        SLEEP_FRAMES[1],
        SLEEP_FRAMES[2],
        SLEEP_FRAMES[3],
        SLEEP_FRAMES[2],
        SLEEP_FRAMES[1]
      ];
      animIntervalMs = 320; // Nhịp thở ngủ sâu êm đềm
    } else if (mode === MODE_TALK) {
      currentActiveFrames = (customFrames && customFrames.length > 0) ? customFrames : [
        'assets/img/calcifer/calcifer_smile_3.webp?v=20261021_dissolve',
        'assets/img/calcifer/calcifer_talk_4.webp?v=20261021_dissolve'
      ];
      animIntervalMs = intervalMs || 230; // Nhịp mồm nói chuyện thong thả, rõ nét biểu cảm
    } else if (mode === MODE_BREATHE) {
      // Chu kỳ thở/nghe lắng đọng sống động (đảm bảo Carte không bao giờ bị đứng hình)
      if (customFrames && customFrames.length > 1) {
        currentActiveFrames = customFrames;
      } else if (customFrames && customFrames.length === 1) {
        currentActiveFrames = [
          customFrames[0],
          'assets/img/calcifer/calcifer_smile_3.webp?v=20261021_dissolve',
          customFrames[0],
          'assets/img/calcifer/calcifer_smile_2.webp?v=20261021_dissolve'
        ];
      } else {
        currentActiveFrames = [
          'assets/img/calcifer/calcifer_smile_1.webp?v=20261021_dissolve',
          'assets/img/calcifer/calcifer_smile_2.webp?v=20261021_dissolve',
          'assets/img/calcifer/calcifer_smile_3.webp?v=20261021_dissolve',
          'assets/img/calcifer/calcifer_smile_2.webp?v=20261021_dissolve'
        ];
      }
      animIntervalMs = intervalMs || 340; // Nhịp thở bập bùng thư thái êm đềm
    } else if (mode === MODE_TIRED) {
      currentActiveFrames = (customFrames && customFrames.length > 0) ? customFrames : TIRED_FRAMES;
      animIntervalMs = intervalMs || 210;
    }

    // Cập nhật ngay frame đầu tiên không để trễ
    if (flameEl && currentActiveFrames.length > 0) {
      flameEl.src = currentActiveFrames[0];
    }

    if (currentActiveFrames.length > 1) {
      animTimer = setInterval(() => {
        if (shouldLoop) {
          animFrameIdx = (animFrameIdx + 1) % currentActiveFrames.length;
          if (flameEl) {
            flameEl.src = currentActiveFrames[animFrameIdx];
          }
        } else {
          if (animFrameIdx < currentActiveFrames.length - 1) {
            animFrameIdx++;
            if (flameEl) {
              flameEl.src = currentActiveFrames[animFrameIdx];
            }
          } else {
            clearInterval(animTimer);
            animTimer = null;
            if (typeof options.onComplete === 'function') {
              options.onComplete();
            }
          }
        }
      }, animIntervalMs);
    }
  }

  // ==========================================================================
  // XỬ LÝ VĂN BẢN VÀ DÒNG CHẢY ĐIỆN ẢNH (CINEMATIC STORY STREAM)
  // ==========================================================================
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

  function scrollToStreamBottom(smooth = false) {
    if (!streamEl) return;
    if (smooth) {
      streamEl.scrollTo({
        top: streamEl.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      streamEl.scrollTop = streamEl.scrollHeight;
    }
  }

  function updateProgress() {
    if (counterEl) {
      counterEl.textContent = `${currentSegmentIdx + 1} / ${STORY_SEGMENTS.length}`;
    }
    if (progressFillEl) {
      const pct = Math.min(100, Math.round(((currentSegmentIdx + 1) / STORY_SEGMENTS.length) * 100));
      progressFillEl.style.width = `${pct}%`;
    }
  }

  function startStream() {
    if (!streamEl) return;
    streamEl.innerHTML = '';
    currentSegmentIdx = 0;
    isSleeping = false;
    isPaused = false;

    if (pauseBtn) {
      pauseBtn.innerHTML = '⏸ Dừng';
      pauseBtn.classList.remove('is-paused');
    }
    if (actionBtn) {
      actionBtn.innerHTML = 'Tiếp tục ▸';
      actionBtn.classList.remove('is-replay');
    }
    if (tipEl) {
      tipEl.innerHTML = 'Tự động cuộn theo dòng thời gian • Chạm để tua nhanh ▸';
    }

    runSegment(0);
  }

  function runSegment(idx) {
    if (idx >= STORY_SEGMENTS.length) {
      transitionToSleep();
      return;
    }

    currentSegmentIdx = idx;
    updateProgress();

    const seg = STORY_SEGMENTS[idx];

    // Đánh dấu các block cũ là đã xong
    const prevBlocks = streamEl.querySelectorAll('.story-block');
    prevBlocks.forEach(b => {
      b.classList.remove('is-current', 'is-typing');
      b.classList.add('is-done');
    });

    // Tạo block mới (đã bỏ icon ở đầu theo yêu cầu)
    const block = document.createElement('div');
    block.className = 'story-block is-current is-typing';
    block.id = `sb-${idx}`;

    const content = document.createElement('div');
    content.className = 'sb-content';

    block.appendChild(content);
    streamEl.appendChild(block);

    currentBlockContentEl = content;
    currentRawText = seg.text;
    const segStartTime = Date.now();

    // Bắt đầu động cơ mồm Carte nói chuyện sinh động theo ngữ cảm
    setMode(MODE_TALK, seg.talkFrames, seg.talkIntervalMs || 230, {
      loop: !seg.playOnce,
      onComplete: () => {
        // Sau 20 frame ăn củi, Carte chuyển sang các frame thở (MODE_BREATHE)!
        const livingBreatheFrames = seg.breatheFrames || [
          seg.breatheFrame,
          'assets/img/calcifer/calcifer_smile_3.webp?v=20261021_dissolve',
          seg.breatheFrame,
          'assets/img/calcifer/calcifer_smile_2.webp?v=20261021_dissolve'
        ];
        setMode(MODE_BREATHE, livingBreatheFrames, 320);
      }
    });
    CalciferEmbers.burst(8);

    // Bắt đầu hiệu ứng gõ chữ
    typewriteSegmentText(
      seg.text,
      block,
      () => {
        // Khi gõ chữ xong cho block này:
        block.classList.remove('is-typing');

        if (seg.playOnce) {
          // Đối với đoạn có chuỗi diễn hoạt 1 lần (như 20 frame ăn củi):
          // Chờ diễn hoạt chạy xong nếu chưa xong, rồi chuyển tiếp nhanh nhẹn
          const elapsed = Date.now() - segStartTime;
          const totalAnimTime = (seg.talkFrames.length) * (seg.talkIntervalMs || 230);
          const remainingToAnimFinish = Math.max(0, totalAnimTime - elapsed);
          const waitTime = Math.max(seg.delayAfter || 750, remainingToAnimFinish + 150);

          if (idx === STORY_SEGMENTS.length - 1) {
            if (actionBtn) actionBtn.innerHTML = 'Hoàn tất ✨';
            scheduleAutoAdvance(idx + 1, waitTime + 300);
          } else {
            scheduleAutoAdvance(idx + 1, waitTime);
          }
        } else {
          // Chuyển biểu cảm sang chuỗi frame thở nhẹ / mỉm cười lắng đọng sống động (nhịp 340ms thư thái)
          const livingBreatheFrames = seg.breatheFrames || [
            seg.breatheFrame,
            seg.talkFrames[0] || seg.breatheFrame,
            seg.breatheFrame,
            (seg.talkFrames[1] || seg.talkFrames[0]) || seg.breatheFrame
          ];
          setMode(MODE_BREATHE, livingBreatheFrames, 340);

          // Nếu là block cuối cùng thì chuẩn bị đi ngủ
          if (idx === STORY_SEGMENTS.length - 1) {
            if (actionBtn) {
              actionBtn.innerHTML = 'Hoàn tất ✨';
            }
            scheduleAutoAdvance(idx + 1, (seg.delayAfter || 700) + 300);
          } else {
            scheduleAutoAdvance(idx + 1, seg.delayAfter || 700);
          }
        }
      },
      {
        step: seg.typeStep || 2,
        interval: seg.typeIntervalMs || 30
      }
    );

    scrollToStreamBottom(true);
  }

  function typewriteSegmentText(rawText, blockEl, onComplete, speedConfig = {}) {
    if (typingTimer) clearTimeout(typingTimer);
    isTyping = true;

    let charIdx = 0;
    const len = rawText.length;
    let blipCounter = 0;
    const stepSize = (speedConfig && speedConfig.step) ? speedConfig.step : 2;
    const stepInterval = (speedConfig && speedConfig.interval) ? speedConfig.interval : 30;

    function step() {
      if (!isTyping) return;

      if (isPaused) {
        typingTimer = setTimeout(step, 100);
        return;
      }

      charIdx += stepSize;
      blipCounter++;

      // Phát âm thanh bloop nhỏ ấm áp mỗi vài ký tự
      if (blipCounter % 5 === 0) {
        CalciferAudio.playTalkBlip();
      }

      if (charIdx >= len) {
        finishCurrentTyping();
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      const partial = rawText.slice(0, charIdx);
      if (currentBlockContentEl) {
        currentBlockContentEl.innerHTML = formatText(partial);
      }
      // Giải pháp 3: Cuộn trực tiếp scrollTop để không xung đột compositor mượt khi gõ từng ký tự
      if (streamEl) {
        streamEl.scrollTop = streamEl.scrollHeight;
      }

      typingTimer = setTimeout(step, stepInterval);
    }

    step();
  }

  function finishCurrentTyping() {
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    isTyping = false;

    if (currentBlockContentEl && currentRawText) {
      currentBlockContentEl.innerHTML = formatText(currentRawText);
    }

    const currentBlock = streamEl ? streamEl.querySelector('.story-block.is-current') : null;
    if (currentBlock) {
      currentBlock.classList.remove('is-typing');
    }

    if (streamEl) {
      streamEl.scrollTop = streamEl.scrollHeight;
    }
  }

  function scheduleAutoAdvance(nextIdx, delayMs) {
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    if (isSleeping) return;

    autoAdvanceTimer = setTimeout(() => {
      if (isPaused || isSleeping) return;
      if (nextIdx < STORY_SEGMENTS.length) {
        runSegment(nextIdx);
      } else {
        transitionToSleep();
      }
    }, delayMs);
  }

  // ==========================================================================
  // CHUYỂN CẢNH KHI KẾT THÚC: CARTE MỆT MỎI VÀ ĐI NGỦ (SLEEP MODE)
  // ==========================================================================
  function transitionToSleep() {
    if (isSleeping) return;
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    isSleeping = true;

    // Đánh dấu tất cả block là done
    const prevBlocks = streamEl.querySelectorAll('.story-block');
    prevBlocks.forEach(b => {
      b.classList.remove('is-current', 'is-typing');
      b.classList.add('is-done');
    });

    // Thêm thông báo Carte say giấc nồng vào cuối stream
    if (streamEl) {
      const endPill = document.createElement('div');
      endPill.className = 'story-end-pill';
      endPill.innerHTML = `<span>😴</span><span>Carte đã kể xong và đang say giấc nồng... Nhấn nút hoặc chạm vào Carte để nghe lại!</span>`;
      streamEl.appendChild(endPill);
      scrollToStreamBottom();
    }

    // Cập nhật nút điều khiển
    if (actionBtn) {
      actionBtn.innerHTML = '↺ Kể lại từ đầu';
      actionBtn.classList.add('is-replay');
    }
    if (tipEl) {
      tipEl.innerHTML = 'Carte ngáp mệt, chuẩn bị chìm vào giấc ngủ ngon zZ...';
    }

    // 1. Chạy chuỗi 17 frame Carte ngáp mệt, vươn vai, thở khói zZ và nhắm mắt buồn ngủ (Flame12 cells 2..18)
    // Tốc độ: 210ms / frame -> tổng 17 frame kéo dài ~3.5s rất tự nhiên và thư thái
    setMode(MODE_TIRED, TIRED_FRAMES, 210, {
      loop: false,
      onComplete: () => {
        if (!isSleeping) return;
        if (tipEl) {
          tipEl.innerHTML = 'Carte đang ngủ ngon zZ... • Chạm vào ngọn lửa để đánh thức';
        }
        // 2. Chuyển sang vòng lặp ngủ say êm đềm (MODE_SLEEP)
        setMode(MODE_SLEEP, null, 320);
        CalciferAudio.startFireCrackle(0.06); // Âm thanh lửa thì thầm
        CalciferEmbers.burst(4);
      }
    });

    // Phát âm thanh tiếng ngáp / thở êm đềm
    CalciferAudio.playSleepSFX();
  }

  // ==========================================================================
  // THỨC TỈNH KHI CHẠM VÀO LÒ SƯỞI (AWAKEN)
  // ==========================================================================
  function awaken() {
    // Nếu Carte đang ngủ say, đánh thức và kể lại từ đầu
    if (isSleeping) {
      wakeUpFromSleep();
      return;
    }

    // Nếu đang trong dòng kể:
    if (currentMode !== MODE_IDLE) {
      if (isTyping) {
        finishCurrentTyping();
        // Huỷ timer cũ và advance ngay
        if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
        const seg = STORY_SEGMENTS[currentSegmentIdx];
        if (seg && seg.playOnce) {
          scheduleAutoAdvance(currentSegmentIdx + 1, 450);
        } else {
          const livingBreatheFrames = seg.breatheFrames || [
            seg.breatheFrame,
            seg.talkFrames[0] || seg.breatheFrame,
            seg.breatheFrame,
            (seg.talkFrames[1] || seg.talkFrames[0]) || seg.breatheFrame
          ];
          setMode(MODE_BREATHE, livingBreatheFrames, 340);
          scheduleAutoAdvance(currentSegmentIdx + 1, 400);
        }
      } else if (currentSegmentIdx < STORY_SEGMENTS.length - 1) {
        if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
        runSegment(currentSegmentIdx + 1);
      } else {
        transitionToSleep();
      }
      return;
    }

    try {
      if (window.Ambience && typeof window.Ambience.start === 'function') {
        window.Ambience.start();
      }
    } catch (e) {}

    // Kích hoạt âm thanh và hiệu ứng
    CalciferAudio.startFireCrackle(0.16);
    CalciferAudio.playAwakenSFX();
    CalciferEmbers.burst(24);

    if (containerEl) {
      containerEl.classList.add('is-awake');
    }

    // Chuỗi thức tỉnh sống động:
    // 1. Nhắm mắt chuẩn bị
    setMode(MODE_AWAKEN, ['assets/img/calcifer/calcifer_talk_1.webp?v=20261021_dissolve'], 300);

    // 2. Mở to mắt giật mình 'O'
    setTimeout(() => {
      setMode(MODE_AWAKEN, ['assets/img/calcifer/calcifer_talk_2.webp?v=20261021_dissolve'], 300);
      CalciferEmbers.burst(10);
    }, 220);

    // 3. Vươn 2 tay lên reo chào mừng!
    setTimeout(() => {
      setMode(MODE_AWAKEN, ['assets/img/calcifer/calcifer_talk_3.webp?v=20261021_dissolve'], 400);
      CalciferEmbers.burst(16);
    }, 480);

    // 4. Mở khung thoại và bắt đầu dòng kể
    setTimeout(() => {
      if (dialogEl) {
        dialogEl.classList.add('active');
        dialogEl.setAttribute('aria-hidden', 'false');
      }
      startStream();
    }, 780);
  }

  function wakeUpFromSleep() {
    isSleeping = false;
    CalciferAudio.playAwakenSFX();
    CalciferAudio.startFireCrackle(0.16);
    CalciferEmbers.burst(20);

    // Giật mình thức dậy 'O'
    setMode(MODE_AWAKEN, ['assets/img/calcifer/calcifer_talk_2.webp?v=20261021_dissolve'], 300);

    setTimeout(() => {
      setMode(MODE_AWAKEN, ['assets/img/calcifer/calcifer_talk_3.webp?v=20261021_dissolve'], 400);
      CalciferEmbers.burst(14);
    }, 260);

    setTimeout(() => {
      startStream();
    }, 600);
  }

  // Bấm nút Action (Tiếp tục / Tua nhanh / Kể lại)
  function handleActionClick() {
    if (isSleeping) {
      wakeUpFromSleep();
      return;
    }

    if (isTyping) {
      finishCurrentTyping();
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      const seg = STORY_SEGMENTS[currentSegmentIdx];
      if (seg && seg.playOnce) {
        scheduleAutoAdvance(currentSegmentIdx + 1, 450);
      } else {
        const livingBreatheFrames = seg.breatheFrames || [
          seg.breatheFrame,
          seg.talkFrames[0] || seg.breatheFrame,
          seg.breatheFrame,
          (seg.talkFrames[1] || seg.talkFrames[0]) || seg.breatheFrame
        ];
        setMode(MODE_BREATHE, livingBreatheFrames, 340);
        scheduleAutoAdvance(currentSegmentIdx + 1, 400);
      }
    } else {
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      if (currentSegmentIdx < STORY_SEGMENTS.length - 1) {
        runSegment(currentSegmentIdx + 1);
      } else {
        transitionToSleep();
      }
    }
  }

  // Tạm dừng / Tiếp tục
  function togglePause() {
    isPaused = !isPaused;
    if (pauseBtn) {
      if (isPaused) {
        pauseBtn.innerHTML = '▶ Tiếp tục';
        pauseBtn.classList.add('is-paused');
      } else {
        pauseBtn.innerHTML = '⏸ Dừng';
        pauseBtn.classList.remove('is-paused');
      }
    }
  }

  // Đóng khung thoại
  function dismiss() {
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    if (typingTimer) clearTimeout(typingTimer);
    isTyping = false;

    if (dialogEl) {
      dialogEl.classList.remove('active');
      dialogEl.setAttribute('aria-hidden', 'true');
    }
    if (containerEl) {
      containerEl.classList.remove('is-awake');
    }

    // Nếu đã ngủ say thì giữ tư thế ngủ say
    if (isSleeping) {
      setMode(MODE_SLEEP, null, 280);
      CalciferAudio.startFireCrackle(0.06);
      return;
    }

    // Ngược lại, trở về ngọn lửa bập bùng tự nhiên
    setMode(MODE_TIRED, ['assets/img/calcifer/calcifer_talk_1.webp?v=20261021_dissolve'], 400);
    setTimeout(() => {
      setMode(MODE_IDLE, null, 120);
    }, 450);
  }

  // ==========================================================================
  // KHỞI TẠO VÀ GẮN SỰ KIỆN (INITIALIZE & BIND EVENTS)
  // ==========================================================================
  function init() {
    flameEl = document.getElementById('calciferFlame');
    containerEl = document.getElementById('calciferContainer');
    dialogEl = document.getElementById('calciferDialog');
    streamEl = document.getElementById('calciferStream');
    progressFillEl = document.getElementById('calciferProgressFill');
    counterEl = document.getElementById('calciferCounter');
    actionBtn = document.getElementById('calciferActionBtn');
    pauseBtn = document.getElementById('calciferPauseBtn');
    soundBtn = document.getElementById('calciferSoundBtn');
    closeBtn = document.getElementById('calciferClose');
    tipEl = document.getElementById('calciferTip');
    embersCanvas = document.getElementById('calciferEmbers');

    preloadImages();

    if (embersCanvas) {
      CalciferEmbers.init(embersCanvas);
    }

    // Chạm vào ngọn lửa / Carte trong lò sưởi
    if (containerEl) {
      containerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        awaken();
      });

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

    if (flameEl) {
      flameEl.addEventListener('click', (e) => {
        e.stopPropagation();
        awaken();
      });
    }

    const hintEl = document.getElementById('calciferHint');
    if (hintEl) {
      hintEl.addEventListener('click', (e) => {
        e.stopPropagation();
        awaken();
      });
    }

    // Chạm vào vùng stream để tua nhanh chữ hoặc chuyển đoạn
    if (streamEl) {
      streamEl.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        handleActionClick();
      });
    }

    if (actionBtn) {
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleActionClick();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePause();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      });
    }

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
      if (dialogEl && dialogEl.classList.contains('active')) {
        if (e.key === 'Escape') {
          dismiss();
        } else if (e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleActionClick();
        }
      }
    });

    // Tắt âm thanh khi người dùng nhấn 'Bắt đầu ngắm sao' hoặc đổi cảnh
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

    // Bắt đầu ngọn lửa bập bùng tự nhiên
    setMode(MODE_IDLE, null, 120);
  }

  return {
    init,
    awaken,
    dismiss,
    handleActionClick,
    togglePause,
    toggleSound: CalciferAudio.toggleSound
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Calcifer.init);
} else {
  Calcifer.init();
}

window.Calcifer = Calcifer;
