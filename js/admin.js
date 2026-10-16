/* Trang admin: soạn bài rich-text và commit thẳng vào repo GitHub qua Contents API. */
(() => {
  const $ = id => document.getElementById(id);
  const CFG_KEY = 'poem-admin-cfg';
  const DATA_PATH = 'data/poems.json';
  let cfg = JSON.parse(localStorage.getItem(CFG_KEY) || '{}');
  let data = null, dataSha = null;
  let editing = null;            // {galaxyId, starId} khi sửa bài cũ
  let pos = { x: 50, y: 50 };
  let cover = { path: '', pending: null };   // pending = dataURL
  const pendingImgs = {};        // id -> dataURL (ảnh chèn trong bài)
  let savedRange = null;

  /* ---------- tiện ích ---------- */
  const setMsg = (t, err) => { $('msg').textContent = t; $('msg').style.color = err ? '#ff8a9a' : ''; };
  const setStatus = (t, cls) => { const s = $('status'); s.textContent = t; s.className = 'status ' + (cls || ''); };
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
    if (!cfg.token || !cfg.owner || !cfg.repo) { setStatus('Chưa kết nối', ''); return; }
    setStatus('Đang tải…');
    try {
      const f = await gh(DATA_PATH);
      dataSha = f.sha;
      data = JSON.parse(b64utf8(f.content));
      setStatus(`Đã kết nối · ${cfg.owner}/${cfg.repo}`, 'ok');
      fillGalaxies(); renderList(); newPost();
    } catch (e) { setStatus(e.message, 'err'); }
  }

  function fillGalaxies() {
    $('fGalaxy').innerHTML = data.constellations.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    $('fGalaxy').onchange = drawPicker;
  }

  function renderList() {
    const box = $('postList'); box.innerHTML = '';
    data.constellations.forEach(c => {
      const h = document.createElement('h4'); h.textContent = c.name; box.appendChild(h);
      c.stars.forEach(s => {
        const b = document.createElement('button');
        b.className = 'post-item' + (editing && editing.starId === s.id ? ' on' : '');
        b.innerHTML = `${s.title.replace(/</g, '&lt;')}<small>${s.date || ''}</small>`;
        b.onclick = () => editPost(c.id, s.id);
        box.appendChild(b);
      });
    });
  }

  /* ---------- picker vị trí sao ---------- */
  function curGalaxy() { return data && data.constellations.find(c => c.id === $('fGalaxy').value); }
  function drawPicker() {
    const g = curGalaxy(); const p = $('picker'); p.innerHTML = '';
    if (!g) return;
    p.style.backgroundImage = `url(${g.bgImg})`;
    g.stars.forEach(s => {
      if (editing && s.id === editing.starId) return;
      const d = document.createElement('i'); d.style.left = s.x + '%'; d.style.top = s.y + '%'; p.appendChild(d);
    });
    const m = document.createElement('b'); m.style.left = pos.x + '%'; m.style.top = pos.y + '%'; p.appendChild(m);
    $('posText').textContent = `x ${pos.x}% · y ${pos.y}%`;
  }
  $('picker').addEventListener('click', e => {
    const r = $('picker').getBoundingClientRect();
    pos = { x: +(((e.clientX - r.left) / r.width) * 100).toFixed(1), y: +(((e.clientY - r.top) / r.height) * 100).toFixed(1) };
    drawPicker();
  });

  /* ---------- form ---------- */
  function setCover(path, pending) {
    cover = { path: path || '', pending: pending || null };
    const src = pending || path;
    $('coverPrev').hidden = !src; if (src) $('coverPrev').src = src;
  }

  function newPost() {
    editing = null;
    ['fTag', 'fTitle', 'fDate', 'fLocation', 'fWeather'].forEach(i => $(i).value = '');
    $('editor').innerHTML = '<p><br></p>';
    setCover('', null); pos = { x: 50, y: 50 };
    $('deleteBtn').hidden = true; $('fGalaxy').disabled = false;
    if (data) { drawPicker(); renderList(); }
    setMsg('');
  }
  $('newBtn').onclick = newPost;

  function editPost(gid, sid) {
    const c = data.constellations.find(x => x.id === gid), s = c.stars.find(x => x.id === sid);
    editing = { galaxyId: gid, starId: sid };
    $('fGalaxy').value = gid; $('fGalaxy').disabled = true;
    $('fTag').value = s.tag || ''; $('fTitle').value = s.title || ''; $('fDate').value = s.date || '';
    $('fLocation').value = s.location || ''; $('fWeather').value = s.weather || '';
    $('editor').innerHTML = PoemRender.bodyHtml(s) || '<p><br></p>';
    setCover(s.coverImage || '', null);
    pos = { x: s.x, y: s.y };
    $('deleteBtn').hidden = false;
    drawPicker(); renderList(); setMsg('Đang sửa: ' + s.title);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('coverFile').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    setCover('', await compress(f, 1400)); e.target.value = '';
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
  ed.addEventListener('paste', e => {   // dán chữ thuần để không kéo theo CSS rác
    const html = e.clipboardData.getData('text/html');
    if (!html) return;
    e.preventDefault();
    document.execCommand('insertHTML', false, PoemRender.sanitize(html.replace(/<img[^>]*>/gi, '')));
  });

  /* ---------- đăng bài ---------- */
  async function uploadDataUrl(dataUrl, hint) {
    const path = `assets/photos/${Date.now().toString(36)}-${hint}.jpg`;
    await putFile(path, dataUrl.split(',')[1], `Thêm ảnh ${hint}`);
    return path;
  }

  async function publish() {
    if (!data) { setMsg('Hãy kết nối GitHub trước.', true); return; }
    const title = $('fTitle').value.trim();
    if (!title) { setMsg('Cần nhập tiêu đề.', true); return; }
    $('publishBtn').disabled = true;
    try {
      setMsg('Đang tải ảnh lên…');
      // 1. Ảnh bìa
      if (cover.pending) cover.path = await uploadDataUrl(cover.pending, 'cover');
      // 2. Ảnh trong bài
      const clone = ed.cloneNode(true);
      for (const img of clone.querySelectorAll('img[data-pending]')) {
        const id = img.dataset.pending;
        if (pendingImgs[id]) { img.setAttribute('src', await uploadDataUrl(pendingImgs[id], 'img')); }
        img.removeAttribute('data-pending');
      }
      const html = PoemRender.sanitize(clone.innerHTML);
      const plain = [...clone.querySelectorAll('p,h3,blockquote,li')].map(n => n.textContent.trim()).filter(Boolean);

      // 3. Cập nhật poems.json (lấy bản mới nhất để tránh ghi đè)
      setMsg('Đang lưu bài…');
      const fresh = await gh(DATA_PATH);
      data = JSON.parse(b64utf8(fresh.content)); dataSha = fresh.sha;

      const gid = editing ? editing.galaxyId : $('fGalaxy').value;
      const g = data.constellations.find(c => c.id === gid);
      const star = {
        id: editing ? editing.starId : `${gid}_${Date.now().toString(36)}`,
        x: pos.x, y: pos.y,
        tag: $('fTag').value.trim(), title, date: $('fDate').value.trim(),
        location: $('fLocation').value.trim(), weather: $('fWeather').value.trim(),
        coverImage: cover.path, html, body: plain
      };
      const i = g.stars.findIndex(s => s.id === star.id);
      i >= 0 ? g.stars[i] = star : g.stars.push(star);

      await putFile(DATA_PATH, utf8b64(JSON.stringify(data, null, 2) + '\n'), `${editing ? 'Sửa' : 'Đăng'} bài: ${title}`, dataSha);
      setMsg('✓ Đã đăng! GitHub Pages sẽ cập nhật sau ~1 phút.');
      await load(); editPost(gid, star.id);
    } catch (e) { setMsg(e.message, true); }
    $('publishBtn').disabled = false;
  }
  $('publishBtn').onclick = publish;

  $('deleteBtn').onclick = async () => {
    if (!editing || !confirm('Xóa bài này? (có thể khôi phục từ lịch sử commit)')) return;
    try {
      const fresh = await gh(DATA_PATH);
      data = JSON.parse(b64utf8(fresh.content));
      const g = data.constellations.find(c => c.id === editing.galaxyId);
      g.stars = g.stars.filter(s => s.id !== editing.starId);
      await putFile(DATA_PATH, utf8b64(JSON.stringify(data, null, 2) + '\n'), 'Xóa bài', fresh.sha);
      setMsg('Đã xóa.'); await load();
    } catch (e) { setMsg(e.message, true); }
  };

  $('exportBtn').onclick = () => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'poems.json'; a.click();
  };

  /* ---------- cài đặt ---------- */
  const dlg = $('settings');
  $('settingsBtn').onclick = () => {
    $('sOwner').value = cfg.owner || ''; $('sRepo').value = cfg.repo || '';
    $('sBranch').value = cfg.branch || 'main'; $('sToken').value = cfg.token || '';
    dlg.showModal();
  };
  $('sSave').onclick = () => {
    cfg = { owner: $('sOwner').value.trim(), repo: $('sRepo').value.trim(), branch: $('sBranch').value.trim() || 'main', token: $('sToken').value.trim() };
    localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
    setTimeout(load, 50);
  };
  $('sForget').onclick = () => { localStorage.removeItem(CFG_KEY); cfg = {}; data = null; dlg.close(); setStatus('Đã xóa token', ''); };

  load();
  if (!cfg.token) setTimeout(() => $('settingsBtn').click(), 300);
})();
