/* blocks.js: the block library.
   Each block is a function: (gym data, page context, options) -> HTML.
   A block never sets a color, a font or a size: it uses class names, and page.css reads the tokens.
   A block that lacks its data (no coaches, no reviews, no photos) returns '' and the page simply skips it. */

export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const low = s => (s === s.toUpperCase() ? s : s.charAt(0).toLowerCase() + s.slice(1));   // keeps HIIT as HIIT
const list = (a, and) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ` ${and} ` + a[a.length - 1]);
const pad2 = n => String(n).padStart(2, '0');
const TICK = '<svg class="zp-tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.8 8.6 6.3 12 13.2 4.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- the fixed words of a page, in both languages ---------- */
export const WORDS = {
  en: {
    nav: { classes: 'Classes', schedule: 'Schedule', coaches: 'Coaches', prices: 'Prices', find: 'Find us' },
    book: 'Book a class', bookShort: 'Book', see: 'See the schedule', seePrices: 'See prices', buy: 'Buy', popular: 'Most popular',
    today: 'Today', left: n => (n === 1 ? '1 spot left' : `${n} spots left`), full: 'Full', wait: 'Waitlist',
    withCoach: 'with', min: 'min', next: 'Next', seeTimes: 'See times', openFloor: 'Open floor',
    tClasses: 'Classes', tWeek: 'This week', tPrices: 'Prices', tCoaches: 'Coaches', tReviews: 'Members say', tFirst: 'First visit', tAbout: 'About', tFind: 'Find us', tHours: 'Hours', tContact: 'Contact',
    hClasses: n => `${['', 'One way', 'Two ways', 'Three ways', 'Four ways', 'Five ways', 'Six ways'][n] || n + ' ways'} to train`,
    hSchedule: 'Pick a time', hPrices: 'Simple prices', hCoaches: 'Who you train with', hReviews: 'In their words', hFirst: 'Your first class is free', hFind: 'Come by',
    steps: ['Pick any class on the schedule.', 'Book it in two taps. No card needed.', 'Show up ten minutes early and say hi.'],
    tax: 'Prices include IVU.', perMonth: '/ month', from: p => `from ${p}`, free: 'First class free', then: p => `then from ${p}`,
    fClasses: 'classes a week', fCap: 'people per class, at most', fFirst: 'first class of the day', fSingle: 'for a single class',
    newHere: 'New here?', bookIt: 'Book it', noClasses: 'No classes this day.', noMatch: 'None of these this day. Try another day.',
    toast: 'In the real page, booking opens here.', maps: 'Open in Maps', made: 'Page made with Zana. Demo: this gym, its people and their words are invented.',
    switchTo: 'Ver en español', menu: 'Menu', pause: 'Pause video', play: 'Play video', prev: 'Back', nextCard: 'Forward',
    bbClass: 'Class', bbDay: 'Day', bbAny: 'Any class', bbGo: 'See times', showing: 'Showing', clear: 'Show all',
    coachOf: 'Coach',
  },
  es: {
    nav: { classes: 'Clases', schedule: 'Horario', coaches: 'Coaches', prices: 'Precios', find: 'Dónde estamos' },
    book: 'Reserva una clase', bookShort: 'Reservar', see: 'Ver el horario', seePrices: 'Ver precios', buy: 'Comprar', popular: 'Más popular',
    today: 'Hoy', left: n => (n === 1 ? 'Queda 1 lugar' : `Quedan ${n} lugares`), full: 'Llena', wait: 'Lista de espera',
    withCoach: 'con', min: 'min', next: 'Próxima', seeTimes: 'Ver horarios', openFloor: 'Piso abierto',
    tClasses: 'Clases', tWeek: 'Esta semana', tPrices: 'Precios', tCoaches: 'Coaches', tReviews: 'Lo que dicen', tFirst: 'Primera visita', tAbout: 'Sobre', tFind: 'Dónde estamos', tHours: 'Horario', tContact: 'Contacto',
    hClasses: n => `${['', 'Una forma', 'Dos formas', 'Tres formas', 'Cuatro formas', 'Cinco formas', 'Seis formas'][n] || n + ' formas'} de entrenar`,
    hSchedule: 'Elige una hora', hPrices: 'Precios claros', hCoaches: 'Con quién entrenas', hReviews: 'En sus palabras', hFirst: 'Tu primera clase es gratis', hFind: 'Pasa por aquí',
    steps: ['Elige cualquier clase del horario.', 'Resérvala en dos toques. Sin tarjeta.', 'Llega diez minutos antes y saluda.'],
    tax: 'Los precios incluyen IVU.', perMonth: '/ mes', from: p => `desde ${p}`, free: 'Primera clase gratis', then: p => `luego desde ${p}`,
    fClasses: 'clases por semana', fCap: 'personas por clase, como máximo', fFirst: 'primera clase del día', fSingle: 'por una clase suelta',
    newHere: '¿Primera vez?', bookIt: 'Resérvala', noClasses: 'No hay clases este día.', noMatch: 'No hay de estas este día. Prueba otro día.',
    toast: 'En la página real, aquí abre la reserva.', maps: 'Abrir en Mapas', made: 'Página hecha con Zana. Demo: este gimnasio, su gente y sus palabras son inventados.',
    switchTo: 'View in English', menu: 'Menú', pause: 'Pausar video', play: 'Reproducir video', prev: 'Atrás', nextCard: 'Adelante',
    bbClass: 'Clase', bbDay: 'Día', bbAny: 'Cualquier clase', bbGo: 'Ver horarios', showing: 'Mostrando', clear: 'Ver todas',
    coachOf: 'Coach',
  },
};

