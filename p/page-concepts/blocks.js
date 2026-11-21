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
    hSchedule: 'Pick a time', hPrices: 'Simple prices', hCoaches: 'Who you train with', hReviews: 'In their words', hFirst: 'Your first class is free', hFirstPlain: 'Your first visit', hFind: 'Come by',
    steps: ['Pick any class on the schedule.', 'Book it in two taps. No card needed.', 'Show up ten minutes early and say hi.'],
    stepsPlain: ['Pick any class on the schedule.', 'Book it in two taps.', 'Show up ten minutes early and say hi.'],
    tax: name => `Prices include ${name}.`, perMonth: '/ month', from: p => `from ${p}`, free: 'First class free', then: p => `then from ${p}`,
    fClasses: 'classes a week', fCap: 'people per class, at most', fFirst: 'first class of the day', fSingle: 'for a single class', fFrom: 'lowest price',
    newHere: 'New here?', bookIt: 'Book it', noClasses: 'No classes this day.', noMatch: 'None of these this day. Try another day.',
    toast: 'In the real page, booking opens here.', maps: 'Open in Maps', made: 'Page made with Zana. Demo: this gym, its people and their words are invented.',
    switchTo: 'Ver en español', menu: 'Menu', pause: 'Pause video', play: 'Play video', prev: 'Back', nextCard: 'Forward',
    bbClass: 'Class', bbDay: 'Day', bbAny: 'Any class', bbGo: 'See times', showing: 'Showing', clear: 'Show all',
    coachOf: 'Coach',
    taxIn: 'Taxes included', seeAll: n => `See all prices (${n})`, fewer: 'Show fewer prices',
    privacy: 'Privacy Policy', terms: 'Terms', close: 'Close', more: 'More', ownAddr: 'Its own address:',
    phone: 'Phone', out: name => `In the real page, this opens ${name}.`, leaves: 'Leaves this page',
    /* a personal trainer sells sessions, not classes: these replace the words above */
    session: {
      nav: { classes: 'Training', schedule: 'Open times' },
      book: 'Book a session', see: 'See open times', seeTimes: 'See open times', tClasses: 'Training', hClasses: () => 'How we can train',
      tWeek: 'Open times', hSchedule: 'Pick an open time', tReviews: 'Clients say', tFirst: 'First session',
      hFirst: 'Your first session is free', hFirstPlain: 'Your first session',
      steps: ['Pick an open time this week.', 'Book it in two taps. No card needed.', 'Come as you are. We start with a short chat about your goals.'],
      stepsPlain: ['Pick an open time this week.', 'Book it in two taps.', 'Come as you are. We start with a short chat about your goals.'],
      fClasses: 'open times this week', fFirst: 'first session of the day', fSingle: 'for a single session',
      noClasses: 'No open times this day.', bbClass: 'Session', bbAny: 'Any session',
      made: 'Page made with Zana. Demo: this trainer, the clients and their words are invented.',
    },
  },
  es: {
    nav: { classes: 'Clases', schedule: 'Horario', coaches: 'Coaches', prices: 'Precios', find: 'Dónde estamos' },
    book: 'Reserva una clase', bookShort: 'Reservar', see: 'Ver el horario', seePrices: 'Ver precios', buy: 'Comprar', popular: 'Más popular',
    today: 'Hoy', left: n => (n === 1 ? 'Queda 1 lugar' : `Quedan ${n} lugares`), full: 'Llena', wait: 'Lista de espera',
    withCoach: 'con', min: 'min', next: 'Próxima', seeTimes: 'Ver horarios', openFloor: 'Piso abierto',
    tClasses: 'Clases', tWeek: 'Esta semana', tPrices: 'Precios', tCoaches: 'Coaches', tReviews: 'Lo que dicen', tFirst: 'Primera visita', tAbout: 'Sobre', tFind: 'Dónde estamos', tHours: 'Horario', tContact: 'Contacto',
    hClasses: n => `${['', 'Una forma', 'Dos formas', 'Tres formas', 'Cuatro formas', 'Cinco formas', 'Seis formas'][n] || n + ' formas'} de entrenar`,
    hSchedule: 'Elige una hora', hPrices: 'Precios claros', hCoaches: 'Con quién entrenas', hReviews: 'En sus palabras', hFirst: 'Tu primera clase es gratis', hFirstPlain: 'Tu primera visita', hFind: 'Pasa por aquí',
    steps: ['Elige cualquier clase del horario.', 'Resérvala en dos toques. Sin tarjeta.', 'Llega diez minutos antes y saluda.'],
    stepsPlain: ['Elige cualquier clase del horario.', 'Resérvala en dos toques.', 'Llega diez minutos antes y saluda.'],
    tax: name => `Los precios incluyen ${name}.`, perMonth: '/ mes', from: p => `desde ${p}`, free: 'Primera clase gratis', then: p => `luego desde ${p}`,
    fClasses: 'clases por semana', fCap: 'personas por clase, como máximo', fFirst: 'primera clase del día', fSingle: 'por una clase suelta', fFrom: 'precio más bajo',
    newHere: '¿Primera vez?', bookIt: 'Resérvala', noClasses: 'No hay clases este día.', noMatch: 'No hay de estas este día. Prueba otro día.',
    toast: 'En la página real, aquí abre la reserva.', maps: 'Abrir en Mapas', made: 'Página hecha con Zana. Demo: este gimnasio, su gente y sus palabras son inventados.',
    switchTo: 'View in English', menu: 'Menú', pause: 'Pausar video', play: 'Reproducir video', prev: 'Atrás', nextCard: 'Adelante',
    bbClass: 'Clase', bbDay: 'Día', bbAny: 'Cualquier clase', bbGo: 'Ver horarios', showing: 'Mostrando', clear: 'Ver todas',
    coachOf: 'Coach',
    taxIn: 'Impuestos incluidos', seeAll: n => `Ver todos los precios (${n})`, fewer: 'Ver menos precios',
    privacy: 'Política de privacidad', terms: 'Términos', close: 'Cerrar', more: 'Más', ownAddr: 'Su propia dirección:',
    phone: 'Teléfono', out: name => `En la página real, aquí abre ${name}.`, leaves: 'Sale de esta página',
    session: {
      nav: { classes: 'Entrenamiento', schedule: 'Horas libres' },
      book: 'Reserva una sesión', see: 'Ver horas libres', seeTimes: 'Ver horas libres', tClasses: 'Entrenamiento', hClasses: () => 'Cómo podemos entrenar',
      tWeek: 'Horas libres', hSchedule: 'Elige una hora libre', tReviews: 'Lo que dicen', tFirst: 'Primera sesión',
      hFirst: 'Tu primera sesión es gratis', hFirstPlain: 'Tu primera sesión',
      steps: ['Elige una hora libre esta semana.', 'Resérvala en dos toques. Sin tarjeta.', 'Ven como estés. Empezamos con una charla corta sobre tus metas.'],
      stepsPlain: ['Elige una hora libre esta semana.', 'Resérvala en dos toques.', 'Ven como estés. Empezamos con una charla corta sobre tus metas.'],
      fClasses: 'horas libres esta semana', fFirst: 'primera sesión del día', fSingle: 'por una sesión suelta',
      noClasses: 'No hay horas libres este día.', bbClass: 'Sesión', bbAny: 'Cualquier sesión',
      made: 'Página hecha con Zana. Demo: esta persona, sus clientes y sus palabras son inventados.',
    },
  },
};

