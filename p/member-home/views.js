/* Member home: what the phone draws. Pure text in, text out: no page access here, so the same code can be checked without a browser.
   The one rule behind every screen: a thing shows only when this person has one. Nothing is ever shown empty or locked. */

import { DAYS, WD, GYMS, CLASSES, COACHES, FACES, WEEK, FULL, WORKOUTS, NOW, W, F } from './data.js?v=5';

let S;                                      // the state being drawn: draw() and bind() set it, the helpers below read it
export const bind = state => { S = state; };

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = x => (x == null ? '[?]' : typeof x === 'object' ? (x[S.lang] ?? x.en) : String(x));
const T = x => esc(t(x));
const f = () => F[S.lang];
const me = () => S.db[S.m];
const gym = () => GYMS[me().gym];
const person = id => me().people.find(p => p.id === id) || me().people[0];
const up = s => s.charAt(0).toUpperCase() + s.slice(1);
const fam = () => me().people.length > 1;
export const FX = () => S.fx !== 'off';      // the review fixes 1, 3, 4 and 5: on unless the viewer switched them off

const svg = d => `<svg class="m-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
const I = {
  down: svg('<path d="M6 9l6 6 6-6"/>'), upc: svg('<path d="M6 15l6-6 6 6"/>'), right: svg('<path d="M9 6l6 6-6 6"/>'), back: svg('<path d="M15 6l-6 6 6 6"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'), x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  home: svg('<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>'),
  schedule: svg('<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
  workouts: svg('<path d="M7 7v10M4 9.5v5M17 7v10M20 9.5v5M7 12h10"/>'),
  account: svg('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>'),
  pin: svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>'),
  phone: svg('<path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7L16 13l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"/>'),
  mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>'),
  card: svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>'),
  receipt: svg('<path d="M6 3.5h12v17l-2.5-1.5-2 1.5-1.5-1.5-1.5 1.5-2-1.5L6 20.5z"/><path d="M9 8h6M9 11.5h6M9 15h3"/>'),
  bell: svg('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  doc: svg('<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M9.5 12.5h5M9.5 16h5"/>'),
  pause: svg('<circle cx="12" cy="12" r="8"/><path d="M10 9v6M14 9v6"/>'),
  people: svg('<circle cx="9" cy="9" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16 14.2c2.6.2 4.5 2 4.5 4.8"/>'),
  store: svg('<path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M4.5 9.5h15a0 0 0 0 1 0 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0z"/><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20"/>'),
  plan: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 12.5h8M8 16h5"/>'),
  out: svg('<path d="M14 4.5h4.5v15H14"/><path d="M10 8l-4 4 4 4M6 12h9"/>'),
  globe: svg('<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.4 2.3 3.5 5 3.5 8s-1.1 5.7-3.5 8c-2.4-2.3-3.5-5-3.5-8s1.1-5.7 3.5-8z"/>'),
  bolt: svg('<path d="M13 3.5 5.5 13.5H12l-1 7 7.5-10H12z"/>'),
};

/* A coach's face. Photos wait on staff profiles [PHO-402]; with no photo it is her first letter. */
const face = (id, cls = '') => {
  const n = COACHES[id] || String(id || '?');
  return FACES[id] ? `<span class="m-face ${cls}"><img src="${FACES[id]}" alt="" loading="lazy" decoding="async"></span>`
    : `<span class="m-face ${cls}" aria-hidden="true">${esc(n.charAt(0))}</span>`;
};
/* the status that just changed gets a small pop, once */
const pop = (who, id) => (S.flash === `${who}:${id}` ? ' m-pop' : '');
/* a row with an icon on the left: the smaller pages are built from these */
const irow = (icon, title, sub, right = '', act = '') => `<${act ? 'button' : 'div'} class="m-row m-irow"${act}><span class="m-ic">${I[icon]}</span><span class="m-rt"><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span>${right}</${act ? 'button' : 'div'}>`;

/* ---------- time and dates ---------- */
export function clock(hm) {
  const [h, m] = hm.split(':').map(Number), pm = h >= 12;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${S.lang === 'es' ? (pm ? 'p. m.' : 'a. m.') : (pm ? 'PM' : 'AM')}`;
}
const dayShort = i => (i === 0 ? t(W.today) : up(WD.short[S.lang][DAYS[i].wd]));
export function dateLine(i) {               // Thursday, Nov 19
  const d = DAYS[i], wd = up(WD.long[S.lang][d.wd]);
  return S.lang === 'es' ? `${wd} ${d.n} de nov.` : `${wd}, Nov ${d.n}`;
}
const whenWord = i => (i === 0 ? t(W.today) : i === 1 ? t(W.tomorrow) : dateLine(i));
export const whenToast = (day, time) => `${day === 0 ? t(W.today).toLowerCase() : day === 1 ? t(W.tomorrow).toLowerCase() : WD.long[S.lang][DAYS[day].wd]}, ${clock(time)}`;

/* ---------- the schedule ---------- */
export function classesOn(day) {
  if (!gym().classes) return [];
  return (WEEK[DAYS[day].wd] || [])
    .filter(r => day > 0 || r[0] >= '17:00')      // today, only what is still to come this evening
    .map(([time, cls, coach]) => ({ id: `${day}-${time}-${cls}`, day, time, cls, coach }));
}
export const findClass = id => classesOn(+id.split('-')[0]).find(c => c.id === id);
export function taken(c) {
  const cap = CLASSES[c.cls].cap;
  if (c.id === FULL) return cap;
  return (c.day * 5 + parseInt(c.time, 10) * 3 + c.cls.charCodeAt(0)) % (cap - 2) + 1;
}
export const bid = x => `${x.day}-${x.time}-${x.cls}`;
const bkOf = (who, c) => me().bookings.find(x => x.who === who && bid(x) === c.id);
const canTake = (p, cls) => !!CLASSES[cls].minor === !!p.minor;     // teens classes for the teen, the rest for adults
const byWhen = (a, c) => a.day - c.day || a.time.localeCompare(c.time);
const mins = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
export const hoursTo = x => (x.day * 1440 + mins(x.time) - mins(NOW)) / 60;      // from now (Tuesday 4:15 PM) to the class

/* Which classes the schedule opens on for this person: the ones she has booked before. */
function listFor(p, day) {
  const all = classesOn(day).filter(c => canTake(p, c.cls));
  const mine = (p.likes || []).length ? all.filter(c => p.likes.includes(c.cls)) : all;
  return { all, mine };
}
export function firstDay(whoId) {             // open the schedule on the first day that has one of her classes
  const p = person(whoId);
  const i = DAYS.findIndex((d, n) => listFor(p, n).mine.length > 0);
  return i < 0 ? 0 : i;
}

