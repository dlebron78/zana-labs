/* app.js: the demo viewer. It is not part of the framework.
   All it does: pick a recipe, keep track of what the viewer changed, and ask the framework to draw.
   The framework itself is data.js, tokens.js, blocks.js, effects.js, recipes.js and page.js. */

import { GYMS } from './data.js?v=8';
import { RECIPES, ORDER, FX, FX_DEFAULTS } from './recipes.js?v=8';
import { buildTokens, CHOICES } from './tokens.js?v=8';
import { buildPage, applyTokens, labelBlocks, wirePage } from './page.js?v=8';
import { mountEffects } from './effects.js?v=8';
import { BLOCK_NAMES, HEROES, SCHEDULES } from './blocks.js?v=8';

const $ = (s, el = document) => el.querySelector(s);
const stage = $('#stage'), topBar = $('#vw-top'), panel = $('#vw-panel'), fab = $('#vw-fab');
const Q = new URLSearchParams(location.search);
if (Q.get('debug') === '1') {
  const box = document.createElement('pre');
  box.style.cssText = 'position:fixed;z-index:999;right:8px;top:8px;max-width:min(92vw,720px);max-height:40vh;overflow:auto;margin:0;padding:8px 10px;background:#fff;color:#a40020;border:2px solid #a40020;font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap';
  box.textContent = 'debug: nothing to report';
  document.body.appendChild(box);
  const say = m => { box.textContent = (box.textContent.startsWith('debug:') ? '' : box.textContent + '\n') + m; };
  window.addEventListener('error', e => say(e.message ? `error: ${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno})` : `failed to load: ${(e.target && (e.target.currentSrc || e.target.src || e.target.href)) || 'a file'}`), true);
  window.addEventListener('unhandledrejection', e => say('rejection: ' + ((e.reason && e.reason.message) || e.reason)));
  for (const k of ['error', 'warn']) { const was = console[k]; console[k] = (...a) => { say(k + ': ' + a.map(x => (x && x.message) || x).join(' ')); was.apply(console, a); }; }
}
const mqWide = window.matchMedia('(min-width: 900px)'), mqStill = window.matchMedia('(prefers-reduced-motion: reduce)');
const HERO_KEYS = { film: 'heroFilm', slideshow: 'heroSlideshow', split: 'heroSplit', framed: 'heroFramed', tiles: 'heroTiles' };
const SCHED_KEYS = { cards: 'scheduleCards', list: 'scheduleList' };
const HERO_NAMES = { heroFilm: 'Film', heroSlideshow: 'Slideshow with tabs', heroSplit: 'Split, with today\'s classes', heroFramed: 'Framed photo', heroTiles: 'Three tiles' };
const keyOf = (map, v) => Object.keys(map).find(k => map[k] === v);
const hex = v => (/^#?[0-9a-f]{6}$/i.test(v || '') ? '#' + v.replace('#', '').toUpperCase() : null);
const ICON = '<svg class="vw-ico" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h6m4 0h4M2 13h3m4 0h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="5" r="2.1" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="7" cy="13" r="2.1" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';

/* ---------- what the viewer has chosen. Empty means "as the recipe says". ---------- */
const state = { r: 'film', lang: 'en', brand: null, tokens: {}, fx: {}, hero: null, sched: null, follow: null, off: new Set(), outline: false, rm: false, bare: false, open: false, tab: 'look' };

function readUrl() {
  if (RECIPES[Q.get('r')]) state.r = Q.get('r');
  if (Q.get('lang') === 'es') state.lang = 'es';
  state.brand = hex(Q.get('c'));
  for (const k of ['mode', 'photo', 'space', 'corners', 'type', 'ground']) { const v = Q.get(k); if (v && CHOICES[k].includes(v)) state.tokens[k] = v; }
  const size = parseFloat(Q.get('scale')); if (size >= 2.5 && size <= 3.1) state.tokens.scale = size;
  const f = Q.get('fx');
  if (f != null) {
    const on = f === 'all' ? FX.map(x => x.id) : f === 'safe' ? FX.filter(x => x.on).map(x => x.id) : f === 'none' ? [] : f.split(/[\s,]+/);
    FX.forEach(x => { state.fx[x.id] = on.includes(x.id); });
  }
  state.hero = HERO_KEYS[Q.get('hero')] || null;
  state.sched = SCHED_KEYS[Q.get('sched')] || null;
  state.follow = ['pill', 'duo', 'bar'].includes(Q.get('follow')) ? Q.get('follow') : null;
  (Q.get('off') || '').split(',').filter(Boolean).forEach(n => state.off.add(+n));
  state.outline = Q.get('outline') === '1';
  state.rm = Q.get('rm') === '1';
  state.bare = Q.get('ui') === '0';
  /* the panel starts open only where it fits beside the page instead of on top of it; panel=1 in the link forces it open */
  state.open = Q.has('panel') ? Q.get('panel') === '1' : window.matchMedia('(min-width: 1900px)').matches;
  if (['look', 'motion', 'blocks'].includes(Q.get('tab'))) state.tab = Q.get('tab');
}

const recipe = () => RECIPES[state.r];
const gymOf = () => GYMS[recipe().gym];
const wantFx = () => ({ ...FX_DEFAULTS, ...recipe().fx, ...state.fx });                 // what is switched on
const still = () => state.rm || mqStill.matches;                                         // reduced motion, real or previewed
const liveFx = () => { const w = wantFx(); return still() ? { book: w.book, bar: w.bar } : w; };   // what really runs
const stick = () => (mqWide.matches && !state.bare ? 52 : 0);                            // height of the demo's sticky top bar
const blockName = b => { let n = typeof b === 'string' ? b : b[0]; if (state.hero && HEROES.includes(n)) n = state.hero; if (state.sched && SCHEDULES.includes(n)) n = state.sched; return n; };
const baseOf = list => { const b = recipe().blocks.map(x => (typeof x === 'string' ? x : x[0])).find(n => list.includes(n)); return b || null; };

function writeUrl() {
  const rec = recipe(), gym = gymOf(), p = new URLSearchParams();
  p.set('r', state.r);
  if (state.lang === 'es') p.set('lang', 'es');
  if (state.brand && state.brand !== gym.brand.toUpperCase()) p.set('c', state.brand.slice(1));
  for (const [k, v] of Object.entries(state.tokens)) if (v !== rec.tokens[k]) p.set(k, v);
  const want = wantFx(), base = { ...FX_DEFAULTS, ...rec.fx };
  if (FX.some(f => want[f.id] !== base[f.id])) { const on = FX.filter(f => want[f.id]).map(f => f.id); p.set('fx', on.length === FX.length ? 'all' : on.length ? on.join(',') : 'none'); }
  if (state.hero) p.set('hero', keyOf(HERO_KEYS, state.hero));
  if (state.sched) p.set('sched', keyOf(SCHED_KEYS, state.sched));
  if (state.follow) p.set('follow', state.follow);
  if (state.off.size) p.set('off', [...state.off].sort((a, b) => a - b).join(','));
  if (state.outline) p.set('outline', '1');
  if (state.rm) p.set('rm', '1');
  if (state.bare) p.set('ui', '0');
  if (Q.has('panel')) p.set('panel', state.open ? '1' : '0');
  history.replaceState(null, '', location.pathname + '?' + p.toString().replace(/%2C/g, ','));
}

/* ---------- drawing the page ---------- */
let page = null, root = null, unwire = null, unmount = null;

/* remember which block is at the top of the screen, so a redraw does not lose your place */
function anchor() {
  const y = stick() + 1;
  for (const el of root.querySelectorAll('[data-block]')) {
    if (el.classList.contains('zp-bar')) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom > y + 24) return { name: el.dataset.block, id: el.id, ratio: (y - r.top) / Math.max(1, r.height) };
  }
  return null;
}
function restore(a) {
  const el = (a.id && root.querySelector('#' + CSS.escape(a.id))) || root.querySelector(`[data-block="${a.name}"]`);
  if (!el) return;
  const r = el.getBoundingClientRect();
  window.scrollTo({ top: Math.max(0, window.scrollY + r.top + a.ratio * r.height - (stick() + 1)), behavior: 'instant' });
}