/* ---------- words Zana writes from the data. The owner types none of this. ----------
   Four voices. Each has a headline (with and without a changing word), a line under it, and a short pitch. */
/* A sentence is built from parts. A part whose fact is missing is left out, so the page never says "0 classes" or "from $Infinity",
   and never promises a free class the business does not offer. These words are a first draft: in the product the owner can edit them. */
const say = (...parts) => parts.filter(Boolean).join(' ');
/* a trainer's headline: what they do, then where or with whom. Neither is needed: the first line stands alone. */
const soloHead = (a, b) => (b ? [esc(a), esc(b + '.')] : [esc(a + '.')]);
const COPY = {
  roof: {
    head: {
      en: (n, g, x) => [x.fx.word ? x.slot(n.map(w => cap(w) + '.')) : esc(cap(list(n.slice(0, 3).map(low), 'and')) + '.'), esc(g.hood ? `Under one roof in ${g.hood}.` : 'Under one roof.')],
      es: (n, g, x) => [x.fx.word ? x.slot(n.map(w => cap(w) + '.')) : esc(cap(list(n.slice(0, 3).map(low), 'y')) + '.'), esc(g.hood ? `Bajo un mismo techo en ${g.hood}.` : 'Bajo un mismo techo.')],
    },
    lead: {
      en: f => say(f.n && `${f.n} ${f.coached ? 'coached ' : ''}classes a week${f.cap > 1 ? `, never more than ${f.cap} people in the room` : ''}.`, f.free && 'Your first one is free.'),
      es: f => say(f.n && `${f.n} clases ${f.coached ? 'con coach ' : ''}cada semana${f.cap > 1 ? `, nunca más de ${f.cap} personas en el salón` : ''}.`, f.free && 'La primera es gratis.'),
    },
    stmt: {
      en: f => say(f.n && f.ways && `${f.ways} to train, ${f.n} classes a week${f.member ? ', one membership' : ''}.`, f.small && f.coached && 'Groups stay small, so your coach knows your name and your numbers.', f.free && 'Come once for free and decide after.'),
      es: f => say(f.n && f.ways && `${f.ways} de entrenar, ${f.n} clases por semana${f.member ? ', una sola membresía' : ''}.`, f.small && f.coached && 'Los grupos son pequeños, así tu coach conoce tu nombre y tus números.', f.free && 'Ven una vez gratis y decide después.'),
    },
  },
  next: {
    head: {
      en: (n, g, x) => (x.fx.word ? [esc('Book a spot in'), x.slot(n.map(w => cap(w) + '.'))] : [esc(`${x.facts.n} classes this week.`), esc('Book yours in two taps.')]),
      es: (n, g, x) => (x.fx.word ? [esc('Reserva tu lugar en'), x.slot(n.map(w => cap(w) + '.'))] : [esc(`${x.facts.n} clases esta semana.`), esc('Reserva la tuya en dos toques.')]),
    },
    lead: {
      en: f => say(f.n && (f.small && f.coached ? 'Small groups, real coaches and a time that fits your day.' : 'Pick a time that fits your day.'), f.free && 'Your first class is free.'),
      es: f => say(f.n && (f.small && f.coached ? 'Grupos pequeños, coaches de verdad y una hora que cabe en tu día.' : 'Elige una hora que quepa en tu día.'), f.free && 'Tu primera clase es gratis.'),
    },
    stmt: {
      en: f => say(f.n && `Pick a class, book it in two taps and show up. ${f.n} classes every week${f.team > 1 ? ` with ${f.coaches} coaches who know your name` : ''}.`, f.free && 'Your first one is on us.'),
      es: f => say(f.n && `Elige una clase, resérvala en dos toques y llega. ${f.n} clases cada semana${f.team > 1 ? ` con ${f.coaches} coaches que saben tu nombre` : ''}.`, f.free && 'La primera va por nosotros.'),
    },
  },
  pace: {
    head: {
      en: (n, g, x) => [x.fx.word ? x.slot(n.map(w => cap(w) + ',')) : esc(cap(list(x.shorts.slice(0, 2).map(low), 'and')) + ','), '<em>at your own pace.</em>'],
      es: (n, g, x) => [x.fx.word ? x.slot(n.map(w => cap(w) + ',')) : esc(cap(list(x.shorts.slice(0, 2).map(low), 'y')) + ','), '<em>a tu propio ritmo.</em>'],
    },
    lead: {
      en: (f, g) => say(f.n && `${f.small ? 'Small classes' : 'Classes'}${g.hood ? ` in ${g.hood}` : ''}${f.levels ? ', for every level' : ''}.`, f.free && 'Come once for free and see how it feels.'),
      es: (f, g) => say(f.n && `${f.small ? 'Clases pequeñas' : 'Clases'}${g.hood ? ` en ${g.hood}` : ''}${f.levels ? ', para todos los niveles' : ''}.`, f.free && 'Ven una vez gratis y mira cómo se siente.'),
    },
    stmt: {
      en: f => say(f.small && 'A quiet room, a small group and a teacher who sees you.', f.n && `${f.n} classes a week${f.levels ? ', from first-timers to daily practice' : ''}.`, f.free && 'Your first class is free.'),
      es: f => say(f.small && 'Un salón tranquilo, un grupo pequeño y alguien que te guía de cerca.', f.n && `${f.n} clases por semana${f.levels ? ', para quien empieza y para quien practica a diario' : ''}.`, f.free && 'Tu primera clase es gratis.'),
    },
  },
  lines: {
    head: {
      en: (n, g, x) => (x.fx.word ? [x.slot(n.map(w => cap(w) + '.')), g.hood && esc(`In ${g.hood}.`)].filter(Boolean) : n.slice(0, 3).map(w => esc(cap(w) + '.'))),
      es: (n, g, x) => (x.fx.word ? [x.slot(n.map(w => cap(w) + '.')), g.hood && esc(`En ${g.hood}.`)].filter(Boolean) : n.slice(0, 3).map(w => esc(cap(w) + '.'))),
    },
    lead: {
      en: f => say(f.n && `${f.n} classes a week.`, f.cap > 1 && `${f.cap} people at most.`, f.free && 'Your first one is free.'),
      es: f => say(f.n && `${f.n} clases por semana.`, f.cap > 1 && `Máximo ${f.cap} personas.`, f.free && 'La primera es gratis.'),
    },
    stmt: {
      en: f => say(f.n && `Show up, work, go home. ${f.n} classes a week${f.cap > 1 ? `, ${f.cap} people at most` : ''}${f.coached ? ' and a coach on every round' : ''}.`, f.free && 'Your first class is free.'),
      es: f => say(f.n && `Llega, trabaja y vete a casa. ${f.n} clases por semana${f.cap > 1 ? `, máximo ${f.cap} personas` : ''}${f.coached ? ' y un coach en cada ronda' : ''}.`, f.free && 'Tu primera clase es gratis.'),
    },
  },
  /* one person who trains people one at a time: no classes, no room size, prices up front */
  solo: {
    head: {
      en: (n, g, x) => soloHead(x.facts.cap > 2 ? 'Personal training' : 'One-on-one training', g.hood ? `in ${g.hood}` : g.owner ? `with ${g.owner}` : ''),
      es: (n, g, x) => soloHead(x.facts.cap > 2 ? 'Entrenamiento personal' : 'Entrenamiento uno a uno', g.hood ? `en ${g.hood}` : g.owner ? `con ${g.owner}` : ''),
    },
    lead: {
      en: f => say(f.from && `Sessions from ${f.from}.`, f.free && 'Your first one is free.', f.n > 1 && `${f.n} open times this week.`),
      es: f => say(f.from && `Sesiones desde ${f.from}.`, f.free && 'La primera es gratis.', f.n > 1 && `${f.n} horas libres esta semana.`),
    },
    stmt: {
      en: (f, g) => say(g.owner && `I am ${g.owner}.`, (f.n || f.from) && `I train ${f.cap > 2 ? `one person or a group of up to ${f.cap}` : f.cap === 2 ? 'one person or a pair' : 'one person'} at a time${g.hood ? ` in ${g.hood}` : ''}.`, (f.n || f.from) && 'Every session is planned for you and changes as you get stronger.', f.free && 'The first session is free, so we can both see if it is a good fit.'),
      es: (f, g) => say(g.owner && `Soy ${g.owner}.`, (f.n || f.from) && `Entreno a ${f.cap > 2 ? `una persona o a un grupo de hasta ${f.cap}` : f.cap === 2 ? 'una persona o a una pareja' : 'una persona'} a la vez${g.hood ? ` en ${g.hood}` : ''}.`, (f.n || f.from) && 'Cada sesión se planifica para ti y cambia a medida que avanzas.', f.free && 'La primera sesión es gratis, para ver si nos entendemos.'),
    },
  },
};
export const VOICES = Object.keys(COPY);