/* ---------- plans, prices, offers ---------- */
const prod = id => gym().products.find(x => x.id === id);
const planName = pl => (pl.name ? t(pl.name) : t(prod(pl.pid).name));

/* What booking one class costs this person: nothing extra on a plan, one class off a pack, or the single price. */
export function costOf(m, who) {
  const pl = m.plans.find(x => x.who === who);
  const due = m.alerts.find(a => a.kind === 'due' && a.who === who);
  if (due && S.grace === 'out') return { kind: 'blocked', alert: due, plan: pl || null };     // grace has run out: Book turns into Pay first [PHO-181]
  if (who === m.people[0].id && m.credits > 0 && !(pl && (pl.kind === 'plan' || pl.left > 0))) return { kind: 'credit' };
  if (pl && pl.kind === 'plan') return { kind: 'plan', plan: pl };
  if (pl && pl.kind === 'pack' && pl.left > 0) return { kind: 'pack', plan: pl };
  return { kind: 'pay', amount: GYMS[m.gym].single, plan: pl || null };
}

/* The one offer a person may see. It always comes from the gym's own price list, so the owner sets up nothing:
   - she pays one class at a time: the smallest pack, at the gym's intro price if it has one and she never bought a pack
   - her pack has 2 or fewer left: the next bigger pack, or the same one again when there is no bigger
   - anything else, including every monthly plan: no offer. */
export function offerFor(m, who) {
  const g = GYMS[m.gym], p = m.people.find(x => x.id === who);
  if (!p || p.minor) return null;
  const pl = m.plans.find(x => x.who === who);
  const unl = g.products.find(x => x.kind === 'plan');
  if (!pl && FX() && m.pace && unl) {         // fix 5: she comes often enough that a month of single classes costs more than the plan
    const monthly = Math.round(m.pace * 52 / 12 * g.single);
    if (monthly > unl.price) return { why: 'unl', pid: unl.id, price: unl.price, monthly, save: monthly - unl.price, pace: m.pace };
  }
  if (!pl) {
    const intro = g.intro && !m.bought ? g.intro : null;
    const pr = intro ? g.products.find(x => x.id === intro.pid) : g.products.find(x => x.kind === 'pack');
    if (!pr) return null;
    const price = intro ? intro.price : pr.price, full = g.single * pr.n;
    if (price >= full) return null;                                 // only when the pack really saves her money
    return { why: intro ? 'intro' : 'first', pid: pr.id, price, n: pr.n, full };
  }
  if (pl.kind !== 'pack' || pl.left > 2) return null;
  const packs = g.products.filter(x => x.kind === 'pack'), i = packs.findIndex(x => x.id === pl.pid);
  const now = packs[i], next = packs[i + 1] || now;
  return { why: next === now ? 'same' : 'bigger', empty: pl.left === 0, pid: next.id, price: next.price, n: next.n, each: Math.round(next.price / next.n), nowEach: Math.round(now.price / now.n) };
}
export function priceFor(m, who, pid) {
  const o = offerFor(m, who), pr = GYMS[m.gym].products.find(x => x.id === pid);
  return o && o.pid === pid ? o.price : pr.price;
}
function offerCopy(o) {
  const u = gym().unit, x = f();
  if (o.why === 'unl') return { title: x.unlTitle(o.price), line: x.unlLine(o.pace, o.monthly, o.save) };
  if (o.why === 'intro') return { title: x.introTitle(o.n, u, o.price), line: x.introLine(o.full, o.full - o.price) };
  if (o.why === 'first') return { title: x.packTitle(o.n, u, o.price), line: x.introLine(o.full, o.full - o.price) };
  if (o.why === 'bigger') return { title: x.biggerTitle(o.n, u, o.price), line: x.biggerLine(o.each, o.nowEach, u) };
  return { title: x.sameTitle(o.n, u, o.price), line: x.sameLine(o.each, u) };
}
const buyBtn = (o, who, cls = 'btn') => `<button class="${cls}" data-act="sheet" data-kind="pay" data-pay="product" data-id="${o.pid}" data-who="${who}">${esc(o.why === 'unl' ? f().switchTo(t(prod(o.pid).name)) : f().buyN(o.n, gym().unit))}</button>`;

/* ---------- what this person has: it decides every section, tab and button ---------- */
export function has(m) {
  return {
    book: !!GYMS[m.gym].classes,                                   // the business runs classes she reserves herself
    train: (m.tracks || []).length > 0 || !!m.program,             // a track her plan covers, or a program her coach wrote
    family: m.people.length > 1,                                   // she books and pays for someone else
  };
}
const aboutName = () => `${t(W.about)} ${gym().name}`;
function sections() {                         // the lines under the gym's name
  const h = has(me());
  if (FX()) return [['home', t(W.home)], h.book && ['schedule', t(W.schedule)], h.train && ['workouts', t(W.workouts)], ['gym', aboutName()]].filter(Boolean);      // fix 1: her own things live under her initials
  return [['home', t(W.home)], h.book && ['schedule', t(W.schedule)], h.train && ['workouts', t(W.workouts)], h.family && ['family', t(W.family)],
    ['plan', t(W.plan)], ['gym', aboutName()], ['account', t(W.account)]].filter(Boolean);
}
function tabs() {                             // the pick: a bar at the bottom. A tab shows only when she has something for it
  const h = has(me());
  return [['home', t(W.home)], h.book && ['schedule', t(W.schedule)], h.train && ['workouts', t(W.workouts)], ['account', t(W.meTab)]].filter(Boolean);
}
const isTab = s => ['home', 'schedule', 'workouts', 'account'].includes(s);
const titleOf = s => (s === 'gym' ? aboutName() : s === 'account' && S.nav === 'tabs' ? t(W.meTab) : t(W[s]));
const underMe = s => ['plan', 'family'].includes(s) && (S.nav === 'tabs' || FX());     // pages reached from her initials go back there

