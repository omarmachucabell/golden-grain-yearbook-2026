// Progressive enhancement: results remain readable when JavaScript is unavailable.
const revealedAwards=new Set(window.Yearbook.read('revealed-awards',[]));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Load nearby portraits before the reveal so the animation opens onto photos.
const preload = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    preload.unobserve(entry.target);
  }
}, {rootMargin: '600px'}) : null;
for (const [index, section] of [...document.querySelectorAll('.award-spread')].entries()) {
  const winners = section.querySelector('.award-winners');
  if (!winners) continue;
  const title = section.querySelector('h2');
  const stage = document.createElement('div');
  stage.className = 'award-reveal-stage';
  winners.before(stage);
  const results = document.createElement('div');
  results.id = `award-results-${index + 1}`;
  results.className = 'award-reveal-results';
  results.tabIndex = -1;
  results.setAttribute('role', 'group');
  results.setAttribute('aria-label', `${title.textContent} results`);
  results.append(winners);
  const runners = section.querySelector('.runners');
  if (runners) results.append(runners);
  results.hidden = true;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'award-reveal-trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', results.id);
  trigger.setAttribute('aria-label', `Reveal the winners of ${title.textContent}`);
  trigger.innerHTML = '<span class="award-seal" aria-hidden="true">?</span><span class="award-reveal-label">Tap to reveal</span><span class="award-beats" aria-hidden="true"><i></i><i></i><i></i></span>';
  const announcement = document.createElement('span');
  announcement.className = 'award-reveal-announcement';
  announcement.setAttribute('role', 'status');
  stage.append(trigger, results, announcement);
  preload?.observe(stage);
  let opened = revealedAwards.has(title.textContent);
  if(opened){trigger.hidden=true;results.hidden=false;trigger.setAttribute('aria-expanded','true');stage.classList.add('is-restored');}

  trigger.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    revealedAwards.add(title.textContent);window.Yearbook.write('revealed-awards',[...revealedAwards]);
    results.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    trigger.setAttribute('aria-disabled', 'true');
    stage.classList.add('is-opening');
    trigger.querySelector('.award-reveal-label').textContent = 'And the winner is…';
    const reveal = () => {
      const from = stage.getBoundingClientRect().height;
      trigger.hidden = true;
      results.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      stage.classList.replace('is-opening', 'is-revealed');
      const names = [...results.querySelectorAll('.winner h3')].map(el => el.textContent);
      announcement.textContent = `${names.length > 1 ? 'Winners' : 'Winner'}: ${names.join(' and ')}.`;
      results.focus({preventScroll: true});
      if (!reducedMotion.matches && stage.animate) {
        stage.animate([{height: `${from}px`}, {height: `${stage.getBoundingClientRect().height}px`}], {duration: 550, easing: 'cubic-bezier(.22,1,.36,1)'});
      }
    };
    if (reducedMotion.matches) reveal();
    else setTimeout(reveal, 850);
  });
}
