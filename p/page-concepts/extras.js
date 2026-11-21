/* extras.js: the two views a business gets besides its page.
     the links list    a link-in-bio page: logo, name, one line, then buttons. Zana's buttons, the content pages, and up to 3 of the owner's own links.
     a content page    up to 3 per business: a title, a hero photo with text over it, formatted text, one photo with text beside it.
                       Its own address. Linked from the footer or the links list, never from the menu bar. No galleries, no layouts.
   Both are painted with the same tokens as the page, so they look like the same business.
   links.html and content.html draw them on their own; the owner's preview frame (preview.js) draws them inside the customizer. */

import { esc, logo, contactOf, footer, legalSheet, footLinks } from './blocks.js?v=18';
import { makeContext, applyTokens, tidy, openSheet, closeSheet, goWhere } from './page.js?v=18';

/* Zana's own buttons. Zana's words are English first, then Spanish, on the button itself: the business's words are written once. */
export const ZANA_LINKS = {
  book: ['Book a class', 'Reservar una clase'], prices: ['Prices', 'Precios'], join: ['Join', 'Únete'], location: ['Location', 'Ubicación'],
  whatsapp: ['WhatsApp', ''], instagram: ['Instagram', ''], tiktok: ['TikTok', ''], phone: ['Phone', 'Teléfono'],
};
export const CUSTOM_MAX = 3, PAGES_MAX = 3;

const ic = d => `<svg class="zp-lk__ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON = {
  book: ic('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  prices: ic('<path d="M3.5 12.5 12 4h8v8l-8.5 8.5a1.5 1.5 0 0 1-2 0l-6-6a1.5 1.5 0 0 1 0-2z"/><circle cx="16" cy="8" r="1.3" fill="currentColor"/>'),
  join: ic('<circle cx="10" cy="8" r="3.8"/><path d="M3.5 20c.6-3.6 3.2-5.6 6.5-5.6 1.5 0 2.8.4 3.9 1.1M18 14v6M15 17h6"/>'),
  location: ic('<path d="M12 21s-7-6.1-7-11.4a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.4"/>'),
  whatsapp: ic('<path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.6 18.6z"/><path d="M9.2 8.6c.2 2.9 2.7 5.6 5.9 6l1-1.4-2-1-1 .8a5 5 0 0 1-2.4-2.4l.8-1-1-2z" fill="currentColor" stroke="none"/>'),
  instagram: ic('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>'),
  tiktok: ic('<path d="M13.5 3.5v11.2a3.3 3.3 0 1 1-3.3-3.3M13.5 3.5c.4 2.6 2.3 4.4 5 4.6"/>'),
  phone: ic('<path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>'),
  page: ic('<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 16h6"/>'),
  out: ic('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
};
const ARROW = '<svg class="zp-lk__go" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const bare = u => String(u || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
export const fullUrl = u => (/^https?:\/\//i.test(String(u).trim()) ? String(u).trim() : 'https://' + String(u).trim());

/* One entry of the links list, by id: a Zana button ("book"), a content page ("page:slug") or one of the owner's own ("c1").
   Returns null when it has nothing to point at: a contact never filled in, a deleted page, a custom link with no address. */
export function linkItem(gym, id, S) {
  const L = gym.links || {};
  if (id.startsWith('page:')) {
    const p = (gym.pages || []).find(pg => pg.slug === id.slice(5));
    return p && p.title ? { kind: 'page', icon: ICON.page, en: p.title, es: '', act: 'go', v: id } : null;
  }
  const c = (L.custom || []).find(x => x.id === id);
  if (c) return c.name && bare(c.url) ? { kind: 'custom', icon: ICON.out, en: c.name, es: '', sub: bare(c.url), href: fullUrl(c.url), out: true } : null;
  if (!ZANA_LINKS[id]) return null;
  const [en, es] = ZANA_LINKS[id];
  if (['whatsapp', 'instagram', 'tiktok', 'phone'].includes(id)) {
    const ct = contactOf(gym, id, S); if (!ct) return null;
    return { kind: id, icon: ICON[id], en, es, sub: ct.shown, href: ct.href, act: 'out', name: ct.name };
  }
  if (id === 'location') {
    const addr = (gym.place && gym.place.addr) || []; if (!addr.length) return null;
    return { kind: id, icon: ICON.location, en, es, sub: addr.join(', '), href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr.join(', '))}`, act: 'out', name: 'Maps' };
  }
  if (id === 'prices' && !(gym.prices || []).length) return null;
  if (id === 'book' && !(gym.schedule || []).length) return null;
  return { kind: id, icon: ICON[id], en, es, act: id === 'join' ? 'join' : 'go', v: id === 'book' ? 'schedule' : id === 'prices' ? 'prices' : '' };
}
/* the entries a visitor sees, in the owner's order */
export const linksShown = (gym, S) => ((gym.links && gym.links.order) || []).filter(id => !((gym.links.off || []).includes(id))).map(id => linkItem(gym, id, S)).filter(Boolean);

