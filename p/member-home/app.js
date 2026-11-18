/* Member home: the clicks. Everything is pretend: no server, no payments, no messages.
   The page is the app: it fills a phone screen, or the whole browser window on a laptop. The layout follows the real screen width.
   The versions sit in a small menu in the corner. The link keeps them, so a case opens directly: ?m=luis&grace=out&fx=off&lang=es
   (member= and fixes=off work too).
   Motion: sheets slide up and back down, a new screen fades in, a toast rises with a line that runs down while Undo is still possible,
   a status that just changed pops once, and a payment shows a short wait on its button. All of it stops when the device asks for less motion. */

import { b, MEMBERS, GYMS, WORKOUTS, W, F, CARDS, TEST_CARDS, DECLINES } from './data.js?v=11';
import { draw, bind, findClass, costOf, priceFor, bid, firstDay, whenToast, cancelTerms, curCard } from './views.js?v=11';
import { PATTERNS, CORE, NOTES, OWNER } from './notes.js?v=10';

const $ = id => document.getElementById(id);
const clone = x => JSON.parse(JSON.stringify(x));
const Q = new URLSearchParams(location.search);
const fresh = () => ({ screen: 'home', day: 0, wday: 0, who: null, all: false, open: undefined, menu: false, sheet: null, toast: null });

const S = {
  m: Object.hasOwn(MEMBERS, Q.get('m') || Q.get('member') || '') ? (Q.get('m') || Q.get('member')) : 'maria',
  nav: 'tabs',                                        // Daniel, Nov 17: the bottom tabs. The other layouts stay in the code, out of the menu
  fx: Q.get('fx') === 'off' || Q.get('fixes') === 'off' ? 'off' : 'on',   // review fixes 1, 3, 4 and 5
  grace: Q.get('grace') === 'out' ? 'out' : 'in',    // an overdue member: still inside the gym's grace, or past it
  lang: Q.get('lang') === 'es' ? 'es' : 'en',
  span: Q.get('span') === 'week' ? 'week' : 'day',          // the Program's Release in Zana: one day at a time (the default) or the whole week
  when: Q.get('when') === 'midnight' ? 'midnight' : 'before',   // the day before at 8:00 PM (the default) or midnight
  card: Q.get('card') === 'none' ? 'none' : 'saved',             // pretend: every member has a card saved, or nobody has one yet
  charge: Q.get('charge') === 'decline' ? 'decline' : 'ok',      // pretend: the saved cards go through, or the bank declines them
  db: clone(MEMBERS),              // each sample member's things; taps change this copy only
  ...fresh(),
};
bind(S);

/* The two pay switches in the corner menu, laid over the sample members. A card added after the switch goes through,
   unless it is the test number that declines. */
function applyPay() {
  Object.values(S.db).forEach(m => {
    if (S.card === 'none') { m.cards = []; m.card = null; }
    else if (!m.cards.length) { m.cards = CARDS[m.id].map(c => ({ ...c })); m.card = 'v'; }
    m.cards.forEach(c => { c.bad = S.charge === 'decline' || !!c.dn; });
  });
}
applyPay();

const phone = $('mh-phone'), topEl = $('mh-top'), scroll = $('mh-scroll'), bottomEl = $('mh-bottom'), layer = $('mh-layer'), notes = $('mh-notes');
const me = () => S.db[S.m];
const f = () => F[S.lang];
const t = x => (typeof x === 'object' ? (x[S.lang] ?? x.en) : x);

