/* page.js: turns a recipe plus a gym into a page.
   1. works out the facts the words need (classes a week, lowest price, the next seven days of classes)
   2. runs the recipe's blocks in order and joins what they return
   3. wires the few things a visitor can press (day tabs, hero tabs, the phone menu, language, Book) */

import { BLOCKS, WORDS, BLOCK_NAMES, HEROES, SCHEDULES, followBook, esc } from './blocks.js?v=16';
import { buildTokens } from './tokens.js?v=16';
import { setSlide } from './effects.js?v=16';

const pad2 = n => String(n).padStart(2, '0');
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
const COUNT = { en: ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'], es: ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'] };
const WAYS = { en: ['', 'One way', 'Two ways', 'Three ways', 'Four ways', 'Five ways', 'Six ways'], es: ['', 'Una forma', 'Dos formas', 'Tres formas', 'Cuatro formas', 'Cinco formas', 'Seis formas'] };
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/* Everything a block may ask for besides the gym itself. */
export function makeContext(gym, { lang = 'en', fx = {}, voice = 'roof', follow = 'pill', blocks = [], now = new Date() }) {
  if (gym.langs && gym.langs.length && !gym.langs.includes(lang)) lang = gym.langs[0];   // a business set up in one language shows that language
  if (!WORDS[lang]) lang = 'en';
  const solo = gym.unit === 'session';   // a personal trainer sells sessions, not classes, and the words change with that
  const S = solo ? { ...WORDS[lang], ...WORDS[lang].session, nav: { ...WORDS[lang].nav, ...WORDS[lang].session.nav } } : WORDS[lang];
  const L = o => (o == null ? '' : typeof o === 'string' ? o : (o[lang] ?? o.en ?? o.es ?? ''));
  const money = n => '$' + n;
  const time = t => { const [h, m] = t.split(':').map(Number); return { clock: `${h % 12 || 12}:${pad2(m)}`, ap: lang === 'es' ? (h < 12 ? 'a.\u00a0m.' : 'p.\u00a0m.') : (h < 12 ? 'AM' : 'PM') }; };   /* \u00a0 keeps "a. m." on one line */
  const timeStr = t => { const v = time(t); return `${v.clock}\u00a0${v.ap}`; };

  /* the next seven days, starting today. Today only keeps classes that have not started yet.
     Spots left are made up here, the same way every time, so the demo shows full classes and nearly full ones. */
  const locale = lang === 'es' ? 'es-PR' : 'en-US';
  const wd = new Intl.DateTimeFormat(locale, { weekday: 'short' }), md = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
  const nowHM = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
  const classes = gym.classes || [], known = new Set(classes.map(c => c.id));
  const rows = (gym.schedule || []).filter(s => s && s.time && known.has(s.cls));   // a row whose class was deleted is left out, not drawn broken
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const sessions = rows
      .filter(s => s.dow === d.getDay() && (i > 0 || s.time > nowHM))
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(s => {
        const h = hash(gym.id + key + s.time + s.cls), r = h % 100;
        /* left is null when the class has no size set: the page then says nothing about spots instead of inventing a number */
        const left = !(s.cap > 0) ? null : solo ? (r < 42 ? 0 : s.cap)   // a trainer's hour is taken or open
          : Math.min(s.cap, r < 11 ? 0 : r < 36 ? 1 + ((h >>> 9) % 3) : Math.max(4, Math.round(s.cap * (0.28 + ((h >>> 5) % 45) / 100))));
        return { ...s, left };
      })
      .filter(s => !(solo && s.left === 0));   // a trainer's taken hour is simply not listed
    days.push({ label: i === 0 ? S.today : capFirst(wd.format(d).replace('.', '')), date: capFirst(md.format(d).replace('.', '')), sessions });
  }
  const day0 = Math.max(0, days.findIndex(d => d.sessions.length));
  const nextOf = {};
  days.forEach(d => d.sessions.forEach(s => { if (!nextOf[s.cls]) nextOf[s.cls] = `${d.label} ${timeStr(s.time)}`; }));

  /* facts for the words: counted from the schedule and the prices, never typed by the owner.
     A fact that cannot be counted stays empty (0 or ''), and the words that would use it are left out. */
  /* "coached classes" are counted when most of the week has a coach on it (an open-gym hour or two does not change that).
     When most rows have no coach, every row counts and the page does not call them coached. */
  const withCoach = rows.filter(s => s.coach), coached = withCoach.length >= rows.length * 0.6 ? withCoach : [], sized = coached.length ? coached : rows;
  const caps = sized.map(s => s.cap).filter(c => c > 0);
  const priced = (gym.prices || []).filter(p => p && Number.isFinite(p.price));
  const singles = priced.filter(p => !p.monthly);
  const cheapest = priced.length ? (singles.length ? singles : priced).reduce((a, p) => (p.price < a.price ? p : a)) : null;
  const team = gym.coaches || [], photos = gym.photos || [];
  const cap = caps.length ? Math.max(...caps) : 0;
  const facts = {
    n: solo ? days.reduce((a, d) => a + d.sessions.length, 0) : sized.length,   // a trainer counts the hours still open in the next seven days
    cap,
    small: cap > 1 && cap <= 25,                    // only a counted room size lets the page say "small groups"
    member: priced.some(p => p.monthly),            // a monthly price exists, so the page may say "one membership"
    team: team.length,
    levels: classes.some(c => c.level),
    noCard: gym.cardToBook === false,               // the business said booking takes no card, so the page may say so
    first: rows.length ? timeStr(rows.map(s => s.time).sort()[0]) : '',
    from: cheapest ? money(cheapest.price) : '',
    single: !cheapest || !(cheapest.credits > 1),   // the lowest price buys one visit, so the page may call it "a single class"
    ways: classes.length ? WAYS[lang][classes.length] || `${classes.length} ${lang === 'es' ? 'formas' : 'ways'}` : '',
    coaches: COUNT[lang][team.length] || String(team.length),
    coached: coached.length > 0,
    free: !!gym.firstFree,                          // a free first visit exists, so the page may promise it
  };

  /* the menu only links to sections that have something to show */
  const has = n => blocks.some(b => b[0] === n);
  const hasSched = (has('scheduleCards') || has('scheduleList')) && rows.length > 0, hasPrices = has('priceCards') && priced.length > 0;
  const place = gym.place || {}, hasPlace = !!((place.addr && place.addr.length) || place.phone || place.email);
  const nav = [
    has('classCards') && classes.length > 0 && { id: 'classes', label: S.nav.classes },
    hasSched && { id: 'schedule', label: S.nav.schedule },
    has('coaches') && team.length > 0 && { id: 'coaches', label: S.nav.coaches },
    hasPrices && { id: 'prices', label: S.nav.prices },
    has('footer') && hasPlace && { id: 'find', label: S.nav.find },
  ].filter(Boolean);
  if (gym.lead === 'prices') nav.sort((a, b) => (b.id === 'prices') - (a.id === 'prices'));   // a page that leads with prices lists them first
  /* where the main button leads: the schedule when there is one, else the prices, else the address. With none of the three there is no button. */
  const cta = hasSched ? { href: '#schedule', label: S.book, short: S.bookShort }
    : hasPrices ? { href: '#prices', label: S.seePrices, short: S.nav.prices }
    : has('footer') && hasPlace ? { href: '#find', label: S.nav.find, short: S.nav.find } : null;

  /* the changing word: every word is in the page, stacked in one spot. Without the effect only the first one shows. */
  const slot = words => `<span class="zp-swap" data-fx-word>${words.map((w, i) => `<span class="zp-swap__w${i ? '' : ' is-on'}"${i ? ' aria-hidden="true"' : ''}>${esc(w)}</span>`).join('')}</span>`;

  return {
    lang, S, L, money, time, fx, voice, follow, days, day0, nextOf, facts, nav, slot, solo, cta, hasSched, hasPrices,
    names: classes.map(c => L(c.name)),
    shorts: [...new Set(classes.map(c => L(c.short || c.name)))],
    classById: Object.fromEntries(classes.map(c => [c.id, c])),
    coachById: Object.fromEntries(team.map(c => [c.id, c])),
    /* the menu bar only sits clear over the hero when the hero really has a photo or a video behind it */
    overMedia: (has('heroFilm') && (!!gym.video || photos.length > 0)) || (has('heroSlideshow') && (classes.filter(c => c.photo).length > 1 || photos.length > 0)),
    pillAlways: !!fx.book && follow === 'pill',      // the price pill is on screen from the start, so the hero needs no buttons of its own
  };
}