/* a full redraw: blocks, language or effects changed */
function draw(keep = true) {
  const rec = recipe(), gym = gymOf();
  const at = keep && root ? anchor() : null;
  if (unmount) unmount();
  if (unwire) unwire();
  drawTop(); measure();                                                          // the top bar first: the page needs its height
  page = buildPage(rec, gym, { lang: state.lang, fx: liveFx(), tokens: state.tokens, brand: state.brand, hero: state.hero, sched: state.sched, follow: state.follow, off: state.off });
  stage.innerHTML = page.html;
  root = stage.firstElementChild;
  applyTokens(root, page.tokens);
  labelBlocks(root);
  root.classList.toggle('zp--still', still());
  root.classList.toggle('is-outlined', state.outline);
  if (at) restore(at); else window.scrollTo({ top: 0, behavior: 'instant' });
  unwire = wirePage(root, page, { setLang: lang => { state.lang = lang; draw(); }, still });
  unmount = mountEffects(root, liveFx(), { stick, S: page.x.S });
  if (at) restore(at);
  document.title = `${rec.name}: ${gym.name} · Zana page framework`;
  writeUrl(); drawPanel();
}

/* a repaint: only tokens changed (color, light or dark, photos, spacing, corners, type). Nothing is rebuilt. */
function paint(redrawPanel = true) {
  page.tokens = buildTokens({ ...recipe().tokens, ...state.tokens }, state.brand || gymOf().brand);
  applyTokens(root, page.tokens);
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));       // lets the effects measure again
  writeUrl();
  if (redrawPanel) drawPanel();
}

