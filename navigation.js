const links = [...document.querySelectorAll('[data-menu-link][data-page]')];
const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
const menu = document.getElementById('catalog-drawer');
let scheduled = false;

function updateFromScroll() {
  scheduled = false;
  if (!links.length) return;
  const threshold = Math.min(160, innerHeight * 0.25);
  let index = 0;
  sections.forEach((section, position) => {
    if (section.getBoundingClientRect().top <= threshold) index = position;
  });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) index = links.length - 1;
  links.forEach((link, position) => {
    if (position === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function scheduleUpdate() {
  if (document.hidden) {
    updateFromScroll();
    return;
  }
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(updateFromScroll);
}

addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', scheduleUpdate);
addEventListener('hashchange', scheduleUpdate);
addEventListener('pageshow', scheduleUpdate);
document.addEventListener('visibilitychange', scheduleUpdate);
menu.addEventListener('click', (event) => {
  if (event.target.closest('[data-menu-link]')) menu.hidePopover();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.matches(':popover-open')) menu.hidePopover();
});
updateFromScroll();