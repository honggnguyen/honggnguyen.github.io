/* Render nội dung bài viết: hỗ trợ cả `body` (mảng đoạn văn cũ) lẫn `html` (rich text từ trang admin).
   HTML luôn được lọc qua whitelist để an toàn. */
const PoemRender = (() => {
  const TAGS = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'SPAN', 'DIV', 'H2', 'H3', 'BLOCKQUOTE',
    'UL', 'OL', 'LI', 'IMG', 'FIGURE', 'FIGCAPTION', 'A', 'HR', 'FONT']);
  const STYLES = new Set(['font-family', 'font-size', 'color', 'text-align', 'font-style', 'font-weight',
    'text-decoration', 'line-height', 'letter-spacing']);
  const SAFE_URL = /^(https?:|assets\/|data\/|\.\/|\/|data:image\/(png|jpe?g|webp|gif);base64,)/i;

  function cleanStyle(v) {
    return v.split(';').map(x => x.trim()).filter(Boolean).filter(d => {
      const [k, ...rest] = d.split(':');
      const val = rest.join(':').toLowerCase();
      return STYLES.has(k.trim().toLowerCase()) && !/url\(|expression|javascript|@import/.test(val);
    }).join(';');
  }

  function sanitize(html) {
    const doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
    (function walk(node) {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) return;
        if (ch.nodeType !== 1 || !TAGS.has(ch.tagName)) { ch.remove(); return; }
        [...ch.attributes].forEach(a => {
          const n = a.name.toLowerCase();
          if (n === 'style') { const s = cleanStyle(a.value); s ? ch.setAttribute('style', s) : ch.removeAttribute('style'); }
          else if ((n === 'src' || n === 'href') && SAFE_URL.test(a.value.trim())) { /* ok */ }
          else if (['alt', 'class', 'data-w'].includes(n) && ch.tagName !== 'A') { /* ok */ }
          else if (n === 'alt' || n === 'target' || n === 'rel') { /* ok */ }
          else ch.removeAttribute(a.name);
        });
        if (ch.tagName === 'A') { ch.setAttribute('target', '_blank'); ch.setAttribute('rel', 'noopener'); }
        if (ch.tagName === 'IMG') ch.setAttribute('loading', 'lazy');
        walk(ch);
      });
    })(doc.body);
    return doc.body.innerHTML;
  }

  function legacy(lines) {
    return (lines || []).map(l => {
      const t = l.trim();
      if (t.startsWith('"') && t.endsWith('"')) return `<blockquote class="blog-quote">${t.slice(1, -1)}</blockquote>`;
      return `<p>${l.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  function bodyHtml(star) {
    return star.html ? sanitize(star.html) : legacy(star.body);
  }

  return { sanitize, bodyHtml };
})();
window.PoemRender = PoemRender;
