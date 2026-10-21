/* Trang admin: Soạn bài rich-text, quản lý đổi vị trí/chòm sao và commit lên GitHub qua Contents API. */
(() => {
  const $ = id => document.getElementById(id);
  const CFG_KEY = 'poem-admin-cfg';
  const DATA_PATH = 'data/poems.json';
  let cfg = JSON.parse(localStorage.getItem(CFG_KEY) || '{}');
  let data = null, dataSha = null;
  let editing = null;            // { galaxyId, starId, origGalaxyId } khi sửa bài cũ
  let pos = { x: 50, y: 50 };
  let cover = { path: '', pending: null };   // pending = dataURL
  const pendingImgs = {};        // id -> dataURL (ảnh chèn trong bài)
  let savedRange = null;
  let isDragging = false;

  /* ---------- tiện ích ---------- */
  const setMsg = (t, err) => {
    const el = $('msg');
    if (!el) return;
    el.textContent = t;
    el.style.color = err ? '#ff8a9a' : 'var(--gold)';
  };
  const setStatus = (t, cls) => {
    const s = $('status');
    if (!s) return;
    s.textContent = t;
    s.className = 'status ' + (cls || '');
  };
  const utf8b64 = s => btoa(unescape(encodeURIComponent(s)));
  const b64utf8 = b => decodeURIComponent(escape(atob(b.replace(/\n/g, ''))));

  async function gh(path, opts = {}) {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
    const res = await fetch(url + (opts.method === 'PUT' || opts.method === 'DELETE' ? '' : `?ref=${cfg.branch || 'main'}`), {
      cache: 'no-store', ...opts,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.json().catch(() => ({}))).message || res.statusText}`);
    return res.json();
  }

  async function putFile(path, contentB64, message, sha) {
    return gh(path, { method: 'PUT', body: JSON.stringify({ message, content: contentB64, branch: cfg.branch || 'main', ...(sha ? { sha } : {}) }) });
  }

  /* ---------- nén ảnh trước khi upload ---------- */
  function compress(file, max = 1600) {
    return new Promise((ok, fail) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        ok(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = fail;
      img.src = URL.createObjectURL(file);
    });
  }
  const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- tải dữ liệu ---------- */
  async function load() {
    if (!cfg.token || !cfg.owner || !cfg.repo) {
      // Chế độ đọc/sửa cục bộ khi chưa nhập token
      try {
        const res = await fetch(DATA_PATH + '?v=' + Date.now());
        if (res.ok) {
          data = await res.json();
          setStatus('Chế độ cục bộ (chưa kết nối GitHub - dùng Xuất JSON để lưu)', 'ok');
          fillGalaxies(); renderList(); newPost();
        } else {
          setStatus('Chưa kết nối GitHub', '');
        }
      } catch (e) {
        setStatus('Chưa kết nối GitHub', '');
      }
      return;
    }

    setStatus('Đang tải từ GitHub…');
    try {
      const f = await gh(DATA_PATH);
      dataSha = f.sha;
      data = JSON.parse(b64utf8(f.content));
      setStatus(`Đã kết nối · ${cfg.owner}/${cfg.repo}`, 'ok');
      fillGalaxies(); renderList(); newPost();
    } catch (e) {
      setStatus(e.message, 'err');
    }
  }

  /* Danh sách chòm sao */
  function getConstellations() {
    return (data && data.constellations) || [];
  }

  function fillGalaxies() {
    const list = getConstellations();
    const opts = list.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    $('fGalaxy').innerHTML = opts;
    $('fGalaxy').onchange = onGalaxyChange;

    const filter = $('filterGalaxy');
    if (filter) {
      filter.innerHTML = `<option value="">✦ Tất cả chòm sao (${list.length})</option>` + opts;
      filter.onchange = renderList;
    }
  }

  function onGalaxyChange() {
    const hint = $('galaxyMoveHint');
    if (editing && editing.origGalaxyId) {
      const currentGid = $('fGalaxy').value;
      if (currentGid !== editing.origGalaxyId) {
        const oldG = getConstellations().find(c => c.id === editing.origGalaxyId);
        const newG = getConstellations().find(c => c.id === currentGid);
        if (hint) {
          hint.innerHTML = `⇄ Chuyển từ <b>${oldG ? oldG.name : editing.origGalaxyId}</b> sang <b>${newG ? newG.name : currentGid}</b> (nhấp trên bản đồ bên dưới để đặt tọa độ mới)`;
          hint.style.color = 'var(--gold)';
        }
      } else {
        if (hint) hint.textContent = '';
      }
    } else {
      if (hint) hint.textContent = '';
    }
    drawPicker();
  }

  function renderList() {
    const box = $('postList');
    if (!box || !data) return;
    box.innerHTML = '';

    const filterGid = $('filterGalaxy') ? $('filterGalaxy').value : '';
    const query = $('searchPost') ? $('searchPost').value.trim().toLowerCase() : '';

    const list = getConstellations();
    let totalShown = 0;

    list.forEach(c => {
      if (filterGid && c.id !== filterGid) return;

      const stars = c.stars.filter(s => {
        if (!query) return true;
        const titleMatch = (s.title || '').toLowerCase().includes(query);
        const tagMatch = (s.tag || '').toLowerCase().includes(query);
        const bodyMatch = Array.isArray(s.body) ? s.body.join(' ').toLowerCase().includes(query) : '';
        return titleMatch || tagMatch || bodyMatch;
      });

      if (stars.length === 0) return;

      const h = document.createElement('h4');
      h.innerHTML = `${c.name} <small style="color:var(--pink-soft);font-weight:normal">(${stars.length})</small>`;
      box.appendChild(h);

      stars.forEach(s => {
        totalShown++;
        const b = document.createElement('button');
        b.className = 'post-item' + (editing && editing.starId === s.id ? ' on' : '');
        b.innerHTML = `
          <div class="p-title">${s.title.replace(/</g, '&lt;')}</div>
          <div class="p-meta">
            <span>${s.date || ''}</span>
            <span class="p-badge" title="Tọa độ">x:${s.x}% y:${s.y}%</span>
          </div>
        `;
        b.onclick = () => editPost(c.id, s.id);
        box.appendChild(b);
      });
    });

    if (totalShown === 0) {
      box.innerHTML = '<p class="muted" style="padding:10px 0">Không tìm thấy bài thơ nào phù hợp.</p>';
    }
  }

  if ($('searchPost')) {
    $('searchPost').oninput = renderList;
  }

  /* ---------- picker vị trí sao ---------- */
  function curGalaxy() {
    const list = getConstellations();
    return list.find(c => c.id === $('fGalaxy').value);
  }

  function setPos(newX, newY, redraw = true) {
    pos.x = +(Math.max(1, Math.min(99, Number(newX) || 50))).toFixed(1);
    pos.y = +(Math.max(1, Math.min(99, Number(newY) || 50))).toFixed(1);

    const fX = $('fPosX'), fY = $('fPosY');
    if (fX && document.activeElement !== fX) fX.value = pos.x;
    if (fY && document.activeElement !== fY) fY.value = pos.y;

    if (redraw) drawPicker();
  }

  function drawPicker() {
    const g = curGalaxy();
    const p = $('picker');
    if (!p) return;
    p.innerHTML = '';
    if (!g) return;

    p.style.backgroundImage = `url(${g.bgImg})`;

    // Vẽ các ngôi sao bài khác trong chòm sao
    g.stars.forEach(s => {
      if (editing && s.id === editing.starId && editing.origGalaxyId === g.id) return;
      const d = document.createElement('i');
      d.style.left = s.x + '%';
      d.style.top = s.y + '%';
      d.title = `${s.title} (${s.x}%, ${s.y}%)`;
      p.appendChild(d);
    });

    // Điểm đánh dấu ngôi sao đang chỉnh/thêm mới
    const marker = document.createElement('b');
    marker.id = 'pickerMarker';
    marker.style.left = pos.x + '%';
    marker.style.top = pos.y + '%';
    marker.title = `Ngôi sao này (${pos.x}%, ${pos.y}%) - Kéo thả để đổi vị trí`;
    p.appendChild(marker);

    const fX = $('fPosX'), fY = $('fPosY');
    if (fX && document.activeElement !== fX) fX.value = pos.x;
    if (fY && document.activeElement !== fY) fY.value = pos.y;
  }

  // Cập nhật vị trí từ tọa độ chuột/touch
  function updatePosFromEvent(e) {
    const p = $('picker');
    if (!p) return;
    const r = p.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const nx = ((clientX - r.left) / r.width) * 100;
    const ny = ((clientY - r.top) / r.height) * 100;
    setPos(nx, ny);
  }

  const pickerEl = $('picker');
  if (pickerEl) {
    pickerEl.addEventListener('mousedown', e => {
      isDragging = true;
      updatePosFromEvent(e);
    });
    window.addEventListener('mousemove', e => {
      if (isDragging) updatePosFromEvent(e);
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Hỗ trợ Touch cho điện thoại/tablet
    pickerEl.addEventListener('touchstart', e => {
      isDragging = true;
      updatePosFromEvent(e);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchmove', e => {
      if (isDragging) {
        updatePosFromEvent(e);
        e.preventDefault();
      }
    }, { passive: false });
    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // Nhập số thủ công
  if ($('fPosX')) {
    $('fPosX').addEventListener('input', e => setPos(e.target.value, pos.y));
  }
  if ($('fPosY')) {
    $('fPosY').addEventListener('input', e => setPos(pos.x, e.target.value));
  }
  if ($('resetPosBtn')) {
    $('resetPosBtn').addEventListener('click', () => setPos(50, 50));
  }

  /* ---------- form ---------- */
  function setCover(path, pending) {
    cover = { path: path || '', pending: pending || null };
    const src = pending || path;
    const prev = $('coverPrev');
    if (prev) {
      prev.hidden = !src;
      if (src) prev.src = src;
    }
  }

  function newPost() {
    editing = null;
    ['fTag', 'fTitle', 'fDate', 'fLocation', 'fWeather'].forEach(i => {
      if ($(i)) $(i).value = '';
    });
    $('editor').innerHTML = '<p><br></p>';
    setCover('', null);
    setPos(50, 50, false);
    $('deleteBtn').hidden = true;
    $('fGalaxy').disabled = false;
    if ($('galaxyMoveHint')) $('galaxyMoveHint').textContent = '';
    if (data) { drawPicker(); renderList(); }
    setMsg('');
  }
  $('newBtn').onclick = newPost;

  function editPost(gid, sid) {
    const list = getConstellations();
    const c = list.find(x => x.id === gid);
    if (!c) return;
    const s = c.stars.find(x => x.id === sid);
    if (!s) return;

    editing = { galaxyId: gid, starId: sid, origGalaxyId: gid };

    // CHO PHÉP ĐỔI CHÒM SAO!
    $('fGalaxy').value = gid;
    $('fGalaxy').disabled = false;
    if ($('galaxyMoveHint')) {
      $('galaxyMoveHint').innerHTML = `Đang ở chòm sao <b>${c.name}</b>. Bạn có thể chọn chòm sao khác ở ô này để chuyển bài.`;
      $('galaxyMoveHint').style.color = '#a998c5';
    }

    $('fTag').value = s.tag || '';
    $('fTitle').value = s.title || '';
    $('fDate').value = s.date || '';
    $('fLocation').value = s.location || '';
    $('fWeather').value = s.weather || '';
    $('editor').innerHTML = (typeof PoemRender !== 'undefined' ? PoemRender.bodyHtml(s) : '') || '<p><br></p>';
    setCover(s.coverImage || '', null);

    setPos(s.x || 50, s.y || 50, false);
    $('deleteBtn').hidden = false;

    drawPicker();
    renderList();
    setMsg(`Đang chỉnh sửa: ${s.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('coverFile').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    setCover('', await compress(f, 1400));
    e.target.value = '';
  };
  $('coverClear').onclick = () => setCover('', null);

  /* ---------- trình soạn thảo ---------- */
  const ed = $('editor');
  document.addEventListener('selectionchange', () => {
    const s = getSelection();
    if (s.rangeCount && ed.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange();
  });
  function restore() {
    ed.focus();
    if (savedRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
  }
  document.execCommand('styleWithCSS', false, true);

  $('toolbar').addEventListener('mousedown', e => { if (e.target.tagName === 'BUTTON') e.preventDefault(); });
  $('toolbar').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'tbImg') { $('imgFile').click(); return; }
    restore();
    if (b.dataset.cmd) document.execCommand(b.dataset.cmd);
    if (b.dataset.block) document.execCommand('formatBlock', false, b.dataset.block);
  });
  $('tbFont').onchange = e => { if (!e.target.value) return; restore(); document.execCommand('styleWithCSS', false, true); document.execCommand('fontName', false, e.target.value); e.target.value = ''; };
  $('tbColor').oninput = e => { restore(); document.execCommand('styleWithCSS', false, true); document.execCommand('foreColor', false, e.target.value); };
  $('tbSize').onchange = e => {
    const v = e.target.value; e.target.value = ''; if (!v) return;
    restore();
    const s = getSelection(); if (!s.rangeCount || s.isCollapsed) { setMsg('Hãy bôi đen đoạn chữ cần đổi cỡ.'); return; }
    const r = s.getRangeAt(0), span = document.createElement('span');
    span.style.fontSize = v; span.appendChild(r.extractContents()); r.insertNode(span);
  };
  $('imgFile').onchange = async e => {
    restore();
    for (const f of e.target.files) {
      const id = uid(), url = await compress(f);
      pendingImgs[id] = url;
      document.execCommand('insertHTML', false, `<img src="${url}" data-pending="${id}" alt="">`);
    }
    e.target.value = '';
  };
  ed.addEventListener('paste', e => {
    const html = e.clipboardData.getData('text/html');
    if (!html) return;
    e.preventDefault();
    document.execCommand('insertHTML', false, typeof PoemRender !== 'undefined' ? PoemRender.sanitize(html.replace(/<img[^>]*>/gi, '')) : html);
  });

  /* ---------- đăng bài ---------- */
  async function uploadDataUrl(dataUrl, hint) {
    const path = `assets/photos/${Date.now().toString(36)}-${hint}.jpg`;
    await putFile(path, dataUrl.split(',')[1], `Thêm ảnh ${hint}`);
    return path;
  }

  // Đồng bộ cập nhật vào cả data.constellations lẫn data.categories (nếu có)
  function syncStarInData(targetGid, star, origGid) {
    // 1. Cập nhật data.constellations
    if (data.constellations) {
      if (origGid && origGid !== targetGid) {
        const oldC = data.constellations.find(c => c.id === origGid);
        if (oldC) oldC.stars = oldC.stars.filter(s => s.id !== star.id);
      }
      const newC = data.constellations.find(c => c.id === targetGid);
      if (newC) {
        const i = newC.stars.findIndex(s => s.id === star.id);
        if (i >= 0) newC.stars[i] = star;
        else newC.stars.push(star);
      }
    }

    // 2. Cập nhật data.categories
    if (data.categories) {
      if (origGid && origGid !== targetGid) {
        data.categories.forEach(cat => {
          (cat.galaxies || []).forEach(g => {
            if (g.id === origGid) g.stars = g.stars.filter(s => s.id !== star.id);
          });
        });
      }
      data.categories.forEach(cat => {
        (cat.galaxies || []).forEach(g => {
          if (g.id === targetGid) {
            const i = g.stars.findIndex(s => s.id === star.id);
            if (i >= 0) g.stars[i] = star;
            else g.stars.push(star);
          }
        });
      });
    }
  }

  // Xóa sao trong cả constellations lẫn categories
  function removeStarFromData(gid, sid) {
    if (data.constellations) {
      const c = data.constellations.find(x => x.id === gid);
      if (c) c.stars = c.stars.filter(s => s.id !== sid);
    }
    if (data.categories) {
      data.categories.forEach(cat => {
        (cat.galaxies || []).forEach(g => {
          if (g.id === gid) g.stars = g.stars.filter(s => s.id !== sid);
        });
      });
    }
  }

  async function publish() {
    if (!data) { setMsg('Chưa có dữ liệu bài viết.', true); return; }
    const title = $('fTitle').value.trim();
    if (!title) { setMsg('Cần nhập tiêu đề.', true); return; }

    $('publishBtn').disabled = true;
    try {
      setMsg('Đang xử lý ảnh & dữ liệu…');
      // 1. Ảnh bìa
      if (cover.pending && cfg.token) {
        cover.path = await uploadDataUrl(cover.pending, 'cover');
      }
      // 2. Ảnh trong bài
      const clone = ed.cloneNode(true);
      if (cfg.token) {
        for (const img of clone.querySelectorAll('img[data-pending]')) {
          const id = img.dataset.pending;
          if (pendingImgs[id]) { img.setAttribute('src', await uploadDataUrl(pendingImgs[id], 'img')); }
          img.removeAttribute('data-pending');
        }
      }
      const html = typeof PoemRender !== 'undefined' ? PoemRender.sanitize(clone.innerHTML) : clone.innerHTML;
      const plain = [...clone.querySelectorAll('p,h3,blockquote,li')].map(n => n.textContent.trim()).filter(Boolean);

      const targetGid = $('fGalaxy').value;
      const origGid = editing ? editing.origGalaxyId : null;

      // 3. Nếu kết nối GitHub, lấy bản mới nhất để tránh conflict
      if (cfg.token && cfg.owner && cfg.repo) {
        setMsg('Đang tải bản mới nhất từ GitHub…');
        const fresh = await gh(DATA_PATH);
        data = JSON.parse(b64utf8(fresh.content));
        dataSha = fresh.sha;
      }

      const star = {
        id: editing ? editing.starId : `${targetGid}_${Date.now().toString(36)}`,
        x: pos.x,
        y: pos.y,
        tag: $('fTag').value.trim() || 'Thơ',
        title,
        date: $('fDate').value.trim(),
        location: $('fLocation').value.trim(),
        weather: $('fWeather').value.trim(),
        coverImage: cover.path,
        html,
        body: plain
      };

      syncStarInData(targetGid, star, origGid);

      if (cfg.token && cfg.owner && cfg.repo) {
        setMsg('Đang commit lên GitHub…');
        const commitMsg = origGid && origGid !== targetGid
          ? `Chuyển bài "${title}" từ chòm sao ${origGid} sang ${targetGid} (${pos.x}%, ${pos.y}%)`
          : `${editing ? 'Sửa' : 'Đăng'} bài: ${title} (${pos.x}%, ${pos.y}%)`;

        await putFile(DATA_PATH, utf8b64(JSON.stringify(data, null, 2) + '\n'), commitMsg, dataSha);
        setMsg(`✓ Đã lưu thành công lên chòm sao ${targetGid}! GitHub Pages sẽ cập nhật sau ~1 phút.`);
        await load();
        editPost(targetGid, star.id);
      } else {
        // Chế độ cục bộ
        setMsg(`✓ Đã lưu thay đổi vào bộ nhớ cục bộ! Bấm "Xuất JSON" để tải file về.`);
        renderList();
        editPost(targetGid, star.id);
      }
    } catch (e) {
      setMsg(e.message, true);
    }
    $('publishBtn').disabled = false;
  }
  $('publishBtn').onclick = publish;

  $('deleteBtn').onclick = async () => {
    if (!editing || !confirm('Xóa bài này khỏi thiên hà?')) return;
    try {
      if (cfg.token && cfg.owner && cfg.repo) {
        const fresh = await gh(DATA_PATH);
        data = JSON.parse(b64utf8(fresh.content));
        removeStarFromData(editing.galaxyId, editing.starId);
        await putFile(DATA_PATH, utf8b64(JSON.stringify(data, null, 2) + '\n'), 'Xóa bài ' + editing.starId, fresh.sha);
        setMsg('Đã xóa thành công.');
        await load();
      } else {
        removeStarFromData(editing.galaxyId, editing.starId);
        setMsg('Đã xóa trong bộ nhớ cục bộ.');
        renderList();
        newPost();
      }
    } catch (e) {
      setMsg(e.message, true);
    }
  };

  $('exportBtn').onclick = () => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' }));
    a.download = 'poems.json';
    a.click();
  };

  /* ---------- cài đặt ---------- */
  const dlg = $('settings');
  $('settingsBtn').onclick = () => {
    $('sOwner').value = cfg.owner || '';
    $('sRepo').value = cfg.repo || '';
    $('sBranch').value = cfg.branch || 'main';
    $('sToken').value = cfg.token || '';
    dlg.showModal();
  };
  $('sSave').onclick = () => {
    cfg = {
      owner: $('sOwner').value.trim(),
      repo: $('sRepo').value.trim(),
      branch: $('sBranch').value.trim() || 'main',
      token: $('sToken').value.trim()
    };
    localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
    setTimeout(load, 50);
  };
  $('sForget').onclick = () => {
    localStorage.removeItem(CFG_KEY);
    cfg = {};
    dlg.close();
    setStatus('Đã xóa token (chế độ cục bộ)', '');
    load();
  };

  load();
})();
