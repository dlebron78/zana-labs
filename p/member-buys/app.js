/* A member buys for herself (PHO-520), built on the member home mock Daniel locked on Nov 17 (p/member-home). Everything is pretend:
   no server, no payments, no messages. What is new here: the Buy screen, the checkout with its price breakdown (IVU only when the
   business collects tax), a renewing plan that tells her it saves her card, the confirmation, the upsell's Not now, and her card on Me.
   Links: ?tax=0 (the business collects no tax), ?staff=shown (Barrio's hidden staff rate, not hidden).

   Below, the member home's own notes:
   The page is the app: it fills a phone screen, or the whole browser window on a laptop. The layout follows the real screen width.
   The versions sit in a small menu in the corner. The link keeps them, so a case opens directly: ?m=luis&grace=out&fx=off&lang=es
   (member= and fixes=off work too).
   Motion: sheets slide up and back down, a new screen fades in, a toast rises with a line that runs down while Undo is still possible,
   a status that just changed pops once, and a payment shows a short wait on its button. All of it stops when the device asks for less motion. */

import { b, MEMBERS, GYMS, WORKOUTS, W, F, CARDS, TEST_CARDS, TEST_FILL, CODES, ZIP_IN, USE_BY, RENEWS } from './data.js?v=12';
import { draw, bind, findClass, costOf, priceFor, bid, firstDay, whenToast, cancelTerms, curCard } from './views.js?v=12';

const $ = id => document.getElementById(id);
const clone = x => JSON.parse(JSON.stringify(x));
const Q = new URLSearchParams(location.search);
const fresh = () => ({ from: null, screen: 'home', day: 0, wday: 0, who: null, all: false, open: undefined, menu: false, sheet: null, toast: null });