/* ---------- words Zana writes from the data. The owner types none of this. ----------
   Four voices. Each has a headline (with and without a changing word), a line under it, and a short pitch. */
const COPY = {
  roof: {
    head: {
      en: (n, g, x) => [x.fx.word ? x.slot(n.map(w => cap(w) + '.')) : esc(cap(list(n.slice(0, 3).map(low), 'and')) + '.'), esc(`Under one roof in ${g.hood}.`)],
      es: (n, g, x) => [x.fx.word ? x.slot(n.map(w => cap(w) + '.')) : esc(cap(list(n.slice(0, 3).map(low), 'y')) + '.'), esc(`Bajo un mismo techo en ${g.hood}.`)],
    },
    lead: {
      en: f => `${f.n} coached classes a week, never more than ${f.cap} people in the room. Your first one is free.`,
      es: f => `${f.n} clases con coach cada semana, nunca más de ${f.cap} personas en el salón. La primera es gratis.`,
    },
    stmt: {
      en: f => `${f.ways} to train, ${f.n} classes a week, one membership. Groups stay small, so your coach knows your name and your numbers. Come once for free and decide after.`,
      es: f => `${f.ways} de entrenar, ${f.n} clases por semana, una sola membresía. Los grupos son pequeños, así tu coach conoce tu nombre y tus números. Ven una vez gratis y decide después.`,
    },
  },
  next: {
    head: {
      en: (n, g, x) => (x.fx.word ? [esc('Book a spot in'), x.slot(n.map(w => cap(w) + '.'))] : [esc(`${x.facts.n} classes this week.`), esc('Book yours in two taps.')]),
      es: (n, g, x) => (x.fx.word ? [esc('Reserva tu lugar en'), x.slot(n.map(w => cap(w) + '.'))] : [esc(`${x.facts.n} clases esta semana.`), esc('Reserva la tuya en dos toques.')]),
    },
    lead: {
      en: () => 'Small groups, real coaches and a time that fits your day. Your first class is free.',
      es: () => 'Grupos pequeños, coaches de verdad y una hora que cabe en tu día. Tu primera clase es gratis.',
    },
    stmt: {
      en: f => `Pick a class, book it in two taps and show up. ${f.n} classes every week with ${f.coaches} coaches who know your name. Your first one is on us.`,
      es: f => `Elige una clase, resérvala en dos toques y llega. ${f.n} clases cada semana con ${f.coaches} coaches que saben tu nombre. La primera va por nosotros.`,
    },
  },
  pace: {
    head: {
      en: (n, g, x) => [x.fx.word ? x.slot(n.map(w => cap(w) + ',')) : esc(cap(list(x.shorts.slice(0, 2).map(low), 'and')) + ','), '<em>at your own pace.</em>'],
      es: (n, g, x) => [x.fx.word ? x.slot(n.map(w => cap(w) + ',')) : esc(cap(list(x.shorts.slice(0, 2).map(low), 'y')) + ','), '<em>a tu propio ritmo.</em>'],
    },
    lead: {
      en: (f, g) => `Small classes in ${g.hood}, for every level. Come once for free and see how it feels.`,
      es: (f, g) => `Clases pequeñas en ${g.hood}, para todos los niveles. Ven una vez gratis y mira cómo se siente.`,
    },
    stmt: {
      en: f => `A quiet room, a small group and a teacher who sees you. ${f.n} classes a week, from first-timers to daily practice. Your first class is free.`,
      es: f => `Un salón tranquilo, un grupo pequeño y alguien que te guía de cerca. ${f.n} clases por semana, para quien empieza y para quien practica a diario. Tu primera clase es gratis.`,
    },
  },
  lines: {
    head: {
      en: (n, g, x) => (x.fx.word ? [x.slot(n.map(w => cap(w) + '.')), esc(`In ${g.hood}.`)] : n.slice(0, 3).map(w => esc(cap(w) + '.'))),
      es: (n, g, x) => (x.fx.word ? [x.slot(n.map(w => cap(w) + '.')), esc(`En ${g.hood}.`)] : n.slice(0, 3).map(w => esc(cap(w) + '.'))),
    },
    lead: {
      en: f => `${f.n} classes a week. ${f.cap} people at most. Your first one is free.`,
      es: f => `${f.n} clases por semana. Máximo ${f.cap} personas. La primera es gratis.`,
    },
    stmt: {
      en: f => `Show up, work, go home. ${f.n} classes a week, ${f.cap} people at most and a coach on every round. Your first class is free.`,
      es: f => `Llega, trabaja y vete a casa. ${f.n} clases por semana, máximo ${f.cap} personas y un coach en cada ronda. Tu primera clase es gratis.`,
    },
  },
};
export const VOICES = Object.keys(COPY);

