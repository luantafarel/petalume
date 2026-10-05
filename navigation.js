const links = [...document.querySelectorAll('[data-section-link]')];
const subtopics = [...document.querySelectorAll('[data-subtopic-link]')];
const sections = subtopics.map((link) => document.getElementById(link.hash.slice(1)));
const groups = [...document.querySelectorAll('[data-subtopic-group]')];
const menu = document.getElementById('subtopic-menu');
const subtopicName = document.querySelector('[data-subtopic-name]');
const subtopicCount = document.querySelector('[data-subtopic-count]');
const map = document.querySelector('.section-map');
const previous = document.querySelector('[data-section-previous]');
const next = document.querySelector('[data-section-next]');
const track = document.querySelector('.map-links');
const name = document.querySelector('[data-section-name]');
const count = document.querySelector('[data-section-count]');
let activeIndex = -1;
let activeSubtopic = -1;
let scheduled = false;

function setActive(index) {
  if (index === activeIndex) return;
  activeIndex = index;
  links.forEach((link, position) => {
    if (position === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  name.textContent = links[index].dataset.label;
  count.textContent = String(index + 1).padStart(2, '0');
  for (const [arrow, destination, disabled] of [
    [previous, Math.max(0, index - 1), index === 0],
    [next, Math.min(links.length - 1, index + 1), index === links.length - 1],
  ]) {
    arrow.href = links[destination].hash;
    arrow.setAttribute('aria-disabled', String(disabled));
    arrow.tabIndex = disabled ? -1 : 0;
  }
  const current = links[index];
  const left = current.offsetLeft;
  if (left < track.scrollLeft || left + current.offsetWidth > track.scrollLeft + track.clientWidth) {
    track.scrollTo({ left: left - (track.clientWidth - current.offsetWidth) / 2, behavior: 'instant' });
  }
}

function updateFromScroll() {
  scheduled = false;
  const threshold = Math.min(160, innerHeight * 0.25);
  let index = 0;
  sections.forEach((section, position) => {
    if (section.getBoundingClientRect().top <= threshold) index = position;
  });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) index = subtopics.length - 1;
  const chapter = Number(subtopics[index].dataset.chapter);
  setActive(chapter);
  if (index !== activeSubtopic) {
    activeSubtopic = index;
    subtopics.forEach((link, position) => {
      if (position === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    groups.forEach((group, position) => { group.hidden = position !== chapter; });
    const siblings = subtopics.filter((link) => Number(link.dataset.chapter) === chapter);
    subtopicName.textContent = subtopics[index].dataset.label;
    subtopicCount.textContent = `${siblings.indexOf(subtopics[index]) + 1} / ${siblings.length}`;
  }
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

for (const arrow of [previous, next]) {
  arrow.addEventListener('click', (event) => {
    if (arrow.getAttribute('aria-disabled') === 'true') event.preventDefault();
  });
}

addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', scheduleUpdate);
addEventListener('hashchange', scheduleUpdate);
addEventListener('pageshow', scheduleUpdate);
document.addEventListener('visibilitychange', scheduleUpdate);
menu.addEventListener('click', (event) => {
  if (event.target.closest('[data-subtopic-link]')) menu.hidePopover();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.matches(':popover-open')) menu.hidePopover();
});
const measureMap = () => {
  document.documentElement.style.setProperty('--map-height', `${map.getBoundingClientRect().height}px`);
};
new ResizeObserver(measureMap).observe(map);
measureMap();
updateFromScroll();