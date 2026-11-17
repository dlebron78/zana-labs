/* settings.js: the owner's settings screen for their business page. A mock: nothing is saved.
   It keeps two things: the style, and the short list of settings the owner changed on top of it.
   owner.js turns those into the settings in force, and the preview frame draws them.
   What an owner may change, and how far, is decided in owner.js. This file only draws the controls. */

import { FX } from './recipes.js?v=12';
import { OWNER_GYM, STYLES, SPACES, SIZES, OWNER_FX, TOP, LOCKED, STYLE, resolve, tokensOf, coverUse, photoCards, scaleOf } from './owner.js?v=12';

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hex = v => (/^#?[0-9a-f]{6}$/i.test((v || '').trim()) ? '#' + v.trim().replace('#', '').toUpperCase() : null);
const lum = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4))).reduce((a, c, i) => a + c * [.2126, .7152, .0722][i], 0);
const Q = new URLSearchParams(location.search);
const mqWide = window.matchMedia('(min-width: 960px)');
const gym = OWNER_GYM;

/* ---------- the words, in English and Spanish ---------- */
const T = {
  en: {
    labs: 'Labs mock: the settings screen a gym owner would use. Nothing is saved.',
    samples: 'Sample pages', spec: 'How it works', plan: 'Launch plan',
    planKey: 'Launch: in the first version. Later: in the second phase.', launch: 'Launch', later: 'Later',
    title: 'Business page settings', crumb: 'Business page', publish: 'Publish', publishToast: 'This is a mock. Nothing was saved or published.',
    vSettings: 'Settings', vPreview: 'Preview', language: 'Language',
    h1: 'Your business page',
    intro: 'The style sets the defaults. You change only what you need, each setting within limits, and you can always go back.',
    sum0: (g, s) => `${g} uses the ${s} style as it comes.`,
    sumN: (g, s, n) => `${g} uses the ${s} style with ${n} ${n === 1 ? 'change' : 'changes'}.`,
    resetAll: 'Reset all to style defaults',
    dflt: 'Style default', changed: 'Changed', reset: 'Reset to style default', on: 'On', off: 'Off', shown: 'Shown', hidden: 'Hidden',

    gStyle: ['Style', 'A style sets the whole look. Everything below starts from it.'],
    styleName: { film: 'Film', timetable: 'Timetable', calm: 'Calm', mono: 'Mono' },
    styleLine: {
      film: 'One video carries the page. Dark, wide type, the price always on screen.',
      timetable: 'The schedule is the page. Visitors can book from the first screen.',
      calm: 'Quiet, light and easy to read. Three photos and a serif headline.',
      mono: 'Black page, black and white photos, tall capitals. One color, only on buttons.',
    },
    styleSuits: {
      film: 'For a gym or club with one good short video.', timetable: 'For a class studio that lives on its timetable.',
      calm: 'For yoga, pilates, barre and wellness studios.', mono: 'For boxing, strength and conditioning gyms.',
    },
    styleKeeps: 'A style also decides light or dark, the corners, the heading typeface and the photo look. Those stay with the style, so the page always looks designed.',

    gBrand: ['Brand', 'Your color, logo and cover photo. They stay when you change style.'],
    color: 'Brand color', anyColor: 'Any color', hex: 'Hex code',
    colors: { black: 'Black', teal: 'Teal', violet: 'Violet', blue: 'Blue' },
    colorOk: 'Buttons, prices and links take this color. Zana keeps the words on top of it readable.',
    colorText: way => `Small colored text uses a slightly ${way} shade of your color, so it stays readable. Buttons keep your exact color.`,
    darker: 'darker', lighter: 'lighter',
    colorFill: 'This color is too close to the page color, so buttons use a shade that shows.',
    sampleOn: 'On your page:', sampleBook: 'Book a class',
    colorSaved: n => `Your saved color: ${n}`, colorBack: n => `Back to your saved color (${n})`,
    logo: 'Logo', logoUp: 'Upload a logo', logoSample: 'Try a sample logo', logoClear: 'Remove logo',
    logoNone: 'No logo yet, so your name is set in the typeface of the style.',
    logoTip: 'A PNG or SVG with a clear background works best.',
    logoMono: 'One color', logoMonoWhat: 'Paints the logo in the text color, so it shows on dark and light pages.',
    logoBack: 'Back to your name in type',
    local: 'Files stay on your device. This mock uploads nothing.',
    cover: 'Cover photo', coverUp: 'Upload a photo', coverPick: 'Or pick one of your photos:',
    coverDflt: 'Zana picked the first photo in your library.', coverBack: 'Back to the photo Zana picked',
    photoN: n => `Photo ${n}`, yourUpload: 'Your upload',
    coverUse: {
      fill: 'It fills the first screen.', first: 'It is the first photo of the slideshow.', beside: 'It sits beside the headline.',
      tile: 'It is the first of the three photos.', poster: 'It shows while the video loads, and for visitors who turn motion off.',
    },
    coverNone: { today: 'Not used right now: this hero shows the classes of the day instead of a photo.', slideshow: 'Not used right now: this slideshow shows one photo per class.' },

    gSpace: ['Spacing and type size', 'How much room the page has, and how big the headlines are. Both stay inside a safe range.'],
    space: 'Spacing', spaceName: { compact: 'Compact', comfortable: 'Comfortable', airy: 'Airy' },
    size: 'Headline size', sizeName: { s: 'Small', m: 'Medium', l: 'Large' },
    sizeNote: (lap, ph, top) => `Now: ${lap}\u00a0px on a laptop, ${ph}\u00a0px on a phone. Body text stays at 18\u00a0px, and headlines stay between 2.5 and ${top} times that, so the two always look like a pair.`,

    gFx: ['Effects', 'Motion on your page. Visitors who ask their phone for less motion get a still version of each one.'],
    fxSafe: 'Safe for everyone', fxExtra: 'Extra motion',
    fxName: Object.fromEntries(FX.map(f => [f.id, f.name])),
    fxWhat: {
      rise: 'Sections ease in as you reach them.', book: 'A Book button stays on screen, with a price.',
      bar: 'The menu stays on top and gets slimmer as you scroll.', lightup: 'Your pitch brightens word by word as you scroll.',
      strip: 'The offer line rolls slowly across the page.', slide: 'Class and coach cards become a row you swipe.',
      word: 'One word in the headline swaps every two seconds.',
      pinPhoto: 'A class photo holds still while the classes scroll past. The day picker stays on screen.',
      pinPlain: 'The day picker stays on screen while you scroll the schedule.',
    },
    fxNeeds: {
      lightup: 'Needs the Pitch and facts section, which is hidden.', strip: 'Needs the offer strip, which is hidden.',
      slideNone: 'Needs the Classes or Coaches section. Both are hidden.', slidePin: 'The classes are pinned, and the Coaches section is hidden.',
    },
    slidePinned: 'Classes stay pinned while Pinned section is on, so only the coach cards slide.',

    gHero: ['Hero', 'The first screen a visitor sees.'],
    heroName: { today: 'Classes of the day', photo: 'Photo', slideshow: 'Slideshow', video: 'Video' },
    heroLine: {
      film: { photo: 'Your cover photo fills the screen.', slideshow: 'Your photos fade from one to the next.' },
      timetable: { today: 'No photo. The next classes, ready to book.', photo: 'Your cover photo beside the headline.', slideshow: 'A framed photo that changes every few seconds.' },
      calm: { photo: 'Three photos beside the headline.', slideshow: 'The three photos trade places with three more.' },
      mono: { photo: 'Your cover photo fills the screen.', slideshow: 'One photo per class, with tabs to pick one.' },
      video: 'A short silent video that loops.',
    },
    videoNote: 'This mock plays a sample clip. In Zana you would upload up to 20 seconds of silent video. A still photo shows first, and the video never loads on a slow connection.',

    gSec: ['Sections', 'What shows on your page, and in what order.'],
    secTop: 'Top of the page', secMid: 'Your sections', secEnd: 'End of the page',
    sec: { menu: 'Menu bar', hero: 'Hero', offer: 'Offer strip', bookbar: 'Booking bar', statement: 'Pitch and facts', classes: 'Classes', schedule: 'Schedule', coaches: 'Coaches', first: 'First visit offer', prices: 'Prices', reviews: 'Reviews', footer: 'Location and contact' },
    secLine: {
      menu: 'Always first.', hero: 'Always under the menu. Its type is set in Hero, above.',
      offer: 'One line with your offer, near the top.', bookbar: 'Pick a class and a day, right under the hero.',
      statement: 'Zana writes it from your schedule and prices.', classes: 'From your class list.',
      schedule: 'The next seven days. Always shown: the Book button leads here.', coaches: 'From your team.',
      first: 'Your offer and three steps for a first visit.', prices: 'Always shown: the price link leads here.',
      reviews: 'Three member quotes.', footer: 'Address, hours and contact. Always last.',
    },
    orderDflt: 'Order: style default', orderWord: 'Order changed', orderReset: 'Reset order to style default',
    moveUp: n => `Move ${n} up`, moveDown: n => `Move ${n} down`, drag: n => `Drag to move ${n}. Arrow keys work too.`, showSec: n => `Show ${n}`,
    moved: (n, i, all) => `${n} is now ${i} of ${all}.`, locked: 'Always shown',
    pvTitle: 'Preview', pvNote: 'Live. Changes show at once.', phone: 'Phone', laptop: 'Laptop',
    notImage: 'That file is not a picture. Try a PNG, JPG or SVG.',
  },
  es: {
    labs: 'Maqueta de labs: la pantalla de ajustes que usaría el dueño de un gimnasio. No se guarda nada.',
    samples: 'Páginas de muestra', spec: 'Cómo funciona', plan: 'Plan de lanzamiento',
    planKey: 'Lanzamiento: en la primera versión. Después: en la segunda fase.', launch: 'Lanzamiento', later: 'Después',
    title: 'Ajustes de la página del negocio', crumb: 'Página del negocio', publish: 'Publicar', publishToast: 'Esto es una maqueta. No se guardó ni se publicó nada.',
    vSettings: 'Ajustes', vPreview: 'Vista previa', language: 'Idioma',
    h1: 'La página de tu negocio',
    intro: 'El estilo define los valores. Cambias solo lo que necesitas, cada ajuste dentro de un límite, y siempre puedes volver atrás.',
    sum0: (g, s) => `${g} usa el estilo ${s} tal como viene.`,
    sumN: (g, s, n) => `${g} usa el estilo ${s} con ${n} ${n === 1 ? 'cambio' : 'cambios'}.`,
    resetAll: 'Restablecer todo al valor del estilo',
    dflt: 'Valor del estilo', changed: 'Cambiado', reset: 'Restablecer al valor del estilo', on: 'Activado', off: 'Desactivado', shown: 'Visible', hidden: 'Oculta',

    gStyle: ['Estilo', 'El estilo define todo el aspecto. Lo demás parte de ahí.'],
    styleName: { film: 'Cine', timetable: 'Horario', calm: 'Calma', mono: 'Mono' },
    styleLine: {
      film: 'Un video lleva la página. Oscuro, letras anchas y el precio siempre a la vista.',
      timetable: 'El horario es la página. Se reserva desde la primera pantalla.',
      calm: 'Tranquilo, claro y fácil de leer. Tres fotos y un titular con serifa.',
      mono: 'Página negra, fotos en blanco y negro y mayúsculas altas. Un solo color, solo en los botones.',
    },
    styleSuits: {
      film: 'Para un gimnasio o club con un buen video corto.', timetable: 'Para un estudio que vive de su horario.',
      calm: 'Para estudios de yoga, pilates, barre y bienestar.', mono: 'Para gimnasios de boxeo, fuerza y acondicionamiento.',
    },
    styleKeeps: 'El estilo también decide si la página es clara u oscura, las esquinas, la tipografía de los títulos y el tratamiento de las fotos. Eso se queda con el estilo, para que la página siempre se vea diseñada.',

    gBrand: ['Marca', 'Tu color, tu logo y tu foto de portada. Se mantienen aunque cambies de estilo.'],
    color: 'Color de marca', anyColor: 'Otro color', hex: 'Código hex',
    colors: { black: 'Negro', teal: 'Verde azulado', violet: 'Violeta', blue: 'Azul' },
    colorOk: 'Los botones, los precios y los enlaces toman este color. Zana mantiene legible el texto que va encima.',
    colorText: way => `El texto pequeño de color usa un tono un poco más ${way} de tu color para que se pueda leer. Los botones mantienen tu color exacto.`,
    darker: 'oscuro', lighter: 'claro',
    colorFill: 'Este color se parece demasiado al fondo de la página, así que los botones usan un tono que sí se ve.',
    sampleOn: 'En tu página:', sampleBook: 'Reservar clase',
    colorSaved: n => `Tu color guardado: ${n}`, colorBack: n => `Volver a tu color guardado (${n})`,
    logo: 'Logo', logoUp: 'Subir un logo', logoSample: 'Probar un logo de muestra', logoClear: 'Quitar el logo',
    logoNone: 'Aún no hay logo, así que tu nombre va en la tipografía del estilo.',
    logoTip: 'Un PNG o SVG con fondo transparente funciona mejor.',
    logoMono: 'Un solo color', logoMonoWhat: 'Pinta el logo con el color del texto, para que se vea en páginas claras y oscuras.',
    logoBack: 'Volver a tu nombre en texto',
    local: 'Los archivos se quedan en tu dispositivo. Esta maqueta no sube nada.',
    cover: 'Foto de portada', coverUp: 'Subir una foto', coverPick: 'O elige una de tus fotos:',
    coverDflt: 'Zana eligió la primera foto de tu biblioteca.', coverBack: 'Volver a la foto que eligió Zana',
    photoN: n => `Foto ${n}`, yourUpload: 'Tu foto',
    coverUse: {
      fill: 'Llena la primera pantalla.', first: 'Es la primera de las fotos que cambian.', beside: 'Va al lado del titular.',
      tile: 'Es la primera de las tres fotos.', poster: 'Se ve mientras carga el video, y para quien desactiva el movimiento.',
    },
    coverNone: { today: 'Ahora no se usa: esta portada muestra las clases del día en lugar de una foto.', slideshow: 'Ahora no se usa: aquí se muestra una foto por clase.' },

    gSpace: ['Espaciado y tamaño de letra', 'Cuánto aire tiene la página y qué tan grandes son los titulares. Ambos se quedan dentro de un rango seguro.'],
    space: 'Espaciado', spaceName: { compact: 'Compacto', comfortable: 'Cómodo', airy: 'Amplio' },
    size: 'Tamaño de los titulares', sizeName: { s: 'Pequeño', m: 'Mediano', l: 'Grande' },
    sizeNote: (lap, ph, top) => `Ahora: ${lap}\u00a0px en una computadora y ${ph}\u00a0px en un teléfono. El texto normal se queda en 18\u00a0px y los titulares entre 2.5 y ${top} veces ese tamaño, para que siempre combinen.`,

    gFx: ['Efectos', 'Movimiento en tu página. Quien pide menos movimiento en su teléfono ve una versión fija de cada uno.'],
    fxSafe: 'Seguros para todos', fxExtra: 'Movimiento extra',
    fxName: { rise: 'Aparecer al llegar', book: 'Botón de reservar que te sigue', bar: 'Cambio de la barra de menú', lightup: 'Frase que se ilumina', strip: 'Franja de texto en movimiento', slide: 'Fila de tarjetas deslizable', word: 'Palabra que cambia', pin: 'Sección fija' },
    fxWhat: {
      rise: 'Las secciones aparecen con suavidad cuando llegas a ellas.', book: 'Un botón de reservar se queda en pantalla, con el precio.',
      bar: 'El menú se queda arriba y se hace más delgado al bajar.', lightup: 'Tu frase se ilumina palabra por palabra al bajar.',
      strip: 'La línea de la oferta cruza la página despacio.', slide: 'Las tarjetas de clases y coaches se vuelven una fila que deslizas.',
      word: 'Una palabra del titular cambia cada dos segundos.',
      pinPhoto: 'Una foto se queda fija mientras pasan las clases. El selector de días se queda en pantalla.',
      pinPlain: 'El selector de días se queda en pantalla mientras recorres el horario.',
    },
    fxNeeds: {
      lightup: 'Necesita la sección Presentación y datos, que está oculta.', strip: 'Necesita la franja de oferta, que está oculta.',
      slideNone: 'Necesita la sección Clases o Coaches. Las dos están ocultas.', slidePin: 'Las clases están fijas y la sección Coaches está oculta.',
    },
    slidePinned: 'Las clases quedan fijas mientras Sección fija está activada, así que solo se deslizan las tarjetas de coaches.',

    gHero: ['Portada', 'La primera pantalla que ve quien visita tu página.'],
    heroName: { today: 'Clases del día', photo: 'Foto', slideshow: 'Fotos que cambian', video: 'Video' },
    heroLine: {
      film: { photo: 'Tu foto de portada llena la pantalla.', slideshow: 'Tus fotos pasan de una a otra con suavidad.' },
      timetable: { today: 'Sin foto. Las próximas clases, listas para reservar.', photo: 'Tu foto de portada al lado del titular.', slideshow: 'Una foto enmarcada que cambia cada pocos segundos.' },
      calm: { photo: 'Tres fotos al lado del titular.', slideshow: 'Las tres fotos se alternan con otras tres.' },
      mono: { photo: 'Tu foto de portada llena la pantalla.', slideshow: 'Una foto por clase, con pestañas para elegir.' },
      video: 'Un video corto, sin sonido, que se repite.',
    },
    videoNote: 'Esta maqueta usa un video de muestra. En Zana subirías hasta 20 segundos de video sin sonido. Primero se ve una foto fija, y el video nunca se carga en conexiones lentas.',

    gSec: ['Secciones', 'Qué se muestra en tu página y en qué orden.'],
    secTop: 'Parte de arriba', secMid: 'Tus secciones', secEnd: 'Final de la página',
    sec: { menu: 'Barra de menú', hero: 'Portada', offer: 'Franja de oferta', bookbar: 'Barra de reserva', statement: 'Presentación y datos', classes: 'Clases', schedule: 'Horario', coaches: 'Coaches', first: 'Oferta de primera visita', prices: 'Precios', reviews: 'Reseñas', footer: 'Ubicación y contacto' },
    secLine: {
      menu: 'Siempre va primero.', hero: 'Siempre debajo del menú. Su tipo se elige en Portada, arriba.',
      offer: 'Una línea con tu oferta, cerca del inicio.', bookbar: 'Elige una clase y un día, justo debajo de la portada.',
      statement: 'Zana la escribe con tu horario y tus precios.', classes: 'Sale de tu lista de clases.',
      schedule: 'Los próximos siete días. Siempre visible: el botón de reservar lleva aquí.', coaches: 'Sale de tu equipo.',
      first: 'Tu oferta y tres pasos para la primera visita.', prices: 'Siempre visible: el enlace de precios lleva aquí.',
      reviews: 'Tres comentarios de miembros.', footer: 'Dirección, horario y contacto. Siempre al final.',
    },
    orderDflt: 'Orden: valor del estilo', orderWord: 'Orden cambiado', orderReset: 'Restablecer el orden del estilo',
    moveUp: n => `Subir ${n}`, moveDown: n => `Bajar ${n}`, drag: n => `Arrastra para mover ${n}. También funcionan las flechas.`, showSec: n => `Mostrar ${n}`,
    moved: (n, i, all) => `${n} ahora está en el lugar ${i} de ${all}.`, locked: 'Siempre visible',
    pvTitle: 'Vista previa', pvNote: 'En vivo. Los cambios se ven al momento.', phone: 'Teléfono', laptop: 'Computadora',
    notImage: 'Ese archivo no es una imagen. Prueba con un PNG, JPG o SVG.',
  },
};
let W = T.en;

