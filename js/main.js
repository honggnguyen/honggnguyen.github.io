document.addEventListener('DOMContentLoaded', async () => {
  Intro.init();
  await Galaxy.init();
  ZodiacPlayer.init();
  document.getElementById('homeBtn').addEventListener('click', () => Intro.back());

  // Hỗ trợ điều hướng 2 chiều: nếu từ trang blog.html quay lại với ?scene=galaxy
  const params = new URLSearchParams(window.location.search);
  if (params.get('scene') === 'galaxy') {
    if (Intro.skipToGalaxy) Intro.skipToGalaxy();
    const cat = params.get('cat');
    if (cat && Galaxy.showCategory) {
      Galaxy.showCategory(cat);
    }
  }
});
