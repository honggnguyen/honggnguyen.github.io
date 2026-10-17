/* Giao diện Đọc Blog Kỷ Niệm Toàn Cảnh (Long-form Memory Blog View)
   - Nền sáng nhạt cùng tông ấm vintage dịu mắt (Cream / Linen / Ivory paper)
   - Thiết kế chuẩn phong cách Literary Blog / Medium phù hợp đọc bài viết dài
   - Nút quay lại ở bên trên cùng thanh tiến trình đọc bài (Reading Progress Bar)
*/
const BlogView = (() => {
  const $ = id => document.getElementById(id);
  const page = $('blogPage');
  let currentStar = null;
  let currentConstellation = null;
  let currentNode = null;
  let isOpen = false;

  function init() {
    if (!page) return;

    // Nút quay lại ở thanh header trên cùng
    const backBtn = $('blogBackBtn');
    if (backBtn) backBtn.addEventListener('click', close);

    // Nút đóng góc phải
    const closeBtn = $('blogCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    // Nút quay lại ở cuối bài viết
    const bottomBackBtn = $('blogBottomBackBtn');
    if (bottomBackBtn) bottomBackBtn.addEventListener('click', () => {
      close();
    });

    // Nút bài trước / sau
    const prevBtn = $('blogPrevBtn');
    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    const nextBtn = $('blogNextBtn');
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    // Phím tắt Escape để đóng
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    });

    // Theo dõi tiến trình cuộn đọc bài (Reading progress bar)
    page.addEventListener('scroll', updateScrollProgress, { passive: true });
  }

  function updateScrollProgress() {
    const bar = $('blogScrollProgress');
    if (!bar) return;
    const maxScroll = page.scrollHeight - page.clientHeight;
    if (maxScroll <= 0) {
      bar.style.width = '0%';
      return;
    }
    const percent = Math.min(100, Math.max(0, (page.scrollTop / maxScroll) * 100));
    bar.style.width = percent + '%';
  }

  function open(star, constellation, node) {
    if (!star || !page) return;
    isOpen = true;
    currentStar = star;
    currentConstellation = constellation || { stars: [star] };
    currentNode = node;

    // Điền dữ liệu bài viết
    const badge = $('blogBadge');
    if (badge) badge.textContent = star.tag || '✦ KỶ NIỆM · VIVI';

    const title = $('blogTitle');
    if (title) title.textContent = star.title || 'Bài viết kỷ niệm';

    const author = $('blogAuthor');
    if (author) author.textContent = star.author || 'Vivi';

    const date = $('blogDate');
    if (date) {
      date.textContent = star.date || '';
      date.style.display = star.date ? 'inline-flex' : 'none';
    }

    const loc = $('blogLocation');
    if (loc) {
      loc.textContent = star.location ? `📍 ${star.location}` : '';
      loc.style.display = star.location ? 'inline-flex' : 'none';
    }

    const wt = $('blogWeather');
    if (wt) {
      wt.textContent = star.weather ? `☁️ ${star.weather}` : '';
      wt.style.display = star.weather ? 'inline-flex' : 'none';
    }

    // Tính thời gian đọc ước tính
    const allText = Array.isArray(star.body) ? star.body.join(' ') : (star.body || '');
    const wordCount = allText.trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 120));
    const rtEl = $('blogReadTime');
    if (rtEl) rtEl.textContent = `⏱️ ${readTime} phút đọc`;

    // Ảnh bìa bài viết nếu có
    const coverWrap = $('blogCover');
    const coverImg = $('blogCoverImg');
    const coverCap = $('blogCoverCaption');
    if (coverWrap && coverImg) {
      if (star.coverImage || star.image) {
        coverImg.src = star.coverImage || star.image;
        coverImg.alt = star.title;
        if (coverCap) coverCap.textContent = star.caption || star.title || '';
        coverWrap.style.display = 'block';
      } else {
        coverWrap.style.display = 'none';
        coverImg.src = '';
      }
    }

    // Nội dung bài viết
    const content = $('blogContent');
    if (content) {
      content.innerHTML = renderBlogBody(star);
    }

    // Cập nhật nút điều hướng bài trước / bài sau
    updatePagination();

    // Mở trang
    page.classList.add('show');
    page.setAttribute('aria-hidden', 'false');
    document.body.classList.add('blog-open');
    page.scrollTop = 0;
    updateScrollProgress();

    // Phát âm thanh nhẹ nhàng
    try {
      if (window.Ambience && typeof Ambience.playChime === 'function') {
        Ambience.playChime();
      }
    } catch (e) {}
  }

  function renderBlogBody(star) {
    if (!star) return '';
    let raw = star.body;
    if (Array.isArray(raw)) {
      // Nhóm các câu thành các đoạn văn dài đẹp
      const paragraphs = [];
      let currentP = [];

      raw.forEach(line => {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed === '...' || trimmed === '***') {
          if (currentP.length > 0) {
            paragraphs.push(currentP.join('<br>'));
            currentP = [];
          }
        } else if (trimmed.startsWith('>') || trimmed.startsWith('"')) {
          if (currentP.length > 0) {
            paragraphs.push(currentP.join('<br>'));
            currentP = [];
          }
          paragraphs.push(`<blockquote>${trimmed.replace(/^>\s*/, '')}</blockquote>`);
        } else {
          currentP.push(trimmed);
        }
      });

      if (currentP.length > 0) {
        paragraphs.push(currentP.join('<br>'));
      }

      return paragraphs.map((p, idx) => {
        if (p.startsWith('<blockquote>')) return p;
        return `<p class="blog-p ${idx === 0 ? 'drop-cap' : ''}">${p}</p>`;
      }).join('');
    }

    // Nếu là chuỗi dài text có \n\n
    if (typeof raw === 'string') {
      const parts = raw.split(/\n\s*\n/);
      return parts.map((part, idx) => {
        const trimmed = part.trim();
        if (trimmed.startsWith('>')) {
          return `<blockquote>${trimmed.replace(/^>\s*/, '')}</blockquote>`;
        }
        return `<p class="blog-p ${idx === 0 ? 'drop-cap' : ''}">${trimmed.replace(/\n/g, '<br>')}</p>`;
      }).join('');
    }

    return '';
  }

  function updatePagination() {
    if (!currentConstellation || !currentConstellation.stars) return;
    const stars = currentConstellation.stars;
    const idx = stars.findIndex(s => s.id === currentStar.id);

    const prevBtn = $('blogPrevBtn');
    const nextBtn = $('blogNextBtn');

    if (prevBtn) {
      if (idx > 0) {
        prevBtn.style.visibility = 'visible';
        prevBtn.innerHTML = `‹ Bài trước: <em>${stars[idx - 1].shortTitle || stars[idx - 1].title}</em>`;
      } else {
        prevBtn.style.visibility = 'hidden';
      }
    }

    if (nextBtn) {
      if (idx < stars.length - 1) {
        nextBtn.style.visibility = 'visible';
        nextBtn.innerHTML = `Bài sau: <em>${stars[idx + 1].shortTitle || stars[idx + 1].title}</em> ›`;
      } else {
        nextBtn.style.visibility = 'hidden';
      }
    }
  }

  function goPrev() {
    if (!currentConstellation || !currentConstellation.stars) return;
    const stars = currentConstellation.stars;
    const idx = stars.findIndex(s => s.id === currentStar.id);
    if (idx > 0) {
      const nextStar = stars[idx - 1];
      open(nextStar, currentConstellation, null);
    }
  }

  function goNext() {
    if (!currentConstellation || !currentConstellation.stars) return;
    const stars = currentConstellation.stars;
    const idx = stars.findIndex(s => s.id === currentStar.id);
    if (idx < stars.length - 1) {
      const nextStar = stars[idx + 1];
      open(nextStar, currentConstellation, null);
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    page.classList.remove('show');
    page.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('blog-open');

    if (currentNode && typeof currentNode.focus === 'function') {
      try { currentNode.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  return { init, open, close };
})();

document.addEventListener('DOMContentLoaded', () => {
  BlogView.init();
});