/* What ships when, for the "launch plan" tags. Kept in step with spec.html. */
const SHIP = {
  hero: { today: 'launch', photo: 'launch', slideshow: 'later', video: 'later' },
  fx: { rise: 'launch', book: 'launch', bar: 'launch', lightup: 'launch', strip: 'later', slide: 'later', word: 'later', pin: 'later' },
  sec: { first: 'later', reviews: 'later', bookbar: 'later' },
};

/* ---------- small drawings ---------- */
const I = {
  tick: '<svg class="st-tick" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.4 2.4 4.6-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  up: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4.5 11L9 6.5l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4.5 7L9 11.5 13.5 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  grip: '<svg viewBox="0 0 18 18" aria-hidden="true"><g fill="currentColor"><circle cx="6.5" cy="4.5" r="1.4"/><circle cx="11.5" cy="4.5" r="1.4"/><circle cx="6.5" cy="9" r="1.4"/><circle cx="11.5" cy="9" r="1.4"/><circle cx="6.5" cy="13.5" r="1.4"/><circle cx="11.5" cy="13.5" r="1.4"/></g></svg>',
  lock: '<svg viewBox="0 0 18 18" aria-hidden="true"><rect x="3.5" y="8" width="11" height="7.5" rx="1.8" fill="currentColor"/><path d="M6 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
};
const ico = d => `<svg viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const HERO_ICON = {
  today: ico('<path d="M4 6h14M4 11h14M4 16h9"/>'),
  photo: ico('<rect x="3" y="4" width="16" height="14" rx="2"/><circle cx="8" cy="9" r="1.4" fill="currentColor" stroke="none"/><path d="M3.5 16l4.5-4 3.5 3 2.5-2 4.5 3.5"/>'),
  slideshow: ico('<path d="M7 6V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1"/><rect x="3" y="7" width="13" height="12" rx="2"/>'),
  video: ico('<rect x="3" y="4" width="16" height="14" rx="2"/><path d="M9.5 8.2v5.6l4.6-2.8z" fill="currentColor" stroke="none"/>'),
};
/* one small picture per style. The button in each takes the brand color. */
const pic = d => `<svg viewBox="0 0 120 76" aria-hidden="true">${d}</svg>`;
const BR = 'style="fill:var(--brand)"';
const THUMB = {
  film: pic(`<rect width="120" height="76" fill="#0c0c0d"/><rect width="120" height="56" fill="#3b3b3f"/><path d="M0 56V34l26-12 22 14 20-9 52 22v7z" fill="#56565c"/><circle cx="104" cy="13" r="6.5" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M102 9.8v6.4l5.2-3.2z" fill="#fff"/><rect x="8" y="33" width="64" height="7" fill="#fff"/><rect x="8" y="44" width="42" height="7" fill="#fff"/><rect x="8" y="64" width="36" height="3" fill="#8d8d92"/><rect x="78" y="60" width="34" height="11" rx="5.5" ${BR}/>`),
  timetable: pic(`<rect width="120" height="76" fill="#f6f5f2"/><rect width="120" height="6" ${BR}/><rect x="8" y="20" width="40" height="6" rx="1" fill="#141413"/><rect x="8" y="30" width="30" height="6" rx="1" fill="#141413"/><rect x="8" y="44" width="24" height="9" rx="3" ${BR}/><rect x="58" y="14" width="54" height="55" rx="5" fill="#fff" stroke="#d6d4cd"/>${[0, 1, 2].map(i => `<circle cx="67" cy="${25 + i * 17}" r="3.5" fill="#bdbbb4"/><rect x="74" y="${22 + i * 17}" width="20" height="3" rx="1" fill="#141413"/><rect x="74" y="${27 + i * 17}" width="13" height="2.5" rx="1" fill="#8b8982"/><rect x="98" y="${22 + i * 17}" width="9" height="6" rx="2" ${BR}/>`).join('')}`),
  calm: pic(`<rect width="120" height="76" fill="#f8f4ec"/><rect x="8" y="22" width="36" height="4" rx="2" fill="#2b2622"/><rect x="8" y="30" width="27" height="4" rx="2" fill="#2b2622"/><rect x="8" y="41" width="30" height="2.5" rx="1" fill="#8f877c"/><rect x="8" y="50" width="26" height="10" rx="5" ${BR}/><rect x="54" y="12" width="18" height="52" rx="9" fill="#cdbfae"/><rect x="76" y="18" width="18" height="52" rx="9" fill="#b3a28f"/><rect x="98" y="12" width="18" height="52" rx="9" fill="#dccfbe"/>`),
  mono: pic(`<rect width="120" height="76" fill="#000"/><rect width="120" height="50" fill="#2a2a2a"/><path d="M60 50V12l60-6v44z" fill="#454545"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${8 + i * 7}" y="14" width="5" height="22" fill="#fff"/>`).join('')}<rect x="8" y="41" width="20" height="6" ${BR}/>${[0, 1, 2].map(i => `<rect x="${64 + i * 17}" y="45" width="14" height="1.5" fill="${i ? '#8a8a8a' : '#fff'}"/>`).join('')}${[0, 1, 2, 3].map(i => `<rect x="${6 + i * 30}" y="58" width="24" height="10" fill="${i % 2 ? 'none' : '#fff'}" stroke="#fff" stroke-width="1.2"/>`).join('')}`),
};
/* an invented logo, so the logo setting can be tried without a file at hand */
const SAMPLE_LOGO = {
  src: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 232 60"><circle cx="30" cy="30" r="21" fill="none" stroke="#E3A72F" stroke-width="6"/><path d="M11 33c6-6 13-6 19 0s13 6 19 0" fill="none" stroke="#0B1F3A" stroke-width="6" stroke-linecap="round"/><text x="66" y="30" font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="700" letter-spacing="3" fill="#0B1F3A">LITORAL</text><text x="67" y="48" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" letter-spacing="2.6" fill="#0B1F3A">TRAINING CLUB</text></svg>'),
  ratio: 3.87, mono: true,
};

/* ---------- what the owner has chosen ----------
   own holds only the settings changed on top of the style. Color, logo and cover photo are the owner's own, so they are kept apart. */
const state = { lang: 'en', stamp: 0, style: 'film', own: {}, brand: null, logo: null, cover: null, upload: null, view: 'settings', device: 'phone', plan: false };
const cur = () => resolve(state.style, state.own);
const brandNow = () => (state.brand || gym.brand).toUpperCase();
const coverChoices = () => [...(state.upload ? [state.upload] : []), ...gym.photos];
const SWATCHES = [[gym.brand, 0], [gym.brand2, 1], ['#111111', 'black'], ['#0E8F7E', 'teal'], ['#7A4DFF', 'violet'], ['#2447F9', 'blue']];
const swatchName = k => (typeof k === 'number' ? gym.brandNames[k][state.lang] : W.colors[k]);

function readUrl() {
  const own = state.own, list = k => (Q.get(k) || '').split(',').filter(Boolean);
  if (Q.get('lang') === 'es') state.lang = 'es';
  if (STYLES.includes(Q.get('style'))) state.style = Q.get('style');
  for (const k of ['space', 'size', 'hero']) if (Q.get(k)) own[k] = Q.get(k);
  for (const [k, v] of [['on', true], ['off', false]]) for (const f of list(k)) own.fx = { ...own.fx, [f]: v };
  for (const [k, v] of [['show', true], ['hide', false]]) for (const f of list(k)) own.show = { ...own.show, [f]: v };
  if (list('order').length) own.order = list('order');
  state.brand = hex(Q.get('c'));
  if (Q.get('logo') === 'sample' || Q.get('logo') === 'color') state.logo = { ...SAMPLE_LOGO, mono: Q.get('logo') === 'sample' };
  const n = parseInt(Q.get('cover'), 10);
  if (n > 0 && gym.photos[n]) state.cover = { src: gym.photos[n].src, pos: gym.photos[n].pos };
  if (Q.get('view') === 'preview') state.view = 'preview';
  if (Q.get('device') === 'laptop') state.device = 'laptop';
  state.plan = Q.get('plan') === '1';
}
function writeUrl() {
  const s = cur(), p = new URLSearchParams(), own = state.own;
  if (state.style !== STYLES[0]) p.set('style', state.style);
  if (state.lang === 'es') p.set('lang', 'es');
  for (const k of ['space', 'size', 'hero']) if (s.changed[k]) p.set(k, s[k]);
  const on = OWNER_FX.filter(f => s.changed.fx[f] && s.want[f]), off = OWNER_FX.filter(f => s.changed.fx[f] && !s.want[f]);
  const show = Object.keys(s.show).filter(k => s.changed.show[k] && s.show[k]), hide = Object.keys(s.show).filter(k => s.changed.show[k] && !s.show[k]);
  for (const [k, v] of [['on', on], ['off', off], ['show', show], ['hide', hide]]) if (v.length) p.set(k, v.join(','));
  if (s.changed.order) p.set('order', own.order.join(','));
  if (state.brand && state.brand !== gym.brand.toUpperCase()) p.set('c', state.brand.slice(1));
  if (state.logo && state.logo.src === SAMPLE_LOGO.src) p.set('logo', state.logo.mono ? 'sample' : 'color');
  const n = state.cover ? gym.photos.findIndex(x => x.src === state.cover.src) : -1;
  if (n > 0) p.set('cover', n);
  if (state.view === 'preview') p.set('view', 'preview');
  if (state.device === 'laptop') p.set('device', 'laptop');
  if (state.plan) p.set('plan', '1');
  for (const k of ['keys', 'frame']) if (Q.has(k)) p.set(k, Q.get(k));
  const q = p.toString().replace(/%2C/g, ',');
  history.replaceState(null, '', location.pathname + (q ? '?' + q : ''));
}

/* ---------- the pieces every group uses ---------- */
const tag = ship => (state.plan ? `<span class="st-ship st-ship--${ship}">${W[ship]}</span>` : '');
const card = (id, n, [title, help], body, ship) => `<section class="st-card" id="g-${id}" aria-labelledby="h-${id}"><header class="st-card__head"><span class="st-n" aria-hidden="true">${n}</span><div><h2 id="h-${id}">${esc(title)}${ship ? tag(ship) : ''}</h2><p>${esc(help)}</p></div></header>${body}</section>`;
const field = (label, body, ship = 'launch') => `<div class="st-field"><div class="st-field__top"><h3>${esc(label)}</h3>${tag(ship)}</div>${body}</div>`;
const seg = (key, opts, now, label) => `<div class="st-seg" role="group" aria-label="${esc(label)}">${opts.map(([v, main, sub]) => `<button type="button" data-do="${key}" data-v="${v}" data-id="${key}:${v}" aria-pressed="${v === now}"><b>${esc(main)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('')}</div>`;
const sw = (key, v, on, label, off = false) => `<button type="button" class="st-sw" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}" data-do="${key}" data-v="${v}" data-id="${key}:${v}"${off ? ' disabled' : ''}><i></i></button>`;
/* the line under a setting: it names the style's default, or offers the way back to it */
const back = (key, name, word = W.changed, label = `${W.reset} (${name})`) => `<p class="st-status is-changed"><span class="st-dot"></span>${esc(word)}. <button type="button" class="st-link" data-do="reset" data-v="${key}" data-id="reset:${key}">${esc(label)}</button></p>`;
const status = (key, changed, name) => (changed ? back(key, name) : `<p class="st-status">${esc(W.dflt)}: ${esc(name)}</p>`);

/* ---------- the six groups ---------- */
function summary(s) {
  const name = W.styleName[s.style];
  return `<div class="st-sum"><h1>${esc(W.h1)}</h1><p>${esc(W.intro)}</p>
    <p class="st-sum__now"><span>${esc(s.count ? W.sumN(gym.name, name, s.count) : W.sum0(gym.name, name))}</span>${s.count ? `<button type="button" class="st-link" data-do="resetall" data-id="resetall">${esc(W.resetAll)}</button>` : ''}</p>
    ${state.plan ? `<p class="st-key"><span class="st-ship st-ship--launch">${W.launch}</span> <span class="st-ship st-ship--later">${W.later}</span> ${esc(W.planKey)}</p>` : ''}</div>`;
}

function gStyle(s) {
  return card('style', 1, W.gStyle, `
    <div class="st-styles" style="--brand:${brandNow()}">${STYLES.map(id => `<button type="button" class="st-style" data-do="style" data-v="${id}" data-id="style:${id}" aria-pressed="${id === s.style}">
      ${THUMB[id]}<span class="st-style__t"><b>${esc(W.styleName[id])}${I.tick}</b><span>${esc(W.styleLine[id])}</span><small>${esc(W.styleSuits[id])}</small></span></button>`).join('')}</div>
    <p class="st-note">${esc(W.styleKeeps)}</p>`, 'launch');
}

/* the part of the color setting that follows the picker while it is dragged */
function colorLive(s) {
  const brand = brandNow(), v = tokensOf(s, brand).vars, saved = gym.brand.toUpperCase();
  const fill = v['--acc'].toUpperCase(), text = v['--accText'].toUpperCase();
  const note = fill !== brand ? W.colorFill : text !== brand ? W.colorText(lum(text) < lum(brand) ? W.darker : W.lighter) : W.colorOk;
  return `<div class="st-sample" style="background:${v['--bg']};color:${v['--ink']}"><span>${esc(W.sampleOn)}</span><span class="st-sample__btn" style="background:${v['--acc']};color:${v['--accInk']};box-shadow:inset 0 0 0 1.5px ${v['--accEdge']}">${esc(W.sampleBook)}</span><span class="st-sample__price" style="color:${v['--accText']}">$25</span></div>
    <p class="st-note">${esc(note)}</p>
    ${brand !== saved ? back('color', '', W.changed, W.colorBack(gym.brandNames[0][state.lang])) : `<p class="st-status">${esc(W.colorSaved(gym.brandNames[0][state.lang]))}</p>`}`;
}

function gBrand(s) {
  const brand = brandNow(), v = tokensOf(s, brand).vars, lg = state.logo, use = coverUse(s.style, s.hero);
  const cover = state.cover ? state.cover.src : gym.photos[0].src;
  const mark = !lg ? `<svg viewBox="0 0 32 32" aria-hidden="true">${gym.logo.mark}</svg><b>${esc(gym.logo.word)}</b>`
    : lg.mono ? `<span class="st-logo__pic st-logo__pic--mono" style="--logo:url('${esc(lg.src)}');aspect-ratio:${lg.ratio}"></span>` : `<img class="st-logo__pic" src="${esc(lg.src)}" alt="">`;
  return card('brand', 2, W.gBrand, `
    ${field(W.color, `
      <div class="st-swatches" role="group" aria-label="${esc(W.color)}">${SWATCHES.map(([c, k]) => `<button type="button" class="st-swatch" style="--c:${c}" data-do="c" data-v="${c}" data-id="c:${c}" aria-pressed="${c.toUpperCase() === brand}" aria-label="${esc(swatchName(k))}" title="${esc(swatchName(k))}"></button>`).join('')}</div>
      <div class="st-pick"><label><input type="color" id="st-cpick" value="${brand.toLowerCase()}" data-do="pick" data-id="pick"><span>${esc(W.anyColor)}</span></label>
        <label><span>${esc(W.hex)}</span><input type="text" id="st-chex" value="${brand}" maxlength="7" spellcheck="false" autocomplete="off" autocapitalize="characters" data-do="hex" data-id="hex"></label></div>
      <div class="st-live-c" id="st-clive">${colorLive(s)}</div>`)}
    ${field(W.logo, `
      <div class="st-logo" style="background:${v['--bg']};color:${v['--ink']}">${mark}</div>
      <div class="st-acts"><label class="st-btn st-btn--ghost st-file"><input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" data-do="logofile" aria-label="${esc(W.logoUp)}">${esc(W.logoUp)}</label>
        ${lg ? `<button type="button" class="st-link" data-do="logoclear" data-id="logoclear">${esc(W.logoClear)}</button>` : `<button type="button" class="st-link" data-do="logosample" data-id="logosample">${esc(W.logoSample)}</button>`}</div>
      ${lg ? `<div class="st-opt"><div><b>${esc(W.logoMono)}</b><small>${esc(W.logoMonoWhat)}</small></div>${sw('logomono', '1', lg.mono, W.logoMono)}</div>${back('logo', '', W.changed, W.logoBack)}`
        : `<p class="st-status">${esc(W.logoNone)} ${esc(W.logoTip)}</p>`}`)}
    ${field(W.cover, `
      <div class="st-acts"><label class="st-btn st-btn--ghost st-file"><input type="file" accept="image/*" data-do="coverfile" aria-label="${esc(W.coverUp)}">${esc(W.coverUp)}</label><span class="st-note">${esc(W.coverPick)}</span></div>
      <div class="st-thumbs" role="group" aria-label="${esc(W.cover)}">${coverChoices().map((p, i) => `<button type="button" class="st-thumb" data-do="cover" data-v="${i}" data-id="cover:${i}" aria-pressed="${p.src === cover}" aria-label="${esc(p.mine ? W.yourUpload : W.photoN(i + (state.upload ? 0 : 1)))}"><img src="${esc(p.src)}" alt="" loading="lazy"${p.pos ? ` style="object-position:${p.pos}"` : ''}></button>`).join('')}</div>
      <p class="st-note">${esc(use === 'none' ? W.coverNone[s.hero] : W.coverUse[use])}</p>
      ${state.cover ? back('cover', '', W.changed, W.coverBack) : `<p class="st-status">${esc(W.coverDflt)}</p>`}
      <p class="st-note">${esc(W.local)}</p>`)}`);
}

function gSpace(s) {
  const d = s.defaults, f = tokensOf(s).facts;
  return card('space', 3, W.gSpace, `
    ${field(W.space, seg('space', SPACES.map(k => [k, W.spaceName[k]]), s.space, W.space) + status('space', s.changed.space, W.spaceName[d.space]))}
    ${field(W.size, seg('size', SIZES.map(k => [k, W.sizeName[k], Math.round(18 * scaleOf(s.style, k)) + '\u00a0px']), s.size, W.size)
      + `<p class="st-note">${esc(W.sizeNote(f.h1Laptop, f.h1Phone, scaleOf(s.style, 'l')))}</p>` + status('size', s.changed.size, W.sizeName[d.size]))}`);
}

function gFx(s) {
  const d = s.defaults;
  const row = f => {
    const stuck = !s.can[f], name = W.fxName[f];
    const what = f === 'pin' ? W.fxWhat[photoCards(s.style) ? 'pinPhoto' : 'pinPlain'] : W.fxWhat[f];
    const why = stuck ? W.fxNeeds[f === 'slide' ? (s.show.classes ? 'slidePin' : 'slideNone') : f] : f === 'slide' && s.fx.slide && s.pinned ? W.slidePinned : '';
    return `<div class="st-fx${stuck ? ' is-off' : ''}"><div class="st-fx__t"><h4><span>${esc(name)}</span>${tag(SHIP.fx[f])}</h4><p>${esc(what)}</p>
      ${why ? `<p class="st-why">${esc(why)}</p>` : ''}${s.changed.fx[f] ? back('fx:' + f, d.fx[f] ? W.on : W.off) : ''}</div>${sw('fx', f, s.fx[f], name, stuck)}</div>`;
  };
  return card('fx', 4, W.gFx, `
    <p class="st-sub">${esc(W.fxSafe)}</p><div class="st-fxs">${OWNER_FX.slice(0, 3).map(row).join('')}</div>
    <p class="st-sub">${esc(W.fxExtra)}</p><div class="st-fxs">${OWNER_FX.slice(3).map(row).join('')}</div>`);
}

function gHero(s) {
  const line = h => (h === 'video' ? W.heroLine.video : W.heroLine[s.style][h]);
  return card('hero', 5, W.gHero, `
    <div class="st-field"><div class="st-heroes" role="group" aria-label="${esc(W.gHero[0])}">${STYLE[s.style].heroes.map(h => `<button type="button" class="st-hero" data-do="hero" data-v="${h}" data-id="hero:${h}" aria-pressed="${h === s.hero}">${HERO_ICON[h]}<span><b>${esc(W.heroName[h])}</b><small>${esc(line(h))}</small></span>${tag(SHIP.hero[h])}</button>`).join('')}</div>
    ${s.hero === 'video' ? `<p class="st-note">${esc(W.videoNote)}</p>` : ''}${status('hero', s.changed.hero, W.heroName[s.defaults.hero])}</div>`);
}

function gSec(s) {
  const d = s.defaults, n = s.order.length;
  const name = k => `<b><span>${esc(W.sec[k])}</span>${tag(SHIP.sec[k] || 'launch')}</b><small>${esc(W.secLine[k])}</small>`;
  const undo = k => (s.changed.show[k] ? back('show:' + k, d.show[k] ? W.shown : W.hidden) : '');
  const lock = `<span class="st-lock" role="img" aria-label="${esc(W.locked)}" title="${esc(W.locked)}">${I.lock}</span>`;
  const fixed = k => `<li class="st-row st-row--fixed"><div class="st-row__t">${name(k)}</div>${lock}</li>`;
  const top = k => `<li class="st-row st-row--top${s.show[k] ? '' : ' is-hidden'}"><div class="st-row__t">${name(k)}${undo(k)}</div>${sw('show', k, s.show[k], W.showSec(W.sec[k]))}</li>`;
  const row = (k, i) => `<li class="st-row${s.show[k] ? '' : ' is-hidden'}" data-key="${k}">
      <button type="button" class="st-grip" data-drag="${k}" data-id="grip:${k}" aria-label="${esc(W.drag(W.sec[k]))}">${I.grip}</button>
      <div class="st-row__t">${name(k)}${undo(k)}</div>
      <button type="button" class="st-mv" data-do="move" data-v="${k}:-1" data-id="move:${k}:-1" aria-label="${esc(W.moveUp(W.sec[k]))}"${i ? '' : ' disabled'}>${I.up}</button>
      <button type="button" class="st-mv" data-do="move" data-v="${k}:1" data-id="move:${k}:1" aria-label="${esc(W.moveDown(W.sec[k]))}"${i < n - 1 ? '' : ' disabled'}>${I.down}</button>
      ${LOCKED.includes(k) ? lock : sw('show', k, s.show[k], W.showSec(W.sec[k]))}</li>`;
  return card('sec', 6, W.gSec, `
    <p class="st-sub">${esc(W.secTop)}</p>
    <ul class="st-rows">${fixed('menu')}${fixed('hero')}${TOP.filter(k => k in s.show).map(top).join('')}</ul>
    <p class="st-sub">${esc(W.secMid)}${tag('later')}</p>
    <ol class="st-rows" id="st-order">${s.order.map(row).join('')}</ol>
    ${s.changed.order ? back('order', '', W.orderWord, W.orderReset) : `<p class="st-status">${esc(W.orderDflt)}</p>`}
    <p class="st-sub">${esc(W.secEnd)}</p>
    <ul class="st-rows">${fixed('footer')}</ul>`);
}

/* ---------- drawing the screen ---------- */
function render(focus) {
  const s = cur();
  W = T[state.lang];
  const root = document.documentElement;
  root.lang = state.lang;
  root.classList.toggle('is-preview', state.view === 'preview');
  document.title = `${W.title} · ${gym.name}`;
  $('#st-labs').innerHTML = `<p>${esc(W.labs)}</p><a href="./">${esc(W.samples)}</a><a href="spec.html">${esc(W.spec)}</a><button type="button" class="st-plan" data-do="plan" data-id="plan" aria-pressed="${state.plan}">${esc(W.plan)}</button>`;
  $('#st-top').innerHTML = `<a class="st-zana" href="./">Zana</a><p class="st-crumb"><b>${esc(gym.name)}</b><span>${esc(W.crumb)}</span></p>
    <div class="st-top__end"><div class="st-lang" role="group" aria-label="${esc(W.language)}">${['en', 'es'].map(l => `<button type="button" data-do="lang" data-v="${l}" data-id="lang:${l}" aria-pressed="${l === state.lang}" lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>
    <button type="button" class="st-btn" data-do="publish" data-id="publish">${esc(W.publish)}</button></div>`;
  $('#st-body').dataset.view = state.view;
  $('#st-settings').innerHTML = summary(s) + gStyle(s) + gBrand(s) + gSpace(s) + gFx(s) + gHero(s) + gSec(s);
  $('#st-pvbar').innerHTML = `<h2>${esc(W.pvTitle)}</h2><p>${esc(W.pvNote)}</p>${seg('device', [['phone', W.phone], ['laptop', W.laptop]], state.device, W.pvTitle)}`;
  $('#st-switch').innerHTML = [['settings', W.vSettings], ['preview', W.vPreview]].map(([v, l]) => `<button type="button" data-do="view" data-v="${v}" data-id="view:${v}" aria-pressed="${v === state.view}">${esc(l)}</button>`).join('');
  if (frame) frame.title = W.pvTitle;
  root.style.setProperty('--labs-h', $('#st-labs').offsetHeight + 'px');
  for (const sel of focus || []) { const el = sel && $(sel); if (el && !el.disabled) { el.focus({ preventScroll: true }); break; } }
  writeUrl();
}

let toastT = 0;
function toast(msg) { const el = $('#st-toast'); el.textContent = msg; el.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('is-on'), 3200); }

/* ---------- the preview frame ---------- */
let frame = null, ready = false, stale = true, fitMode = '';
const waiting = { focus: null, fromTop: false };
const shown = () => mqWide.matches || state.view === 'preview';

function mountFrame() {
  if (frame) return;
  frame = document.createElement('iframe');
  frame.title = W.pvTitle;
  frame.src = 'preview.html?v=12';
  $('#st-holder').append(frame);
  fit();
}

/* size the frame: a phone at its real width, or a 1280px laptop scaled down to fit the space */
function fit() {
  const holder = $('#st-holder'), pane = $('#st-pane');
  const mode = !mqWide.matches ? 'full' : state.device;
  holder.className = 'st-pv__holder is-' + mode;
  holder.style.cssText = '';
  if (frame) frame.style.cssText = '';
  if (mode !== 'full') {
    const W0 = pane.clientWidth, H0 = pane.clientHeight;
    let w, h, k = 1;
    if (mode === 'phone') { w = 390; h = Math.round(Math.max(420, Math.min(H0 - 20, 800))); }
    else { w = 1280; k = Math.min(1, (W0 - 2) / w); h = Math.round(Math.max(640, Math.min(900, (H0 - 2) / k))); }
    holder.style.cssText = `width:${Math.floor(w * k)}px;height:${Math.floor(h * k)}px`;
    if (frame) frame.style.cssText = `width:${w}px;height:${h}px;transform:scale(${k})`;
  }
  const changed = mode !== fitMode; fitMode = mode;
  return changed;
}

/* tell the frame the settings in force. focus: the part of the page to glide to. fromTop: start again at the top. */
function send(extra = {}) {
  if (!frame || !ready) return;
  if (!shown()) { stale = true; waiting.focus = extra.focus || waiting.focus; waiting.fromTop = waiting.fromTop || !!extra.fromTop; return; }
  const lg = state.logo, cv = state.cover;
  frame.contentWindow.postMessage({
    zana: 'settings', s: cur(), lang: state.lang, stamp: state.stamp, brand: brandNow(),
    logo: lg ? { src: lg.src, mono: lg.mono, ratio: lg.ratio } : null, cover: cv ? { src: cv.src, pos: cv.pos } : null,
    focus: extra.focus || waiting.focus || null, fromTop: !!(extra.fromTop || waiting.fromTop), redraw: !!(extra.redraw || stale),
  }, location.origin);
  stale = false; waiting.focus = null; waiting.fromTop = false;
}
/* the layout changed (a resize, the phone and laptop switch, Settings and Preview): size the frame again and have it redraw if its shape changed */
function relayout() {
  const changed = fit();
  if (shown() && (changed || stale)) requestAnimationFrame(() => send({ redraw: true }));
}

window.addEventListener('message', e => {
  if (!frame || e.origin !== location.origin || e.source !== frame.contentWindow) return;
  if (e.data && e.data.zana === 'ready') { ready = true; stale = true; send({ fromTop: true }); }
});

/* ---------- what each control does ---------- */
const FX_AT = { lightup: 'statement', strip: 'offer', word: 'top', bar: 'top' };   // where to look after switching an effect
let settingsY = 0;

function act(name, v, el) {
  const s = cur(), d = s.defaults, own = state.own;
  let focus = null, fromTop = false, keep = el && el.dataset.id ? [`[data-id="${el.dataset.id}"]`] : [];
  const set = (k, val) => { if (val === d[k]) delete own[k]; else own[k] = val; };
  const setIn = (group, k, val) => { const g = { ...own[group] }; if (val === d[group][k]) delete g[k]; else g[k] = val; own[group] = g; };
  switch (name) {
    case 'style': if (v === state.style) return; state.style = v; fromTop = true; break;
    case 'space': set('space', v); break;
    case 'size': set('size', v); focus = 'top'; break;
    case 'hero': set('hero', v); focus = 'top'; break;
    case 'fx':
      setIn('fx', v, !s.want[v]);
      focus = v === 'slide' ? (s.show.classes && !s.pinned ? 'classes' : 'coaches') : v === 'pin' ? (photoCards(s.style) && s.show.classes ? 'classes' : 'schedule') : FX_AT[v] || null;
      break;
    case 'show':
      if (!(v in s.show) || LOCKED.includes(v)) return;
      setIn('show', v, !s.show[v]);
      if (!s.show[v]) focus = v;
      break;
    case 'move': {
      const [k, dir] = v.split(':'), order = [...s.order], i = order.indexOf(k), j = i + +dir;
      if (i < 0 || j < 0 || j >= order.length) return;
      order.splice(j, 0, order.splice(i, 1)[0]);
      placeOrder(order, k); focus = k;
      keep = [`[data-id="move:${k}:${dir}"]`, `[data-id="move:${k}:${-dir}"]`];
      break;
    }
    case 'reset': {
      const [kind, k] = v.split(':');
      if (kind === 'fx' || kind === 'show') { const g = { ...own[kind] }; delete g[k]; own[kind] = g; keep = [`[data-id="${kind}:${k}"]`]; if (kind === 'show') focus = d.show[k] ? k : null; }
      else if (kind === 'color') { state.brand = null; keep = ['.st-swatch[aria-pressed="true"]']; }
      else if (kind === 'logo') { state.logo = null; focus = 'top'; keep = ['[data-id="logosample"]']; }
      else if (kind === 'cover') { state.cover = null; focus = 'top'; keep = ['.st-thumb[aria-pressed="true"]']; }
      else { delete own[kind]; keep = [kind === 'order' ? '#st-order .st-mv:not(:disabled)' : `[data-do="${kind}"][aria-pressed="true"]`]; if (kind === 'hero') focus = 'top'; }
      break;
    }
    case 'resetall': state.own = {}; fromTop = true; keep = ['.st-style[aria-pressed="true"]']; break;
    case 'c': { const h = hex(v); state.brand = h && h !== gym.brand.toUpperCase() ? h : null; break; }
    case 'cover': { const p = coverChoices()[+v]; if (!p) return; state.cover = p.src === gym.photos[0].src ? null : { src: p.src, pos: p.pos }; focus = 'top'; keep = ['.st-thumb[aria-pressed="true"]']; break; }
    case 'logosample': state.logo = { ...SAMPLE_LOGO }; focus = 'top'; keep = ['[data-id="logomono:1"]']; break;
    case 'logoclear': state.logo = null; focus = 'top'; keep = ['[data-id="logosample"]']; break;
    case 'logomono': if (!state.logo) return; state.logo = { ...state.logo, mono: !state.logo.mono }; focus = 'top'; break;
    case 'lang': if (v === state.lang) return; state.lang = v; state.stamp++; break;
    case 'device': if (v === state.device) return; state.device = v; render(keep); relayout(); return;
    case 'view':
      if (v === state.view) return;
      if (state.view === 'settings') settingsY = window.scrollY; else stale = true;       // coming back to the preview: have it draw afresh
      state.view = v; if (v === 'preview') stale = true;
      render(keep); relayout();
      if (v === 'settings') window.scrollTo({ top: settingsY, behavior: 'instant' });
      return;
    case 'plan': state.plan = !state.plan; render(keep); return;
    case 'publish': toast(W.publishToast); return;
    default: return;
  }
  render(keep);
  send({ focus, fromTop });
}

/* a new order for the seven sections. Back at the style's own order, it stops counting as a change. */
function placeOrder(order, movedKey) {
  const d = cur().defaults;
  if (order.join() === d.order.join()) delete state.own.order; else state.own.order = order;
  if (movedKey) $('#st-live').textContent = W.moved(W.sec[movedKey], order.indexOf(movedKey) + 1, order.length);
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-do]');
  if (!b || b.disabled || b.tagName === 'INPUT') return;
  act(b.dataset.do, b.dataset.v, b);
});

/* the color picker and the hex field: follow them live, and only draw the whole screen again when the owner is done */
function liveColor() {
  const s = cur(), brand = brandNow();
  $('#st-clive').innerHTML = colorLive(s);
  document.querySelectorAll('.st-swatch').forEach(b => b.setAttribute('aria-pressed', b.dataset.v.toUpperCase() === brand));
  const pick = $('#st-cpick'), text = $('#st-chex');
  if (pick && document.activeElement !== pick) pick.value = brand.toLowerCase();
  if (text && document.activeElement !== text) text.value = brand;
  $('.st-styles').style.setProperty('--brand', brand);
  const chip = $('.st-logo'), v = tokensOf(s, brand).vars;
  if (chip) { chip.style.background = v['--bg']; chip.style.color = v['--ink']; }
  send();
}
document.addEventListener('input', e => {
  const el = e.target, what = el.dataset && el.dataset.do;
  if (what !== 'pick' && what !== 'hex') return;
  const h = hex(el.value);
  if (what === 'hex') el.setAttribute('aria-invalid', String(!h));
  if (h) { state.brand = h !== gym.brand.toUpperCase() ? h : null; liveColor(); }
});
document.addEventListener('change', e => {
  const el = e.target, what = el.dataset && el.dataset.do;
  if (what === 'pick' || what === 'hex') act('c', hex(el.value) || brandNow(), el);
  if (what === 'logofile') takeFile(el.files[0], 'logo');
  if (what === 'coverfile') takeFile(el.files[0], 'cover');
});

/* a picture from the owner's device. It is read in place and never leaves the browser. */
function takeFile(file, kind) {
  if (!file) return;
  if (!/^image\//.test(file.type)) return toast(W.notImage);
  const src = URL.createObjectURL(file), img = new Image();
  img.onload = () => {
    if (kind === 'logo') state.logo = { src, ratio: +(img.naturalWidth / Math.max(1, img.naturalHeight)).toFixed(3) || 3, mono: file.type !== 'image/jpeg' };   // a JPG has no clear background, so it keeps its own colors
    else { state.upload = { src, mine: true }; state.cover = { src }; }
    render(); send({ focus: 'top' });
  };
  img.onerror = () => { URL.revokeObjectURL(src); toast(W.notImage); };
  img.src = src;
}

/* ---------- dragging a section to a new place ---------- */
document.addEventListener('pointerdown', e => {
  const grip = e.target.closest('[data-drag]');
  if (!grip || e.button > 0) return;
  const row = grip.closest('.st-row'), list = row.parentElement, rows = [...list.children];
  const from = rows.indexOf(row), box = rows.map(r => r.getBoundingClientRect());
  const step = box.length > 1 ? box[1].top - box[0].top - box[0].height + box[from].height : box[from].height;   // the dragged row's height plus the gap
  const y0 = e.clientY; let to = from;
  e.preventDefault();
  row.classList.add('is-drag'); list.classList.add('is-sorting'); document.body.classList.add('st-dragging');
  const move = ev => {
    const dy = Math.max(box[0].top - box[from].top, Math.min(box[box.length - 1].bottom - box[from].bottom, ev.clientY - y0));
    const mid = box[from].top + box[from].height / 2 + dy;
    row.style.transform = `translateY(${dy}px)`; to = from;
    rows.forEach((r, i) => {
      if (i === from) return;
      const c = box[i].top + box[i].height / 2;
      const shift = i > from && mid > c ? -step : i < from && mid < c ? step : 0;
      if (shift < 0) to = Math.max(to, i); else if (shift > 0) to = Math.min(to, i);
      r.style.transform = shift ? `translateY(${shift}px)` : '';
    });
  };
  const end = ev => {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); window.removeEventListener('keydown', esc2);
    document.body.classList.remove('st-dragging');
    const key = grip.dataset.drag, order = [...cur().order];
    if (ev && ev.type === 'pointerup' && to !== from) { order.splice(to, 0, order.splice(from, 1)[0]); placeOrder(order, key); }
    render([`[data-id="grip:${key}"]`]);
    if (ev && ev.type === 'pointerup' && to !== from) send({ focus: key });
  };
  const esc2 = ev => { if (ev.key === 'Escape') end(null); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end); window.addEventListener('keydown', esc2);
});
document.addEventListener('keydown', e => {
  const grip = e.target.closest && e.target.closest('[data-drag]');
  if (!grip || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
  e.preventDefault();
  act('move', `${grip.dataset.drag}:${e.key === 'ArrowUp' ? -1 : 1}`, grip);
  const again = $(`[data-id="grip:${grip.dataset.drag}"]`); if (again) again.focus({ preventScroll: true });
});

/* ---------- start ---------- */
readUrl();
render();
if (Q.get('frame') !== 'late') mountFrame();
let resizeT = 0;
window.addEventListener('resize', () => { cancelAnimationFrame(resizeT); resizeT = requestAnimationFrame(relayout); });
mqWide.addEventListener('change', relayout);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { document.documentElement.style.setProperty('--labs-h', $('#st-labs').offsetHeight + 'px'); relayout(); });   // the note may wrap differently once the typeface is in

/* Test aids, off unless the link asks for them (keys=1). They press the same controls a click does, so a check can be run from the keyboard.
   frame=late holds the preview back until "i" is pressed. */
if (Q.get('keys') === '1') window.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || (e.target.closest && e.target.closest('input, [data-drag]'))) return;
  const s = cur(), next = (list, v) => list[(list.indexOf(v) + 1) % list.length];
  const n = /^Digit([1-8])$/.exec(e.code);
  if (e.shiftKey && n) return act('fx', OWNER_FX[n[1] - 1]);
  const scroll = { '[': { by: -.8 }, ']': { by: .8 }, '\\': { to: 'top' } }[e.key];
  if (scroll && frame) return frame.contentWindow.postMessage({ zana: 'scroll', ...scroll }, location.origin);
  if (e.key === 'i') return mountFrame();
  if (e.key === 'g') return act(!state.logo ? 'logosample' : state.logo.mono ? 'logomono' : 'logoclear');
  const key = e.key.toLowerCase(), i = coverChoices().findIndex(p => p.src === (state.cover ? state.cover.src : gym.photos[0].src));
  const map = {
    1: ['style', 'film'], 2: ['style', 'timetable'], 3: ['style', 'calm'], 4: ['style', 'mono'],
    l: ['lang', state.lang === 'en' ? 'es' : 'en'], v: ['view', state.view === 'settings' ? 'preview' : 'settings'], d: ['device', state.device === 'phone' ? 'laptop' : 'phone'],
    s: ['space', next(SPACES, s.space)], z: ['size', next(SIZES, s.size)], h: ['hero', next(STYLE[s.style].heroes, s.hero)],
    c: ['c', next(SWATCHES.map(x => x[0].toUpperCase()), brandNow())], o: ['cover', String((i + 1) % coverChoices().length)],
    x: ['show', 'reviews'], f: ['show', 'first'], b: ['show', 'offer'], a: ['show', 'statement'], k: ['show', 'bookbar'], j: ['show', 'coaches'], q: ['show', 'classes'],
    m: ['move', s.order[3] + ':-1'], n: ['move', s.order[0] + ':1'], p: ['plan'], r: ['resetall'], 0: ['publish'],
  };
  if (map[key]) { e.preventDefault(); act(...map[key]); }
});