/* The filter behind "brand tinted" photos. tokens.js supplies the three tables. */
const defs = duo => `<svg class="zp-defs" aria-hidden="true" focusable="false"><filter id="zp-duo" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="${duo.r}"/><feFuncG type="table" tableValues="${duo.g}"/><feFuncB type="table" tableValues="${duo.b}"/></feComponentTransfer></filter></svg>`;

/* recipe + gym (+ the viewer's changes) -> the page as HTML, plus what was used to build it.
   o: { lang, fx, tokens, brand, hero, sched, follow, off }
      fx      the effects that are really on (after reduced motion)
      tokens  token choices that replace the recipe's
      hero / sched  swap the recipe's hero or schedule block for another one
      off     positions in the recipe's block list to leave out */
/* A business may be missing almost anything. The gaps are filled once here, so no block has to ask whether a list exists. */
const tidy = g => ({
  ...g, photos: g.photos || [], classes: g.classes || [], schedule: g.schedule || [], coaches: g.coaches || [], reviews: g.reviews || [],
  prices: (g.prices || []).filter(p => p && Number.isFinite(p.price)), logo: g.logo || { word: g.name }, place: { addr: [], hours: [], ...(g.place || {}) },
});

export function buildPage(recipe, gym, o = {}) {
  gym = tidy(gym);
  const fx = o.fx || {}, follow = o.follow || recipe.follow || 'pill';
  const blocks = recipe.blocks
    .map((b, i) => {
      let [name, opt] = typeof b === 'string' ? [b, {}] : [b[0], { ...(b[1] || {}) }];
      if (o.hero && HEROES.includes(name) && name !== o.hero) { name = o.hero; opt = name === 'heroSplit' ? { side: 'today' } : {}; }
      if (o.sched && SCHEDULES.includes(name)) name = o.sched;
      return [name, opt, i];
    })
    .filter(b => !(o.off && o.off.has(b[2])) && BLOCKS[b[0]]);
  /* the voice follows the business: a personal trainer always speaks in the first person about sessions,
     and a gym on the prices-first layout speaks like the timetable does */
  const voice = gym.unit === 'session' ? 'solo' : recipe.voice === 'solo' ? 'next' : recipe.voice;
  const x = makeContext(gym, { lang: o.lang, fx, voice, follow, blocks, now: o.now });
  const tokens = buildTokens({ ...recipe.tokens, ...(o.tokens || {}) }, o.brand || gym.brand);
  const html = `<div class="zp" id="zp" lang="${x.lang}" data-recipe="${esc(recipe.id)}" data-fx="${Object.keys(fx).filter(k => fx[k]).join(' ')}">
${defs(tokens.duo)}
${blocks.map(([name, opt]) => BLOCKS[name](gym, x, opt)).join('\n')}
${fx.book && x.cta ? followBook(gym, x, follow) : ''}
<p class="zp-toast" role="status" aria-live="polite"></p>
</div>`;
  return { html, tokens, x, blocks, gym, recipe, follow };
}