const S = {
  m: Object.hasOwn(MEMBERS, Q.get('m') || Q.get('member') || '') ? (Q.get('m') || Q.get('member')) : 'maria',
  nav: 'tabs',                                        // Daniel, Nov 17: the bottom tabs. The other layouts stay in the code, out of the menu
  fx: Q.get('fx') === 'off' || Q.get('fixes') === 'off' ? 'off' : 'on',   // review fixes 1, 3, 4 and 5
  grace: Q.get('grace') === 'out' ? 'out' : 'in',    // an overdue member: still inside the gym's grace, or past it
  lang: Q.get('lang') === 'es' ? 'es' : 'en',
  span: Q.get('span') === 'week' ? 'week' : 'day',          // the Program's Release in Zana: one day at a time (the default) or the whole week
  when: Q.get('when') === 'midnight' ? 'midnight' : 'before',   // the day before at 8:00 PM (the default) or midnight
  card: Q.get('card') === 'none' ? 'none' : 'saved',             // pretend: every member has a card saved, or nobody has one yet
  charge: ['decline', 'funds'].includes(Q.get('charge')) ? Q.get('charge') : 'ok',      // pretend: the saved cards go through, or the bank declines them (plainly, or for not enough money)
  wallet: Q.get('wallet') === 'on' ? 'on' : 'off',               // pretend: Apple Pay and Link above the card form. Off in Zana's code today
  tax: ['0', 'off'].includes(Q.get('tax')) ? 'off' : 'on',       // the business collects tax (IVU 11.5%), or not: Settings > Tax
  staff: Q.get('staff') === 'shown' ? 'shown' : 'hidden',        // Barrio's $60 staff rate: hidden from new sales, or not
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
    m.cards.forEach(c => { c.bad = S.charge === 'decline' ? 'generic_decline' : S.charge === 'funds' ? 'insufficient_funds' : c.dn || null; });
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
  return `<div class="n-top"><button type="button" class="n-btn" data-do="notes">Close notes</button><button type="button" class="n-btn" data-do="reset">Start over</button><a href="../member-home/">Member home</a></div>
    <p class="n-pat"><b>A member buys for herself</b><span>PHO-520</span></p>
    <p class="n-line">Built on the member home Daniel locked on Nov 17. Everything is pretend: nothing is charged, saved or sent.</p>
    <h2>Daniel's rulings (PHO-480, Nov 19)</h2>
    <ul class="n-fx">
      <li><b>Pays:</b> "card form inside zana." She never leaves the app.</li>
      <li><b>Can buy:</b> "(a) Not hidden": every product not hidden from new sales. Barrio's $60 staff rate is hidden, so it isn't on Buy. The corner menu can unhide it.</li>
      <li><b>Renewing plan:</b> saves her card, and the checkout says so before she pays.</li>
      <li><b>Upsell:</b> a frequent drop-in is offered Unlimited: 6 x $20 = $120 this month, "You'd have saved $21 this month". Not now hides the offer until her next pack runs out.</li>
      <li><b>Tax:</b> the IVU shows on the breakdown only when the business collects tax. Corner menu, or <code>?tax=0</code>.</li>
    </ul>
    <h3>Try it</h3>
    <ol>
      <li>As Inés (drop-in): Home, Your plan. The Unlimited offer says what she'd have saved. Tap Switch to Unlimited: the checkout says her card stays on file for renewals. Pay, and the confirmation opens.</li>
      <li>Me, then Buy a plan or pack: everything Barrio sells, grouped. The intro shows only to someone who never bought a pack or plan.</li>
      <li>Corner menu, Checkout, first card: Stripe's card form inside the sheet, no "save" box, because a renewing plan always saves the card. The same goes for paying an overdue month (Luis).</li>
      <li>Type a test card: Declined, Not enough money, Bank asks to confirm. Nothing is charged and the form stays as she left it.</li>
      <li>As Carmen (1 class left): book a class to use it. Home asks her to buy the next pack. Not now hides it, on Home and on her plan, until her next pack runs out.</li>
      <li>As Inés, open Thursday's class on Schedule and switch to Unlimited from there: the confirmation's button books that class.</li>
      <li>Corner menu, Tax: No tax. The breakdown loses its IVU lines.</li>
    </ol>
    <h3>Not ruled, picked here (for Daniel to look at)</h3>
    <ul class="n-fx">
      <li>Prices include IVU (as Products has it), so $99 is $99. The breakdown takes the IVU out of the price; it doesn't add it on top.</li>
      <li>Not now applies to the drop-in's Unlimited offer too, read literally: it stays hidden until a pack of hers runs out. Buy still says "You'd have saved $21" on Unlimited.</li>
      <li>The Not now link also sits on the plan card's offer, and every plan card ends with Buy a plan or pack (new on the locked Home).</li>
      <li>Luis, overdue, sees Pay $99 at the top of Buy, and his Unlimited reads Payment failed.</li>
      <li>The intro (3 classes, $39) shows only until her first pack or plan. Drop-ins don't count.</li>
      <li>A drop-in bought on Buy is a class credit she books later.</li>
      <li>On Unlimited, Buy still lists packs and drop-ins (nothing is hidden from her); Unlimited itself shows Yours now.</li>
      <li>Buy is reached from Your plan on Home and from Me. It buys for herself; a parent buys for a child from the child's plan.</li>
    </ul>`;
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
  const cfNo = layer.querySelector('[data-cf="no"]'); if (cfNo) showBrand(cfNo);      // a form drawn with a number in it shows its brand
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
  try { history.replaceState(null, '', `?m=${S.m}${S.tax === 'off' ? '&tax=0' : ''}${S.staff === 'shown' ? '&staff=shown' : ''}${S.fx === 'off' ? '&fx=off' : ''}${S.grace === 'out' ? '&grace=out' : ''}${S.lang === 'es' ? '&lang=es' : ''}${S.span === 'week' ? '&span=week' : ''}${S.when === 'midnight' ? '&when=midnight' : ''}${S.card === 'none' ? '&card=none' : ''}${S.charge !== 'ok' ? `&charge=${S.charge}` : ''}${S.wallet === 'on' ? '&wallet=on' : ''}`); } catch (e) { /* a preview frame may refuse; the page still works */ }
}

