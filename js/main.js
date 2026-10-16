document.addEventListener('DOMContentLoaded', () => {
  Intro.init();
  Galaxy.init();
  ZodiacPlayer.init();
  document.getElementById('homeBtn').addEventListener('click', () => Intro.back());
});