let undoFn = null, toastTimer = 0, lastKey = '', opener = null, lastToast = 0, busy = false;
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* A short message at the bottom, with Undo when the tap can be taken back. Payments never get an Undo. */
function toast(text, undo) {
  S.toast = { text, undo: !!undo, at: Date.now() };
  undoFn = undo || null;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {      // remove it quietly: a full redraw here could wipe a score she is typing
    S.toast = null; undoFn = null;
    document.body.classList.toggle('mh-cover', !!(S.sheet || S.menu));
    phone.querySelectorAll('.m-toast, .m-said').forEach(el => {
      if (calm()) { el.remove(); return; }
      el.classList.add('m-leave');
      setTimeout(() => el.remove(), 220);
    });
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
    <h3>${S.nav === 'tabs' ? 'Where it is weak' : 'What breaks'}</h3>
    <p class="n-weak">${x.weak}</p>
    <h3>Daniel's list, in this layout</h3>
    <div class="n-core">${CORE[S.nav].map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}</div>
    <h3>What the owner sets up</h3>
    <p>${OWNER[me().gym]}</p>
    <p class="n-more"><a href="spec.html">Read the plan in plain words</a>. It weighs the three layouts, lists everything a member could need with its card, and says what is not carded yet.</p>
    <h3>Review fixes (${S.fx === 'off' ? 'off' : 'on'})</h3>
    <ul class="n-fx">
      <li><b>1.</b> Her own things live under her initials (the Me tab), not under the gym's name.</li>
      <li><b>3.</b> Cancelling a class she paid for asks first and says what comes back. Barrio's cancel window is 2 hours, the default canon gives it when a gym turns it on. It is 4:15 PM in this mockup.</li>
      <li><b>4.</b> A parent sees "Book a class for Mateo" on Home and a big Booking for switch on Schedule.</li>
      <li><b>5.</b> A drop-in coming twice a week is offered Unlimited when it saves her money.</li>
      <li><b>2.</b> Past classes and best lifts up front: not done, later.</li>
    </ul>
    <p class="n-fine"><b>Pretend:</b> nothing is charged, booked or sent. Members can't book or pay for themselves in Zana yet. Barrio's red and logo, Repecho and the people are made up. Coach photos stand in for staff profiles, which are not built yet (PHO-402, Staff photo and profile). Class descriptions are made up too: Zana has no field for them yet (PHO-479). Paying is pretend too: no card is charged or kept. Change card, Buy more, the card form and receipts work; the card form takes the test numbers in its small print, and the corner menu can make a card decline. Directions and sign out do nothing. Workouts for the other days are made up. When they show follows the Release each Program has in Zana today (one day at a time or the whole week, the day before at 8:00 PM or midnight, Ready days only); here one switch sets it for all of Barrio's programs.</p>`;
}

/* ---------- draw ---------- */
const keyOf = el => (el && el.dataset && el.dataset.act ? Object.entries(el.dataset).map(([k, v]) => `[data-${k}="${v}"]`).join('') : null);

function render() {
  const active = document.activeElement;
  const key = phone.contains(active) ? keyOf(active) : null, hadSheet = !!layer.querySelector('.m-sheet:not(.m-leave)');
  const oldLayer = [...layer.children].filter(el => !el.classList.contains('m-leave')), oldKey = (layer.querySelector('.m-sheet:not(.m-leave)') || {}).dataset?.k;
  const v = draw(S);
  phone.lang = S.lang;
  document.body.classList.toggle('mh-cover', !!(S.sheet || S.menu || S.toast));     // the corner button steps aside for a sheet or a message
  phone.style.setProperty('--f', v.frame.bg);
  phone.style.setProperty('--onf', v.frame.on);
  phone.style.setProperty('--onf2', v.frame.on2);
  phone.style.setProperty('--wash', v.frame.wash);
  topEl.innerHTML = v.top;
  const sk = `${S.m}/${S.nav}/${S.screen}`, y = scroll.scrollTop;
  scroll.innerHTML = v.body;
  scroll.scrollTop = sk === lastKey ? y : 0;      // a new screen starts at its top, a redraw of the same one stays put
  if (sk !== lastKey && lastKey && scroll.firstElementChild) scroll.firstElementChild.classList.add('m-enter');
  lastKey = sk;
  bottomEl.innerHTML = v.bottom;
  const tEl = bottomEl.querySelector('.m-toast');
  if (tEl && +tEl.dataset.tid !== lastToast) tEl.classList.add('m-enter');
  lastToast = S.toast ? S.toast.at : 0;
  layer.innerHTML = v.layer;
  const newSheet = layer.querySelector('.m-sheet');
  if (newSheet && !hadSheet) layer.querySelectorAll('.m-scrim, .m-sheet').forEach(el => el.classList.add('m-enter'));
  else if (newSheet && oldKey && newSheet.dataset.k !== oldKey) newSheet.classList.add('m-swap');      // one sheet into the next: the content changes, the sheet stays
  if (hadSheet && !newSheet && !calm()) {        // the old sheet slides back down over the new screen, then goes
    oldLayer.filter(el => el.matches('.m-scrim, .m-sheet')).forEach(el => {
      el.classList.remove('m-enter', 'm-swap'); el.classList.add('m-leave'); el.removeAttribute('data-act'); el.setAttribute('aria-hidden', 'true'); el.inert = true;
      layer.appendChild(el);
      setTimeout(() => el.remove(), 260);
    });
  }
  S.flash = null;
  notes.innerHTML = notesHtml();
  document.querySelectorAll('[data-set]').forEach(el => {
    const [k, val] = el.dataset.set.split(':');
    el.setAttribute('aria-pressed', String(S[k] === val));
  });
  /* keep the keyboard where it was: into a sheet when one opens, back to its button when it closes */
  const sheetEl = layer.querySelector('.m-sheet:not(.m-leave)');
  let target = null;
  if (sheetEl && !hadSheet) target = sheetEl;
  else if (!sheetEl && hadSheet && opener) { target = phone.querySelector(opener); opener = null; }
  else if (key) target = phone.querySelector(key);
  if (target) target.focus({ preventScroll: true });
  try { history.replaceState(null, '', `?m=${S.m}${S.fx === 'off' ? '&fx=off' : ''}${S.grace === 'out' ? '&grace=out' : ''}${S.lang === 'es' ? '&lang=es' : ''}${S.span === 'week' ? '&span=week' : ''}${S.when === 'midnight' ? '&when=midnight' : ''}${S.card === 'none' ? '&card=none' : ''}${S.charge === 'decline' ? '&charge=decline' : ''}`); } catch (e) { /* a preview frame may refuse; the page still works */ }
}

/* ---------- the card form: read it, check it, or fill a test card ---------- */
const digits = v => String(v || '').replace(/\D/g, '');
const luhn = n => { let sum = 0; [...n].reverse().forEach((d, i) => { let x = +d; if (i % 2) { x *= 2; if (x > 9) x -= 9; } sum += x; }); return sum % 10 === 0; };
const brandOf = n => (n[0] === '4' ? 'Visa' : n[0] === '5' || n[0] === '2' ? 'Mastercard' : n[0] === '3' ? 'Amex' : n[0] === '6' ? 'Discover' : 'Card');
function readCard() {
  const v = id => (layer.querySelector(`[data-cf="${id}"]`) || {}).value || '';
  const no = digits(v('no')), [mm, yy] = v('exp').split('/').map(x => +digits(x)), cvc = digits(v('cvc')), zip = digits(v('zip'));
  const bad = !(no.length >= 15 && no.length <= 16 && luhn(no)) ? ['no', W.errNo]
    : !(mm >= 1 && mm <= 12 && yy >= 26 && !(yy === 26 && mm < 11)) ? ['exp', W.errExp]
    : !(cvc.length >= 3 && cvc.length <= 4) ? ['cvc', W.errCvc]
    : zip.length !== 5 ? ['zip', W.errZip] : null;
  layer.querySelectorAll('[data-cf]').forEach(el => el.removeAttribute('aria-invalid'));
  const err = $('cf-err');
  if (bad) {
    const el = layer.querySelector(`[data-cf="${bad[0]}"]`);
    el.setAttribute('aria-invalid', 'true'); el.focus();
    if (err) { err.textContent = t(bad[1]); err.hidden = false; }
    return null;
  }
  const save = $('cf-save'), dn = DECLINES.includes(no);
  return { id: `c${Date.now()}`, brand: brandOf(no), last4: no.slice(-4), exp: `${String(mm).padStart(2, '0')}/${String(yy).padStart(2, '0')}`, dn, bad: dn, keep: !save || save.checked };
}
const nextNo = m => Math.max(1000, ...Object.values(S.db).flatMap(x => x.receipts.map(r => r.no || 0))) + 1;
const rec = (m, card, what, amt, who) => m.receipts.unshift({ d: W.today, what, amt, no: nextNo(m), brand: card.brand, last4: card.last4, who });
const cardLabel = c => f().cardName(c.brand, c.last4);

/* ---------- what a tap does ---------- */
const packOf = (m, who) => m.plans.find(p => p.who === who && p.kind === 'pack');

function drop(m, x, back = 'pack') {     // take a booking back; give the class back to its pack, or keep what she paid as a credit
  m.bookings = m.bookings.filter(y => y !== x);
  const pl = x.pack && packOf(m, x.who);
  if (pl && back === 'pack') pl.left += 1;
  if (back === 'credit') m.credits = (m.credits || 0) + 1;
}
function doBook(who, id) {
  const m = me(), c = findClass(id), cost = costOf(m, who);
  const x = { who, day: c.day, time: c.time, cls: c.cls };
  if (cost.kind === 'pack') { cost.plan.left -= 1; x.pack = true; }      // assumed: a booking holds one class from the pack
  if (cost.kind === 'credit') { m.credits -= 1; x.credit = true; }
  m.bookings.push(x);
  S.sheet = null;
  S.flash = `${who}:${id}`;
  const last = x.pack && cost.plan.left === 0, p = m.people.find(y => y.id === who);
  const said = p && !p.me ? f().toastBookedFor(p.name, whenToast(c.day, c.time)) : f().toastBooked(whenToast(c.day, c.time));
  toast(said + (last ? f().toastLast(GYMS[m.gym].unit) : ''), () => drop(m, x, x.credit ? 'credit' : 'pack'));
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
    const cur = S.sheet;
    const back = cur && cur.kind === 'class' && a.kind === 'pay' ? { kind: 'class', id: cur.id, who: cur.who } : null;
    if (!cur) opener = keyOf(el);
    S.menu = false;
    const prev = cur && cur.kind !== a.kind && ['class', 'pay', 'packs', 'cards'].includes(cur.kind) ? cur : null;      // the arrow on top goes back to it
    S.sheet = { kind: a.kind, id: a.id, who: a.who || (cur && cur.who), pay: a.pay ? { type: a.pay, id: a.id, who: a.who } : null, back, prev };
  },
  back() { S.sheet = S.sheet && S.sheet.prev; },
  pick(a) { S.sheet.pick = a.arg; },
  usecard() {
    const m = me(), id = S.sheet.pick || (curCard() || {}).id, prev = S.sheet.prev, c = m.cards.find(x => x.id === id);
    m.card = id;
    if (prev && prev.kind === 'pay') S.sheet = { ...prev, card: id, declined: null };       // back to the payment, on this card
    else { S.sheet = null; toast(f().toastCardSet(cardLabel(c))); }
  },
  savecard() {
    const m = me(), c = readCard();
    if (!c) return false;
    delete c.keep;
    m.cards.push(c); m.card = c.id;
    const prev = S.sheet.prev, pay = prev && prev.kind === 'pay' ? prev : prev && prev.prev && prev.prev.kind === 'pay' ? prev.prev : null;
    if (pay) S.sheet = { ...pay, card: c.id, declined: null };
    else { S.sheet = null; toast(f().toastCardSet(cardLabel(c))); }
  },
  testcard(a) {
    const x = TEST_CARDS[a.arg];
    Object.entries(x).forEach(([k, v]) => { const el = layer.querySelector(`[data-cf="${k}"]`); if (el) { el.value = v; el.removeAttribute('aria-invalid'); } });
    const err = $('cf-err'); if (err) err.hidden = true;
    return false;
  },
  emailcopy() { toast(f().toastEmailed(me().email)); S.toast.sheet = true; },
  open(a, el) { S.open = el.getAttribute('aria-expanded') === 'true' ? null : a.arg; },
  day(a) { S.day = +a.arg; },
  wday(a) { S.wday = +a.arg; S.open = undefined; },
  week(a) {      // the arrows: next week opens on its Monday, this week on today
    const k = a.kind === 'wday' ? 'wday' : 'day', wk = (S[k] > 5 ? 1 : 0) + Number(a.arg);
    if (wk < 0 || wk > 1) return false;
    S[k] = wk ? 6 : 0; S.open = undefined;
  },
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
    const k = costOf(me(), a.who).kind;
    if (k === 'pay' || k === 'blocked') ACT.sheet({ kind: 'class', id: a.id, who: a.who }, el);
    else doBook(a.who, a.id);
  },
  bookpay(a) {
    const m = me(), c = findClass(a.id), amt = GYMS[m.gym].single, card = curCard();
    if (!card || card.bad) {
      S.sheet = { kind: 'pay', id: a.id, who: a.who, pay: { type: 'class', id: a.id, who: a.who }, prev: S.sheet };
      if (card) S.sheet.declined = { name: cardLabel(card), n: 1, id: card.id };       // she tapped Book and pay: the charge was tried, and the bank said no
      return true;
    }
    m.bookings.push({ who: a.who, day: c.day, time: c.time, cls: c.cls, paid: amt });
    rec(m, card, b('Single class', 'Clase suelta'), amt, a.who);
    S.sheet = null;
    S.flash = `${a.who}:${a.id}`;
    toast(f().toastBooked(whenToast(c.day, c.time)) + f().toastCharged(amt));
  },
  wait(a) {
    const m = me(), c = findClass(a.id), x = { who: a.who, day: c.day, time: c.time, cls: c.cls, wait: true };
    m.bookings.push(x);
    S.sheet = null;
    S.flash = `${a.who}:${a.id}`;
    toast(f().toastWait(), () => drop(m, x));
  },
  cancel(a) {
    const m = me(), x = m.bookings.find(y => y.who === a.who && bid(y) === a.id);
    if (!x) return false;
    const tm = x.wait ? { back: 'pack' } : cancelTerms(x);      // pack: the class returns; credit: kept for another class; none: too late
    drop(m, x, tm.back);
    S.sheet = null;
    const said = x.wait ? f().toastLeft() : tm.back === 'none' ? f().toastLate() : tm.back === 'credit' ? f().toastCredit() : f().toastCancelled();
    toast(said, () => {
      m.bookings.push(x);
      const pl = x.pack && packOf(m, x.who);
      if (pl && tm.back === 'pack') pl.left -= 1;
      if (tm.back === 'credit') m.credits -= 1;
    });
    return true;
  },
  pay() {
    const m = me(), g = GYMS[m.gym], sh = S.sheet, p = sh.pay, back = sh.back;
    const fresh = !m.cards.length, card = fresh ? readCard() : curCard();
    if (!card) return false;
    if (card.bad) {        // the bank says no: nothing is charged, she stays here
      sh.declined = { name: cardLabel(card), n: sh.declined && sh.declined.id === card.id ? sh.declined.n + 1 : 1, id: card.id };
      return true;
    }
    if (fresh && card.keep) { delete card.keep; m.cards.push(card); m.card = card.id; }      // saved for next time, so the next payment is one tap
    if (p.type === 'due') {
      const a = m.alerts.find(x => x.id === p.id), pl = m.plans.find(x => x.who === a.who);
      m.alerts = m.alerts.filter(x => x !== a);
      pl.due = false;
      rec(m, card, pl.name || g.products.find(x => x.id === pl.pid).name, a.amount, a.who);
      toast(f().toastPaid(a.amount));
    } else if (p.type === 'class') {
      const c = findClass(p.id);
      m.bookings.push({ who: p.who, day: c.day, time: c.time, cls: c.cls, paid: g.single });
      rec(m, card, b('Single class', 'Clase suelta'), g.single, p.who);
      S.flash = `${p.who}:${p.id}`;
      toast(f().toastBooked(whenToast(c.day, c.time)) + f().toastCharged(g.single));
    } else {
      const pr = g.products.find(x => x.id === p.id), amt = priceFor(m, p.who, p.id);     // read the price before the plan changes
      const i = m.plans.findIndex(x => x.who === p.who), old = i >= 0 ? m.plans[i] : null;
      const next = pr.kind === 'pack'
        ? { who: p.who, kind: 'pack', pid: pr.id, left: (old && old.kind === 'pack' ? old.left : 0) + pr.n, until: b('Feb 15', '15 feb') }
        : { who: p.who, kind: 'plan', pid: pr.id, renews: b('Dec 17', '17 dic') };
      if (i >= 0) m.plans[i] = next; else m.plans.unshift(next);
      m.bought = true;
      rec(m, card, pr.name, amt, p.who);
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

const WAIT = { pay: 900, bookpay: 900, book: 380 };      // pretend: the time a real charge or booking takes
const NOWAIT = { bookpay: () => !curCard(), pay: () => !me().cards.length && !readCard() };   // no card yet, or the form has a mistake: answer at once, nothing is charged
phone.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || !phone.contains(el) || busy) return;
  const fn = ACT[el.dataset.act];
  if (!fn) return;
  const ms = WAIT[el.dataset.act];
  if (ms && el.closest('.m-sheet') && !calm() && !(NOWAIT[el.dataset.act] && NOWAIT[el.dataset.act]())) {
    busy = true;
    el.classList.add('m-busy'); el.setAttribute('aria-busy', 'true');
    el.dataset.label = el.textContent;
    el.innerHTML = `<i class="m-spin" aria-hidden="true"></i><span>${el.dataset.act === 'book' ? t(W.booking) : t(W.paying)}</span>`;
    setTimeout(() => {
      busy = false;
      if (fn(el.dataset, el) !== false) render();
      else { el.classList.remove('m-busy'); el.removeAttribute('aria-busy'); el.textContent = el.dataset.label; }
    }, ms);
    return;
  }
  if (fn(el.dataset, el) !== false) render();
});