/* ---------- the card form: read it, check it, or fill a test card ---------- */
const digits = v => String(v || '').replace(/\D/g, '');
const luhn = n => { let sum = 0; [...n].reverse().forEach((d, i) => { let x = +d; if (i % 2) { x *= 2; if (x > 9) x -= 9; } sum += x; }); return sum % 10 === 0; };
const brandOf = n => (n[0] === '4' ? 'Visa' : n[0] === '5' || n[0] === '2' ? 'Mastercard' : n[0] === '3' ? 'Amex' : n[0] === '6' ? 'Discover' : 'Card');
/* what she typed, kept on the sheet so a decline or the bank's check gives her the form back as she left it, the way Stripe does */
function typed() {
  const v = id => (layer.querySelector(`[data-cf="${id}"]`) || {}).value || '', save = $('cf-save');
  return { no: v('no'), exp: v('exp'), cvc: v('cvc'), zip: v('zip'), cc: v('cc'), keep: !save || save.checked };
}
/* checked the way Stripe's form checks it, with Stripe's own words */
function readCard() {
  const v = id => (layer.querySelector(`[data-cf="${id}"]`) || {}).value || '';
  const no = digits(v('no')), ed = digits(v('exp')), mm = +ed.slice(0, 2), yy = +ed.slice(2, 4), cvc = digits(v('cvc')), zip = digits(v('zip')), cc = v('cc');
  const bad = no.length < 15 ? ['no', W.errNo] : !(no.length <= 16 && luhn(no)) ? ['no', W.errNoBad]
    : ed.length < 4 || !(mm >= 1 && mm <= 12) ? ['exp', W.errExp]
    : yy < 26 || (yy === 26 && mm < 11) ? ['exp', W.errExpPast]
    : cvc.length < 3 ? ['cvc', W.errCvc]
    : ZIP_IN.includes(cc) && zip.length !== 5 ? ['zip', W.errZip] : null;
  layer.querySelectorAll('[data-cf]').forEach(el => el.removeAttribute('aria-invalid'));
  const err = $('cf-err');
  if (bad) {
    const el = layer.querySelector(`[data-cf="${bad[0]}"]`);
    el.setAttribute('aria-invalid', 'true'); el.focus();
    if (err) { err.textContent = t(bad[1]); err.hidden = false; }
    return null;
  }
  const save = $('cf-save'), code = CODES[no] || null, tds = code === '3ds', dn = tds ? null : code;
  return { id: `c${Date.now()}`, brand: brandOf(no), last4: no.slice(-4), exp: `${String(mm).padStart(2, '0')}/${String(yy).padStart(2, '0')}`, country: cc, dn, bad: dn, tds, keep: !save || save.checked };
}
const showBrand = el => {      // the brand marks in the number field: all four until the number says which one
  const n = digits(el.value), br = n ? brandOf(n) : '';
  el.parentElement.querySelectorAll('[data-b]').forEach(i => { i.hidden = !!br && br !== 'Card' && i.dataset.b !== br; });
};
const nextNo = m => Math.max(1000, ...Object.values(S.db).flatMap(x => x.receipts.map(r => r.no || 0))) + 1;
const rec = (m, card, what, amt, who, pid) => { const r = { d: W.today, what, amt, no: nextNo(m), brand: card.brand, last4: card.last4, who, pid, tax: S.tax === 'on' && !!GYMS[m.gym].taxRate }; m.receipts.unshift(r); return r; };
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
  if (last && m.snooze) delete m.snooze[who];      // her pack ran out: an offer she put off with Not now can come back
  const said = p && !p.me ? f().toastBookedFor(p.name, whenToast(c.day, c.time)) : f().toastBooked(whenToast(c.day, c.time));
  toast(said + (last ? f().toastLast(GYMS[m.gym].unit) : ''), () => drop(m, x, x.credit ? 'credit' : 'pack'));
}

/* one payment that also saves the card when she ticked it: in Stripe, a PaymentIntent with setup_future_usage. Zana's desk
   saves first and charges after; this is the member's one-step version */
