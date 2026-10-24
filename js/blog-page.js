/* ==========================================================================
   BLOG KỶ NIỆM (VIVI'S POETIC JOURNAL) - JAVASCRIPT CONTROLLER
   Quản lý danh sách bài viết, thanh bên Sidebar, tìm kiếm, đọc bài và điều hướng 2 chiều
   ========================================================================== */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  let allPosts = [];
  let currentPost = null;

  // Khởi tạo trang khi DOM sẵn sàng
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    bindUIEvents();
    await loadData();
    determineInitialPost();
    updateReadingProgress();
  }

  function bindUIEvents() {
    // Theo dõi tiến trình đọc khi cuộn trang
    window.addEventListener('scroll', updateReadingProgress, { passive: true });

    // Tìm kiếm bài viết tức thì ở thanh bên Sidebar
    const searchInput = $('blogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        filterSidebarPosts(e.target.value.trim().toLowerCase());
      });
    }

    // Nút gập / mở Sidebar trên Desktop (Tập trung toàn màn hình cho bài viết)
    const desktopToggle = $('sidebarToggleBtn');
    if (desktopToggle) {
      desktopToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
      });
    }

    // Toggle menu Sidebar trên điện thoại
    const drawerToggle = $('mobileSidebarToggle');
    const sidebar = $('blogSidebar');
    const backdrop = $('sidebarBackdrop');
    const closeBtn = $('sidebarCloseBtn');

    if (drawerToggle && sidebar && backdrop) {
      drawerToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
        backdrop.classList.add('show');
      });

      const closeDrawer = () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
      };

      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
      backdrop.addEventListener('click', closeDrawer);
    }

    // Lắng nghe thay đổi URL (Popstate / Back / Forward của trình duyệt)
    window.addEventListener('popstate', () => {
      determineInitialPost();
    });
  }

  async function loadData() {
    try {
      const res = await fetch('data/poems.json?v=' + Date.now());
      if (!res.ok) throw new Error('Không thể tải dữ liệu bài viết');
      const data = await res.json();

      // Tìm chòm sao Kỷ Niệm
      const kyniemCat = data.categories?.find(c => c.id === 'kyniem');
      if (kyniemCat && kyniemCat.galaxies?.[0]?.stars?.length) {
        allPosts = kyniemCat.galaxies[0].stars;
      } else {
        const kyNiemGalaxy = data.constellations?.find(c => c.id === 'ky-niem' || c.category === 'kyniem' || (c.name && c.name.includes('Kỷ Niệm')));
        if (kyNiemGalaxy && kyNiemGalaxy.stars?.length) {
          allPosts = kyNiemGalaxy.stars;
        } else {
          // Fallback nếu không có cấu trúc riêng
          allPosts = (data.constellations || []).flatMap(c => c.stars || []);
        }
      }

      renderSidebarPosts(allPosts);
    } catch (err) {
      console.error('Lỗi nạp bài viết blog:', err);
      const postBody = $('postBody');
      if (postBody) {
        postBody.innerHTML = '<p class="error-msg">Không thể tải danh sách bài viết. Vui lòng thử lại sau.</p>';
      }
    }
  }

  function determineInitialPost() {
    if (!allPosts.length) return;

    // 1. Kiểm tra tham số ?post=... trong URL
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post') || window.location.hash.replace('#', '');

    let target = null;
    if (postId) {
      target = allPosts.find(p => p.id === postId || p.id === decodeURIComponent(postId));
    }

    // Mặc định chọn bài đầu tiên nếu không có tham số hoặc không tìm thấy
    if (!target) target = allPosts[0];

    loadPost(target, false);
  }

  function renderSidebarPosts(posts) {
    const listEl = $('sidebarPostList');
    const countBadge = $('postCount');
    if (!listEl) return;

    if (countBadge) countBadge.textContent = posts.length;
    listEl.innerHTML = '';

    if (!posts.length) {
      listEl.innerHTML = '<div style="padding:12px;font-size:0.8rem;color:var(--text-sub);text-align:center;">Không tìm thấy bài viết phù hợp</div>';
      return;
    }

    posts.forEach((post, idx) => {
      const item = document.createElement('a');
      item.className = 'sp-item' + (currentPost && currentPost.id === post.id ? ' active' : '');
      item.href = `?post=${encodeURIComponent(post.id)}`;
      item.dataset.id = post.id;

      item.innerHTML = `
        <span class="sp-num">#${idx + 1}</span>
        <div class="sp-info">
          <div class="sp-title">${post.title || 'Chưa đặt tiêu đề'}</div>
          <div class="sp-date">${post.date || ''}</div>
        </div>
      `;

      item.addEventListener('click', e => {
        e.preventDefault();
        loadPost(post, true);

        // Đóng drawer trên điện thoại nếu đang mở
        const sidebar = $('blogSidebar');
        const backdrop = $('sidebarBackdrop');
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('show');
      });

      listEl.appendChild(item);
    });
  }

  function filterSidebarPosts(query) {
    if (!query) {
      renderSidebarPosts(allPosts);
      return;
    }

    const filtered = allPosts.filter(p => {
      const titleMatch = (p.title || '').toLowerCase().includes(query);
      const locMatch = (p.location || '').toLowerCase().includes(query);
      const dateMatch = (p.date || '').toLowerCase().includes(query);
      const bodyText = Array.isArray(p.body) ? p.body.join(' ') : (p.body || '');
      const bodyMatch = bodyText.toLowerCase().includes(query);
      return titleMatch || locMatch || dateMatch || bodyMatch;
    });

    renderSidebarPosts(filtered);
  }

  function loadPost(post, pushState = true) {
    if (!post) return;
    currentPost = post;

    // Cập nhật URL trình duyệt để người dùng có thể copy và chia sẻ link
    if (pushState) {
      const newUrl = `${window.location.pathname}?post=${encodeURIComponent(post.id)}`;
      window.history.pushState({ postId: post.id }, '', newUrl);
    }

    // Đánh dấu active trong Sidebar
    const items = document.querySelectorAll('.sp-item');
    items.forEach(el => {
      el.classList.toggle('active', el.dataset.id === post.id);
    });

    // Cập nhật tiêu đề trang
    document.title = `${post.title || 'Kỷ Niệm'} · Vivi's Poetic Journal`;

    // Điền nội dung bài viết
    const badge = $('postBadge');
    if (badge) badge.textContent = post.tag || '✦ KỶ NIỆM · VIVI';

    const title = $('postTitle');
    if (title) title.textContent = post.title || 'Bài viết kỷ niệm';

    const date = $('postDate');
    if (date) {
      date.textContent = post.date || '';
      const parent = date.closest('.meta-item');
      if (parent) parent.style.display = post.date ? 'inline-flex' : 'none';
    }

    const author = $('postAuthor');
    if (author) author.textContent = post.author || 'Vivi';

    const loc = $('postLocation');
    if (loc) {
      loc.textContent = post.location || '';
      const parent = loc.closest('.meta-item');
      if (parent) parent.style.display = post.location ? 'inline-flex' : 'none';
    }

    const weather = $('postWeather');
    if (weather) {
      weather.textContent = post.weather || '';
      const parent = weather.closest('.meta-item');
      if (parent) parent.style.display = post.weather ? 'inline-flex' : 'none';
    }

    // Thời gian đọc ước tính
    const allText = Array.isArray(post.body) ? post.body.join(' ') : (post.body || '');
    const words = allText.trim().split(/\s+/).filter(Boolean).length;
    const readMinutes = Math.max(1, Math.ceil(words / 130));
    const rt = $('postReadTime');
    if (rt) rt.textContent = `${readMinutes} phút đọc`;

    // Ảnh bìa nếu có
    const coverFig = $('postCover');
    const coverImg = $('postCoverImg');
    const coverCap = $('postCoverCaption');
    const imgUrl = post.coverImage || post.image;

    if (coverFig && coverImg) {
      if (imgUrl) {
        coverImg.src = imgUrl;
        coverImg.alt = post.title || 'Ảnh kỷ niệm';
        if (coverCap) {
          coverCap.textContent = '';
          coverCap.style.display = 'none';
        }
        coverFig.style.display = 'block';
      } else {
        coverFig.style.display = 'none';
        coverImg.src = '';
      }
    }

    // Render thân bài viết
    const bodyEl = $('postBody');
    if (bodyEl) {
      bodyEl.innerHTML = formatBodyHtml(post.body);
    }

    // Cập nhật phân trang (Bài trước / Bài sau)
    updatePagination(post);

    // Cập nhật link quay về đúng chòm sao trên thiên hà
    const galaxyReturnBtn = $('galaxyReturnBtn');
    if (galaxyReturnBtn) {
      galaxyReturnBtn.href = `index.html?scene=galaxy&cat=kyniem&star=${encodeURIComponent(post.id)}`;
    }

    // Cuộn lên đầu bài viết mượt mà
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateReadingProgress();
  }

  function formatBodyHtml(body) {
    if (!body) return '';
    if (typeof body === 'string') return `<p>${body}</p>`;
    if (!Array.isArray(body)) return '';

    const paragraphs = [];
    let currentP = [];

    body.forEach(line => {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed === '...' || trimmed === '***') {
        if (currentP.length > 0) {
          paragraphs.push(`<p>${currentP.join('<br>')}</p>`);
          currentP = [];
        }
      } else if (trimmed.startsWith('>')) {
        if (currentP.length > 0) {
          paragraphs.push(`<p>${currentP.join('<br>')}</p>`);
          currentP = [];
        }
        const quoteText = trimmed.replace(/^>\s*/, '');
        paragraphs.push(`<blockquote>${quoteText}</blockquote>`);
      } else {
        currentP.push(trimmed);
      }
    });

    if (currentP.length > 0) {
      paragraphs.push(`<p>${currentP.join('<br>')}</p>`);
    }

    return paragraphs.join('\n');
  }

  function updatePagination(current) {
    const idx = allPosts.findIndex(p => p.id === current.id);
    const prevBtn = $('prevPostBtn');
    const nextBtn = $('nextPostBtn');

    if (prevBtn) {
      if (idx > 0) {
        const prevPost = allPosts[idx - 1];
        prevBtn.style.visibility = 'visible';
        prevBtn.innerHTML = `‹ Bài trước: <em>${prevPost.shortTitle || prevPost.title}</em>`;
        prevBtn.onclick = () => loadPost(prevPost, true);
      } else {
        prevBtn.style.visibility = 'hidden';
      }
    }

    if (nextBtn) {
      if (idx < allPosts.length - 1) {
        const nextPost = allPosts[idx + 1];
        nextBtn.style.visibility = 'visible';
        nextBtn.innerHTML = `Bài sau: <em>${nextPost.shortTitle || nextPost.title}</em> ›`;
        nextBtn.onclick = () => loadPost(nextPost, true);
      } else {
        nextBtn.style.visibility = 'hidden';
      }
    }
  }

  function updateReadingProgress() {
    const bar = $('readingProgressBar');
    if (!bar) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) {
      bar.style.width = '0%';
      return;
    }

    const percent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    bar.style.width = percent + '%';
  }

})();
