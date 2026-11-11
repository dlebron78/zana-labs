/* Zana Labs kit: every test page loads this.
   What it gives a page:
   - labs.test({...})   declares the test's question and KPIs (no KPIs, no tracking)
   - labs.track(name)   records an event; buttons with data-track="name" record themselves
   - labs.store         a pretend server: saves what the tester creates, in their own browser
   - a thin strip at the top: "Zana test · Feedback · Start over"
   Tracking goes to PostHog only when kit/config.js has a key. */
(function () {
  'use strict';
  var cfg = window.LABS_CONFIG || {};
  var L = (window.labs = {});
  var params = new URLSearchParams(location.search);
  var vMeta = document.querySelector('meta[name="labs-version"]');
  L.version = vMeta ? vMeta.content : 'v1';
  L.tester = params.get('t') || null;
  L.testName = null;
  L.kpis = [];
  var queue = [], started = Date.now();

  /* ---------- PostHog (only with a key) ---------- */
  function loadPosthog() {
    if (!cfg.posthogKey) return;
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once identify alias reset get_distinct_id getFeatureFlag isFeatureEnabled onFeatureFlags opt_out_capturing opt_in_capturing startSessionRecording stopSessionRecording".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(cfg.posthogKey, {
      api_host: cfg.posthogHost || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      session_recording: { maskAllInputs: false }
    });
    if (L.tester) window.posthog.identify(L.tester);
    /* anything recorded while tracking was off is sent now, marked as recovered */
    try { var k = 'labs:outbox', ob = JSON.parse(localStorage.getItem(k) || '[]');
      ob.forEach(function (e) { e[1].recovered = true; window.posthog.capture(e[0], e[1]); });
      if (ob.length) window.posthog.capture('recovered_backlog', { events: ob.length, test: L.testName });
      localStorage.removeItem(k); } catch (e) {}
  }

  L.track = function (name, props) {
    if (!L.testName) return; /* a page without labs.test() records nothing */
    var p = Object.assign({ test: L.testName, version: L.version, tester: L.tester, device: innerWidth < 760 ? 'phone' : 'laptop' }, props || {});
    p.at = new Date().toISOString();
    if (window.posthog && window.posthog.capture) window.posthog.capture(name, p);
    else { queue.push([name, p]); try { var k = 'labs:outbox'; var ob = JSON.parse(localStorage.getItem(k) || '[]'); ob.push([name, p]); localStorage.setItem(k, JSON.stringify(ob.slice(-500))); } catch (e) {} }
    try { console.debug('[labs]', name, p); } catch (e) {}
  };

  /* ---------- the test declaration ---------- */
  L.test = function (t) {
    if (!t || !t.name || !t.question || !t.kpis || !t.kpis.length) {
      console.warn('[labs] This page declares no KPIs, so nothing is tracked.');
      return;
    }
    L.testName = t.name; L.kpis = t.kpis; L.question = t.question;
    loadPosthog();
    L.track('opened');
  };

  /* buttons and links with data-track record themselves */
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (el) L.track(el.getAttribute('data-track'));
  }, true);
  addEventListener('pagehide', function () { L.track('left', { seconds: Math.round((Date.now() - started) / 1000) }); });

  /* ---------- the pretend server (the tester's own browser) ---------- */
  function ns() { return 'labs:' + (L.testName || 'page') + ':'; }
  L.store = {
    get: function (k, dflt) { try { var v = localStorage.getItem(ns() + k); return v == null ? dflt : JSON.parse(v); } catch (e) { return dflt; } },
    set: function (k, v) { try { localStorage.setItem(ns() + k, JSON.stringify(v)); } catch (e) {} },
    reset: function () { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(ns()) === 0) localStorage.removeItem(k); }); } catch (e) {} }
  };

  /* ---------- feel like an app on a phone ----------
     - no sideways drift or rubber-band: the page is locked to the screen width
     - no zoom-in when tapping a field (iPhones zoom into any field with text under 16px, then the page slides sideways)
     - no grey flash when tapping */
  (function appFeel() {
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp && !/maximum-scale/.test(vp.content)) vp.content += ', maximum-scale=1';
    var st = document.createElement('style');
    st.textContent = 'html,body{max-width:100%;overflow-x:hidden;overflow-x:clip;overscroll-behavior-x:none}' +
      'html{-webkit-text-size-adjust:100%;text-size-adjust:100%}' +
      '*{-webkit-tap-highlight-color:transparent}' +
      '@media (pointer:coarse){input,select,textarea{font-size:16px!important}}';
    document.head.appendChild(st);
  })();

  /* ---------- the test strip, feedback and start over ---------- */
  var css = '.labs-strip{display:flex;align-items:center;gap:14px;padding:6px max(16px,env(safe-area-inset-right,0px)) 6px max(16px,env(safe-area-inset-left,0px));background:#2A2A28;color:#D8D8D3;font:500 12px/1.3 "Geist",-apple-system,system-ui,sans-serif;position:relative;z-index:40;height:32px;box-sizing:border-box}' +
    '.labs-strip b{color:#FFF;font-weight:600}.labs-strip span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.labs-strip button{border:0;background:none;color:#FFF;font:600 12px/1 inherit;font-family:inherit;padding:6px 0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}' +
    '.labs-fb{position:fixed;inset:0;z-index:80;background:rgba(17,17,17,.38);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.labs-fb form{background:#FFF;color:#111;width:min(480px,100%);border-radius:16px;padding:22px;display:grid;gap:12px;font:15px/1.45 "Geist",-apple-system,system-ui,sans-serif;box-shadow:0 16px 40px rgba(17,17,17,.35)}' +
    '.labs-fb h2{margin:0;font-size:20px}.labs-fb label{display:grid;gap:6px;font-size:14px;color:#4A4A48}' +
    '.labs-fb textarea,.labs-fb select{font:inherit;color:#111;border:1px solid #E8E8E5;border-radius:12px;padding:10px 12px;background:#FFF}.labs-fb textarea{min-height:72px;resize:vertical}' +
    '.labs-fb .r{display:flex;gap:8px;justify-content:flex-end}.labs-fb .r button{border:0;border-radius:10px;height:40px;padding:0 16px;font:600 15px inherit;font-family:inherit;cursor:pointer;background:#F0F0ED;color:#111}.labs-fb .r .p{background:#111;color:#FFF}';
  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }
  function strip() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    var off = !cfg.posthogKey;
    var bar = el('<div class="labs-strip" role="note"'+(off?' style="background:#A8261B"':'')+'><span><b>Zana test</b> · '+(off?'TRACKING IS OFF: answers are not being saved':'your taps are recorded to improve it')+'</span><button type="button" data-labs="fb">Feedback</button><button type="button" data-labs="reset">Start over</button></div>');
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.style.setProperty('--labs-h', '32px');
    addEventListener('scroll', function () { document.documentElement.style.setProperty('--labs-h', Math.max(0, 32 - scrollY) + 'px'); }, { passive: true });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.labs === 'fb') L.feedback();
      if (b.dataset.labs === 'reset') {
        if (b.dataset.sure) { L.track('reset'); L.store.reset(); location.reload(); }
        else { b.dataset.sure = '1'; b.textContent = 'Tap again to erase'; setTimeout(function () { delete b.dataset.sure; b.textContent = 'Start over'; }, 3000); }
      }
    });
  }
  L.feedback = function () {
    var w = el('<div class="labs-fb"><form><h2>How did it go?</h2>' +
      '<label>Did you get done what you wanted?<select name="done"><option value="">Pick one</option><option>Yes, easily</option><option>Yes, but it took effort</option><option>No</option></select></label>' +
      '<label>What confused you, or slowed you down?<textarea name="confused"></textarea></label>' +
      '<label>What’s missing?<textarea name="missing"></textarea></label>' +
      '<label>Would you use this instead of how you do it today?<select name="use"><option value="">Pick one</option><option>Yes</option><option>Maybe</option><option>No</option></select></label>' +
      '<div class="r"><button type="button" data-x>Cancel</button><button class="p" type="submit">Send</button></div></form></div>');
    document.body.appendChild(w);
    w.addEventListener('click', function (e) { if (e.target === w || e.target.hasAttribute('data-x')) w.remove(); });
    w.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault(); var f = new FormData(e.target), o = {}; f.forEach(function (v, k) { o[k] = v; });
      L.track('feedback_sent', o);
      e.target.innerHTML = '<h2>Thank you</h2><p style="margin:0;color:#4A4A48">That helps a lot.</p><div class="r"><button class="p" type="button" data-x>Close</button></div>';
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', strip); else strip();
})();