function finishPay(card, fresh) {
  const m = me(), g = GYMS[m.gym], p = S.sheet.pay, back = S.sheet.back;
  const kept = fresh && card.keep;
  if (kept) { ['keep', 'tds', 'bad', 'dn'].forEach(k => delete card[k]); m.cards.push(card); m.card = card.id; }      // saved for next time, so the next payment is one tap
  if (p.type === 'due') {
    const a = m.alerts.find(x => x.id === p.id), pl = m.plans.find(x => x.who === a.who);
    m.alerts = m.alerts.filter(x => x !== a);
    pl.due = false;
    rec(m, card, pl.name || g.products.find(x => x.id === pl.pid).name, a.amount, a.who);
    toast(f().toastPaid(a.amount));
  } else if (p.type === 'class') {
    const c = findClass(p.id);
    m.bookings.push({ who: p.who, day: c.day, time: c.time, cls: c.cls, paid: g.single });
    m.month = (m.month || 0) + 1;
    rec(m, card, b('Drop-in', 'Clase suelta'), g.single, p.who);
    S.flash = `${p.who}:${p.id}`;
    toast(f().toastBooked(whenToast(c.day, c.time)) + f().toastCharged(g.single));
  } else {
    const pr = g.products.find(x => x.id === p.id), amt = priceFor(m, p.who, p.id);
    if (pr.kind === 'drop') m.credits = (m.credits || 0) + 1;      // a drop-in bought ahead is a class credit she books later
    else if (pr.kind === 'pack') {
      const old = m.plans.find(x => x.who === p.who && x.kind === 'pack'), until = USE_BY[pr.days];
      if (old) Object.assign(old, { pid: pr.id, left: old.left + pr.n, until });
      else m.plans.push({ who: p.who, kind: 'pack', pid: pr.id, left: pr.n, until });
      m.bought = true;
    } else {
      m.plans = [{ who: p.who, kind: 'plan', pid: pr.id, renews: RENEWS }, ...m.plans.filter(x => !(x.who === p.who && x.kind === 'plan'))];
      m.bought = true;
    }
    const r = rec(m, card, pr.name, amt, p.who, pr.id);
    if (pr.kind === 'drop') m.month = (m.month || 0) + 1;
    S.sheet = { kind: 'done', id: String(r.no), kept: kept ? { brand: card.brand, last4: card.last4 } : null, cls: back && back.kind === 'class' ? { id: back.id, who: back.who } : null };      // the confirmation, with the receipt in it
    return true;
  }
  S.sheet = back ? { ...back, pay: null, back: null } : null;      // bought from inside a class: back to that class, now covered
  if (back) S.toast.sheet = true;                                   // and the receipt line is said inside that sheet
  if (kept && S.toast) S.toast.text += f().toastKept(cardLabel(card));
}