/* ---------- the demo's controls ---------- */
function drawTop() {
  topBar.innerHTML = `<a class="vw-brand" href="./"><b>Zana</b><span>page framework</span></a>
    <div class="vw-tabs" role="group" aria-label="Sample page">${ORDER.map(id => `<button type="button" class="vw-tab" data-do="r" data-v="${id}" aria-pressed="${id === state.r}">${RECIPES[id].name}</button>`).join('')}</div>
    <div class="vw-end"><a class="vw-link" href="spec.html">How it works</a><button type="button" class="vw-adjust" data-do="toggle" aria-expanded="${state.open}">${ICON}<span>Adjust<span class="vw-more"> this page</span></span></button></div>`;
}

const seg = (label, key, opts, cur) => `<div class="vw-group"><p class="vw-label">${label}</p><div class="vw-seg" role="group" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" data-do="${key}" data-v="${v}" aria-pressed="${String(v) === String(cur)}">${t}</button>`).join('')}</div></div>`;
const toggle = (key, v, on, name, what, off = false) => `<button type="button" class="vw-sw" role="switch" aria-checked="${!!on}" data-do="${key}" data-v="${v}"${off ? ' disabled' : ''}><span><b>${name}</b><small>${what}</small></span><i></i></button>`;

function lookTab() {
  const rec = recipe(), gym = gymOf(), t = page.tokens.choice, brand = (state.brand || gym.brand).toUpperCase();
  const colors = [[gym.brand, `${gym.brandNames[0].en}, this gym's own color`], [gym.brand2, `${gym.brandNames[1].en}, a second color to try`], ['#111111', 'Black'], ['#0E8F7E', 'Teal'], ['#7A4DFF', 'Violet']];
  const top = t.type === 'condensed' ? 3.1 : 3;
  const named = colors.find(([c]) => c.toUpperCase() === brand);
  return `
    <div class="vw-group"><p class="vw-label">Sample page</p>
      <div class="vw-samples">${ORDER.map(id => `<button type="button" data-do="r" data-v="${id}" aria-pressed="${id === state.r}"><b>${RECIPES[id].name}</b><small>${GYMS[RECIPES[id].gym].name}</small></button>`).join('')}</div>
      <p class="vw-help"><b>${rec.name}.</b> ${rec.line} Suits: ${rec.suits.charAt(0).toLowerCase() + rec.suits.slice(1)}</p>
      <p class="vw-try"><b>Try this.</b> ${rec.try}</p>
    </div>
    <div class="vw-group"><p class="vw-label">Brand color</p>
      <div class="vw-swatches">${colors.map(([c, n]) => `<button type="button" class="vw-swatch" style="--c:${c}" data-do="c" data-v="${c}" aria-pressed="${c.toUpperCase() === brand}" aria-label="${n}" title="${n}"></button>`).join('')}
        <label class="vw-pick"><input type="color" value="${brand}" data-do="pick" aria-label="Pick any color"><span>Any color</span></label></div>
      <p class="vw-help">${named ? named[1] : brand}. Buttons, ticks and prices take the color. The words stay readable on any color you pick.</p>
    </div>
    ${seg('Page', 'mode', [['light', 'Light'], ['dark', 'Dark']], t.mode)}
    ${seg('Photos', 'photo', [['original', 'Original'], ['bw', 'Black and white'], ['tint', 'Brand tint']], t.photo)}
    ${seg('Spacing', 'space', [['compact', 'Compact'], ['comfortable', 'Comfortable'], ['airy', 'Airy']], t.space)}
    ${seg('Corners', 'corners', [['square', 'Square'], ['soft', 'Soft'], ['round', 'Round']], t.corners)}
    ${seg('Heading voice', 'type', [['wide', 'Wide'], ['plain', 'Plain'], ['serif', 'Serif'], ['condensed', 'Tall caps']], t.type)}
    ${seg('Headline size on a laptop', 'scale', [2.5, 2.75, top].map(s => [s, Math.round(18 * s) + 'px']), t.scale >= 3 ? top : t.scale)}
    <p class="vw-help">Body text is 18px. The headline stays between 2.5 and 3 times that, so the two always look like a pair.</p>
    ${seg('Language', 'lang', [['en', 'English'], ['es', 'Español']], state.lang)}
    <div class="vw-row"><button type="button" data-do="reset">Reset this sample</button><button type="button" data-do="copy">Copy link</button></div>`;
}