/* ---------- the bar on top ---------- */
function top() {
  const g = gym(), m = me(), home = S.screen === 'home', tabbed = S.nav === 'tabs';
  const title = esc(home ? g.name : titleOf(S.screen));
  const lead = home || (tabbed && isTab(S.screen))
    ? `<span class="m-logo" aria-hidden="true">${g.mark}</span>`
    : `<button class="m-icb" data-act="go" data-arg="${tabbed || underMe(S.screen) ? 'account' : 'home'}" aria-label="${T(W.back)}">${I.back}</button>`;
  const mid = tabbed
    ? `<b class="m-title">${title}</b>`
    : `<button class="m-title" data-act="menu" aria-expanded="${!!S.menu}" aria-haspopup="true"><b>${title}</b>${I.down}</button>`;
  const ava = tabbed ? '' : `<button class="m-ava" data-act="go" data-arg="account" aria-label="${T(W.account)}: ${esc(m.full)}">${m.ini}</button>`;      // with tabs, Account already has a tab
  return `${lead}${mid}<span class="m-sp"></span>${ava}`;
}
function menu() {
  return `<button class="m-scrim m-under" data-act="menu" aria-label="${T(W.close)}"></button><nav class="m-menu" aria-label="${T(W.menu)}">${
    sections().map(([id, label]) => `<button class="m-mi" data-act="go" data-arg="${id}"${S.screen === id ? ' aria-current="page"' : ''}>${esc(label)}</button>`).join('')
  }<p class="m-mfoot">${T(W.signedIn)} ${esc(me().full)}</p></nav>`;
}

/* ---------- the bar at the bottom ---------- */
function bottom() {
  const h = has(me());
  let bar = '';
  if (S.nav === 'tabs') {
    const cur = isTab(S.screen) ? S.screen : 'account';
    const icon = id => (id === 'account' ? `<span class="m-tabme" aria-hidden="true">${esc(me().ini)}</span>` : I[id]);      // Me is her initials
    const dot = id => (id === 'home' && S.screen !== 'home' && me().alerts.length ? '<i class="m-dot" aria-hidden="true"></i>' : '');      // something on Home needs her
    bar = `<nav class="m-tabbar" aria-label="${T(W.tabsLabel)}">${tabs().map(([id, label]) => `<button data-act="go" data-arg="${id}"${cur === id ? ' aria-current="page"' : ''}><span class="m-tabi">${icon(id)}${dot(id)}</span><span>${esc(label)}</span></button>`).join('')}</nav>`;
  } else if (S.nav === 'book' && S.screen === 'home' && h.book) {
    bar = `<div class="m-bookbar"><button class="btn pri lg m-wide" data-act="go" data-arg="schedule">${T(W.bookClass)}</button></div>`;
  }
  const age = S.toast ? Math.max(0, (Date.now() - (S.toast.at || Date.now())) / 1000) : 0;
  const toast = S.toast && !(S.toast.sheet && S.sheet) ? `<div class="m-toast" role="status" data-tid="${S.toast.at || 0}" style="--age:-${age.toFixed(2)}s">${S.toast.undo ? '' : `<span class="m-tok">${I.check}</span>`}<span>${esc(S.toast.text)}</span>${S.toast.undo ? `<button data-act="undo">${T(W.undo)}</button><i class="m-tline" aria-hidden="true"></i>` : ''}</div>` : '';
  return toast + bar;
}

/* ---------- pieces of the home ---------- */
function newsStrip() {
  return `<button class="m-news" data-act="sheet" data-kind="news"><span class="m-lab">${T(W.news)}</span><span class="m-newst">${T(gym().news.title)}</span>${I.right}</button>`;
}
const tag = p => (fam() ? `<span class="m-tag">${p.me ? T(W.you) : esc(p.name)}</span>` : '');

/* Notices sit on top of the home. Red means something goes wrong if she ignores it. Blue is for her and can wait. An offer is never red. */
function notices() {
  const m = me(), red = [], blue = [];
  m.alerts.forEach(a => {
    const p = person(a.who), pl = m.plans.find(x => x.who === a.who);
    const grace = S.grace === 'out' ? f().graceOut() : gym().graceUntil ? f().graceIn(t(gym().graceUntil)) : '';
    red.push(`<section class="m-note act"><p class="m-nk">${T(W.needsYou)}</p><b>${esc(f().dueTitle(p.name, p.me))}</b><p>${esc(f().dueLine(planName(pl), a.amount, t(a.since)))} ${esc(grace)}</p>
      <div class="m-na"><button class="btn" data-act="sheet" data-kind="pay" data-pay="due" data-id="${a.id}" data-who="${a.who}">${esc(f().payAmt(a.amount))}</button></div></section>`);
  });
  m.plans.forEach(pl => {      // a pack that just ran out: the one time an offer moves up here. "Not now" sends it back down to her plan
    const o = pl.kind === 'pack' && pl.left === 0 && !pl.quiet ? offerFor(m, pl.who) : null;
    if (o) blue.push(`<section class="m-note info"><p class="m-nk">${T(W.forYou)}</p><b>${esc(f().emptyTitle(gym().unit))}</b><p>${esc(f().emptyLine(gym().unit))} ${esc(offerCopy(o).title)}.</p>
      <div class="m-na">${buyBtn(o, pl.who)}<button class="m-link" data-act="seen" data-arg="offer" data-who="${pl.who}">${T(W.notNow)}</button></div></section>`);
  });
  if (m.note && !m.note.seen) blue.push(`<section class="m-note info"><p class="m-nk">${T(W.from)} ${esc(m.note.from)} · ${T(m.note.about)}</p><b>${T(m.note.text)}</b>
    <div class="m-na"><button class="btn" data-act="seen" data-arg="note">${T(W.gotIt)}</button></div></section>`);
  (m.notices || []).filter(n => !n.seen).forEach(n => blue.push(`<section class="m-note info"><p class="m-nk">${T(W.forYou)}</p><b>${T(n.title)}</b><p>${T(n.body)}</p>
    <div class="m-na"><button class="btn" data-act="seen" data-arg="${n.id}">${T(W.gotIt)}</button></div></section>`));
  return red.concat(blue).join('');
}

function resLine(p, r) {
  const v = esc(r.v);
  const show = p.log === 'weight' ? `${v} lb` : p.log === 'reps' ? `${v} ${T(W.repsShort)}` : v;
  return `<p class="m-res">${I.check}<span>${show}${p.scaled ? ` · ${T(r.rx === 'scaled' ? W.scaled : W.rx)}` : ''}${r.best ? ` · ${T(W.newBest)}` : ''}</span></p>`;
}
function workout(tr, bare) {
  const w = WORKOUTS[tr], res = (me().results || {})[tr] || {};
  return `<div class="m-wo">${bare ? '' : `<p class="m-woh"><span class="m-lab">${T(W.workout)}</span><b>${T(w.title)}</b></p>`}<ol class="m-parts">${w.parts.map((p, i) => `<li><span class="ix" aria-hidden="true">${String.fromCharCode(65 + i)}</span><div class="m-pt">
    <p class="m-pn"><b>${T(p.name)}</b><span class="mins">${p.mins} min</span></p><p class="m-px">${T(p.text)}</p>${p.scaled ? `<p class="m-scl"><span>${T(W.scaled)}</span>${T(p.scaled)}</p>` : ''}${res[i] ? resLine(p, res[i]) : ''}</div></li>`).join('')}</ol></div>`;
}
const isLogged = tr => Object.keys((me().results || {})[tr] || {}).length > 0;
const logBtn = tr => `<button class="btn" data-act="sheet" data-kind="log" data-id="${tr}">${T(isLogged(tr) ? W.editScore : W.logScore)}</button>`;

