/* Shared across every page: mobile nav toggle, scroll-reveal, footer year */

const navlinks = document.getElementById('navlinks');
const burgerToggle = document.getElementById('burgerToggle');
if (burgerToggle && navlinks) {
  burgerToggle.addEventListener('click', () => navlinks.classList.toggle('open'));
  navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navlinks.classList.remove('open')));
}

const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
// re-observe elements added dynamically by page-specific scripts (menu cards, reviews, instagram grid)
window.addEventListener('load', () => {
  setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el)), 50);
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
