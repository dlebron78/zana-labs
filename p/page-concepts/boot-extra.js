/* boot-extra.js: links.html and content.html on their own, outside the customizer.
   They show Barrio 13 CrossFit as it comes, painted in the launch style (Timetable). A small labs strip on top links the other views. */
import { GYMS } from './data.js?v=18';
import { RECIPES } from './recipes.js?v=18';
import { buildTokens } from './tokens.js?v=18';
import { drawExtra } from './extras.js?v=18';

const Q = new URLSearchParams(location.search);
const kind = document.body.dataset.kind, gym = GYMS.barrio;
const stage = document.getElementById('stage'), strip = document.getElementById('xl-top');
let lang = Q.get('lang') === 'es' ? 'es' : 'en', cur = null;
const slug = Q.get('p') || (gym.pages[0] && gym.pages[0].slug);
const addr = kind === 'links' ? `${gym.slug}.zana.fit/links` : `${gym.slug}.zana.fit/${slug}`;

function draw() {
  if (cur) cur.unwire();
  cur = drawExtra(stage, kind, gym, { lang, slug, tokens: buildTokens(RECIPES.timetable.tokens, gym.brand), hooks: { setLang: l => { lang = l; draw(); } } });
  document.title = `${cur.title} · Zana`;
  document.documentElement.lang = lang;
  const p = new URLSearchParams(); if (kind === 'content' && Q.get('p')) p.set('p', slug); if (lang === 'es') p.set('lang', 'es');
  history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
}
strip.innerHTML = `<a class="xl-b" href="./?r=timetable&amp;launch=1"><b>Zana</b> <span>page framework</span></a>
  <span class="xl-addr" title="The address this view would have">${addr}</span>
  <nav><a href="./?r=timetable&amp;launch=1">Page</a><a href="links.html"${kind === 'links' ? ' aria-current="page"' : ''}>Links list</a><a href="content.html?p=${slug}"${kind === 'content' ? ' aria-current="page"' : ''}>Content page</a><a href="settings.html">Customizer</a><a href="spec.html">How it works</a></nav>`;
draw();