function nextCard(x) {
  const k = CLASSES[x.cls], c = findClass(bid(x)), m = me();
  const tr = x.day === 0 && (m.tracks || []).includes(x.cls) ? x.cls : null;      // today's booked class brings its workout with it
  return `<section class="card m-next"><div class="m-nh"><span class="m-lab">${esc(whenWord(x.day))}</span><span class="m-pill ok${pop(x.who, bid(x))}">${I.check}${T(W.booked)}</span></div>
    <div class="m-nt"><span class="m-time">${clock(x.time)}</span><span class="m-what"><b>${T(k.name)}</b>${tag(person(x.who))}</span></div>
    <p class="m-meta m-coach">${face(c.coach, 'sm')}<span>${esc(COACHES[c.coach])} · ${k.mins} min · ${T(k.room)}</span></p>${tr ? workout(tr) : ''}
    <div class="m-foot">${tr ? logBtn(tr) : ''}${cancelBtn(x, 'm-link')}</div></section>`;
}
/* Cancel: with fix 3, a booking she paid for asks first and says what she gets back. Leaving a waitlist never asks. */
function cancelBtn(x, cls) {
  const label = x.wait ? T(W.waitLeave) : T(W.cancel);
  return FX() && !x.wait
    ? `<button class="${cls}" data-act="sheet" data-kind="cancel" data-id="${bid(x)}" data-who="${x.who}">${label}</button>`
    : `<button class="${cls}" data-act="cancel" data-id="${bid(x)}" data-who="${x.who}">${label}</button>`;
}
/* What a cancel costs, from the gym's window and how the class was paid for. */
export function cancelTerms(x) {
  const g = gym(), hrs = g.cancelHrs, late = hrs > 0 && hoursTo(x) < hrs;
  if (x.pack) return { late, back: late ? 'none' : 'pack' };
  if (x.paid || x.credit) return { late, back: late ? 'none' : 'credit', amt: x.paid || g.single };
  return { late, back: 'plan' };
}
function trackRows(ids, label, dflt) {
  if (!ids.length) return '';
  const openId = S.open === undefined ? dflt : S.open;
  return `<section class="m-sec"><h2 class="m-lab">${esc(label)}</h2><div class="card m-rows">${ids.map(id => {
    const w = WORKOUTS[id], open = openId === id, mins = w.parts.reduce((a, p) => a + p.mins, 0);
    return `<div class="m-acc"><button class="m-row" data-act="open" data-arg="${id}" aria-expanded="${open}"><span class="m-rt"><b>${T(CLASSES[id].name)}</b><span>${T(w.title)} · ${mins} min${isLogged(id) ? ` · ${T(W.logged)}` : ''}</span></span>${open ? I.upc : I.down}</button>${
      open ? `<div class="m-accb">${workout(id, true)}<div class="m-foot">${logBtn(id)}</div></div>` : ''}</div>`;
  }).join('')}</div></section>`;
}
function programCard() {
  const p = me().program, ticks = me().ticks || [], done = ticks.filter(Boolean).length, all = done === p.parts.length;
  return `<section class="card m-next"><div class="m-nh"><span class="m-lab">${T(W.today)} · ${T(W.yourPlanDay)}</span>${all ? `<span class="m-pill ok">${I.check}${T(W.done)}</span>` : `<span class="m-count">${done}/${p.parts.length}</span>`}</div>
    <div class="m-nt"><span class="m-what"><b>${T(p.name)}</b></span></div><p class="m-meta">${T(W.week)} ${p.week} ${T(W.of)} ${p.of} · ${T(p.day)}</p>
    <ul class="m-ticks">${p.parts.map((x, i) => `<li><button class="m-tick" data-act="tick" data-arg="${i}" aria-pressed="${!!ticks[i]}"><span class="m-box" aria-hidden="true">${ticks[i] ? I.check : ''}</span><span class="m-pt"><b>${T(x.name)}</b><span>${T(x.text)}</span></span></button></li>`).join('')}</ul></section>`;
}
function sessionCard(s) {
  return `<section class="card m-next"><div class="m-nh"><span class="m-lab">${esc(whenWord(s.day))}</span><span class="m-pill ok">${I.check}${T(W.booked)}</span></div>
    <div class="m-nt"><span class="m-time">${clock(s.time)}</span><span class="m-what"><b>${T(s.name)} ${T(W.withWord)} ${esc(s.coach)}</b></span></div>
    <p class="m-meta">${s.mins} min · ${esc(gym().name)}, ${esc(gym().hood)}</p>
    <div class="m-foot"><button class="m-link" data-act="sheet" data-kind="session">${T(W.cantMakeIt)}</button></div></section>`;
}
const emptyCard = (title, line) => `<section class="m-none"><b>${esc(title)}</b><span>${esc(line)}</span></section>`;

function weekRows(rest, canBook) {
  const m = me();
  const usual = (m.usual || []).filter(u => !m.bookings.some(x => x.who === u.who && bid(x) === bid(u)) && findClass(bid(u)));
  const rows = rest.map(x => ({ x, booked: true })).concat(usual.map(x => ({ x, booked: false }))).sort((a, c) => byWhen(a.x, c.x));
  if (!rows.length) return '';
  return `<section class="m-sec"><h2 class="m-lab">${T(W.thisWeek)}</h2><div class="card m-rows">${rows.map(({ x, booked }) => {
    const k = CLASSES[x.cls], c = findClass(bid(x)), p = person(x.who);
    const when = `<span class="m-rd"><b>${esc(dayShort(x.day))}</b><span>${clock(x.time)}</span></span>`;
    const name = `<b>${T(k.name)}${tag(p)}</b>`;
    return booked
      ? `<button class="m-row" data-act="sheet" data-kind="class" data-id="${c.id}" data-who="${x.who}">${when}<span class="m-rt">${name}<span class="m-sub">${face(c.coach, 'xs')}${esc(COACHES[c.coach])}</span></span><span class="m-st ${x.wait ? 'q' : 'ok'}${pop(x.who, c.id)}">${x.wait ? T(W.waiting) : I.check + T(W.booked)}</span></button>`
      : `<div class="m-row">${when}<span class="m-rt">${name}<span>${T(W.usual)}</span></span>${costOf(m, x.who).kind === 'blocked'
        ? `<button class="btn sm" data-act="sheet" data-kind="class" data-id="${c.id}" data-who="${x.who}">${T(W.payFirst)}</button>`
        : `<button class="btn sm" data-act="quick" data-id="${c.id}" data-who="${x.who}">${T(W.book)}</button>`}</div>`;
  }).join('')}${canBook ? addRows() : ''}</div></section>`;
}
function addRows() {               // fix 4: a parent gets one row per person, so booking for her son is in plain sight
  const m = me();
  if (!(fam() && FX())) return `<button class="m-row m-addrow" data-act="go" data-arg="schedule"><span class="m-rt"><b>+ ${T(W.bookAnother)}</b></span>${I.right}</button>`;
  return m.people.map(p => `<button class="m-row m-addrow" data-act="go" data-arg="schedule" data-who="${p.id}"><span class="m-rt"><b>+ ${esc(p.me ? f().bookForMe() : f().bookFor(p.name))}</b></span>${I.right}</button>`).join('');
}