/* Paint: write the tokens onto the page. Changing a color, the spacing or the corners is only this. Nothing is rebuilt. */
export function applyTokens(root, tokens) {
  for (const [k, v] of Object.entries(tokens.vars)) root.style.setProperty(k, v);
  for (const [k, v] of Object.entries(tokens.attrs)) root.dataset[k] = v;
  const f = root.querySelector('#zp-duo');
  if (f) for (const [tag, v] of [['feFuncR', tokens.duo.r], ['feFuncG', tokens.duo.g], ['feFuncB', tokens.duo.b]]) f.querySelector(tag).setAttribute('tableValues', v);
}

/* each block's name, for the "show block names" view */
export function labelBlocks(root) {
  root.querySelectorAll('[data-block]').forEach(el => { const n = BLOCK_NAMES[el.dataset.block]; if (n) el.dataset.label = n.en; });
}

/* The things a visitor can press. hooks: { setLang(lang), still(): true when motion is reduced } */
export function wirePage(root, page, hooks = {}) {
  const { x } = page, S = x.S;
  const how = () => (hooks.still && hooks.still() ? 'auto' : 'smooth');
  const toast = root.querySelector('.zp-toast'); let toastT = 0;
  const say = msg => { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2600); };
  const goTo = id => { const el = id && root.querySelector('#' + CSS.escape(id)); if (el) el.scrollIntoView({ behavior: how(), block: 'start' }); return !!el; };
  const sched = () => root.querySelector('.zp-sched');

  const setDay = i => {
    const s = sched(); if (!s) return;
    s.querySelectorAll('.zp-day').forEach(b => { const on = +b.dataset.day === i; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    s.querySelectorAll('.zp-daypanel').forEach(p => { p.hidden = +p.dataset.day !== i; });
    const tabs = s.querySelector('.zp-days'), on = s.querySelector('.zp-day.is-on');
    if (tabs && on) { const a = on.offsetLeft - tabs.offsetLeft - 16; if (a < tabs.scrollLeft || a + on.offsetWidth + 32 > tabs.scrollLeft + tabs.clientWidth) tabs.scrollTo({ left: Math.max(0, a), behavior: how() }); }
  };
  const setFilter = cls => {
    const s = sched(); if (!s) return;
    s.querySelectorAll('.zp-daypanel').forEach(p => {
      const items = [...p.querySelectorAll('[data-cls]')]; let shown = 0;
      items.forEach(el => { const ok = !cls || el.dataset.cls === cls; el.hidden = !ok; if (ok) shown++; });
      const empty = p.querySelector('.zp-empty');
      if (empty) { empty.hidden = shown > 0; empty.textContent = items.length && !shown ? S.noMatch : S.noClasses; }
    });
    const note = s.querySelector('.zp-filter');
    if (note) { note.hidden = !cls; if (cls && x.classById[cls]) note.querySelector('span').textContent = `${S.showing}: ${x.L(x.classById[cls].name)}.`; }
  };
  const closeMenu = () => { const b = root.querySelector('.zp-bar.is-open'); if (b) { b.classList.remove('is-open'); const m = b.querySelector('.zp-menu'); if (m) m.setAttribute('aria-expanded', 'false'); } };

  const onClick = e => {
    const t = e.target.closest('.zp-day, .zp-tab, [data-pick], [data-act], a[href^="#"]');
    if (!t || !root.contains(t)) return;
    if (t.matches('.zp-day')) return setDay(+t.dataset.day);
    if (t.matches('.zp-tab')) return setSlide(t.closest('[data-block]'), +t.dataset.slide, true);
    if (t.dataset.pick) {                                   // "See times" on a class: show only that class, on its next day
      e.preventDefault(); setFilter(t.dataset.pick);
      const i = x.days.findIndex(d => d.sessions.some(s => s.cls === t.dataset.pick)); if (i >= 0) setDay(i);
      goTo('schedule'); return;
    }
    switch (t.dataset.act) {
      case 'lang': e.preventDefault(); if (hooks.setLang) hooks.setLang(x.lang === 'en' ? 'es' : 'en'); return;
      case 'menu': { const b = t.closest('.zp-bar'); t.setAttribute('aria-expanded', b.classList.toggle('is-open')); return; }
      case 'reserve': e.preventDefault(); say(S.toast); return;
      case 'noop': e.preventDefault(); return;
      case 'clearfilter': setFilter(''); return;
      case 'pause': case 'find': return;                    // the moving hero owns the pause button; the form is handled on submit
    }
    if (t.matches('a[href^="#"]')) { e.preventDefault(); closeMenu(); goTo(t.getAttribute('href').slice(1)); }
  };
  const onSubmit = e => {
    const f = e.target.closest('form[data-act="find"]'); if (!f) return;
    e.preventDefault(); setFilter(f.elements.cls.value); setDay(+f.elements.day.value); goTo('schedule');
  };
  /* Photos below the first screen load when the visitor gets near them. A moment after the page settles the rest load too,
     and at once before a print, so a print or a full-page capture shows photos and not gray boxes.
     A visitor who asked to save data, or is on a slow line, keeps the lazy loading. */
  const loadAll = () => root.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
  const line = navigator.connection || {};
  const lazyT = line.saveData || /2g/.test(line.effectiveType || '') ? 0 : setTimeout(loadAll, 2500);
  window.addEventListener('beforeprint', loadAll);
  root.addEventListener('click', onClick); root.addEventListener('submit', onSubmit);
  return () => { root.removeEventListener('click', onClick); root.removeEventListener('submit', onSubmit); window.removeEventListener('beforeprint', loadAll); clearTimeout(toastT); clearTimeout(lazyT); };
}