/* ---------- small pieces the blocks share ---------- */
/* The logo. With no image, the mark and the name are set in the heading typeface.
   An uploaded image shows as it is, or (one color) painted in the text color: the image is used as a stencil, so it shows on any background. */
export const logo = (gym, href = '#top') => {
  const l = gym.logo;
  const pic = !l.src ? `${l.mark ? `<svg viewBox="0 0 32 32" aria-hidden="true">${l.mark}</svg>` : ''}<span class="zp-logo__w">${esc(l.word || gym.name)}</span>`
    : l.mono ? `<span class="zp-logo__pic zp-logo__pic--mono" style="--logo:url('${esc(l.src)}');aspect-ratio:${+l.ratio || 3}"></span>`
    : `<img class="zp-logo__pic" src="${esc(l.src)}" alt="">`;
  return `<a class="zp-logo" href="${href}" aria-label="${esc(gym.name)}">${pic}</a>`;
};
const oneLang = gym => !!gym.langs && gym.langs.length < 2;   // the business is set up in one language, so there is nothing to switch to
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

/* The drafted headline names the classes. With no classes, or with names too long to set in headline type,
   it falls back to the business name and what it is. */
function headline(gym, x) {
  const c = COPY[x.voice] || COPY.roof;
  const used = x.fx.word ? x.names : x.names.slice(0, 3);
  const fits = x.voice === 'solo' ? !!(x.facts.n || x.facts.from) : used.length > 0 && x.facts.n > 0 && used.every(w => w.length <= 18);   // a neighborhood is not needed: each voice leaves it out when the business has none
  const where = [x.L(gym.kind), gym.hood].filter(Boolean).join(x.lang === 'es' ? ' en ' : ' in ');
  const lines = fits ? c.head[x.lang](x.names, gym, x) : [esc(gym.name + '.'), where && esc(where + '.')].filter(Boolean);
  return lines.map(l => `<span class="zp-line">${l}</span>`).join(' ');
}
const leadLine = (gym, x) => (COPY[x.voice] || COPY.roof).lead[x.lang](x.facts, gym, x);