/* Her plan, in one card. The offer sits here, at the thing it is about, and only one at a time. */
function planBlock(link) {
  const m = me(), g = gym(), rows = [];
  m.people.forEach(p => {
    const pl = m.plans.find(x => x.who === p.id);
    if (!pl && (p.minor || !g.classes)) return;
    let title, line;
    if (!pl) { title = t(W.payPer); line = esc(f().perUnit(g.single, g.unit)) + (p.me && m.credits > 0 ? ` · <strong>${esc(f().creditLine(m.credits))}</strong>` : ''); }
    else if (pl.kind === 'pack') { title = planName(pl); line = `${pl.left <= 2 ? `<strong>${esc(f().left(pl.left, g.unit))}</strong>` : esc(f().left(pl.left, g.unit))}${pl.left > 0 ? ` · ${esc(f().useBy(t(pl.until)))}` : ''}`; }
    else { title = planName(pl); line = pl.due ? `<strong class="m-bad">${T(W.payFailed)}</strong>` : esc(f().renews(t(pl.renews), pl.price || prod(pl.pid).price)); }
    const inner = `<span class="m-rt"><b>${esc(title)}${tag(p)}</b><span>${line}</span></span>`;
    rows.push(link ? `<button class="m-row" data-act="go" data-arg="plan">${inner}${I.right}</button>` : `<div class="m-row">${inner}</div>`);
    const o = offerFor(m, p.id);
    /* while the notice on top carries the offer, it is not said twice down here */
    if (o && !(o.empty && !pl.quiet)) { const c = offerCopy(o); rows.push(`<div class="m-offer"><p class="m-lab">${T(W.offer)}</p><div><b>${esc(c.title)}</b><p>${esc(c.line)}</p></div>${buyBtn(o, p.id)}</div>`); }
  });
  if (!rows.length) return '';
  return `<section class="m-sec"><h2 class="m-lab">${T(W.yourPlan)}</h2><div class="card m-rows">${rows.join('')}</div></section>`;
}

/* ---------- home: in time order. What needs her, now, next, this week, then what stands ---------- */
function home() {
  const m = me(), g = gym(), h = has(m), tracks = m.tracks || [];
  const booked = m.bookings.filter(x => !x.wait).sort(byWhen), next = booked[0];
  const nextToday = next && next.day === 0, withWorkout = nextToday && tracks.includes(next.cls);
  let out = `<header class="m-hello"><p class="m-lab">${T(W.dateLong)}</p><h1 class="m-h1">${T(W.hi)}, ${esc(m.first)}</h1></header>${notices()}`;
  if (m.program) out += programCard();
  if (nextToday) out += nextCard(next) + trackRows(tracks.filter(id => id !== next.cls || !withWorkout), t(withWorkout ? W.alsoToday : W.todayWorkouts), withWorkout ? null : tracks[0]);
  else out += trackRows(tracks, t(W.todayWorkouts), tracks[0]);
  if (m.sessions) out += m.sessions.length ? sessionCard(m.sessions[0]) : emptyCard(t(W.noSession), f().noSessionLine(g.owner));
  if (next && !nextToday) out += nextCard(next);
  if (!next && h.book) out += emptyCard(t(W.nothingBooked), t(W.nothingBookedLine));
  if (S.nav === 'menu' && h.book) out += `<button class="btn lg m-wide" data-act="go" data-arg="schedule">${T(W.bookClass)}</button>`;
  out += weekRows(m.bookings.filter(x => x !== next).sort(byWhen), h.book) || (h.book ? `<section class="m-sec"><div class="card m-rows">${addRows()}</div></section>` : '');
  out += planBlock(true);
  return `<div class="m-page${g.news ? ' m-hasnews' : ''}">${g.news ? newsStrip() : ''}${out}</div>`;
}

/* ---------- schedule: her classes first, one day at a time ---------- */
function schedule() {
  const m = me(), p = person(S.who || m.people[0].id), { all, mine } = listFor(p, S.day);
  const list = S.all ? all : mine, more = all.length > mine.length;
  const whoSeg = !fam() ? '' : FX()
    ? `<div class="m-whobig" role="group" aria-label="${T(W.forWhom)}"><p class="m-lab">${T(W.forWhom)}</p><div>${m.people.map(x => `<button data-act="who" data-arg="${x.id}" aria-pressed="${x.id === p.id}"><span class="m-whoava" aria-hidden="true">${esc(x.name.charAt(0))}</span><span><b>${esc(x.name)}</b><span>${x.me ? T(W.you) : `${x.age} ${T(W.years)}`}</span></span></button>`).join('')}</div></div>`
    : `<div class="m-who"><span class="m-lab">${T(W.forWhom)}</span><span class="m-seg" role="group" aria-label="${T(W.forWhom)}">${m.people.map(x => `<button data-act="who" data-arg="${x.id}" aria-pressed="${x.id === p.id}">${x.me ? T(W.me) : esc(x.name)}</button>`).join('')}</span></div>`;
  const strip = `<div class="m-days" role="group" aria-label="${T(W.schedule)}">${DAYS.map((d, i) => `<button data-act="day" data-arg="${i}" aria-pressed="${i === S.day}"><span>${esc(dayShort(i))}</span><b>${d.n}</b></button>`).join('')}</div>`;
  const rows = list.map(c => {
    const k = CLASSES[c.cls], x = bkOf(p.id, c), left = k.cap - taken(c), cost = costOf(m, p.id);
    const right = x ? (x.wait ? `<span class="m-st q${pop(p.id, c.id)}">${T(W.waiting)}</span>` : `<span class="m-st ok${pop(p.id, c.id)}">${I.check}${T(W.booked)}</span>`)
      : left <= 0 ? `<span class="m-st q">${T(W.full)}</span>` : cost.kind === 'blocked' ? `<span class="m-st bad">${T(W.payFirst)}</span>` : cost.kind === 'pay' ? `<span class="m-st q">$${cost.amount}</span>` : '';
    const spots = !x && left > 0 && left <= 3 ? ` · ${left} ${T(left === 1 ? W.spot : W.spots)}` : '';
    return `<button class="m-row" data-act="sheet" data-kind="class" data-id="${c.id}" data-who="${p.id}"><span class="m-rd"><b>${clock(c.time)}</b></span><span class="m-rt"><b>${T(k.name)}</b><span class="m-sub">${face(c.coach, 'xs')}${esc(COACHES[c.coach])} · ${k.mins} min${spots}</span></span>${right}${I.right}</button>`;
  }).join('');
  const head = fam() && FX() && !p.me ? `${esc(f().classesFor(p.name))} · ${esc(dateLine(S.day))}` : esc(dateLine(S.day));
  return `<div class="m-page">${whoSeg}${strip}<section class="m-sec"><h2 class="m-lab">${head}</h2>${
    rows ? `<div class="card m-rows">${rows}</div>` : `<section class="m-none"><span>${T(all.length ? W.noneThisDay : W.noneAtAll)}</span></section>`}</section>${
    more ? `<button class="m-link m-center" data-act="all">${T(S.all ? W.showMine : W.showAll)}</button>` : ''}</div>`;
}