function motionTab() {
  const want = wantFx(), rm = still(), gym = gymOf();
  const has = n => page.blocks.some(b => b[0] === n);
  const ok = {
    rise: true, book: true, bar: has('menuBar'), lightup: has('statement'), strip: has('offerStrip'), slide: has('classCards') || has('coaches'),
    hero: ['heroFilm', 'heroSlideshow', 'heroFramed', 'heroTiles'].some(has), word: HEROES.some(has),
    pin: (has('classCards') && gym.classes.every(c => c.photo)) || SCHEDULES.some(has),
  };
  const why = {
    bar: 'Needs the menu bar block, which is off.', lightup: 'Needs the statement block, which is off.', strip: 'Needs the offer strip block, which is off.',
    slide: 'Needs class cards or coaches, which are off.', hero: 'This hero has no photo or video. Pick another hero under Blocks.', word: 'Needs a hero block.', pin: 'Needs class photos or a schedule.',
  };
  const row = f => toggle('fx', f.id, want[f.id] && ok[f.id], f.name, !ok[f.id] ? why[f.id] : rm ? `Still version: ${f.still}` : f.what, !ok[f.id]);
  const base = { ...FX_DEFAULTS, ...recipe().fx };
  const set = FX.every(f => want[f.id] === base[f.id]) ? 'own' : FX.every(f => want[f.id] === f.on) ? 'safe' : FX.every(f => want[f.id]) ? 'all' : FX.every(f => !want[f.id]) ? 'none' : '';
  return `
    ${rm ? `<p class="vw-banner">Reduced motion is ${state.rm ? 'being previewed' : 'on in this browser'}. Each effect shows its still version. Nothing is hidden.</p>` : ''}
    ${seg('Quick sets', 'fxset', [['own', 'This sample'], ['safe', 'Safe three'], ['all', 'All on'], ['none', 'All off']], set)}
    <div class="vw-group"><p class="vw-label">On by default, safe for every gym</p>${FX.filter(f => f.on).map(row).join('')}</div>
    <div class="vw-group"><p class="vw-label">The owner switches these on</p>${FX.filter(f => !f.on).map(row).join('')}</div>
    <div class="vw-group"><p class="vw-label">Check the fallback</p>${toggle('rm', '1', state.rm, 'Preview reduced motion', 'What a visitor sees when their phone asks for less motion.')}</div>`;
}

function blocksTab() {
  const rec = recipe(), hero = state.hero || baseOf(HEROES), sched = state.sched || baseOf(SCHEDULES);
  const rows = rec.blocks.map((b, i) => `<button type="button" class="vw-blk" role="switch" aria-checked="${!state.off.has(i)}" data-do="block" data-v="${i}"><span class="vw-blk__n">${i + 1}</span><b>${BLOCK_NAMES[blockName(b)].en}</b><i></i></button>`).join('');
  return `
    <p class="vw-help">A page is a list of blocks, top to bottom. Switch one off and the page closes up around it. A block with nothing to show hides by itself.</p>
    <div class="vw-group"><p class="vw-label">Blocks on this page</p>${rows}</div>
    ${hero ? `<div class="vw-group"><p class="vw-label">Swap the hero</p><div class="vw-list">${HEROES.map(h => `<button type="button" data-do="hero" data-v="${h}" aria-pressed="${h === hero}">${HERO_NAMES[h]}</button>`).join('')}</div></div>` : ''}
    ${sched ? seg('Schedule style', 'sched', [['scheduleCards', 'Cards with coach'], ['scheduleList', 'Plain list']], sched) : ''}
    ${seg('Book button that follows you', 'follow', [['pill', 'Pill with price'], ['duo', 'Two actions'], ['bar', 'Full bar']], page.follow)}
    <div class="vw-group">${toggle('outline', '1', state.outline, 'Show block names', 'Outlines each block on the page and names it.')}</div>`;
}