phone.addEventListener('input', e => {
  const el = e.target, k = el.dataset && el.dataset.cf;
  if (k === 'no') el.value = digits(el.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  if (k === 'exp') { const d = digits(el.value).slice(0, 4); el.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; }
  if (k === 'cvc' || k === 'zip') el.value = digits(el.value).slice(0, k === 'zip' ? 5 : 4);
});

/* ---------- the sample menu in the corner: not part of the app ---------- */
const body = document.body, demo = $('mh-demo'), fab = document.querySelector('.dm-fab');
const DO = {
  reset() { S.db = clone(MEMBERS); applyPay(); Object.assign(S, fresh()); clearToast(); body.classList.remove('mh-notes-open'); demo.hidden = true; syncViewer(); render(); },
  notes() { demo.hidden = true; body.classList.toggle('mh-notes-open'); syncViewer(); if (body.classList.contains('mh-notes-open')) notes.scrollTop = 0; },
  flow(arg) {      // the pay screens, one tap each: the member, the screen, and the sheet it opens on
    S.db = clone(MEMBERS); Object.assign(S, fresh()); clearToast();
    S.card = arg === 'first' ? 'none' : 'saved'; S.charge = arg === 'decline' ? 'decline' : 'ok';
    applyPay();
    const F2 = {
      pack: () => { S.m = 'carmen'; S.screen = 'plan'; S.sheet = { kind: 'packs', who: 'carmen' }; },
      first: () => { S.m = 'ines'; S.screen = 'schedule'; S.who = 'ines'; S.day = 2; S.sheet = { kind: 'class', id: '2-18:30-yo', who: 'ines' }; },
      change: () => { S.m = 'maria'; S.screen = 'plan'; S.sheet = { kind: 'cards' }; },
      decline: () => { S.m = 'luis'; S.screen = 'home'; S.sheet = { kind: 'pay', id: 'due-luis', who: 'luis', pay: { type: 'due', id: 'due-luis', who: 'luis' } }; },
      receipts: () => { S.m = 'maria'; S.screen = 'receipts'; S.sheet = { kind: 'receipt', id: String(S.db.maria.receipts[0].no) }; },
    };
    F2[arg]();
    demo.hidden = true; syncViewer(); render();
  },
  demo() { demo.hidden = !demo.hidden; syncViewer(); if (!demo.hidden) demo.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true }); else fab.focus({ preventScroll: true }); },
};
function syncViewer() {
  fab.setAttribute('aria-expanded', String(!demo.hidden));
}
document.addEventListener('click', e => {
  const set = e.target.closest('[data-set]'), act = e.target.closest('[data-do]');
  if (set) {
    const [k, v] = set.dataset.set.split(':');
    S[k] = v;
    if (k === 'card' || k === 'charge') applyPay();
    if (!['lang', 'span', 'when'].includes(k)) { Object.assign(S, fresh()); clearToast(); }      // a new member or state starts on the home; a new language or release keeps her place
    render();
  } else if (act && DO[act.dataset.do]) DO[act.dataset.do](act.dataset.arg);
  else if (!demo.hidden && !demo.contains(e.target)) { demo.hidden = true; syncViewer(); }      // a tap outside closes the menu
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (body.classList.contains('mh-notes-open')) DO.notes();
  else if (!demo.hidden) DO.demo();
  else if (S.sheet || S.menu) { S.sheet = null; S.menu = false; render(); }
});

syncViewer();
render();