/* ---------- small pieces the blocks share ---------- */
const logo = gym => `<a class="zp-logo" href="#top" aria-label="${esc(gym.name)}"><svg viewBox="0 0 32 32" aria-hidden="true">${gym.logo.mark}</svg><span class="zp-logo__w">${esc(gym.logo.word)}</span></a>`;
const initials = name => name.split(/\s+/).map(w => w.charAt(0)).join('').slice(0, 2).toUpperCase();
const avatar = (c, cls = '') => (c && c.photo
  ? `<span class="zp-av ${cls}"><img class="zp-img" src="${c.photo}" alt="" loading="lazy"></span>`
  : `<span class="zp-av zp-av--init ${cls}" aria-hidden="true">${c ? esc(initials(c.name)) : '<svg viewBox="0 0 16 16" width="45%" aria-hidden="true"><path d="M3 12V7m5 5V4m5 8V8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'}</span>`);
const photo = (src, o = {}) => `<div class="zp-ph ${o.cls || ''}"><img class="zp-img" src="${src}" alt="${esc(o.alt || '')}"${o.pos ? ` style="object-position:${o.pos}"` : ''} ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'}></div>`;
const head = (tag, title, o = {}) => `<div class="zp-head" data-rise><div class="zp-head__t"><p class="zp-tag">${esc(tag)}</p><h2 class="zp-h2">${title}</h2>${o.lead ? `<p class="zp-lead">${esc(o.lead)}</p>` : ''}</div>${o.side || ''}</div>`;
/* keep a time and its am/pm together on one line: "9 p. m." must never break after the 9 or the p. */
const glue = s => String(s).replace(/(\d) (?=(?:[ap]\. ?m\.|AM\b|PM\b))/g, '$1\u00a0').replace(/\b([ap])\. m\./g, '$1.\u00a0m.');
const clock = t => `${esc(t.clock)} <span>${esc(t.ap)}</span>`;   /* a real space, so a screen reader says "6:00 a.m." and not "6:00a.m." */
/* keep a trailing initial with its name: "Luis O." must never leave the "O." alone on the next line */
const person = s => String(s).replace(/ (?=\S{1,3}$)/, '\u00a0');
const wide = gym => gym.photos.filter(p => p.shape === 'wide');
const slideStack = pics => pics.map((s, i) => `<div class="zp-slide${i ? '' : ' is-on'}"><img class="zp-img" src="${s.src}" alt=""${s.pos ? ` style="object-position:${s.pos}"` : ''} ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>`).join('');
const arrowBtns = S => `<div class="zp-arrows"><button type="button" class="zp-arrow" data-dir="-1" aria-label="${esc(S.prev)}">${ARROW}</button><button type="button" class="zp-arrow" data-dir="1" aria-label="${esc(S.nextCard)}">${ARROW}</button></div>`;

function headline(gym, x) {
  const c = COPY[x.voice] || COPY.roof;
  return c.head[x.lang](x.names, gym, x).map(l => `<span class="zp-line">${l}</span>`).join(' ');
}
const leadLine = (gym, x) => (COPY[x.voice] || COPY.roof).lead[x.lang](x.facts, gym);

function heroCopy(gym, x) {
  const { S } = x;
  return `<div class="zp-hero__copy">
    <p class="zp-tag">${esc(gym.area)} · ${esc(x.L(gym.kind))}</p>
    <h1 class="zp-h1">${headline(gym, x)}</h1>
    <p class="zp-lead">${esc(leadLine(gym, x))}</p>
    ${x.pillAlways ? '' : `<div class="zp-btns" data-follow-start>
      <a class="zp-btn" href="#schedule">${esc(S.book)}</a>
      <a class="zp-btn zp-btn--ghost" href="#prices">${esc(S.seePrices)}</a>
    </div>`}
  </div>`;
}

function sessionBits(s, x) {
  const { S, L } = x;
  const cls = x.classById[s.cls], co = s.coach ? x.coachById[s.coach] : null;
  const fullUp = s.left === 0;
  return {
    cls, co, fullUp, t: x.time(s.time),
    who: co ? `${S.withCoach} ${person(co.name)}` : S.openFloor,
    spots: fullUp ? S.full : S.left(s.left),
    btn: `<a class="zp-btn zp-btn--sm${fullUp ? ' zp-btn--ghost' : ''}" href="#" data-act="reserve">${esc(fullUp ? S.wait : S.bookShort)}</a>`,
    name: L(cls.name),
  };
}

/* =====================================================================
   THE BLOCKS
   ===================================================================== */