/* ---------- the smaller pages. Sketches: they show what lives where ---------- */
const kv = (k, v) => `<div class="m-kv"><span>${k}</span><span>${v}</span></div>`;
const listCard = (label, rows) => (rows ? `<section class="m-sec"><h2 class="m-lab">${esc(label)}</h2><div class="card m-rows">${rows}</div></section>` : '');

function workoutsPage() {
  const m = me(), tracks = m.tracks || [];
  const bookedToday = m.bookings.find(x => !x.wait && x.day === 0 && tracks.includes(x.cls));
  let out = '';
  if (m.program) {
    out += programCard() + listCard(t(W.thisWeekPlan), m.program.days.map(d => `<div class="m-row"><span class="m-rt"><b>${T(d.d)}</b><span>${T(d.what)}</span></span>${d.state === 'done' ? `<span class="m-st ok">${I.check}${T(W.done)}</span>` : d.state === 'today' ? `<span class="m-st q">${T(W.today)}</span>` : ''}</div>`).join(''));
  }
  out += trackRows(tracks, t(W.todayWorkouts), bookedToday ? bookedToday.cls : tracks[0]);
  out += listCard(t(W.recent), (m.history || []).map(r => `<div class="m-row"><span class="m-rd"><b>${T(r.d)}</b></span><span class="m-rt"><b>${T(r.what)}</b><span>${T(r.res)}</span></span></div>`).join(''));
  out += listCard(t(W.bests), (m.bests || []).map(r => kv(`<b>${T(r.what)}</b>`, `${esc(r.res)} · ${T(r.d)}`)).join(''));
  return `<div class="m-page">${out}</div>`;
}
function planPage() {
  const m = me(), g = gym(), self = m.people[0], mine = m.plans.find(x => x.who === self.id);
  const options = !mine || mine.kind === 'pack' ? g.products.map(pr => {
    const price = priceFor(m, self.id, pr.id), cur = mine && mine.pid === pr.id;
    return `<div class="m-row"><span class="m-rt"><b>${T(pr.name)}</b><span>$${price}${pr.kind === 'plan' ? ` ${T(W.aMonth)}` : ''}${price < pr.price ? ` · <s>$${pr.price}</s>` : ''}${cur ? ` · ${T(W.current)}` : ''}</span></span><button class="btn sm" data-act="sheet" data-kind="pay" data-pay="product" data-id="${pr.id}" data-who="${self.id}">${T(W.buy)}</button></div>`;
  }).join('') : '';
  const card = irow('card', T(W.cardBrand), T(W.cardExp), `<button class="btn sm" data-act="mock">${T(W.change)}</button>`);
  const rec = m.receipts.map(r => irow('receipt', T(r.what), T(r.d), `<span class="m-amt">$${r.amt}</span>`)).join('');
  return `<div class="m-page">${planBlock(false)}${listCard(t(W.options), options)}${listCard(t(W.card), card)}${listCard(t(W.receipts), rec)}
    ${listCard(t(W.pause), irow('pause', T(W.askPause), T(W.pauseLine), I.right, ' data-act="pause"'))}</div>`;
}
function familyPage() {
  const m = me(), self = m.people[0];
  return `<div class="m-page">${m.people.filter(p => !p.me).map(p => {
    const pl = m.plans.find(x => x.who === p.id);
    return `<section class="card m-kid"><div class="m-kidh"><span class="m-meava sm" aria-hidden="true">${esc(p.name.charAt(0))}</span><span class="m-rt"><b>${esc(p.name)}</b><span>${p.age} ${T(W.years)}</span></span></div>
      ${pl ? `<p class="m-meta">${esc(planName(pl))}${pl.due ? ` · <strong class="m-bad">${T(W.payFailed)}</strong>` : ` · ${esc(f().renews(t(pl.renews), pl.price))}`}</p>` : ''}
      <p class="m-meta">${esc(f().waiverBy(t(m.waiver), self.name))}</p>
      <div class="m-foot"><button class="btn" data-act="go" data-arg="schedule" data-who="${p.id}">${T(W.bookFor)} ${esc(p.name)}</button></div></section>`;
  }).join('')}<p class="m-fine">${T(W.addChild)}</p></div>`;
}
function gymPage() {
  const g = gym();
  const hours = g.hours.map(x => `<span class="m-hl">${T(x)}</span>`).join('');
  const where = irow('pin', esc(g.addr || g.hood), g.addr ? esc(g.hood) : '', `<button class="btn sm" data-act="mock">${T(W.directions)}</button>`);
  const reach = (g.phone ? irow('phone', esc(g.phone), T(W.callOrText), I.right, ' data-act="mock"') : '') + irow('mail', esc(g.email), T(W.writeUs), I.right, ' data-act="mock"');
  const news = g.news ? `<button class="m-row m-irow" data-act="sheet" data-kind="news"><span class="m-ic">${I.bell}</span><span class="m-rt"><b>${T(g.news.title)}</b><span>${T(g.news.when)}</span></span>${I.right}</button>` : irow('bell', T(W.noNews), '');
  return `<div class="m-page"><section class="m-gymhead"><span class="m-logo lg" aria-hidden="true">${g.mark}</span><span class="m-rt"><b>${esc(g.name)}</b><span>${esc(g.hood)}</span></span></section>
    ${listCard(t(W.allNews), news)}${listCard(t(W.hours), `<div class="m-row m-irow"><span class="m-ic">${I.clock}</span><span class="m-rt m-hours">${hours}</span></div>`)}${listCard(t(W.where), where)}${listCard(t(W.contact), reach)}</div>`;
}
function accountPage() {
  const m = me(), g = gym(), h = has(m);
  const mine = S.nav === 'tabs' || FX();       // everything that is hers, under her initials
  const links = mine
    ? `<div class="card m-rows">${[['plan', 'plan', t(W.plan)], h.family && ['family', 'people', t(W.family)], S.nav === 'tabs' && ['gym', 'store', aboutName()]].filter(Boolean).map(([id, icon, label]) => `<button class="m-row m-irow" data-act="go" data-arg="${id}"><span class="m-ic">${I[icon]}</span><span class="m-rt"><b>${esc(label)}</b></span>${I.right}</button>`).join('')}</div>` : '';
  const bk = mine && h.book ? listCard(t(W.upcoming), m.bookings.slice().sort(byWhen).map(x => {
    const k = CLASSES[x.cls], c = findClass(bid(x));
    return c ? `<button class="m-row" data-act="sheet" data-kind="class" data-id="${c.id}" data-who="${x.who}"><span class="m-rd"><b>${esc(dayShort(x.day))}</b><span>${clock(x.time)}</span></span><span class="m-rt"><b>${T(k.name)}${tag(person(x.who))}</b><span class="m-sub">${face(c.coach, 'xs')}${esc(COACHES[c.coach])}</span></span><span class="m-st ${x.wait ? 'q' : 'ok'}">${x.wait ? T(W.waiting) : I.check + T(W.booked)}</span></button>` : '';
  }).join('')) : '';
  const lang = `<div class="m-row m-irow"><span class="m-ic">${I.globe}</span><span class="m-rt"><b>${T(W.language)}</b></span><span class="m-seg sm" role="group" aria-label="${T(W.language)}"><button data-act="lang" data-arg="en" aria-pressed="${S.lang === 'en'}">EN</button><button data-act="lang" data-arg="es" aria-pressed="${S.lang === 'es'}">ES</button></span></div>`;
  const settings = lang + irow('bell', T(W.notifications), T(W.notifLine)) + irow('doc', T(W.documents), esc(f().waiver(t(m.waiver)))) + irow('store', T(W.yourGyms), esc(f().onlyPlace(g.name)));
  return `<div class="m-page"><section class="card m-meCard"><span class="m-meava" aria-hidden="true">${esc(m.ini)}</span><span class="m-rt"><b>${esc(m.full)}</b><span>${esc(m.email)}</span></span></section>${links}${bk}
    <section class="m-sec"><div class="card m-rows">${settings}</div></section>
    <button class="m-out" data-act="mock">${I.out}${T(W.signOut)}</button><p class="m-ver">Zana · ${esc(g.name)}</p></div>`;
}
function body() {
  return ({ home, schedule, workouts: workoutsPage, plan: planPage, family: familyPage, gym: gymPage, account: accountPage }[S.screen] || home)();
}

