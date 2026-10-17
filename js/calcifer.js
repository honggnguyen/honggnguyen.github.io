/* ==========================================================================
   CARTE (CALCIFER) - NGƯỜI GIỮ LỬA CỦA LÂU ĐÀI
   - Idle: 8 frame ngọn lửa bập bùng tự nhiên từ Flame_1_8.png, chu kỳ mượt 120ms.
   - Thức tỉnh: Mở mắt ngạc nhiên, giơ tay chào mừng và mở khung thoại.
   - Hội thoại: 16 biểu cảm nói chuyện, cười, giơ tay sinh động từ Flame_smile & Flame_smile2.
   - Kết thúc: Mỉm cười chào, khép mắt lại và trở về ngọn lửa bập bùng bình thường.
   - Căn chỉnh: Khớp 100% từng pixel vào vòm lò sưởi nền không để lại viền hộp.
   ========================================================================== */

const Calcifer = (() => {
  // 8 frames ngọn lửa bập bùng tự nhiên từ Flame_1_8.png
  const IDLE_FRAMES = [
    'assets/img/calcifer/flame_idle_1.webp',
    'assets/img/calcifer/flame_idle_2.webp',
    'assets/img/calcifer/flame_idle_3.webp',
    'assets/img/calcifer/flame_idle_4.webp',
    'assets/img/calcifer/flame_idle_5.webp',
    'assets/img/calcifer/flame_idle_6.webp',
    'assets/img/calcifer/flame_idle_7.webp',
    'assets/img/calcifer/flame_idle_8.webp'
  ];

  // 9 phân đoạn hội thoại với các biểu cảm tương ứng từ Flame_smile & Flame_smile2
  const DIALOGUE_PAGES = [
    {
      title: 'Xin chào bạn!',
      text: 'Chào bạn,\nMình là **Carte** — người giữ lửa và canh gác cho tòa lâu đài cùng với chú chó siêu to tên **Bond**.\n\nNhờ có mình mà lâu đài mới chuyển động và đi bất kì nơi nào mà cô chủ muốn.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_3.webp', // giơ tay chào mừng
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_3.webp',
        'assets/img/calcifer/calcifer_talk_6.webp'
      ]
    },
    {
      title: 'Cô chủ của Carte',
      text: 'Cô chủ của mình là một người thích khám phá, tò mò và cũng mơ mộng nữa.',
      mainFrame: 'assets/img/calcifer/calcifer_smile_1.webp', // cười dịu dàng
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_1.webp',
        'assets/img/calcifer/calcifer_talk_4.webp'
      ]
    },
    {
      title: 'Những cái tên gắn liền từng chặng đường',
      text: 'Mình có được nghe cô chủ kể trước kia cô có khá nhiều tên, mỗi cái tên gắn liền với một giai đoạn...\n\nHiện tại cô chủ mình chọn **Vivi** làm tên tiếng Việt cũng như bút danh cho việc viết, còn **Vivian** là tên tiếng Anh.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_6.webp', // mở miệng kể chuyện
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_6.webp',
        'assets/img/calcifer/calcifer_talk_7.webp'
      ]
    },
    {
      title: 'Đưa cô gần hơn tới các vì sao',
      text: 'Mình hay gọi cô là **Vivi** luôn cho gọn.\n\nVivi rất thích các chòm sao nên mình đã luôn phải cháy rực rỡ để đưa cô gần hơn tới các vì sao ✨ — một góc nhỏ ấm áp nơi cô có thể quan sát, nhìn ngắm, chiêm nghiệm về những điều cô đọc được, cô đi qua hay những sáng tác của cô.',
      mainFrame: 'assets/img/calcifer/calcifer_smile_6.webp', // giơ tay nhiệt huyết
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_6.webp',
        'assets/img/calcifer/calcifer_talk_3.webp'
      ]
    },
    {
      title: 'Những khoảng ở giữa...',
      text: 'Vivi vừa hiền lành cũng vừa ghê gớm, vừa sâu sắc vừa vô tri, vừa chăm chỉ cũng vừa lười biếng, vừa thích đi nhưng cũng lười đi... 😊\n\nCô là sự kết hợp của nhiều khoảng ở giữa…',
      mainFrame: 'assets/img/calcifer/calcifer_smile_2.webp', // cười tít mắt `> <`
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_2.webp',
        'assets/img/calcifer/calcifer_smile_5.webp'
      ]
    },
    {
      title: 'Tình yêu dành cho nghệ thuật',
      text: 'Nhưng có lẽ điều mà cô luôn thích đó là **nghệ thuật**.\n\nCô thích khám phá về thế giới, thích ghi lại những chiêm nghiệm về cuộc đời.',
      mainFrame: 'assets/img/calcifer/calcifer_smile_5.webp', // nụ cười điềm đạm
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_5.webp',
        'assets/img/calcifer/calcifer_talk_4.webp'
      ]
    },
    {
      title: 'Phương châm viết của Vivi',
      text: 'Vivi hay nói với mình là cô:\n\n🔥 **« VIẾT ĐỂ KHÔNG QUÊN »** 🔥',
      mainFrame: 'assets/img/calcifer/calcifer_talk_8.webp', // cười lớn vui vẻ
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_8.webp',
        'assets/img/calcifer/calcifer_smile_8.webp'
      ]
    },
    {
      title: 'Những dấu chân con chữ',
      text: 'Vậy nên…\n\nNhiều khi các bài viết hay các sáng tác có thể như là một dấu chân cô đã đi và muốn lưu dấu thông qua vài con chữ lộn xộn.',
      mainFrame: 'assets/img/calcifer/calcifer_smile_7.webp', // nụ cười rạng rỡ
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_7.webp',
        'assets/img/calcifer/calcifer_talk_5.webp'
      ]
    },
    {
      title: 'Chinh phục những chân trời mới',
      text: 'Chẳng xô bồ hay cũng chẳng cần trau chuốt để ngóng chờ một chàng hoàng tử của đời.\n\nCác con chữ chỉ đơn giản vẫn ở đó và lớn dần từng ngày để tự chinh phục những điều thú vị tiếp theo. ✨',
      mainFrame: 'assets/img/calcifer/calcifer_smile_3.webp', // giơ 2 tay hạnh phúc
      talkFrames: [
        'assets/img/calcifer/calcifer_smile_3.webp',
        'assets/img/calcifer/calcifer_talk_3.webp'
      ]
    }
  ];

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

  let idleTimer = null;
  let idleFrameIdx = 0;
  let isAwake = false;
  let currentPage = 0;
  let talkingInterval = null;

  // Tiền tải toàn bộ 24 frames vào bộ nhớ đệm
  function preloadImages() {
    const all = [
      ...IDLE_FRAMES,
      'assets/img/calcifer/calcifer_talk_1.webp',
      'assets/img/calcifer/calcifer_talk_2.webp',
      'assets/img/calcifer/calcifer_talk_3.webp',
      'assets/img/calcifer/calcifer_talk_4.webp',
      'assets/img/calcifer/calcifer_talk_5.webp',
      'assets/img/calcifer/calcifer_talk_6.webp',
      'assets/img/calcifer/calcifer_talk_7.webp',
      'assets/img/calcifer/calcifer_talk_8.webp',
      'assets/img/calcifer/calcifer_smile_1.webp',
      'assets/img/calcifer/calcifer_smile_2.webp',
      'assets/img/calcifer/calcifer_smile_3.webp',
      'assets/img/calcifer/calcifer_smile_4.webp',
      'assets/img/calcifer/calcifer_smile_5.webp',
      'assets/img/calcifer/calcifer_smile_6.webp',
      'assets/img/calcifer/calcifer_smile_7.webp',
      'assets/img/calcifer/calcifer_smile_8.webp'
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

  // Chuyển động miệng và ngọn lửa khi Carte nói
  function animateTalking(talkFrames, mainFrame, durationMs = 1300) {
    stopTalkingLoop();
    if (!talkFrames || talkFrames.length === 0) {
      if (flameEl) flameEl.src = mainFrame;
      return;
    }
    let idx = 0;
    talkingInterval = setInterval(() => {
      idx = (idx + 1) % talkFrames.length;
      if (flameEl) flameEl.src = talkFrames[idx];
    }, 200);

    setTimeout(() => {
      stopTalkingLoop();
      if (isAwake && flameEl) {
        flameEl.src = mainFrame;
      }
    }, durationMs);
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

  function renderPage(pageIdx) {
    if (pageIdx < 0) pageIdx = 0;
    if (pageIdx >= DIALOGUE_PAGES.length) pageIdx = DIALOGUE_PAGES.length - 1;
    currentPage = pageIdx;

    const page = DIALOGUE_PAGES[currentPage];

    if (titleEl) titleEl.textContent = page.title;
    if (textEl) textEl.innerHTML = formatText(page.text);
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

    animateTalking(page.talkFrames, page.mainFrame, 1300);
  }

  // Thức tỉnh khi chạm vào lò sưởi
  function awaken() {
    if (isAwake) {
      nextPage();
      return;
    }

    if (window.Ambience && typeof window.Ambience.start === 'function') {
      window.Ambience.start();
    }

    stopIdleLoop();
    isAwake = true;

    if (containerEl) {
      containerEl.classList.add('is-awake');
    }

    // Chuỗi thức tỉnh sống động:
    // 1. Nhắm mắt ngủ
    if (flameEl) {
      flameEl.src = 'assets/img/calcifer/calcifer_talk_1.webp';
    }

    // 2. Mở to mắt giật mình 'O'
    setTimeout(() => {
      if (!isAwake) return;
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_2.webp';
    }, 180);

    // 3. Giơ 2 tay lên reo chào mừng
    setTimeout(() => {
      if (!isAwake) return;
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_3.webp';
    }, 420);

    // 4. Mở khung thoại tinh tế
    setTimeout(() => {
      if (!isAwake) return;
      if (dialogEl) {
        dialogEl.classList.add('active');
        dialogEl.setAttribute('aria-hidden', 'false');
      }
      renderPage(0);
    }, 680);
  }

  function nextPage() {
    if (currentPage < DIALOGUE_PAGES.length - 1) {
      renderPage(currentPage + 1);
    } else {
      dismiss();
    }
  }

  function prevPage() {
    if (currentPage > 0) {
      renderPage(currentPage - 1);
    }
  }

  // Kết thúc nói chuyện -> về lại ngọn lửa bập bùng tự nhiên
  function dismiss() {
    if (!isAwake) return;
    stopTalkingLoop();

    if (dialogEl) {
      dialogEl.classList.remove('active');
      dialogEl.setAttribute('aria-hidden', 'true');
    }

    if (containerEl) {
      containerEl.classList.remove('is-awake');
    }

    // Mỉm cười chào rồi nhắm mắt quay lại ngọn lửa bình thường
    if (flameEl) {
      flameEl.src = 'assets/img/calcifer/calcifer_talk_4.webp';
    }

    setTimeout(() => {
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_1.webp';
    }, 380);

    setTimeout(() => {
      startIdleLoop();
    }, 780);
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

    preloadImages();

    if (containerEl) {
      containerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        awaken();
      });

      containerEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          awaken();
        }
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isAwake) {
        dismiss();
      }
    });

    startIdleLoop();
  }

  return {
    init,
    awaken,
    dismiss,
    nextPage,
    prevPage
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Calcifer.init);
} else {
  Calcifer.init();
}

window.Calcifer = Calcifer;