/* Menu bar. Sits clear over a film or slideshow hero. The "menu bar" effect makes it stick and slim down. */
export function menuBar(gym, x) {
  const { S } = x;
  const links = x.nav.map(n => `<a href="#${n.id}">${esc(n.label)}</a>`).join('');
  return `<header class="zp-bar" data-block="menuBar" data-over="${x.overMedia ? 1 : 0}">
    <div class="zp-bar__bg"><div class="zp-bar__in">
      ${logo(gym)}
      <nav class="zp-nav" aria-label="${esc(S.menu)}">${links}</nav>
      <div class="zp-bar__end">
        <button class="zp-lang" type="button" data-act="lang" aria-label="${esc(S.switchTo)}">${x.lang === 'en' ? 'ES' : 'EN'}</button>
        <a class="zp-btn zp-btn--sm zp-bar__book" href="#schedule"><span class="zp-w">${esc(S.book)}</span><span class="zp-n">${esc(S.bookShort)}</span></a>
        <button class="zp-menu" type="button" data-act="menu" aria-expanded="false" aria-label="${esc(S.menu)}"><i></i></button>
      </div>
    </div>
    <div class="zp-drawer">${links}<a class="zp-btn zp-btn--block" href="#schedule">${esc(S.book)}</a></div></div>
  </header>`;
}

/* Hero 1: film. A silent loop behind the headline. The still photo shows first; the video only loads when the "moving hero" effect is on. */
export function heroFilm(gym, x) {
  const v = gym.video, still = wide(gym)[0] || gym.photos[0];
  if (!v && !still) return heroSplit(gym, x, { side: 'today' });
  const media = v
    ? `<picture><source media="(max-width:699px)" srcset="${v.posterTall}"><img class="zp-img" src="${v.posterWide}" alt="" fetchpriority="high"></picture>
       <video class="zp-img" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-wide="${v.wide}" data-tall="${v.tall}"></video>`
    : `<img class="zp-img" src="${still.src}" alt="" fetchpriority="high"${still.pos ? ` style="object-position:${still.pos}"` : ''}>`;
  return `<section class="zp-hero zp-hero--full" data-block="heroFilm" id="top">
    <div class="zp-hero__media"${v ? ' data-fx-hero="video"' : ''}>${media}</div>
    <div class="zp-scrim"></div>
    <div class="zp-hero__in">${heroCopy(gym, x)}</div>
    ${v ? `<button class="zp-pause" type="button" data-act="pause" hidden aria-label="${esc(x.S.pause)}"><i></i></button>` : ''}
  </section>`;
}

/* Hero 2: slideshow with tabs. One photo per class; the tabs name the classes. The "moving hero" effect advances it by itself. */
export function heroSlideshow(gym, x) {
  const { L, S } = x;
  let slides = gym.classes.filter(c => c.photo).slice(0, 3).map(c => ({ src: c.photo, pos: c.pos, label: L(c.name), sub: x.nextOf[c.id] ? `${S.next}: ${x.nextOf[c.id]}` : '' }));
  if (slides.length < 2) slides = gym.photos.slice(0, 3).map(p => ({ src: p.src, pos: p.pos, label: '', sub: '' }));
  if (!slides.length) return heroSplit(gym, x, { side: 'today' });
  const named = slides.every(s => s.label);
  return `<section class="zp-hero zp-hero--full zp-hero--slides" data-block="heroSlideshow" id="top">
    <div class="zp-hero__media" data-fx-hero="slides">${slideStack(slides)}</div>
    <div class="zp-scrim"></div>
    <div class="zp-hero__in">${heroCopy(gym, x)}</div>
    ${slides.length > 1 ? `<div class="zp-tabs" style="--n:${slides.length}">${slides.map((s, i) => `<button type="button" class="zp-tab${i ? '' : ' is-on'}" data-slide="${i}"><span class="zp-tag">${pad2(i + 1)}</span>${named ? `<b>${esc(s.label)}</b><span class="zp-tab__sub">${esc(s.sub)}</span>` : ''}</button>`).join('')}</div>` : ''}
  </section>`;
}

/* Hero 3: split. Words on the left. On the right, today's next classes ready to book, or one photo. */
export function heroSplit(gym, x, o = {}) {
  const { S } = x;
  let side;
  const pic = gym.photos[0];
  if (o.side === 'photo' && pic) side = photo(pic.src, { cls: 'zp-split__ph', pos: pic.pos, eager: true });
  else {
    const d = x.days.find(day => day.sessions.length) || x.days[0];
    side = `<div class="zp-today">
      <div class="zp-today__head"><p class="zp-tag">${esc(d.label)} · ${esc(d.date)}</p><a class="zp-link" href="#schedule">${esc(S.see)}</a></div>
      ${d.sessions.slice(0, 3).map(s => { const b = sessionBits(s, x); return `<article class="zp-mini">
        ${avatar(b.co)}
        <div class="zp-mini__main"><p class="zp-mini__time zp-num">${clock(b.t)}</p><p class="zp-mini__name">${esc(b.name)}</p><p class="zp-mini__meta">${esc(b.who)} · ${esc(b.spots)}</p></div>
        ${b.btn}
      </article>`; }).join('')}
    </div>`;
  }
  return `<section class="zp-hero zp-hero--split" data-block="heroSplit" id="top">
    <div class="zp-hero__in zp-split">${heroCopy(gym, x)}<div class="zp-split__side">${side}</div></div>
  </section>`;
}

/* Hero 4: framed photo. Words centered on the page color, one photo in a frame below.
   With "moving hero" on, the frame steps slowly through the gym's wide photos. */