/* ---------- the one pop-up: a sheet from the bottom. One black button in each ---------- */
function classSheet() {
  const m = me(), c = findClass(S.sheet.id), p = person(S.sheet.who), k = CLASSES[c.cls], g = gym();
  const x = bkOf(p.id, c), tk = taken(c), cost = costOf(m, p.id), o = offerFor(m, p.id);
  let state = '', action, fine = '', extra = '';
  if (x && x.wait) { state = `<p class="m-state q">${T(W.waitOn)}</p>`; action = cancelBtn(x, 'btn lg m-wide'); fine = t(W.waitNote); }
  else if (x) { state = `<p class="m-state ok">${I.check}${T(W.youBooked)}</p>`; action = cancelBtn(x, 'btn lg m-wide'); }
  else if (cost.kind === 'blocked') {        // grace is over: the one button pays the overdue plan, then she comes back here to book
    state = `<p class="m-state bad">${esc(f().payFirstLine(cost.alert.amount))}</p>`;
    action = `<button class="btn pri lg m-wide" data-act="sheet" data-kind="pay" data-pay="due" data-id="${cost.alert.id}" data-who="${p.id}">${esc(f().payAmt(cost.alert.amount))}</button>`;
  }
  else if (tk >= k.cap) { state = `<p class="m-state q">${T(W.full)}. ${esc(f().spotsOf(tk, k.cap))}.</p>`; action = `<button class="btn pri lg m-wide" data-act="wait" data-id="${c.id}" data-who="${p.id}">${T(W.waitJoin)}</button>`; fine = t(W.waitNote); }
  else if (cost.kind === 'pay') {
    action = `<button class="btn pri lg m-wide" data-act="bookpay" data-id="${c.id}" data-who="${p.id}">${esc(f().bookPay(cost.amount))}</button>`; fine = f().charged(cost.amount);
    if (o) extra = `<div class="m-offer m-inset"><p class="m-lab">${T(W.offer)}</p><div><b>${esc(offerCopy(o).title)}</b><p>${esc(offerCopy(o).line)}</p></div>${buyBtn(o, p.id)}</div>`;   // the offer sits under the button, never in front of it
  } else {
    action = `<button class="btn pri lg m-wide" data-act="book" data-id="${c.id}" data-who="${p.id}">${T(W.book)}</button>`;
    fine = cost.kind === 'credit' ? f().usesCredit() : cost.kind === 'pack' ? f().uses(cost.plan.left, g.unit) : f().included(planName(cost.plan));
  }
  const pct = Math.min(100, Math.round(tk / k.cap * 100));
  const meter = `<div class="m-cap"><div class="m-meter${tk >= k.cap ? ' full' : ''}" aria-hidden="true"><span style="width:${pct}%"></span></div><span>${esc(f().spotsOf(tk, k.cap))}</span></div>`;
  return { title: T(k.name), body: `<div class="m-sum"><span class="m-time">${clock(c.time)}</span><span class="m-sumd">${c.day === 0 ? `${T(W.today)} · ` : ''}${esc(dateLine(c.day))} · ${k.mins} min</span></div>
    <div class="m-coachrow">${face(c.coach, 'md')}<span class="m-rt"><b>${esc(COACHES[c.coach])}</b><span>${T(W.coachWord)} · ${T(k.room)}</span></span></div>${meter}<p class="m-desc">${T(k.blurb)}</p>${
    fam() ? `<p class="m-for"><span class="m-lab">${T(W.forWhom)}</span> <b>${p.me ? T(W.me) : esc(p.name)}</b></p>` : ''}${state}${action}${fine ? `<p class="m-fine">${esc(fine)}</p>` : ''}${extra}` };
}
function cancelSheet() {
  const m = me(), c = findClass(S.sheet.id), p = person(S.sheet.who), k = CLASSES[c.cls], g = gym();
  const x = bkOf(p.id, c), tm = cancelTerms(x), u = f().unit(g.unit, 1), hrs = g.cancelHrs;
  const line = tm.back === 'pack' ? f().cancelBack(u, hrs) : tm.back === 'credit' ? f().cancelCredit(tm.amt, hrs)
    : tm.back === 'none' ? (x.pack ? f().cancelLost(u, hrs) : f().cancelPaidLost(tm.amt, hrs)) : f().cancelPlan();
  return { title: T(W.cancelQ), body: `<p class="m-meta"><b>${T(k.name)}</b> · ${esc(dateLine(c.day))} · ${clock(c.time)}</p>${p.me ? '' : `<p class="m-for">${esc(f().cancelFor(p.name))}</p>`}
    <p class="m-warn${tm.back === 'none' ? ' bad' : ''}">${esc(line)}</p>
    <button class="btn lg m-wide${tm.back === 'none' ? ' m-danger' : ''}" data-act="cancel" data-id="${c.id}" data-who="${p.id}">${T(W.yesCancel)}</button>
    <button class="m-link m-center" data-act="close">${T(W.keep)}</button>` };
}
function logSheet() {
  const tr = S.sheet.id, w = WORKOUTS[tr], res = (me().results || {})[tr] || {};
  const fields = w.parts.map((p, i) => {
    if (!p.log) return '';
    const r = res[i] || {}, rx = r.rx || 'rx';
    return `<div class="m-field"><label for="m-log-${i}"><b>${T(p.name)}</b><span>${T(p.text)}</span></label><div class="m-inrow">
      <input class="m-in" id="m-log-${i}" data-log="${i}" inputmode="${p.log === 'time' ? 'text' : 'decimal'}" autocomplete="off" placeholder="${T(W[p.log])}" value="${esc(r.v || '')}">${
      p.scaled ? `<span class="m-seg" role="group" aria-label="${T(W.rx)} / ${T(W.scaled)}" data-rxfor="${i}"><button type="button" data-act="rx" data-arg="rx" aria-pressed="${rx === 'rx'}">${T(W.rx)}</button><button type="button" data-act="rx" data-arg="scaled" aria-pressed="${rx === 'scaled'}">${T(W.scaled)}</button></span>` : ''}</div></div>`;
  }).join('');
  return { title: `${T(W.logTitle)}`, body: `<p class="m-meta">${T(CLASSES[tr].name)} · ${T(w.title)}</p>${fields}<p class="m-err" id="m-log-err" hidden>${T(W.logEmpty)}</p><button class="btn pri lg m-wide" data-act="savelog">${T(W.save)}</button>` };
}
function paySheet() {
  const m = me(), pay = S.sheet.pay, p = person(pay.who);
  let what, amt;
  if (pay.type === 'due') { const a = m.alerts.find(x => x.id === pay.id), pl = m.plans.find(x => x.who === a.who); amt = a.amount; what = planName(pl); }
  else { const pr = prod(pay.id); amt = priceFor(m, pay.who, pay.id); what = `${t(pr.name)}${pr.kind === 'plan' ? `, $${amt} ${t(W.aMonth)}` : ''}`; }
  const when = pay.type === 'due' ? esc(f().wasDue(t(m.alerts.find(x => x.id === pay.id).since))) : T(W.payToday);
  const card = irow('card', T(W.cardBrand), T(W.cardExp), `<button class="btn sm" data-act="mock">${T(W.change)}</button>`);   // pretend: Change does nothing
  return { title: esc(what), body: `<div class="m-sum"><span class="m-time">$${amt}</span><span class="m-sumd">${when}</span></div>${fam() ? `<p class="m-for"><span class="m-lab">${T(W.forWord)}</span> <b>${p.me ? T(W.me) : esc(p.name)}</b></p>` : ''}
    <div class="card m-rows m-paycard">${card}</div>
    <button class="btn pri lg m-wide" data-act="pay">${esc(f().payAmt(amt))}</button><p class="m-fine">${T(W.receiptLine)}</p>` };
}
function newsSheet() {
  const n = gym().news;
  return { title: T(n.title), body: `<p class="m-desc">${T(n.body)}</p><p class="m-fine">${T(n.when)} · ${esc(gym().name)}</p>` };
}
function sessionSheet() {
  const s = me().sessions[0], g = gym();
  return { title: `${T(s.name)} ${T(W.withWord)} ${esc(s.coach)}`, body: `<p class="m-meta">${esc(dateLine(s.day))} · ${clock(s.time)} · ${s.mins} min</p><p class="m-meta">${esc(g.name)}, ${esc(g.hood)}</p>
    <button class="btn lg m-wide" data-act="nosession">${T(W.cancelSession)}</button><p class="m-fine">${esc(f().sessionLine(s.coach))}</p>` };
}
function sheet() {
  const v = ({ class: classSheet, cancel: cancelSheet, log: logSheet, pay: paySheet, news: newsSheet, session: sessionSheet }[S.sheet.kind])();
  /* a message that belongs to this sheet (she just paid from inside it) is said here: the bar at the bottom is covered */
  const said = S.toast && S.toast.sheet ? `<p class="m-state ok m-said" role="status">${I.check}<span>${esc(S.toast.text)}</span></p>` : '';
  return `<div class="m-scrim" data-act="close"></div><div class="m-sheet" role="dialog" aria-modal="true" aria-labelledby="m-sheet-t" tabindex="-1" data-k="${S.sheet.kind}-${S.sheet.id || ''}">
    <i class="m-grab" aria-hidden="true"></i><div class="m-sh"><h2 id="m-sheet-t">${v.title}</h2><button class="m-x" data-act="close" aria-label="${T(W.close)}">${I.x}</button></div>${said}${v.body}</div>`;
}

/* ---------- the bar color: the gym's color paints the bar and its menu, nothing else ---------- */
const lum = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function frameOf(g) {
  const bg = g.frame || '#0E0E0E', L = lum(bg);
  const dark = (L + 0.05) / (lum('#111111') + 0.05) > 1.05 / (L + 0.05);     // dark words read better than white on this color
  return { bg, on: dark ? '#111111' : '#FFFFFF', on2: dark ? '#111111' : g.frame ? 'rgba(255,255,255,.84)' : '#A3A3A0', wash: dark ? 'rgba(17,17,17,.13)' : 'rgba(255,255,255,.14)' };
}

export function draw(state) {
  S = state;
  return { top: top(), body: body(), bottom: bottom(), layer: (S.menu ? menu() : '') + (S.sheet ? sheet() : ''), frame: frameOf(gym()) };
}