const ACT = {
  go(a) {
    if (a.arg === 'shop' && S.screen !== 'shop') S.from = S.screen;      // Buy's back arrow returns where she came from
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
  done() { S.sheet = null; if (S.screen === 'shop') S.screen = S.from || 'home'; },      // the confirmation's Done: back where she started buying
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
    Object.entries({ ...TEST_FILL, no: TEST_CARDS[a.arg].no }).forEach(([k, v]) => { const el = layer.querySelector(`[data-cf="${k}"]`); if (el) { el.value = v; el.removeAttribute('aria-invalid'); } });
    showBrand(layer.querySelector('[data-cf="no"]'));
    const err = $('cf-err'); if (err) err.hidden = true;
    return false;
  },
  wallet() { toast(t(W.wallet)); S.toast.sheet = true; },
  tds(a) {       // her answer on the bank's screen: confirmed, it pays; cancelled, nothing is charged
    const sh = S.sheet, card = sh.tds.card;
    sh.tds = null;
    if (a.arg === 'ok') { card.tds = false; return finishPay(card, true); }
    sh.declined = { code: '3ds', name: cardLabel(card), n: sh.declined && sh.declined.id === card.last4 ? sh.declined.n + 1 : 1, id: card.last4 };
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
    else if (a.arg === 'offer') {      // "Not now": hidden until her next pack runs out (PHO-480 question 10), for a drop-in too
      m.snooze = { ...(m.snooze || {}), [a.who]: true };
      toast(f().snoozePack());
    }
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
      if (card) S.sheet.declined = { code: card.bad, saved: true, name: cardLabel(card), n: 1, id: card.id };       // she tapped Book and pay: the charge was tried, and the bank said no
      return true;
    }
    m.bookings.push({ who: a.who, day: c.day, time: c.time, cls: c.cls, paid: amt });
    m.month = (m.month || 0) + 1;
    rec(m, card, b('Drop-in', 'Clase suelta'), amt, a.who);
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
    const m = me(), sh = S.sheet, fresh = !m.cards.length;
    if (fresh) sh.typed = typed();
    const card = fresh ? readCard() : curCard();
    if (!card) return false;
    if (card.bad) {        // the bank says no: nothing is charged, she stays here, the form as she left it
      const id = fresh ? card.last4 : card.id;
      sh.declined = { code: card.bad, saved: !fresh, name: cardLabel(card), n: sh.declined && sh.declined.id === id ? sh.declined.n + 1 : 1, id };
      return true;
    }
    if (fresh && card.tds) { sh.tds = { card }; return true; }      // a new card her bank wants confirmed first: its screen opens over the payment
    return finishPay(card, fresh);
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

const WAIT = { pay: 900, bookpay: 900, book: 380, tds: 900 };      // pretend: the time a real charge or booking takes
const NOWAIT = { bookpay: () => !curCard(), pay: () => !me().cards.length && !readCard(), tds: a => a.arg !== 'ok' };   // no card yet, or the form has a mistake: answer at once, nothing is charged
phone.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || !phone.contains(el) || busy) return;
  const fn = ACT[el.dataset.act];
  if (!fn) return;
  const ms = WAIT[el.dataset.act];
  if (ms && el.closest('.m-sheet') && !calm() && !(NOWAIT[el.dataset.act] && NOWAIT[el.dataset.act](el.dataset))) {
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
  if (k === 'exp') { const d = digits(el.value).slice(0, 4); el.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d; }
  if (k === 'cvc' || k === 'zip') el.value = digits(el.value).slice(0, k === 'zip' ? 5 : 4);
  if (k === 'no') showBrand(el);
});
phone.addEventListener('change', e => {      // the country decides whether Stripe asks a ZIP; the box decides whether the consent line shows
  const el = e.target;
  if (el.dataset && el.dataset.cf === 'cc') {
    const zip = ZIP_IN.includes(el.value), cf = el.closest('.m-cf');
    cf.dataset.zip = zip ? 'yes' : 'no';
    cf.querySelector('[data-cf="zip"]').closest('.m-cff').hidden = !zip;
  }
  if (el.id === 'cf-save') { const c = $('cf-consent'); if (c) c.hidden = !el.checked; }
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
    const pay = (who, id) => ({ kind: 'pay', id, who, pay: { type: 'product', id, who } });
    const F2 = {
      offer: () => { S.m = 'ines'; S.screen = 'home'; },
      shop: () => { S.m = 'ines'; S.from = 'home'; S.screen = 'shop'; },
      plan: () => { S.m = 'ines'; S.from = 'home'; S.screen = 'shop'; S.sheet = pay('ines', 'unl'); },
      first: () => { S.m = 'ines'; S.from = 'home'; S.screen = 'shop'; S.sheet = pay('ines', 'unl'); },
      decline: () => { S.m = 'ines'; S.from = 'home'; S.screen = 'shop'; S.sheet = { ...pay('ines', 'p10'), declined: { code: 'generic_decline', saved: true, name: cardLabel(S.db.ines.cards[0]), n: 1, id: 'v' } }; },
      done: () => { S.m = 'ines'; S.from = 'home'; S.screen = 'shop'; S.sheet = pay('ines', 'unl'); finishPay(S.db.ines.cards[0], false); },
      runout: () => { S.m = 'carmen'; S.db.carmen.plans[0].left = 0; },
      me: () => { S.m = 'maria'; S.screen = 'account'; },
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
    if (k === 'card' || k === 'charge') { S.db = clone(MEMBERS); applyPay(); }      // a new card state starts the samples over
    if (['wallet', 'tax', 'staff'].includes(k)) { render(); return; }      // a setting of the business: she stays where she is
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
