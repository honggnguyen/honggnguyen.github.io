/* ==========================================================================
   CARTE (CALCIFER) - NGƯỜI GIỮ LỬA CỦA LÂU ĐÀI
   - Idle: Ngọn lửa bập bùng tự nhiên trong lò sưởi (4 frames).
   - Click: Carte thức tỉnh, mở mắt chào và đọc lời giới thiệu về Vivi.
   - Pager: 9 phân đoạn hội thoại, hoạt ảnh nói chuyện & cảm xúc theo ngữ cảnh.
   - Kết thúc: Carte mỉm cười nhắm mắt, quay về ngọn lửa bập bùng bình thường.
   ========================================================================== */

const Calcifer = (() => {
  const IDLE_FRAMES = [
    'assets/img/calcifer/flame_idle_1.webp',
    'assets/img/calcifer/flame_idle_2.webp',
    'assets/img/calcifer/flame_idle_3.webp',
    'assets/img/calcifer/flame_idle_4.webp'
  ];

  const DIALOGUE_PAGES = [
    {
      title: 'Xin chào bạn!',
      text: 'Chào bạn,\nMình là **Carte** — người giữ lửa và canh gác cho tòa lâu đài cùng với chú chó siêu to tên **Bond**.\n\nNhờ có mình mà lâu đài mới chuyển động và đi bất kì nơi nào mà cô chủ muốn.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_3.webp', // giơ tay chào
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_3.webp',
        'assets/img/calcifer/calcifer_talk_6.webp'
      ]
    },
    {
      title: 'Cô chủ của Carte',
      text: 'Cô chủ của mình là một người thích khám phá, tò mò và cũng mơ mộng nữa.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_4.webp', // nụ cười dịu dàng
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_4.webp',
        'assets/img/calcifer/calcifer_talk_5.webp'
      ]
    },
    {
      title: 'Những cái tên gắn liền từng chặng đường',
      text: 'Mình có được nghe cô chủ kể trước kia cô có khá nhiều tên, mỗi cái tên gắn liền với một giai đoạn...\n\nHiện tại cô chủ mình chọn **Vivi** làm tên tiếng Việt cũng như bút danh cho việc viết, còn **Vivian** là tên tiếng Anh.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_6.webp', // mở miệng kể chuyện
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_6.webp',
        'assets/img/calcifer/calcifer_talk_5.webp'
      ]
    },
    {
      title: 'Đưa cô gần hơn tới các vì sao',
      text: 'Mình hay gọi cô là **Vivi** luôn cho gọn.\n\nVivi rất thích các chòm sao nên mình đã luôn phải cháy rực rỡ để đưa cô gần hơn tới các vì sao ✨ — một góc nhỏ ấm áp nơi cô có thể quan sát, nhìn ngắm, chiêm nghiệm về những điều cô đọc được, cô đi qua hay những sáng tác của cô.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_7.webp', // ngọn lửa bùng cháy nhiệt huyết
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_7.webp',
        'assets/img/calcifer/calcifer_talk_3.webp'
      ]
    },
    {
      title: 'Những khoảng ở giữa...',
      text: 'Vivi vừa hiền lành cũng vừa ghê gớm, vừa sâu sắc vừa vô tri, vừa chăm chỉ cũng vừa lười biếng, vừa thích đi nhưng cũng lười đi... 😊\n\nCô là sự kết hợp của nhiều khoảng ở giữa…',
      mainFrame: 'assets/img/calcifer/calcifer_talk_9.webp', // tít mắt cười `> <`
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_9.webp',
        'assets/img/calcifer/calcifer_talk_4.webp'
      ]
    },
    {
      title: 'Tình yêu dành cho nghệ thuật',
      text: 'Nhưng có lẽ điều mà cô luôn thích đó là **nghệ thuật**.\n\nCô thích khám phá về thế giới, thích ghi lại những chiêm nghiệm về cuộc đời.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_5.webp', // ấm áp điềm đạm
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_5.webp',
        'assets/img/calcifer/calcifer_talk_4.webp'
      ]
    },
    {
      title: 'Phương châm viết của Vivi',
      text: 'Vivi hay nói với mình là cô:\n\n🔥 **« VIẾT ĐỂ KHÔNG QUÊN »** 🔥',
      mainFrame: 'assets/img/calcifer/calcifer_talk_8.webp', // cười lớn vui vẻ
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_8.webp',
        'assets/img/calcifer/calcifer_talk_10.webp'
      ]
    },
    {
      title: 'Những dấu chân con chữ',
      text: 'Vậy nên…\n\nNhiều khi các bài viết hay các sáng tác có thể như là một dấu chân cô đã đi và muốn lưu dấu thông qua vài con chữ lộn xộn.',
      mainFrame: 'assets/img/calcifer/calcifer_talk_10.webp', // nụ cười rạng rỡ
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_10.webp',
        'assets/img/calcifer/calcifer_talk_5.webp'
      ]
    },
    {
      title: 'Chinh phục những chân trời mới',
      text: 'Chẳng xô bồ hay cũng chẳng cần trau chuốt để ngóng chờ một chàng hoàng tử của đời.\n\nCác con chữ chỉ đơn giản vẫn ở đó và lớn dần từng ngày để tự chinh phục những điều thú vị tiếp theo. ✨',
      mainFrame: 'assets/img/calcifer/calcifer_talk_3.webp', // hạnh phúc ấm áp
      talkFrames: [
        'assets/img/calcifer/calcifer_talk_3.webp',
        'assets/img/calcifer/calcifer_talk_4.webp'
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

  // Tiền tải (preload) toàn bộ ảnh để hoạt ảnh mượt 100% không giật hình
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
      'assets/img/calcifer/calcifer_talk_9.webp',
      'assets/img/calcifer/calcifer_talk_10.webp'
    ];
    all.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  // Khởi động vòng lặp lửa bập bùng tự nhiên (Idle loop)
  function startIdleLoop() {
    stopIdleLoop();
    stopTalkingLoop();
    isAwake = false;
    idleTimer = setInterval(() => {
      idleFrameIdx = (idleFrameIdx + 1) % IDLE_FRAMES.length;
      if (flameEl) {
        flameEl.src = IDLE_FRAMES[idleFrameIdx];
      }
    }, 140);
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

  // Bắt đầu nhép miệng/động đậy khi Carte nói
  function animateTalking(talkFrames, mainFrame, durationMs = 1200) {
    stopTalkingLoop();
    if (!talkFrames || talkFrames.length === 0) {
      if (flameEl) flameEl.src = mainFrame;
      return;
    }
    let idx = 0;
    talkingInterval = setInterval(() => {
      idx = (idx + 1) % talkFrames.length;
      if (flameEl) flameEl.src = talkFrames[idx];
    }, 220);

    // Sau khi nói xong một đoạn thì giữ biểu cảm chính
    setTimeout(() => {
      stopTalkingLoop();
      if (isAwake && flameEl) {
        flameEl.src = mainFrame;
      }
    }, durationMs);
  }

  // Chuyển đổi markdown đơn giản sang HTML an toàn
  function formatText(raw) {
    let esc = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Bold: **text**
    esc = esc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Line breaks
    esc = esc.replace(/\n\n/g, '</p><p>');
    esc = esc.replace(/\n/g, '<br>');
    return '<p>' + esc + '</p>';
  }

  // Cập nhật nội dung trang hội thoại
  function renderPage(pageIdx) {
    if (pageIdx < 0) pageIdx = 0;
    if (pageIdx >= DIALOGUE_PAGES.length) pageIdx = DIALOGUE_PAGES.length - 1;
    currentPage = pageIdx;

    const page = DIALOGUE_PAGES[currentPage];

    if (titleEl) titleEl.textContent = page.title;
    if (textEl) {
      textEl.innerHTML = formatText(page.text);
    }
    if (counterEl) {
      counterEl.textContent = `${currentPage + 1} / ${DIALOGUE_PAGES.length}`;
    }

    // Pager dots
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

    // Nút lùi/tiến
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

    // Chạy hoạt ảnh nói chuyện tương ứng
    animateTalking(page.talkFrames, page.mainFrame, 1300);
  }

  // Carte thức tỉnh khi ấn vào
  function awaken() {
    if (isAwake) {
      // Nếu đã mở thì ấn vào Carte sẽ chuyển sang trang tiếp theo
      nextPage();
      return;
    }

    // Bật nhạc nền nếu chưa bật
    if (window.Ambience && typeof window.Ambience.start === 'function') {
      window.Ambience.start();
    }

    stopIdleLoop();
    isAwake = true;

    if (containerEl) {
      containerEl.classList.add('is-awake');
    }

    // Chuỗi thức tỉnh sống động:
    // 1. Nhắm mắt ngủ -> 2. Mở to mắt giật mình 'O' -> 3. Giơ 2 tay reo vui -> 4. Mở khung thoại
    if (flameEl) {
      flameEl.src = 'assets/img/calcifer/calcifer_talk_1.webp'; // ngủ
    }

    setTimeout(() => {
      if (!isAwake) return;
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_2.webp'; // thức tỉnh 'O'
    }, 180);

    setTimeout(() => {
      if (!isAwake) return;
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_3.webp'; // giơ tay chào
    }, 420);

    setTimeout(() => {
      if (!isAwake) return;
      if (dialogEl) {
        dialogEl.classList.add('active');
        dialogEl.setAttribute('aria-hidden', 'false');
      }
      renderPage(0);
    }, 700);
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

    // Tạm biệt vui vẻ rồi nhắm mắt quay về lửa bình thường
    if (flameEl) {
      flameEl.src = 'assets/img/calcifer/calcifer_talk_4.webp'; // mỉm cười
    }

    setTimeout(() => {
      if (flameEl) flameEl.src = 'assets/img/calcifer/calcifer_talk_1.webp'; // nhắm mắt
    }, 400);

    setTimeout(() => {
      startIdleLoop();
    }, 850);
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

    // Đóng khi ấn phím Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isAwake) {
        dismiss();
      }
    });

    // Bắt đầu lửa bập bùng
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

// Tự khởi chạy khi DOM sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Calcifer.init);
} else {
  Calcifer.init();
}

window.Calcifer = Calcifer;
