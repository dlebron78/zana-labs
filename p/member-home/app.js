/* Member home: the clicks. Everything is pretend: no server, no payments, no messages.
   The link keeps the sample member, the layout and the language: ?m=marta&nav=book&lang=es */

import { b, MEMBERS, GYMS, WORKOUTS, W, F } from './data.js?v=2';
import { draw, bind, findClass, costOf, priceFor, bid, firstDay, whenToast } from './views.js?v=2';
import { PATTERNS, CORE, NOTES, OWNER } from './notes.js?v=2';

const $ = id => document.getElementById(id);
const clone = x => JSON.parse(JSON.stringify(x));
const Q = new URLSearchParams(location.search);
const fresh = () => ({ screen: 'home', day: 0, who: null, all: false, open: undefined, menu: false, sheet: null, toast: null });

const S = {
  m: Object.hasOwn(MEMBERS, Q.get('m') || '') ? Q.get('m') : 'marta',
  nav: Object.hasOwn(PATTERNS, Q.get('nav') || '') ? Q.get('nav') : 'book',
  lang: Q.get('lang') === 'es' ? 'es' : 'en',
  db: clone(MEMBERS),              // each sample member's things; taps change this copy only
  ...fresh(),
};
bind(S);

const phone = $('mh-phone'), topEl = $('mh-top'), scroll = $('mh-scroll'), bottomEl = $('mh-bottom'), layer = $('mh-layer'), notes = $('mh-notes');
const me = () => S.db[S.m];
const f = () => F[S.lang];
const t = x => (typeof x === 'object' ? (x[S.lang] ?? x.en) : x);

let undoFn = null, toastTimer = 0, lastKey = '', opener = null;

/* A short message at the bottom, with Undo when the tap can be taken back. Payments never get an Undo. */
function toast(text, undo) {
  S.toast = { text, undo: !!undo };
  undoFn = undo || null;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {      // remove it quietly: a full redraw here could wipe a score she is typing
    S.toast = null; undoFn = null;
    phone.querySelectorAll('.m-toast, .m-said').forEach(el => el.remove());
  }, 8000);
}
function clearToast() { S.toast = null; undoFn = null; clearTimeout(toastTimer); }

/* ---------- the notes beside the phone ---------- */
function notesHtml() {
  const n = NOTES[S.m], p = PATTERNS[S.nav], x = n[S.nav];
  return `<div class="n-top"><button type="button" class="n-btn" data-do="notes">Close notes</button><button type="button" class="n-btn" data-do="reset">Start over</button><a href="spec.html">The plan</a></div>
    <p class="n-pat"><b>${p.name}</b><span>${p.tag}</span></p>
    <p class="n-line">${p.line}</p>
    <h2>${n.title}</h2>
    <p>${n.who}</p>
    <h3>Try it</h3>
    <ol>${x.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    <h3>${S.nav === 'book' ? 'Where it is weak' : 'What breaks'}</h3>
    <p class="n-weak">${x.weak}</p>
    <h3>Daniel's list, in this layout</h3>
    <div class="n-core">${CORE[S.nav].map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}</div>
    <h3>What the owner sets up</h3>
    <p>${OWNER[me().gym]}</p>
    <p class="n-more"><a href="spec.html">Read the plan in plain words</a>. It weighs the three layouts, lists everything a member could need with its card, and says what is not carded yet.</p>
    <p class="n-fine">Everything here is pretend. Tablado, Repecho and the people are made up. Nothing is charged or sent.</p>`;
}

/* ---------- draw ---------- */
const keyOf = el => (el && el.dataset && el.dataset.act ? Object.entries(el.dataset).map(([k, v]) => `[data-${k}="${v}"]`).join('') : null);

function render() {
  const active = document.activeElement;
  const key = phone.contains(active) ? keyOf(active) : null, hadSheet = !!layer.querySelector('.m-sheet');
  const v = draw(S);
  phone.lang = S.lang;
  phone.style.setProperty('--f', v.frame.bg);
  phone.style.setProperty('--onf', v.frame.on);
  phone.style.setProperty('--onf2', v.frame.on2);
  phone.style.setProperty('--wash', v.frame.wash);
  topEl.innerHTML = v.top;
  const sk = `${S.m}/${S.nav}/${S.screen}`, y = scroll.scrollTop;
  scroll.innerHTML = v.body;
  scroll.scrollTop = sk === lastKey ? y : 0;      // a new screen starts at its top, a redraw of the same one stays put
  lastKey = sk;
  bottomEl.innerHTML = v.bottom;
  layer.innerHTML = v.layer;
  notes.innerHTML = notesHtml();
  document.querySelectorAll('[data-set]').forEach(el => {
    const [k, val] = el.dataset.set.split(':');
    el.setAttribute('aria-pressed', String(S[k] === val));
  });
  /* keep the keyboard where it was: into a sheet when one opens, back to its button when it closes */
  const sheetEl = layer.querySelector('.m-sheet');
  let target = null;
  if (sheetEl && !hadSheet) target = sheetEl;
  else if (!sheetEl && hadSheet && opener) { target = phone.querySelector(opener); opener = null; }
  else if (key) target = phone.querySelector(key);
  if (target) target.focus({ preventScroll: true });
  try { history.replaceState(null, '', `?m=${S.m}&nav=${S.nav}${S.lang === 'es' ? '&lang=es' : ''}`); } catch (e) { /* a preview frame may refuse; the page still works */ }
}