function heroCopy(gym, x) {
  const { S } = x, lead = leadLine(gym, x);
  const prices = { href: '#prices', label: S.seePrices };
  /* a page that leads with prices puts that button first. A button is only there when it leads somewhere. */
  const one = gym.lead === 'prices' && x.hasPrices ? prices : x.cta;
  const two = !one ? null : one.href !== '#prices' && x.hasPrices ? prices : one.href === '#prices' && x.hasSched ? { href: '#schedule', label: S.book } : null;
  const tag = [gym.area, x.L(gym.kind)].filter(Boolean).join(' · ');
  return `<div class="zp-hero__copy">
    ${tag ? `<p class="zp-tag">${esc(tag)}</p>` : ''}
    <h1 class="zp-h1">${headline(gym, x)}</h1>
    ${lead ? `<p class="zp-lead">${esc(lead)}</p>` : ''}
    ${x.pillAlways || !one ? '' : `<div class="zp-btns" data-follow-start>
      <a class="zp-btn" href="${one.href}">${esc(one.label)}</a>
      ${two ? `<a class="zp-btn zp-btn--ghost" href="${two.href}">${esc(two.label)}</a>` : ''}
    </div>`}
  </div>`;
}

function sessionBits(s, x) {
  const { S, L } = x;
  const cls = x.classById[s.cls], co = s.coach ? x.coachById[s.coach] : null;
  const fullUp = s.left === 0;
  return {
    cls, co, fullUp, t: x.time(s.time),
    open: !co && !x.solo && !!cls.open,              // the business marks this class as open floor: no coach on purpose
    who: co ? `${S.withCoach} ${person(co.name)}` : !x.solo && cls.open ? S.openFloor : '',   // a row with no coach says nothing about one
    spots: fullUp ? S.full : s.left == null || x.solo ? '' : S.left(s.left),   // no size set, or a one-person hour: nothing to say about spots
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
      ${links ? `<nav class="zp-nav" aria-label="${esc(S.menu)}">${links}</nav>` : ''}
      <div class="zp-bar__end">
        ${oneLang(gym) ? '' : `<button class="zp-lang" type="button" data-act="lang" aria-label="${esc(S.switchTo)}">${x.lang === 'en' ? 'ES' : 'EN'}</button>`}
        ${x.cta ? `<a class="zp-btn zp-btn--sm zp-bar__book" href="${x.cta.href}"><span class="zp-w">${esc(x.cta.label)}</span><span class="zp-n">${esc(x.cta.short)}</span></a>` : ''}
        ${links ? `<button class="zp-menu" type="button" data-act="menu" aria-expanded="false" aria-label="${esc(S.menu)}"><i></i></button>` : ''}
      </div>
    </div>
    <div class="zp-drawer">${links}${x.cta ? `<a class="zp-btn zp-btn--block" href="${x.cta.href}">${esc(x.cta.label)}</a>` : ''}</div></div>
  </header>`;
}

/* Hero 1: film. A silent loop behind the headline. The still photo shows first; the video only loads when the "moving hero" effect is on.
   With no video it is one photo edge to edge. slides: true makes it a slow slideshow of the gym's wide photos instead. */
export function heroFilm(gym, x, o = {}) {
  const pics = wide(gym), still = pics[0] || gym.photos[0];
  const slides = o.slides && pics.length > 1 ? pics.slice(0, 4) : null;
  const v = slides ? null : gym.video;
  if (!v && !still) return heroSplit(gym, x, { side: 'today' });
  const media = slides ? slideStack(slides) : v
    ? `<picture><source media="(max-width:699px)" srcset="${v.posterTall}"><img class="zp-img" src="${v.posterWide}" alt="" fetchpriority="high"></picture>
       <video class="zp-img" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-wide="${v.wide}" data-tall="${v.tall}"></video>`
    : `<img class="zp-img" src="${still.src}" alt="" fetchpriority="high"${still.pos ? ` style="object-position:${still.pos}"` : ''}>`;
  return `<section class="zp-hero zp-hero--full" data-block="heroFilm" id="top">
    <div class="zp-hero__media"${slides ? ' data-fx-hero="slides"' : v ? ' data-fx-hero="video"' : ''}>${media}</div>
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
  let side = '', board = false;
  const pic = gym.photos[0], d = x.days.find(day => day.sessions.length);
  if ((o.side === 'photo' || !d) && pic) side = photo(pic.src, { cls: 'zp-split__ph', pos: pic.pos, eager: true });
  else if (d && o.side === 'board') {
    /* the board: the day's next classes set like a station timetable. The times are the biggest type on the page. */
    board = true;
    side = `<div class="zp-board">
      <div class="zp-board__head"><p class="zp-tag">${esc(d.label)} · ${esc(d.date)}</p>${x.hasSched ? `<a class="zp-link" href="#schedule">${esc(S.see)}</a>` : ''}</div>
      ${d.sessions.slice(0, 3).map(s => { const b = sessionBits(s, x); return `<article class="zp-board__row${b.fullUp ? ' is-full' : ''}">
        <p class="zp-board__time zp-num">${clock(b.t)}</p>
        <div class="zp-board__main"><p class="zp-board__name">${esc(b.name)}</p><p class="zp-board__meta">${esc([b.who || (b.cls.mins && `${b.cls.mins} ${S.min}`), b.spots].filter(Boolean).join(' · '))}</p></div>
        ${b.btn}
      </article>`; }).join('')}
    </div>`;
  } else if (d) {
    side = `<div class="zp-today">
      <div class="zp-today__head"><p class="zp-tag">${esc(d.label)} · ${esc(d.date)}</p>${x.hasSched ? `<a class="zp-link" href="#schedule">${esc(S.see)}</a>` : ''}</div>
      ${d.sessions.slice(0, 3).map(s => { const b = sessionBits(s, x); return `<article class="zp-mini">
        ${avatar(b.co)}
        <div class="zp-mini__main"><p class="zp-mini__time zp-num">${clock(b.t)}</p><p class="zp-mini__name">${esc(b.name)}</p><p class="zp-mini__meta">${esc([b.who || (b.cls.mins && `${b.cls.mins} ${S.min}`), b.spots].filter(Boolean).join(' · '))}</p></div>
        ${b.btn}
      </article>`; }).join('')}
    </div>`;
  }
  return `<section class="zp-hero zp-hero--split" data-block="heroSplit" id="top">
    <div class="zp-hero__in zp-split${side ? '' : ' is-alone'}${board ? ' zp-split--board' : ''}">${heroCopy(gym, x)}${side ? `<div class="zp-split__side">${side}</div>` : ''}</div>
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
      <div class="zp-framed__ph"><div class="zp-ph" data-fx-hero="slides">${slideStack(pics)}</div>${x.L(gym.offer) ? `<span class="zp-chip zp-framed__offer">${esc(x.L(gym.offer))}</span>` : ''}</div>
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
      <div class="zp-tiles__grid" style="--n:${pics.length}" data-fx-hero="tiles">${pics.map((p, i) => `<figure class="zp-tile"><div class="zp-ph"><img class="zp-img" src="${p.src}" alt=""${pos(p)} fetchpriority="high">${alts[i] ? `<img class="zp-img zp-tile__alt" data-src="${alts[i].src}" alt=""${pos(alts[i])}>` : ''}</div>${i === 1 && x.L(gym.offer) ? `<figcaption class="zp-tile__badge"><span class="zp-chip">${esc(x.L(gym.offer))}</span></figcaption>` : ''}</figure>`).join('')}</div>
    </div>
  </section>`;
}

/* Offer strip. Thin: one line with the offer. Loud: class names in headline type. The "moving text strip" effect sets it rolling. */
export function offerStrip(gym, x, o = {}) {
  const { S, L } = x, f = x.facts;
  const loud = o.variant === 'loud', offer = L(gym.offer);
  if (loud ? !x.names.length : !offer) return '';   // nothing to say, so no strip
  let still, seq;
  if (loud) {
    const words = [...x.names, offer].filter(Boolean);
    seq = words.map((w, i) => `<span class="${i % 2 ? 'o' : ''}">${esc(w)}</span><span class="zp-strip__x" aria-hidden="true">/</span>`).join('');
    still = x.names.slice(0, 3).map((w, i) => `<span class="${i % 2 ? 'o' : ''}">${esc(w)}</span>`).join('<span class="zp-strip__x" aria-hidden="true">/</span>');
  } else {
    const bits = [offer, f.n && `${f.n} ${S.fClasses}`, f.from && cap(S.from(f.from)), gym.area].filter(Boolean);
    seq = bits.map(t => `<span>${esc(t)}</span><span class="zp-strip__x" aria-hidden="true">·</span>`).join('');
    still = `<span>${esc(S.newHere)} ${esc(offer)}.</span>${x.cta ? ` <a class="zp-link" href="${x.cta.href}">${esc(x.hasSched ? S.bookIt : x.cta.label)}</a>` : ''}`;
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
  const text = (COPY[x.voice] || COPY.roof).stmt[x.lang](f, gym, x);
  /* only the facts that could be counted. A one-person hour has no "people per class". */
  const facts = [[f.n, S.fClasses], [!x.solo && f.cap > 1 && f.cap, S.fCap], [f.first, S.fFirst], [f.from, f.single ? S.fSingle : S.fFrom]].filter(([v]) => v);
  if (!text && !facts.length) return '';
  return `<section class="zp-sec zp-stmt" data-block="statement" id="about"><div class="zp-in">
    <p class="zp-tag" data-rise>${esc(S.tAbout)} ${esc(gym.name)}</p>
    ${text ? `<p class="zp-stmt__text" data-fx-lightup data-rise>${esc(text)}</p>` : ''}
    ${facts.length ? `<dl class="zp-facts">${facts.map(([v, l], i) => `<div class="zp-fact" data-rise style="--i:${i}"><dd class="zp-num">${esc(v)}</dd><dt class="zp-tag">${esc(l)}</dt></div>`).join('')}</dl>` : ''}
  </div></section>`;
}

/* Class cards. With photos, or plain and numbered when there are none.
   "Sliding card row" turns the grid into a swipe row. "Pinned section" holds one photo still while the classes scroll past it. */
export function classCards(gym, x, o = {}) {
  const { S, L } = x;
  const cs = gym.classes; if (!cs.length) return '';
  const withPhotos = o.variant !== 'plain' && cs.every(c => c.photo);
  const pinned = x.fx.pin && o.pin !== false && cs.every(c => c.photo);
  const meta = c => [c.mins && `${c.mins} ${S.min}`, L(c.level)].filter(Boolean).join(' · ');
  const n = cs.length, cols = n <= 4 ? n : n % 4 === 0 || n % 4 === 3 ? 4 : 3;
  const next = c => (x.hasSched && x.nextOf[c.id] ? `<p class="zp-next"><span>${esc(S.next)}: ${esc(x.nextOf[c.id])}</span><a class="zp-link" href="#schedule" data-pick="${c.id}">${esc(S.seeTimes)}</a></p>` : '');
  let body;
  if (pinned) {
    body = `<div class="zp-pin" data-fx-pin>
      <div class="zp-pin__media"><div class="zp-pin__frame">${cs.map((c, i) => photo(c.photo, { cls: i ? '' : 'is-on', pos: c.pos, alt: L(c.name) })).join('')}</div></div>
      <div class="zp-pin__list">${cs.map((c, i) => `<article class="zp-pin__item${i ? '' : ' is-on'}" data-i="${i}">
        ${photo(c.photo, { cls: 'zp-pin__inline', pos: c.pos, alt: L(c.name) })}
        <p class="zp-tag">${pad2(i + 1)} / ${pad2(cs.length)} · ${esc(meta(c))}</p>
        <h3 class="zp-h2">${esc(L(c.name))}</h3>
        ${L(c.blurb) ? `<p>${esc(L(c.blurb))}</p>` : ''}
        ${next(c)}
      </article>`).join('')}</div>
    </div>`;
  } else {
    body = `<div class="zp-cards${withPhotos ? '' : ' zp-cards--plain'}${n === 1 ? ' is-one' : ''}" style="--cols:${cols}"${o.slide !== false ? ' data-fx-slide' : ''}>${cs.map((c, i) => `<article class="zp-class" data-rise style="--i:${i}">
      ${withPhotos ? photo(c.photo, { cls: 'zp-class__ph', pos: c.pos, alt: L(c.name) }) : ''}
      <div class="zp-class__body">
        <p class="zp-tag">${withPhotos ? '' : pad2(i + 1) + ' · '}${esc(meta(c))}</p>
        <h3 class="zp-h3">${esc(L(c.name))}</h3>
        ${L(c.blurb) ? `<p>${esc(L(c.blurb))}</p>` : ''}
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
  if (!x.hasSched) return '';   // no classes on the calendar, so no schedule section and no link to one
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
    <p class="zp-sess__meta">${esc([b.cls.mins && `${b.cls.mins} ${S.min}`, b.who].filter(Boolean).join(' · '))}</p>
    <div class="zp-sess__foot"><span class="zp-spots">${esc(b.spots)}</span>${b.btn}</div>
  </article>`; }, 'zp-sessgrid');
}

/* Schedule as a plain list: one line per class. */
export function scheduleList(gym, x, o = {}) {
  const { S } = x;
  return scheduleShell(gym, x, o, 'scheduleList', s => { const b = sessionBits(s, x); return `<article class="zp-row${b.fullUp ? ' is-full' : ''}" data-cls="${s.cls}">
    <p class="zp-row__time zp-num">${clock(b.t)}</p>
    <p class="zp-row__name">${esc(b.name)}${b.cls.mins ? ` <span>${b.cls.mins} ${esc(S.min)}</span>` : ''}</p>
    <p class="zp-row__who">${b.co || b.open ? `${avatar(b.co)}<span>${esc(b.co ? person(b.co.name) : S.openFloor)}</span>` : ''}</p>
    <p class="zp-row__spots">${esc(b.spots)}</p>
    ${b.btn}
  </article>`; }, `zp-rows${o.big ? ' zp-rows--big' : ''}${x.solo ? ' zp-rows--solo' : ''}`);
}

/* Price cards: name, price in the brand color, one line, the "what you get" ticks, a full-width Buy button
   pinned to the bottom so the buttons line up, and the owner's own label in a small corner tab ("Most popular", "New").
   The owner picks which products are featured (onPage). The rest wait behind "See all", in the same grid. */
export function priceCards(gym, x, o = {}) {
  const { S, L } = x;
  if (!gym.prices || !gym.prices.length) return '';
  const feat = gym.prices.filter(p => p.onPage !== false), rest = gym.prices.filter(p => p.onPage === false);
  const shown = feat.length ? feat : gym.prices, more = feat.length ? rest : [];
  const n = shown.length, tax = gym.tax && gym.tax.included;
  const tabOf = p => (L(p.label) || (p.featured ? S.popular : ''));
  const card = (p, i, hide) => `<article class="zp-plan${tabOf(p) ? ' is-feat' : ''}"${hide ? ' data-more hidden' : ' data-rise'} style="--i:${i}">
      ${tabOf(p) ? `<span class="zp-plan__tab">${esc(tabOf(p))}</span>` : ''}
      <h3 class="zp-h3 zp-plan__name">${esc(L(p.name))}</h3>
      <p class="zp-plan__price">${esc(x.money(p.price))}${p.monthly ? ` <small>${esc(S.perMonth)}</small>` : ''}</p>
      ${tax ? `<p class="zp-plan__tax">(${esc(S.taxIn)})</p>` : ''}
      ${L(p.line) ? `<p class="zp-plan__line">${esc(L(p.line))}</p>` : ''}
      ${(p.ticks || []).length ? `<ul class="zp-ticks">${p.ticks.map(t => `<li>${TICK}<span>${esc(L(t))}</span></li>`).join('')}</ul>` : ''}
      <a class="zp-btn zp-btn--block" href="#" data-act="reserve">${esc(S.buy)}</a>
    </article>`;
  return `<section class="zp-sec${o.band ? ' zp-sec--band' : ''}" data-block="priceCards" id="prices"><div class="zp-in">
    ${head(S.tPrices, esc(S.hPrices))}
    <div class="zp-plans${n === 1 ? ' is-one' : ''}" style="--cols:${n === 4 ? 2 : Math.min(3, n)}">${shown.map((p, i) => card(p, i)).join('')}${more.map((p, i) => card(p, n + i, true)).join('')}</div>
    ${more.length ? `<p class="zp-plans__more"><button type="button" class="zp-btn zp-btn--ghost" data-act="allprices" aria-expanded="false" data-all="${esc(S.seeAll(gym.prices.length))}" data-few="${esc(S.fewer)}">${esc(S.seeAll(gym.prices.length))}</button></p>` : ''}
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
      ${L(c.role) ? `<p class="zp-coach__role">${esc(L(c.role))}</p>` : ''}
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
  if (!x.hasSched) return '';   // the steps start at the schedule, so with no schedule there is nothing to explain
  const pic = gym.photos[o.photo || 0], free = x.facts.free;   // no photo at that spot: the steps stand alone instead of repeating the cover
  const words = `<div class="zp-first__copy" data-rise>
    <p class="zp-tag">${esc(S.tFirst)}</p>
    <h2 class="zp-h2">${esc(free ? S.hFirst : S.hFirstPlain)}</h2>
    <ol class="zp-steps">${(x.facts.noCard ? S.steps : S.stepsPlain).map((s, i) => `<li><span class="zp-num">${i + 1}</span><span>${esc(s)}</span></li>`).join('')}</ol>
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
  if (!x.hasSched) return '';
  const note = [x.facts.from && cap(S.from(x.facts.from)), L(gym.offer)].filter(Boolean).join(' · ');
  return `<div class="zp-bookbar" data-block="bookingBar"><form class="zp-bookbar__in" data-act="find">
    <label><span class="zp-tag">${esc(S.bbClass)}</span><select name="cls"><option value="">${esc(S.bbAny)}</option>${gym.classes.map(c => `<option value="${c.id}">${esc(L(c.name))}</option>`).join('')}</select></label>
    <label><span class="zp-tag">${esc(S.bbDay)}</span><select name="day">${x.days.map((d, i) => `<option value="${i}"${i === x.day0 ? ' selected' : ''}>${esc(d.label)}, ${esc(d.date)}</option>`).join('')}</select></label>
    <button class="zp-btn" type="submit">${esc(S.bbGo)}</button>
    ${note ? `<p class="zp-bookbar__note">${esc(note)}</p>` : ''}
  </form></div>`;
}

/* Contact details. WhatsApp, Instagram, TikTok and phone are business details the owner fills in from the customizer.
   Each one shows only when it is filled in, in the footer and on the links list. */
export const CONTACTS = ['whatsapp', 'instagram', 'tiktok', 'phone'];
export function contactOf(gym, k, S) {
  const v = String((gym.place || {})[k] || '').trim(); if (!v) return null;
  const handle = v.replace(/^@/, ''), digits = v.replace(/\D/g, '');
  return {
    whatsapp: { name: 'WhatsApp', shown: v, href: `https://wa.me/1${digits}` },
    instagram: { name: 'Instagram', shown: '@' + handle, href: `https://www.instagram.com/${handle}/` },
    tiktok: { name: 'TikTok', shown: '@' + handle, href: `https://www.tiktok.com/@${handle}` },
    phone: { name: S.phone, shown: v, href: `tel:+1${digits}` },
  }[k];
}
/* every outside link in the demo says where it would go instead of leaving */
const outLink = (c, label, cls = 'zp-link') => `<a class="${cls}" href="${esc(c.href)}" data-act="out" data-name="${esc(c.name)}">${label}</a>`;

/* Privacy Policy and Terms: footer links that open a panel. The text comes from the business's legal documents in Zana.
   They are never printed on the page itself. */
export function legalSheet(gym, x) {
  const docs = gym.legal ? ['privacy', 'terms'].filter(k => gym.legal[k]) : [];
  if (!docs.length) return '';
  return `<div class="zp-sheet" data-sheet hidden><div class="zp-sheet__scrim" data-act="sheetclose"></div>
    ${docs.map(k => { const d = gym.legal[k]; return `<article class="zp-sheet__box" role="dialog" aria-modal="true" aria-labelledby="zp-doc-${k}" data-doc="${k}" hidden>
      <div class="zp-sheet__head"><div><h2 class="zp-h3" id="zp-doc-${k}">${esc(x.L(d.title))}</h2>${d.updated ? `<p class="zp-tag">${esc(x.L(d.updated))}</p>` : ''}</div><button type="button" class="zp-sheet__x" data-act="sheetclose" aria-label="${esc(x.S.close)}">×</button></div>
      <div class="zp-sheet__body">${(d.body || []).map(p => `<p>${esc(x.L(p))}</p>`).join('')}
      ${gym.slug ? `<p class="zp-sheet__addr">${esc(x.S.ownAddr)} ${esc(gym.slug)}.zana.fit/${k}</p>` : ''}</div>
    </article>`; }).join('')}
  </div>`;
}
/* the small links at the very bottom: content pages, then Privacy Policy and Terms */
export function footLinks(gym, x) {
  const { S } = x;
  const pages = (gym.pages || []).filter(p => p.footer !== false && p.title);
  const docs = gym.legal ? ['privacy', 'terms'].filter(k => gym.legal[k]) : [];
  const bits = [
    ...pages.map(p => `<a href="content.html?p=${esc(p.slug)}" data-act="go" data-v="page:${esc(p.slug)}">${esc(p.title)}</a>`),
    ...docs.map(k => `<button type="button" data-act="legal" data-v="${k}">${esc(k === 'privacy' ? S.privacy : S.terms)}</button>`),
  ];
  return bits.length ? `<nav class="zp-foot__links" aria-label="${esc(S.more)}">${bits.join('')}</nav>` : '';
}

/* Footer: where, when and how to reach the business. */
export function footer(gym, x) {
  const { S, L } = x, p = gym.place;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.addr.join(', '))}`;
  const reach = CONTACTS.map(k => contactOf(gym, k, S)).filter(Boolean);
  const contact = reach.length || p.email || !oneLang(gym);
  return `<footer class="zp-foot" data-block="footer" id="find"><div class="zp-in">
    <div class="zp-foot__grid">
      <div class="zp-foot__brand">${logo(gym)}${L(gym.line) ? `<p>${esc(L(gym.line))}</p>` : x.L(gym.kind) || gym.area ? `<p>${[x.L(gym.kind), gym.area].filter(Boolean).map(t => esc(t) + '.').join(' ')}</p>` : ''}${x.cta && x.cta.href !== '#find' ? `<a class="zp-btn" href="${x.cta.href}">${esc(x.cta.label)}</a>` : ''}</div>
      ${p.addr.length ? `<div><p class="zp-tag">${esc(S.tFind)}</p><p>${p.addr.map(esc).join('<br>')}</p>${L(p.note) ? `<p class="zp-foot__note">${esc(L(p.note))}</p>` : ''}<p>${outLink({ href: mapsHref, name: 'Maps' }, esc(S.maps))}</p></div>` : ''}
      ${p.hours.length ? `<div><p class="zp-tag">${esc(S.tHours)}</p><p>${p.hours.map(h => esc(glue(L(h)))).join('<br>')}</p></div>` : ''}
      ${contact ? `<div><p class="zp-tag">${esc(S.tContact)}</p>${reach.length || p.email ? `<ul class="zp-foot__reach">${reach.map(c => `<li><span>${esc(c.name)}</span>${outLink(c, esc(c.shown))}</li>`).join('')}${p.email ? `<li><span>Email</span>${esc(p.email)}</li>` : ''}</ul>` : ''}${oneLang(gym) ? '' : `<p><button class="zp-link" type="button" data-act="lang">${esc(S.switchTo)}</button></p>`}</div>` : ''}
    </div>
    ${footLinks(gym, x)}
    <p class="zp-foot__made">${esc(L(gym.made) || S.made)}</p>
  </div>${legalSheet(gym, x)}</footer>`;
}

/* The Book button that follows you. Three shapes: a pill with the price, a pill with two actions, a full bar.
   It is not in the recipe's block list: the page adds it when the "follows you" effect is on. */
export function followBook(gym, x, variant = 'pill') {
  const { S, L } = x, f = x.facts, c = x.cta, offer = L(gym.offer);
  const btn = `<a class="zp-btn zp-follow__btn" href="${c.href}"><span class="zp-w">${esc(c.label)}</span><span class="zp-n">${esc(c.short)}</span></a>`;
  const price = x.hasPrices && c.href !== '#prices';   // the price link is only there when it leads somewhere the button does not
  const inner = variant === 'duo'
    ? `${btn}${price ? `<a class="zp-follow__alt" href="#prices">${esc(S.nav.prices)} · ${esc(S.from(f.from))}</a>` : ''}`
    : `${price ? `<a class="zp-follow__txt" href="#prices"><b>${esc(offer || S.nav.prices)}</b><span>${esc(offer ? S.then(f.from) : S.from(f.from))}</span></a>` : ''}${btn}`;
  return `<div class="zp-follow zp-follow--${variant}${price ? '' : ' is-bare'}" data-fx-book role="complementary" aria-label="${esc(c.label)}">${inner}</div>`;
}

/* Cover band. The one cover photo the owner sets, shown wide under a hero that has no photo of its own
   (Timetable's hero is the day's board). The launch version adds it so a launch page is never photo-free. */
export function coverBand(gym, x) {
  const pic = gym.photos[0]; if (!pic) return '';
  return `<section class="zp-sec zp-cover" data-block="coverBand"><div class="zp-in" data-rise>${photo(pic.src, { cls: 'zp-cover__ph', pos: pic.pos, alt: gym.name })}</div></section>`;
}

export const BLOCKS = { menuBar, heroFilm, heroSlideshow, heroSplit, heroFramed, heroTiles, coverBand, offerStrip, statement, classCards, scheduleCards, scheduleList, priceCards, coaches, reviews, firstVisit, bookingBar, footer };

/* names the control panel and the spec use */
export const BLOCK_NAMES = {
  menuBar: { en: 'Menu bar', es: 'Barra de menú' },
  heroFilm: { en: 'Hero: film', es: 'Portada: video' },
  heroSlideshow: { en: 'Hero: slideshow with tabs', es: 'Portada: fotos con pestañas' },
  heroSplit: { en: 'Hero: split with today\'s classes', es: 'Portada: dividida con las clases de hoy' },
  heroFramed: { en: 'Hero: framed photo', es: 'Portada: foto enmarcada' },
  heroTiles: { en: 'Hero: three tiles', es: 'Portada: tres fotos' },
  coverBand: { en: 'Cover photo', es: 'Foto de portada' },
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
