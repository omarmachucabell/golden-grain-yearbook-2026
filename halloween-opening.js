// The photograph stays pinned long enough for the scroll to expose its own title.
const opening = document.querySelector('.eve-opening');
const scene = opening.querySelector('.eve-scene');
const caption = opening.querySelector('.eve-opening-caption');
const navEntry = document.querySelector('.eve-nav-entry');
const holidayLinks = navEntry.querySelector('.topic-subnav');
opening.dataset.scrollReveal = '';
let frame = 0;

function easeReveal(fraction) {
  const t = Math.min(1, Math.max(0, fraction));
  return t * t * (3 - 2 * t);
}

function updateChapterEntry() {
  frame = 0;
  const bounds = opening.getBoundingClientRect();
  const travel = Math.max(1, bounds.height - scene.clientHeight);
  const progress = -bounds.top / travel;
  const reveal = easeReveal((progress - .08) / .70);
  caption.style.setProperty('--eve-date-opacity', easeReveal((progress - .30) / .54).toFixed(3));
  caption.style.setProperty('--eve-title-opacity', reveal.toFixed(3));
  caption.style.setProperty('--eve-title-offset', ((1 - reveal) * 18).toFixed(1) + 'px');
  const pastOpening = bounds.bottom <= 0;
  // The header follows the photograph directly and pins when its bottom edge clears the viewport top.
  const fadeDistance = Math.max(1, navEntry.offsetHeight - holidayLinks.offsetHeight);
  const navOpacity = easeReveal(-bounds.bottom / fadeDistance);
  document.body.style.setProperty('--eve-nav-opacity', navOpacity.toFixed(3));
  document.body.classList.toggle('eve-nav-hidden', navOpacity === 0);
  document.body.classList.toggle('eve-chapter-open', pastOpening);
}

function scheduleUpdate() {
  if (!frame) frame = requestAnimationFrame(updateChapterEntry);
}

updateChapterEntry();
window.addEventListener('scroll', scheduleUpdate, {passive: true});
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('pageshow', scheduleUpdate);