/* ---------- what a tap does ---------- */
const packOf = (m, who) => m.plans.find(p => p.who === who && p.kind === 'pack');

function drop(m, x) {                    // take a booking back, and give the class back to the pack it came from
  m.bookings = m.bookings.filter(y => y !== x);
  const pl = x.pack && packOf(m, x.who);
  if (pl) pl.left += 1;
}
function doBook(who, id) {
  const m = me(), c = findClass(id), cost = costOf(m, who);
  const x = { who, day: c.day, time: c.time, cls: c.cls };
  if (cost.kind === 'pack') { cost.plan.left -= 1; x.pack = true; }      // assumed: a booking holds one class from the pack
  m.bookings.push(x);
  S.sheet = null;
  const last = x.pack && cost.plan.left === 0;
  toast(f().toastBooked(whenToast(c.day, c.time)) + (last ? f().toastLast(GYMS[m.gym].unit) : ''), () => drop(m, x));
}

const ACT = {
  go(a) {
    S.screen = a.arg; S.menu = false; S.sheet = null;
    S.open = undefined;                    // each screen opens the workout it would open by itself
    if (a.arg === 'schedule') {            // the schedule opens on the first day that has one of her classes
      S.who = a.who || me().people[0].id;      // always opens on herself, unless she came from a child's card
      S.all = false;
      S.day = firstDay(S.who);
    }
  },
  menu() { S.menu = !S.menu; },
  close() { S.sheet = null; S.menu = false; },
  sheet(a, el) {
    const back = S.sheet && S.sheet.kind === 'class' && a.kind === 'pay' ? { kind: 'class', id: S.sheet.id, who: S.sheet.who } : null;
    if (!S.sheet) opener = keyOf(el);
    S.menu = false;
    S.sheet = { kind: a.kind, id: a.id, who: a.who, pay: a.pay ? { type: a.pay, id: a.id, who: a.who } : null, back };
  },
  open(a, el) { S.open = el.getAttribute('aria-expanded') === 'true' ? null : a.arg; },
  day(a) { S.day = +a.arg; },
  who(a) { S.who = a.arg; S.all = false; S.day = firstDay(S.who); },
  all() { S.all = !S.all; },
  lang(a) { S.lang = a.arg; },
  tick(a) { const m = me(); m.ticks[+a.arg] = !m.ticks[+a.arg]; },
  seen(a) {
    const m = me();
    if (a.arg === 'note') m.note.seen = true;
    else if (a.arg === 'offer') m.plans.find(p => p.who === a.who).quiet = true;      // "Not now": the offer goes back down to her plan
    else m.notices.find(n => n.id === a.arg).seen = true;
  },
  book(a) { doBook(a.who, a.id); },
  quick(a, el) {                           // one tap when it costs her nothing more; the sheet with the price when it charges
    if (costOf(me(), a.who).kind === 'pay') ACT.sheet({ kind: 'class', id: a.id, who: a.who }, el);
    else doBook(a.who, a.id);
  },
  bookpay(a) {
    const m = me(), c = findClass(a.id), amt = GYMS[m.gym].single;
    m.bookings.push({ who: a.who, day: c.day, time: c.time, cls: c.cls, paid: amt });
    m.receipts.unshift({ d: W.today, what: b('Single class', 'Clase suelta'), amt });
    S.sheet = null;
    toast(f().toastBooked(whenToast(c.day, c.time)) + f().toastCharged(amt));
  },
  wait(a) {
    const m = me(), c = findClass(a.id), x = { who: a.who, day: c.day, time: c.time, cls: c.cls, wait: true };
    m.bookings.push(x);
    S.sheet = null;
    toast(f().toastWait(), () => drop(m, x));
  },
  cancel(a) {
    const m = me(), x = m.bookings.find(y => y.who === a.who && bid(y) === a.id);
    if (!x) return false;
    drop(m, x);
    S.sheet = null;
    toast(x.wait ? f().toastLeft() : f().toastCancelled(), () => {
      m.bookings.push(x);
      const pl = x.pack && packOf(m, x.who);
      if (pl) pl.left -= 1;
    });
    return true;
  },
  pay() {
    const m = me(), g = GYMS[m.gym], p = S.sheet.pay, back = S.sheet.back;
    if (p.type === 'due') {
      const a = m.alerts.find(x => x.id === p.id), pl = m.plans.find(x => x.who === a.who);
      m.alerts = m.alerts.filter(x => x !== a);
      pl.due = false;
      m.receipts.unshift({ d: W.today, what: pl.name, amt: a.amount });
      toast(f().toastPaid(a.amount));
    } else {
      const pr = g.products.find(x => x.id === p.id), amt = priceFor(m, p.who, p.id);     // read the price before the plan changes
      const i = m.plans.findIndex(x => x.who === p.who), old = i >= 0 ? m.plans[i] : null;
      const next = pr.kind === 'pack'
        ? { who: p.who, kind: 'pack', pid: pr.id, left: (old && old.kind === 'pack' ? old.left : 0) + pr.n, until: b('Feb 15', '15 feb') }
        : { who: p.who, kind: 'plan', pid: pr.id, renews: b('Dec 17', '17 dic') };
      if (i >= 0) m.plans[i] = next; else m.plans.unshift(next);
      m.bought = true;
      m.receipts.unshift({ d: W.today, what: pr.name, amt });
      toast(pr.kind === 'pack' ? f().toastAdded(amt, pr.n, g.unit) : f().toastPaid(amt));
    }
    S.sheet = back ? { ...back, pay: null, back: null } : null;      // bought from inside a class: back to that class, now covered
    if (back) S.toast.sheet = true;                                   // and the receipt line is said inside that sheet
  },
  savelog() {
    const m = me(), tr = S.sheet.id, w = WORKOUTS[tr], res = {};
    layer.querySelectorAll('[data-log]').forEach(inp => {
      const i = +inp.dataset.log, v = inp.value.trim(), p = w.parts[i];
      if (!v) return;
      const seg = layer.querySelector(`[data-rxfor="${i}"] [aria-pressed="true"]`);
      res[i] = { v, rx: seg ? seg.dataset.arg : 'rx', best: p.log === 'weight' && !!p.best && parseFloat(v) > p.best };   // a best is set only when beaten
    });
    if (!Object.keys(res).length) { $('m-log-err').hidden = false; return false; }
    m.results = m.results || {};
    const prev = m.results[tr];
    m.results[tr] = res;
    S.sheet = null;
    toast(f().toastSaved(), () => { if (prev) m.results[tr] = prev; else delete m.results[tr]; });
    return true;
  },
  rx(a, el) {                              // flip Rx or Scaled in place, so what she typed stays
    el.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === el)));
    return false;
  },
  nosession() {
    const m = me(), s = m.sessions[0];
    m.sessions = [];
    S.sheet = null;
    toast(f().toastSession(s.coach), () => { m.sessions = [s]; });
  },
  pause() { toast(f().toastPause(GYMS[me().gym].name)); },
  mock() { toast(t(W.mockOnly)); },
  undo() { if (undoFn) undoFn(); clearToast(); },
};