export function heroFramed(gym, x) {
  const pics = wide(gym).slice(0, 4);
  if (!pics.length && gym.photos[0]) pics.push(gym.photos[0]);
  if (!pics.length) return heroSplit(gym, x, { side: 'today' });
  return `<section class="zp-hero zp-hero--framed" data-block="heroFramed" id="top">
    <div class="zp-hero__in zp-framed">${heroCopy(gym, x)}
      <div class="zp-framed__ph"><div class="zp-ph" data-fx-hero="slides">${slideStack(pics)}</div><span class="zp-chip zp-framed__offer">${esc(x.L(gym.offer))}</span></div>
    </div>
  </section>`;
}

/* Hero 5: three tiles. Words beside three tall photos, the offer pinned to one of them.
   With "moving hero" on, each tile fades slowly to a second photo and back. That second photo only loads then. */
export function heroTiles(gym, x) {
  const pics = gym.photos.slice(0, 3), alts = gym.photos.slice(3, 6);
  if (pics.length < 2) return pics.length ? heroFramed(gym, x) : heroSplit(gym, x, { side: 'today' });
  const pos = p => (p.pos ? ` style="object-position:${p.pos}"` : '');
  return `<section class="zp-hero zp-hero--tiles" data-block="heroTiles" id="top">
    <div class="zp-hero__in zp-tiles">${heroCopy(gym, x)}
      <div class="zp-tiles__grid" style="--n:${pics.length}" data-fx-hero="tiles">${pics.map((p, i) => `<figure class="zp-tile"><div class="zp-ph"><img class="zp-img" src="${p.src}" alt=""${pos(p)} fetchpriority="high">${alts[i] ? `<img class="zp-img zp-tile__alt" data-src="${alts[i].src}" alt=""${pos(alts[i])}>` : ''}</div>${i === 1 ? `<figcaption class="zp-tile__badge"><span class="zp-chip">${esc(x.L(gym.offer))}</span></figcaption>` : ''}</figure>`).join('')}</div>
    </div>
  </section>`;
}

/* Offer strip. Thin: one line with the offer. Loud: class names in headline type. The "moving text strip" effect sets it rolling. */
export function offerStrip(gym, x, o = {}) {
  const { S, L } = x, f = x.facts;
  const loud = o.variant === 'loud';
  let still, seq;
  if (loud) {
    const words = [...x.names, L(gym.offer)];
    seq = words.map((w, i) => `<span class="${i % 2 ? 'o' : ''}">${esc(w)}</span><span class="zp-strip__x" aria-hidden="true">/</span>`).join('');
    still = x.names.slice(0, 3).map((w, i) => `<span class="${i % 2 ? 'o' : ''}">${esc(w)}</span>`).join('<span class="zp-strip__x" aria-hidden="true">/</span>');
  } else {
    const bits = [L(gym.offer), `${f.n} ${S.fClasses}`, cap(S.from(f.from)), gym.area];
    seq = bits.map(t => `<span>${esc(t)}</span><span class="zp-strip__x" aria-hidden="true">·</span>`).join('');
    still = `<span>${esc(S.newHere)} ${esc(L(gym.offer))}.</span> <a class="zp-link" href="#schedule">${esc(S.bookIt)}</a>`;
  }
  const grp = `<div class="zp-strip__grp">${seq.repeat(loud ? 3 : 4)}</div>`;
  return `<div class="zp-strip zp-strip--${loud ? 'loud' : 'thin'} zp-strip--${o.tone || 'band'}" data-block="offerStrip" data-fx-strip>
    <div class="zp-strip__still">${still}</div>
    <div class="zp-strip__track" aria-hidden="true">${grp}${grp}</div>
  </div>`;
}

/* Statement: the short pitch, in headline type, with four facts counted from the schedule and prices.
   The "lights up" effect brightens it word by word as you scroll. */
export function statement(gym, x) {
  const { S } = x, f = x.facts;
  const text = (COPY[x.voice] || COPY.roof).stmt[x.lang](f, gym);
  const facts = [[f.n, S.fClasses], [f.cap, S.fCap], [f.first, S.fFirst], [f.from, S.fSingle]];
  return `<section class="zp-sec zp-stmt" data-block="statement" id="about"><div class="zp-in">
    <p class="zp-tag" data-rise>${esc(S.tAbout)} ${esc(gym.name)}</p>
    <p class="zp-stmt__text" data-fx-lightup data-rise>${esc(text)}</p>
    <dl class="zp-facts">${facts.map(([v, l], i) => `<div class="zp-fact" data-rise style="--i:${i}"><dd class="zp-num">${esc(v)}</dd><dt class="zp-tag">${esc(l)}</dt></div>`).join('')}</dl>
  </div></section>`;
}

/* Class cards. With photos, or plain and numbered when there are none.
   "Sliding card row" turns the grid into a swipe row. "Pinned section" holds one photo still while the classes scroll past it. */