/* the logo leads back to the business's page */
const home = gym => logo(gym, './?r=timetable&launch=1').replace('<a ', '<a data-act="go" data-v="top" ');

/* ---------- the links list ---------- */
export function linksHtml(gym, x) {
  const { S } = x, items = linksShown(gym, S);
  const btn = (it, i) => {
    const t = `<span class="zp-lk__t"><b>${esc(it.en)}</b>${it.es ? `<small lang="es">${esc(it.es)}</small>` : it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span>`;
    if (it.out) return `<a class="zp-lk__btn" href="${esc(it.href)}" target="_blank" rel="noopener">${it.icon}${t}${ICON.out.replace('zp-lk__ico', 'zp-lk__go')}<span class="zp-vh"> (${esc(S.leaves)})</span></a>`;
    return `<a class="zp-lk__btn${i === 0 && it.kind === 'book' ? ' is-main' : ''}" href="${esc(it.href || '#')}" data-act="${it.act}"${it.v ? ` data-v="${esc(it.v)}"` : ''}${it.name ? ` data-name="${esc(it.name)}"` : ''}>${it.icon}${t}${ARROW}</a>`;
  };
  return `<div class="zp zp-lk" id="zp" lang="en">
  <main class="zp-lk__in">
    <header class="zp-lk__head">
      <div class="zp-lk__logo">${home(gym)}</div>
      <h1 class="zp-h2 zp-lk__name">${esc(gym.name)}</h1>
      ${x.L(gym.line) ? `<p class="zp-lk__line">${esc(x.L(gym.line))}</p>` : ''}
    </header>
    <nav class="zp-lk__list" aria-label="${esc(gym.name)}">${items.map(btn).join('')}</nav>
    <footer class="zp-lk__foot">${footLinks({ ...gym, pages: [] }, x)}<p>${esc(x.L(gym.made) || S.made)}</p></footer>
  </main>
  ${legalSheet(gym, x)}
  <p class="zp-toast" role="status" aria-live="polite"></p>
</div>`;
}

/* ---------- formatted text ----------
   An owner may use headings, bold and links. Anything else typed or pasted is reduced to plain text. */
const KEEP = { H2: 'h2', H3: 'h3', P: 'p', B: 'b', STRONG: 'b', I: 'i', EM: 'i', A: 'a', BR: 'br', UL: 'ul', OL: 'ol', LI: 'li', DIV: 'p' };
export function cleanRich(html) {
  const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');
  const walk = node => [...node.childNodes].map(n => {
    if (n.nodeType === 3) return esc(n.textContent);
    if (n.nodeType !== 1) return '';
    const tag = KEEP[n.tagName], inner = walk(n);
    if (!tag) return inner;
    if (tag === 'br') return '<br>';
    if (tag === 'a') { const h = n.getAttribute('href') || ''; return /^(https?:|mailto:|tel:)/i.test(h) ? `<a href="${esc(h)}">${inner}</a>` : inner; }
    return inner.trim() || tag === 'p' ? `<${tag}>${inner}</${tag}>` : '';
  }).join('');
  return walk(doc.body).replace(/<p><\/p>/g, '');
}