function drawPanel(resetScroll = false) {
  const body = $('.vw-panel__body', panel), y = body && !resetScroll ? body.scrollTop : 0;
  const active = panel.contains(document.activeElement) ? document.activeElement : null, key = active && active.dataset.do ? [active.dataset.do, active.dataset.v] : null;
  const tabs = [['look', 'Look'], ['motion', 'Motion'], ['blocks', 'Blocks']];
  panel.innerHTML = `<div class="vw-panel__head"><div class="vw-ptabs" role="tablist">${tabs.map(([v, t]) => `<button type="button" class="vw-ptab" role="tab" aria-selected="${state.tab === v}" data-do="tab" data-v="${v}">${t}</button>`).join('')}</div><button type="button" class="vw-close" data-do="toggle" aria-label="Close the Adjust panel">×</button></div>
    <div class="vw-panel__body" role="tabpanel">${state.tab === 'motion' ? motionTab() : state.tab === 'blocks' ? blocksTab() : lookTab()}</div>`;
  $('.vw-panel__body', panel).scrollTop = y;
  if (key) { const el = panel.querySelector(`[data-do="${key[0]}"]${key[1] != null ? `[data-v="${CSS.escape(key[1])}"]` : ''}`); if (el) el.focus({ preventScroll: true }); }
  syncOpen();
}
function hintOff() { document.documentElement.classList.remove('vw-hint-on'); }
function syncOpen() {
  panel.classList.toggle('is-open', state.open);
  panel.setAttribute('aria-hidden', String(!state.open));
  fab.setAttribute('aria-expanded', String(state.open));
  const b = $('.vw-adjust', topBar); if (b) b.setAttribute('aria-expanded', String(state.open));
}

function act(k, v, el) {
  switch (k) {
    case 'toggle': state.open = !state.open; hintOff(); syncOpen(); return;
    case 'tab': state.tab = v; drawPanel(true); return;
    case 'r': if (v !== state.r) { Object.assign(state, { r: v, brand: null, tokens: {}, fx: {}, hero: null, sched: null, follow: null, off: new Set() }); draw(false); } return;
    case 'c': state.brand = v.toUpperCase(); paint(); return;
    case 'mode': case 'photo': case 'space': case 'corners': case 'type': state.tokens[k] = v; paint(); return;
    case 'scale': state.tokens.scale = +v; paint(); return;
    case 'lang': if (v !== state.lang) { state.lang = v; draw(); } return;
    case 'fx': state.fx[v] = !wantFx()[v]; draw(); return;
    case 'fxset': state.fx = v === 'own' ? {} : Object.fromEntries(FX.map(f => [f.id, v === 'all' ? true : v === 'none' ? false : f.on])); draw(); return;
    case 'rm': state.rm = !state.rm; draw(); return;
    case 'outline': state.outline = !state.outline; root.classList.toggle('is-outlined', state.outline); writeUrl(); drawPanel(); return;
    case 'block': { const i = +v; if (state.off.has(i)) state.off.delete(i); else state.off.add(i); draw(); return; }
    case 'hero': state.hero = v === baseOf(HEROES) ? null : v; draw(); return;
    case 'sched': state.sched = v === baseOf(SCHEDULES) ? null : v; draw(); return;
    case 'follow': state.follow = v === recipe().follow ? null : v; draw(); return;
    case 'reset': Object.assign(state, { brand: null, tokens: {}, fx: {}, hero: null, sched: null, follow: null, off: new Set(), rm: false, outline: false }); draw(); return;
    case 'copy': {
      const done = msg => { el.textContent = msg; setTimeout(() => { if (el.isConnected) el.textContent = 'Copy link'; }, 1800); };
      (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => done('Copied'), () => done('Copy from the address bar'));
      return;
    }
  }
}