export function classCards(gym, x, o = {}) {
  const { S, L } = x;
  const cs = gym.classes; if (!cs.length) return '';
  const withPhotos = o.variant !== 'plain' && cs.every(c => c.photo);
  const pinned = x.fx.pin && o.pin !== false && cs.every(c => c.photo);
  const meta = c => `${c.mins} ${S.min} · ${L(c.level)}`;
  const next = c => (x.nextOf[c.id] ? `<p class="zp-next"><span>${esc(S.next)}: ${esc(x.nextOf[c.id])}</span><a class="zp-link" href="#schedule" data-pick="${c.id}">${esc(S.seeTimes)}</a></p>` : '');
  let body;
  if (pinned) {
    body = `<div class="zp-pin" data-fx-pin>
      <div class="zp-pin__media"><div class="zp-pin__frame">${cs.map((c, i) => photo(c.photo, { cls: i ? '' : 'is-on', pos: c.pos, alt: L(c.name) })).join('')}</div></div>
      <div class="zp-pin__list">${cs.map((c, i) => `<article class="zp-pin__item${i ? '' : ' is-on'}" data-i="${i}">
        ${photo(c.photo, { cls: 'zp-pin__inline', pos: c.pos, alt: L(c.name) })}
        <p class="zp-tag">${pad2(i + 1)} / ${pad2(cs.length)} · ${esc(meta(c))}</p>
        <h3 class="zp-h2">${esc(L(c.name))}</h3>
        <p>${esc(L(c.blurb))}</p>
        ${next(c)}
      </article>`).join('')}</div>
    </div>`;
  } else {
    body = `<div class="zp-cards${withPhotos ? '' : ' zp-cards--plain'}" style="--cols:${cs.length === 4 ? 4 : cs.length === 2 ? 2 : 3}"${o.slide !== false ? ' data-fx-slide' : ''}>${cs.map((c, i) => `<article class="zp-class" data-rise style="--i:${i}">
      ${withPhotos ? photo(c.photo, { cls: 'zp-class__ph', pos: c.pos, alt: L(c.name) }) : ''}
      <div class="zp-class__body">
        <p class="zp-tag">${withPhotos ? '' : pad2(i + 1) + ' · '}${esc(meta(c))}</p>
        <h3 class="zp-h3">${esc(L(c.name))}</h3>
        <p>${esc(L(c.blurb))}</p>
        ${next(c)}
      </div>
    </article>`).join('')}</div>`;
  }
  return `<section class="zp-sec${o.band ? ' zp-sec--band' : ''}" data-block="classCards" id="classes"><div class="zp-in">
    ${head(S.tClasses, esc(S.hClasses(cs.length)), { side: pinned ? '' : arrowBtns(S) })}
    ${body}
  </div></section>`;
}

/* Schedule, two ways. Both show seven days from today with a Book button on every class. */
function scheduleShell(gym, x, o, name, sessionHtml, wrapCls) {
  const { S } = x;
  const tabs = x.days.map((d, i) => `<button type="button" class="zp-day${i === x.day0 ? ' is-on' : ''}" data-day="${i}"><b>${esc(d.label)}</b><small>${esc(d.date)}</small></button>`).join('');
  const panels = x.days.map((d, i) => `<div class="zp-daypanel ${wrapCls}" data-day="${i}"${i === x.day0 ? '' : ' hidden'}>${d.sessions.length ? d.sessions.map(s => sessionHtml(s)).join('') : ''}<p class="zp-empty"${d.sessions.length ? ' hidden' : ''}>${esc(S.noClasses)}</p></div>`).join('');
  return `<section class="zp-sec zp-sched${o.band ? ' zp-sec--band' : ''}" data-block="${name}" id="schedule"><div class="zp-in">
    ${head(S.tWeek, esc(S.hSchedule))}
    <div class="zp-days" role="group" aria-label="${esc(S.tWeek)}">${tabs}</div>
    <p class="zp-filter" hidden><span></span> <button type="button" class="zp-link" data-act="clearfilter">${esc(S.clear)}</button></p>
    <div data-rise>${panels}</div>
  </div></section>`;
}

/* Schedule as cards: the coach's photo, the time and a Book button on each one. */
export function scheduleCards(gym, x, o = {}) {
  const { S } = x;
  return scheduleShell(gym, x, o, 'scheduleCards', s => { const b = sessionBits(s, x); return `<article class="zp-sess" data-cls="${s.cls}">
    <p class="zp-sess__time zp-num">${clock(b.t)}</p>
    ${avatar(b.co, 'zp-sess__ph')}
    <h3 class="zp-h3 zp-sess__name">${esc(b.name)}</h3>
    <p class="zp-sess__meta">${b.cls.mins} ${esc(S.min)} · ${esc(b.who)}</p>
    <div class="zp-sess__foot"><span class="zp-spots">${esc(b.spots)}</span>${b.btn}</div>
  </article>`; }, 'zp-sessgrid');
}

/* Schedule as a plain list: one line per class. */
export function scheduleList(gym, x, o = {}) {
  const { S } = x;
  return scheduleShell(gym, x, o, 'scheduleList', s => { const b = sessionBits(s, x); return `<article class="zp-row" data-cls="${s.cls}">
    <p class="zp-row__time zp-num">${clock(b.t)}</p>
    <p class="zp-row__name">${esc(b.name)} <span>${b.cls.mins} ${esc(S.min)}</span></p>
    <p class="zp-row__who">${avatar(b.co)}<span>${esc(b.co ? person(b.co.name) : S.openFloor)}</span></p>
    <p class="zp-row__spots">${esc(b.spots)}</p>
    ${b.btn}
  </article>`; }, 'zp-rows');
}