/* ---------- a content page ---------- */
export function contentHtml(gym, pg, x) {
  const { S } = x;
  if (!pg) return `<div class="zp zp-cp" id="zp"><p class="zp-cp__none zp-in">${esc('This content page does not exist.')}</p></div>`;
  const hero = pg.hero || {}, side = pg.side || {};
  const bar = `<header class="zp-bar" data-block="menuBar" data-over="${hero.src ? 1 : 0}"><div class="zp-bar__bg"><div class="zp-bar__in">
      ${home(gym)}
      <div class="zp-bar__end">${(gym.schedule || []).length ? `<a class="zp-btn zp-btn--sm" href="./?r=timetable&launch=1#schedule" data-act="go" data-v="schedule">${esc(S.book)}</a>` : ''}</div>
    </div></div></header>`;
  return `<div class="zp zp-cp" id="zp" lang="${x.lang}">
  ${bar}
  <section class="zp-hero ${hero.src ? 'zp-hero--full' : ''} zp-cp__hero" data-block="cpHero" id="top">
    ${hero.src ? `<div class="zp-hero__media"><img class="zp-img" src="${esc(hero.src)}" alt=""${hero.pos ? ` style="object-position:${esc(hero.pos)}"` : ''} fetchpriority="high"></div><div class="zp-scrim"></div>` : ''}
    <div class="zp-hero__in"><div class="zp-hero__copy">
      <h1 class="zp-h1">${esc(pg.title || '')}</h1>
      ${hero.text ? `<p class="zp-lead">${esc(hero.text)}</p>` : ''}
    </div></div>
  </section>
  ${cleanRich(pg.body) ? `<section class="zp-sec" data-block="cpText"><div class="zp-in zp-cp__text">${cleanRich(pg.body)}</div></section>` : ''}
  ${side.src || side.text ? `<section class="zp-sec zp-sec--band" data-block="cpSide"><div class="zp-in zp-cp__side${side.src ? '' : ' is-solo'}">
    ${side.src ? `<div class="zp-ph zp-cp__ph"><img class="zp-img" src="${esc(side.src)}" alt="" loading="lazy"${side.pos ? ` style="object-position:${esc(side.pos)}"` : ''}></div>` : ''}
    ${side.text ? `<p class="zp-cp__beside">${esc(side.text)}</p>` : ''}
  </div></section>` : ''}
  ${footer(gym, x)}
  <p class="zp-toast" role="status" aria-live="polite"></p>
</div>`;
}

/* draw one of the two views into a stage. o: { lang, tokens, slug, hooks } */
export function drawExtra(stage, kind, gymIn, o = {}) {
  const gym = tidy(gymIn);
  const x = makeContext(gym, { lang: o.lang || 'en', blocks: [['footer']] });
  const pg = kind === 'content' ? (gym.pages || []).find(p => p.slug === o.slug) || (o.slug ? null : gym.pages[0]) : null;
  stage.innerHTML = kind === 'links' ? linksHtml(gym, x) : contentHtml(gym, pg, x);
  const root = stage.firstElementChild;
  applyTokens(root, o.tokens);
  root.dataset.fx = 'rise';
  const toast = root.querySelector('.zp-toast'); let t = 0;
  const say = m => { if (!toast) return; toast.textContent = m; toast.classList.add('is-on'); clearTimeout(t); t = setTimeout(() => toast.classList.remove('is-on'), 2600); };
  const onClick = e => {
    const a = e.target.closest('[data-act]'); if (!a || !root.contains(a)) return;
    switch (a.dataset.act) {
      case 'legal': e.preventDefault(); openSheet(root, a.dataset.v, a); return;
      case 'sheetclose': closeSheet(root); return;
      case 'out': e.preventDefault(); say(x.S.out(a.dataset.name)); return;
      case 'join': e.preventDefault(); say(x.lang === 'es' ? 'En la página real, aquí abre la pantalla de Zana para unirse.' : 'In the real page, this opens Zana\'s join screen.'); return;
      case 'go': e.preventDefault(); goWhere(a.dataset.v, o.hooks); return;
      case 'reserve': case 'noop': e.preventDefault(); return;
      case 'lang': e.preventDefault(); if (o.hooks && o.hooks.setLang) o.hooks.setLang(x.lang === 'en' ? 'es' : 'en'); return;
    }
  };
  const onKey = e => { if (e.key === 'Escape') closeSheet(root); };
  root.addEventListener('click', onClick); document.addEventListener('keydown', onKey);
  return { root, x, title: kind === 'links' ? gym.name : pg ? `${pg.title} · ${gym.name}` : gym.name,
    unwire: () => { closeSheet(root); root.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); clearTimeout(t); } };
}