phone.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || !phone.contains(el)) return;
  const fn = ACT[el.dataset.act];
  if (fn && fn(el.dataset, el) !== false) render();
});

/* ---------- the viewer around the phone ---------- */
const body = document.body;
const DO = {
  reset() { S.db = clone(MEMBERS); Object.assign(S, fresh()); clearToast(); body.classList.remove('mh-notes-open'); syncViewer(); render(); },
  notes() { body.classList.toggle('mh-notes-open'); syncViewer(); if (body.classList.contains('mh-notes-open')) notes.scrollTop = 0; },
  switches() { body.classList.toggle('mh-min'); syncViewer(); },
};
function syncViewer() {
  const open = body.classList.contains('mh-notes-open'), min = body.classList.contains('mh-min');
  document.querySelectorAll('.vw [data-do="notes"]').forEach(el => el.setAttribute('aria-expanded', String(open)));
  document.querySelectorAll('.vw [data-do="switches"]').forEach(el => { el.textContent = min ? 'Show' : 'Hide'; el.setAttribute('aria-expanded', String(!min)); });
}
document.addEventListener('click', e => {
  const set = e.target.closest('[data-set]'), act = e.target.closest('[data-do]');
  if (set) {
    const [k, v] = set.dataset.set.split(':');
    S[k] = v;
    if (k !== 'lang') { Object.assign(S, fresh()); clearToast(); }      // a new member or layout starts on the home
    render();
  } else if (act && DO[act.dataset.do]) DO[act.dataset.do]();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (body.classList.contains('mh-notes-open')) DO.notes();
  else if (S.sheet || S.menu) { S.sheet = null; S.menu = false; render(); }
});

syncViewer();
render();