/* Price cards: three equal cards, name, price in the brand color, one line, three ticks, a full-width Buy button
   pinned to the bottom so the buttons line up, and a small corner tab on the featured one. */
export function priceCards(gym, x, o = {}) {
  const { S, L } = x;
  if (!gym.prices || !gym.prices.length) return '';
  return `<section class="zp-sec${o.band ? ' zp-sec--band' : ''}" data-block="priceCards" id="prices"><div class="zp-in">
    ${head(S.tPrices, esc(S.hPrices))}
    <div class="zp-plans" style="--cols:${Math.min(3, gym.prices.length)}">${gym.prices.map((p, i) => `<article class="zp-plan${p.featured ? ' is-feat' : ''}" data-rise style="--i:${i}">
      ${p.featured ? `<span class="zp-plan__tab">${esc(S.popular)}</span>` : ''}
      <h3 class="zp-h3 zp-plan__name">${esc(L(p.name))}</h3>
      <p class="zp-plan__price">${esc(x.money(p.price))}${p.monthly ? ` <small>${esc(S.perMonth)}</small>` : ''}</p>
      <p class="zp-plan__line">${esc(L(p.line))}</p>
      <ul class="zp-ticks">${p.ticks.map(t => `<li>${TICK}<span>${esc(L(t))}</span></li>`).join('')}</ul>
      <a class="zp-btn zp-btn--block" href="#" data-act="reserve">${esc(S.buy)}</a>
    </article>`).join('')}</div>
    <p class="zp-note">${esc(S.tax)}</p>
  </div></section>`;
}

/* Coaches: a portrait, a name and what they teach. No photo? Initials. */
export function coaches(gym, x, o = {}) {
  const { S, L } = x;
  if (!gym.coaches || !gym.coaches.length) return '';
  return `<section class="zp-sec${o.band ? ' zp-sec--band' : ''}" data-block="coaches" id="coaches"><div class="zp-in">
    ${head(S.tCoaches, esc(S.hCoaches), { side: arrowBtns(S) })}
    <div class="zp-coaches" style="--cols:${Math.min(5, Math.max(3, gym.coaches.length))}" data-fx-slide>${gym.coaches.map((c, i) => `<article class="zp-coach" data-rise style="--i:${i}">
      ${avatar(c, 'zp-coach__ph')}
      <h3 class="zp-h3">${esc(person(c.name))}</h3>
      <p class="zp-coach__role">${esc(L(c.role))}</p>
    </article>`).join('')}</div>
  </div></section>`;
}

/* Reviews: three short quotes. */
export function reviews(gym, x, o = {}) {
  const { S, L } = x;
  if (!gym.reviews || !gym.reviews.length) return '';
  return `<section class="zp-sec${o.band ? ' zp-sec--band' : ''}" data-block="reviews" id="reviews"><div class="zp-in">
    ${head(S.tReviews, esc(S.hReviews))}
    <div class="zp-quotes">${gym.reviews.slice(0, 3).map((r, i) => `<figure class="zp-quote" data-rise style="--i:${i}"><blockquote>${esc(L(r.q))}</blockquote><figcaption>${esc(person(r.who))}</figcaption></figure>`).join('')}</div>
  </div></section>`;
}

/* First visit: the offer and three steps. As a full-width photo band, or as a photo beside the words. */
export function firstVisit(gym, x, o = {}) {
  const { S, L } = x;
  const pic = gym.photos[o.photo || 0];
  const words = `<div class="zp-first__copy" data-rise>
    <p class="zp-tag">${esc(S.tFirst)}</p>
    <h2 class="zp-h2">${esc(S.hFirst)}</h2>
    <ol class="zp-steps">${S.steps.map((s, i) => `<li><span class="zp-num">${i + 1}</span><span>${esc(s)}</span></li>`).join('')}</ol>
    <div class="zp-btns"><a class="zp-btn" href="#schedule">${esc(S.book)}</a></div>
  </div>`;
  if (o.variant === 'band' && pic) {
    return `<section class="zp-first zp-first--band" data-block="firstVisit" id="first">
      ${photo(pic.src, { cls: 'zp-first__bg', pos: pic.pos })}<div class="zp-scrim zp-scrim--side"></div>
      <div class="zp-first__in">${words}</div>
    </section>`;
  }
  return `<section class="zp-sec zp-first${o.band ? ' zp-sec--band' : ''}" data-block="firstVisit" id="first"><div class="zp-in zp-first__split${pic ? '' : ' is-solo'}">
    ${pic ? `<div data-rise>${photo(pic.src, { cls: 'zp-first__ph', pos: pic.pos })}</div>` : ''}${words}
  </div></section>`;
}