const onClick = e => { const b = e.target.closest('[data-do]'); if (!b || b.disabled || b.dataset.do === 'pick') return; act(b.dataset.do, b.dataset.v, b); };
topBar.addEventListener('click', onClick);
panel.addEventListener('click', onClick);
fab.addEventListener('click', () => act('toggle'));
/* the color picker repaints while you drag; the panel itself is only redrawn when you let go */
panel.addEventListener('input', e => { if (e.target.matches('[data-do="pick"]')) { state.brand = e.target.value.toUpperCase(); paint(false); } });
panel.addEventListener('change', e => { if (e.target.matches('[data-do="pick"]')) drawPanel(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.open) act('toggle'); });

/* keyboard shortcuts, for showing the demo from a laptop:
   1 to 4 sample · L language · D light or dark · B brand color · P photos · S spacing · C corners · T heading voice
   M motion set · Shift+1 to 9 one effect · R reduced motion · H hero · K schedule · F Book button · O block names
   A Adjust panel · G next panel tab · U hide or show the demo controls · 0 reset */
const next = (list, cur) => list[(list.indexOf(cur) + 1) % list.length];
const KEYS = {
  l: () => act('lang', state.lang === 'en' ? 'es' : 'en'),
  d: () => act('mode', next(CHOICES.mode, page.tokens.choice.mode)),
  b: () => { const g = gymOf(); act('c', next([g.brand, g.brand2, '#111111', '#0E8F7E', '#7A4DFF'].map(c => c.toUpperCase()), (state.brand || g.brand).toUpperCase())); },
  p: () => act('photo', next(CHOICES.photo, page.tokens.choice.photo)),
  s: () => act('space', next(CHOICES.space, page.tokens.choice.space)),
  c: () => act('corners', next(CHOICES.corners, page.tokens.choice.corners)),
  t: () => act('type', next(CHOICES.type, page.tokens.choice.type)),
  m: () => { const w = wantFx(), base = { ...FX_DEFAULTS, ...recipe().fx }; const cur = FX.every(f => w[f.id] === base[f.id]) ? 'own' : FX.every(f => w[f.id]) ? 'all' : FX.every(f => !w[f.id]) ? 'none' : 'safe'; act('fxset', next(['own', 'all', 'none', 'safe'], cur)); },
  r: () => act('rm'),
  h: () => act('hero', next(HEROES, state.hero || baseOf(HEROES))),
  k: () => act('sched', next(SCHEDULES, state.sched || baseOf(SCHEDULES))),
  f: () => act('follow', next(['pill', 'duo', 'bar'], page.follow)),
  o: () => act('outline'),
  a: () => act('toggle'),
  g: () => { state.open = true; act('tab', next(['look', 'motion', 'blocks'], state.tab)); },
  u: () => { state.bare = !state.bare; document.documentElement.classList.toggle('vw-bare', state.bare); draw(); },
  0: () => act('reset'),
};
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  if (e.target instanceof Element && e.target.closest('input, select, textarea, [contenteditable]')) return;
  const digit = /^Digit([1-9])$/.exec(e.code || '');
  if (digit && e.shiftKey) { const f = FX[+digit[1] - 1]; if (f) { e.preventDefault(); act('fx', f.id); } return; }
  if (digit && +digit[1] <= ORDER.length) { e.preventDefault(); act('r', ORDER[+digit[1] - 1]); return; }
  const fn = !e.shiftKey && KEYS[e.key.toLowerCase()];
  if (fn) { e.preventDefault(); fn(); }
});
mqWide.addEventListener('change', () => draw());
function measure() { document.documentElement.style.setProperty('--chrome-above', (mqWide.matches || state.bare ? 0 : topBar.offsetHeight) + 'px'); }
window.addEventListener('resize', measure);
mqStill.addEventListener('change', () => draw());

/* ---------- start ---------- */
readUrl();
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
document.documentElement.classList.toggle('vw-bare', state.bare);
fab.innerHTML = `${ICON}<span>Adjust this page</span>`;
if (!state.open && !state.bare) { document.documentElement.classList.add('vw-hint-on'); setTimeout(hintOff, 9000); }   /* a short pointer to the Adjust button, once per visit */
draw(false);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => window.dispatchEvent(new Event('resize')));
