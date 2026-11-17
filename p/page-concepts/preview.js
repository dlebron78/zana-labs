/* preview.js: the page inside the owner's settings screen.
   It keeps no settings of its own. The settings screen sends the settings in force and this draws them with the framework,
   exactly the way a visitor's browser would. Because it is a frame, the page reacts to the frame's width: a phone-wide frame gets the phone layout. */

import { buildPage, applyTokens, wirePage } from './page.js?v=13';
import { mountEffects } from './effects.js?v=13';
import { compose, tokensOf, resolve, blocksOf } from './owner.js?v=13';

const stage = document.getElementById('stage');
const mqStill = window.matchMedia('(prefers-reduced-motion: reduce)');
const still = () => mqStill.matches;
const alone = window.parent === window;                 // opened by itself, with no settings screen around it
const tell = m => { if (!alone) window.parent.postMessage(m, location.origin); };

let last = null, built = '', lang = 'en', stamp = null;
let page = null, root = null, unwire = null, unmount = null;

/* remember which block is at the top of the frame, so a redraw does not lose the owner's place */
function anchor() {
  for (const el of root.querySelectorAll('[data-block]')) {
    if (el.classList.contains('zp-bar')) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom > 25) return { name: el.dataset.block, id: el.id, ratio: (1 - r.top) / Math.max(1, r.height) };
  }
  return null;
}
function restore(a) {
  const el = (a.id && root.querySelector('#' + CSS.escape(a.id))) || root.querySelector(`[data-block="${a.name}"]`);
  if (!el) return;
  const r = el.getBoundingClientRect();
  window.scrollTo({ top: Math.max(0, window.scrollY + r.top + a.ratio * r.height - 1), behavior: 'instant' });
}

/* everything that needs the blocks built again. Color, spacing and headline size are not in here: they are only paint. */
const buildKey = m => JSON.stringify([m.s.style, m.s.hero, m.s.fx, m.s.order, m.s.show, m.logo, m.cover, lang, still()]);

function draw(m, keep) {
  const at = keep && root ? anchor() : null;
  if (unmount) unmount();
  if (unwire) unwire();
  const c = compose(m.s, { lang, brand: m.brand, logo: m.logo, cover: m.cover, still: still() });
  page = buildPage(c.recipe, c.gym, c.opts);
  stage.innerHTML = page.html;
  root = stage.firstElementChild;
  applyTokens(root, page.tokens);
  root.classList.toggle('zp--still', still());
  if (at) restore(at); else window.scrollTo({ top: 0, behavior: 'instant' });
  unwire = wirePage(root, page, { setLang: l => { lang = l; draw(last, true); built = buildKey(last); tell({ zana: 'lang', lang }); }, still });
  unmount = mountEffects(root, c.fx, { stick: () => 0, S: page.x.S });
  if (at) restore(at);
  document.documentElement.lang = lang;
}

function paint(m) {
  page.tokens = tokensOf(m.s, m.brand);
  applyTokens(root, page.tokens);
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));   // lets the effects measure again
}

/* glide to the part of the page the owner just changed */
function show(key) {
  const el = key === 'top' ? root : blocksOf(key).map(n => root.querySelector(`[data-block="${n}"]`)).find(Boolean);
  if (!el) return;
  const top = key === 'top' ? 0 : Math.max(0, window.scrollY + el.getBoundingClientRect().top - 76);
  window.scrollTo({ top, behavior: still() ? 'instant' : 'smooth' });
}

function take(m) {
  if (m.stamp !== stamp) { stamp = m.stamp; lang = m.lang === 'es' ? 'es' : 'en'; }   // the settings screen changed language: follow it
  const key = buildKey(m);
  if (root && key === built && !m.redraw) paint(m); else draw(m, !m.fromTop);
  built = key; last = m;
  if (m.focus) show(m.focus);
}

window.addEventListener('message', e => {
  if (e.origin !== location.origin || e.source !== window.parent) return;
  const m = e.data;
  if (!m || typeof m !== 'object') return;
  if (m.zana === 'settings' && m.s) take(m);
  if (m.zana === 'scroll' && root) window.scrollTo({ top: m.to === 'top' ? 0 : window.scrollY + m.by * window.innerHeight, behavior: 'instant' });
});
mqStill.addEventListener('change', () => { if (last) take({ ...last, redraw: true, focus: null }); });

if (alone) take({ s: resolve('film', {}), lang: 'en', stamp: 0 });   // opened directly: show the first style as it comes
else tell({ zana: 'ready' });