/* Booking bar: pick a class and a day, jump to those times. */
export function bookingBar(gym, x) {
  const { S, L } = x;
  return `<div class="zp-bookbar" data-block="bookingBar"><form class="zp-bookbar__in" data-act="find">
    <label><span class="zp-tag">${esc(S.bbClass)}</span><select name="cls"><option value="">${esc(S.bbAny)}</option>${gym.classes.map(c => `<option value="${c.id}">${esc(L(c.name))}</option>`).join('')}</select></label>
    <label><span class="zp-tag">${esc(S.bbDay)}</span><select name="day">${x.days.map((d, i) => `<option value="${i}"${i === x.day0 ? ' selected' : ''}>${esc(d.label)}, ${esc(d.date)}</option>`).join('')}</select></label>
    <button class="zp-btn" type="submit">${esc(S.bbGo)}</button>
    <p class="zp-bookbar__note">${esc(cap(S.from(x.facts.from)))} · ${esc(L(gym.offer))}</p>
  </form></div>`;
}

/* Footer: where, when and how to reach the gym. */
export function footer(gym, x) {
  const { S, L } = x, p = gym.place;
  return `<footer class="zp-foot" data-block="footer" id="find"><div class="zp-in">
    <div class="zp-foot__grid">
      <div class="zp-foot__brand">${logo(gym)}<p>${esc(x.L(gym.kind))}. ${esc(gym.area)}.</p><a class="zp-btn" href="#schedule">${esc(S.book)}</a></div>
      <div><p class="zp-tag">${esc(S.tFind)}</p><p>${p.addr.map(esc).join('<br>')}</p><p><a class="zp-link" href="#" data-act="noop">${esc(S.maps)}</a></p></div>
      <div><p class="zp-tag">${esc(S.tHours)}</p><p>${p.hours.map(h => esc(glue(L(h)))).join('<br>')}</p></div>
      <div><p class="zp-tag">${esc(S.tContact)}</p><p>${esc(p.phone)}<br>${esc(p.email)}</p><p><button class="zp-link" type="button" data-act="lang">${esc(S.switchTo)}</button></p></div>
    </div>
    <p class="zp-foot__made">${esc(S.made)}</p>
  </div></footer>`;
}

/* The Book button that follows you. Three shapes: a pill with the price, a pill with two actions, a full bar.
   It is not in the recipe's block list: the page adds it when the "follows you" effect is on. */
export function followBook(gym, x, variant = 'pill') {
  const { S, L } = x, f = x.facts;
  const btn = `<a class="zp-btn zp-follow__btn" href="#schedule"><span class="zp-w">${esc(S.book)}</span><span class="zp-n">${esc(S.bookShort)}</span></a>`;
  const inner = variant === 'duo'
    ? `${btn}<a class="zp-follow__alt" href="#prices">${esc(S.nav.prices)} · ${esc(S.from(f.from))}</a>`
    : `<a class="zp-follow__txt" href="#prices"><b>${esc(L(gym.offer))}</b><span>${esc(S.then(f.from))}</span></a>${btn}`;
  return `<div class="zp-follow zp-follow--${variant}" data-fx-book role="complementary" aria-label="${esc(S.book)}">${inner}</div>`;
}

export const BLOCKS = { menuBar, heroFilm, heroSlideshow, heroSplit, heroFramed, heroTiles, offerStrip, statement, classCards, scheduleCards, scheduleList, priceCards, coaches, reviews, firstVisit, bookingBar, footer };

/* names the control panel and the spec use */
export const BLOCK_NAMES = {
  menuBar: { en: 'Menu bar', es: 'Barra de menú' },
  heroFilm: { en: 'Hero: film', es: 'Portada: video' },
  heroSlideshow: { en: 'Hero: slideshow with tabs', es: 'Portada: fotos con pestañas' },
  heroSplit: { en: 'Hero: split with today\'s classes', es: 'Portada: dividida con las clases de hoy' },
  heroFramed: { en: 'Hero: framed photo', es: 'Portada: foto enmarcada' },
  heroTiles: { en: 'Hero: three tiles', es: 'Portada: tres fotos' },
  offerStrip: { en: 'Offer strip', es: 'Franja de oferta' },
  statement: { en: 'Statement and facts', es: 'Frase y datos' },
  classCards: { en: 'Class cards', es: 'Tarjetas de clases' },
  scheduleCards: { en: 'Schedule: cards with coach', es: 'Horario: tarjetas con coach' },
  scheduleList: { en: 'Schedule: plain list', es: 'Horario: lista simple' },
  priceCards: { en: 'Price cards', es: 'Tarjetas de precios' },
  coaches: { en: 'Coaches', es: 'Coaches' },
  reviews: { en: 'Reviews', es: 'Reseñas' },
  firstVisit: { en: 'First visit offer', es: 'Oferta de primera visita' },
  bookingBar: { en: 'Booking bar', es: 'Barra de reserva' },
  footer: { en: 'Footer: location and contact', es: 'Pie: ubicación y contacto' },
  followBook: { en: 'Book button that follows you', es: 'Botón de reservar que te sigue' },
};
export const HEROES = ['heroFilm', 'heroSlideshow', 'heroSplit', 'heroFramed', 'heroTiles'];
export const SCHEDULES = ['scheduleCards', 'scheduleList'];
