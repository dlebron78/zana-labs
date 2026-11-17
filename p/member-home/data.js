/* Member home: sample data. Everything here is made up.
   Tablado is an invented training club. Repecho is the labs' sample solo trainer (see p/page-concepts).
   Words a business would type itself (class names, workouts, news) are written in both languages so the switch reads whole. */

export const b = (en, es) => ({ en, es });

/* ---------- the calendar ----------
   Today is Tuesday, November 17, 2026. A member books herself up to 7 days ahead, so the strip runs to next Tuesday. */
export const DAYS = [
  { n: 17, wd: 2 }, { n: 18, wd: 3 }, { n: 19, wd: 4 }, { n: 20, wd: 5 },
  { n: 21, wd: 6 }, { n: 22, wd: 7 }, { n: 23, wd: 1 }, { n: 24, wd: 2 },
];
export const WD = {   // weekday names, 1 = Monday
  short: { en: ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], es: ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'] },
  long: { en: ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], es: ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] },
};

/* ---------- the two businesses ---------- */
export const GYMS = {
  tablado: {
    id: 'tablado', name: 'Tablado', mark: 'T',
    frame: null,                      // set no color, so the bar is Zana black
    classes: true,                    // runs classes a member reserves herself
    hood: 'Santurce, San Juan',
    hours: [b('Monday to Friday, 5:30 AM to 8:30 PM', 'Lunes a viernes, 5:30 a. m. a 8:30 p. m.'), b('Saturday, 7:00 AM to 12:00 PM', 'Sábado, 7:00 a. m. a 12:00 p. m.'), b('Sunday, 9:30 AM to 11:30 AM', 'Domingo, 9:30 a. m. a 11:30 a. m.')],
    email: 'hola@tablado.example',
    news: {
      title: b('No classes on Thursday the 26th', 'No hay clases el jueves 26'),
      body: b('We close for Thanksgiving. Friday the 27th we are back at 6:00 AM with the usual schedule.', 'Cerramos por Acción de Gracias. El viernes 27 volvemos a las 6:00 a. m. con el horario de siempre.'),
      when: b('Posted yesterday', 'Publicado ayer'),
    },
    single: 25,                       // the price of one class, paid one by one
    unit: 'class',
    products: [
      { id: 'p5', kind: 'pack', n: 5, price: 115, name: b('5-class pack', 'Paquete de 5 clases') },
      { id: 'p10', kind: 'pack', n: 10, price: 210, name: b('10-class pack', 'Paquete de 10 clases') },
      { id: 'unl', kind: 'plan', price: 159, name: b('Unlimited', 'Ilimitado') },
    ],
    intro: { pid: 'p5', price: 99 },  // the gym's own intro price on a first pack
  },
  repecho: {
    id: 'repecho', name: 'Repecho', mark: 'R',
    frame: '#1E8E5A',                 // Nico picked a color: it paints the bar and its menu, nothing else
    classes: false,                   // one-on-one only: the coach books the sessions
    owner: 'Nico',
    hood: 'Miramar, San Juan',
    hours: [b('Monday to Friday, 6:00 AM to 8:00 PM', 'Lunes a viernes, 6:00 a. m. a 8:00 p. m.'), b('Saturday, 8:00 AM to 12:00 PM', 'Sábado, 8:00 a. m. a 12:00 p. m.')],
    email: 'hola@repecho.example',
    news: null,
    single: 45,
    unit: 'session',
    products: [
      { id: 's8', kind: 'pack', n: 8, price: 320, name: b('8 sessions', '8 sesiones') },
      { id: 'mo', kind: 'plan', price: 420, name: b('Monthly plan', 'Plan mensual') },
    ],
    intro: null,
  },
};

/* ---------- Tablado's classes ---------- */
export const CLASSES = {
  ct: { name: b('Cross-training', 'Cross-training'), mins: 60, cap: 12, room: b('Main floor', 'Salón principal'),
    blurb: b('Strength and conditioning for every level. Each workout has a scaled option.', 'Fuerza y acondicionamiento para todos los niveles. Cada entreno trae una opción escalada.') },
  wl: { name: b('Weightlifting', 'Levantamiento'), mins: 60, cap: 8, room: b('Platforms', 'Plataformas'),
    blurb: b('Snatch and clean and jerk, with a coach on every lift.', 'Arranque y envión, con un coach en cada levantamiento.') },
  gy: { name: b('Gymnastics', 'Gimnasia'), mins: 45, cap: 8, room: b('Main floor', 'Salón principal'),
    blurb: b('Handstands, pulling strength and ring work, one step at a time.', 'Parada de manos, fuerza de jalón y anillas, paso a paso.') },
  en: { name: b('Endurance', 'Resistencia'), mins: 45, cap: 12, room: b('Track', 'Pista'),
    blurb: b('Running and rowing intervals. Come as you are.', 'Intervalos de carrera y remo. Ven como estés.') },
  yo: { name: b('Yoga flow', 'Yoga flow'), mins: 60, cap: 14, room: b('Studio', 'Estudio'),
    blurb: b('A steady flow for every level. Mats are in the studio.', 'Un flow parejo para todos los niveles. Hay mats en el estudio.') },
  te: { name: b('Teens', 'Teens'), mins: 50, cap: 10, room: b('Main floor', 'Salón principal'), minor: true,
    blurb: b('Ages 12 to 16. Movement basics, light weights and games.', 'De 12 a 16 años. Movimientos básicos, pesos livianos y juegos.') },
};
export const COACHES = { irene: 'Irene', tomas: 'Tomás', lucia: 'Lucía' };

/* The week, by weekday (1 = Monday). Each row: time, class, coach. */
const TUE = [['06:00', 'ct', 'irene'], ['09:00', 'yo', 'lucia'], ['12:00', 'ct', 'tomas'], ['17:00', 'ct', 'tomas'], ['18:00', 'ct', 'irene'], ['18:30', 'yo', 'lucia'], ['19:00', 'wl', 'tomas']];
const MON = [['06:00', 'ct', 'irene'], ['12:00', 'ct', 'tomas'], ['16:00', 'te', 'lucia'], ['17:00', 'ct', 'tomas'], ['18:00', 'ct', 'irene'], ['19:00', 'gy', 'tomas']];
export const WEEK = {
  1: MON,
  2: TUE,
  3: [['06:00', 'en', 'irene'], ['12:00', 'ct', 'tomas'], ['16:00', 'te', 'lucia'], ['17:00', 'ct', 'tomas'], ['18:00', 'ct', 'irene'], ['19:00', 'gy', 'tomas']],
  4: [['06:00', 'ct', 'irene'], ['09:00', 'yo', 'lucia'], ['12:00', 'ct', 'tomas'], ['17:00', 'ct', 'irene'], ['18:00', 'ct', 'tomas'], ['18:30', 'yo', 'lucia'], ['19:00', 'wl', 'irene']],
  5: [['06:00', 'ct', 'irene'], ['12:00', 'ct', 'tomas'], ['17:00', 'ct', 'tomas'], ['18:00', 'ct', 'irene']],
  6: [['07:00', 'en', 'irene'], ['08:00', 'ct', 'tomas'], ['09:00', 'te', 'tomas'], ['09:00', 'yo', 'lucia'], ['10:00', 'wl', 'irene']],
  7: [['10:00', 'yo', 'lucia']],
};
export const FULL = '1-18:00-ct';      // one full class (Wednesday 6:00 PM), to show the waitlist

/* ---------- today's workouts at Tablado, one per track ---------- */
export const WORKOUTS = {
  ct: { title: b('Squat day', 'Día de sentadilla'), parts: [
    { name: b('Warm-up', 'Calentamiento'), mins: 10, text: b('3 rounds: 200 m run, 10 air squats, 10 ring rows', '3 rondas: 200 m de carrera, 10 sentadillas, 10 remos en anillas') },
    { name: b('Back squat', 'Sentadilla trasera'), mins: 20, text: b('5 x 5 @ 75%', '5 x 5 @ 75%'), log: 'weight', best: 185 },
    { name: b('Conditioning', 'Acondicionamiento'), mins: 15, text: b('4 rounds for time: 400 m run, 15 kettlebell swings, 10 burpees', '4 rondas por tiempo: 400 m de carrera, 15 swings con kettlebell, 10 burpees'),
      scaled: b('3 rounds, lighter kettlebell, step-back burpees', '3 rondas, kettlebell más liviano, burpees sin salto'), log: 'time' },
  ] },
  wl: { title: b('Snatch', 'Arranque'), parts: [
    { name: b('Snatch', 'Arranque'), mins: 25, text: b('Build to a heavy single, then 4 x 2 @ 80%', 'Sube a un sencillo pesado, luego 4 x 2 @ 80%'), log: 'weight', best: 95 },
    { name: b('Snatch pulls', 'Halones de arranque'), mins: 15, text: b('4 x 3 with the weight of today\'s single', '4 x 3 con el peso del sencillo de hoy') },
  ] },
  gy: { title: b('Handstand and pull', 'Parada de manos y jalón'), parts: [
    { name: b('Handstand holds', 'Parada de manos'), mins: 15, text: b('5 x 30 seconds against the wall', '5 x 30 segundos contra la pared') },
    { name: b('Strict pull-ups', 'Dominadas estrictas'), mins: 15, text: b('5 sets, as many as you can', '5 series, las que puedas'), log: 'reps' },
  ] },
  en: { title: b('Intervals', 'Intervalos'), parts: [
    { name: b('Run', 'Carrera'), mins: 30, text: b('5 x 800 m, rest 2 minutes between each', '5 x 800 m, descansa 2 minutos entre cada una'), log: 'time' },
  ] },
};

/* ---------- the four sample members ----------
   people: who she can book and pay for. The first one is herself.
   plans: what each person holds. No plan means she pays one class at a time.
   likes: the classes she has booked before. The schedule opens on these. */
export const MEMBERS = {
  ines: {
    id: 'ines', first: 'Inés', full: 'Inés C.', ini: 'IC', email: 'ines@example.com', gym: 'tablado',
    people: [{ id: 'ines', name: 'Inés', me: true, likes: ['yo'] }],
    plans: [],
    bought: false,                    // she has never bought a pack, so the intro price is still hers
    tracks: [],
    bookings: [{ who: 'ines', day: 0, time: '18:30', cls: 'yo' }],
    usual: [{ who: 'ines', day: 2, time: '18:30', cls: 'yo' }],
    alerts: [], notices: [],
    receipts: [{ d: b('Today', 'Hoy'), what: b('Single class', 'Clase suelta'), amt: 25 }, { d: b('Nov 12', '12 nov'), what: b('Single class', 'Clase suelta'), amt: 25 }, { d: b('Nov 10', '10 nov'), what: b('Single class', 'Clase suelta'), amt: 25 }],
    waiver: b('Oct 3', '3 oct'),
  },
  marta: {
    id: 'marta', first: 'Marta', full: 'Marta D.', ini: 'MD', email: 'marta@example.com', gym: 'tablado',
    people: [{ id: 'marta', name: 'Marta', me: true, likes: ['ct', 'wl', 'gy', 'en'] }],
    plans: [{ who: 'marta', kind: 'plan', pid: 'unl', renews: b('Dec 1', '1 dic') }],
    bought: true,
    tracks: ['ct', 'wl', 'gy', 'en'],   // the four tracks her plan covers
    bookings: [{ who: 'marta', day: 0, time: '18:00', cls: 'ct' }, { who: 'marta', day: 2, time: '18:00', cls: 'ct' }],
    usual: [],
    alerts: [],
    notices: [{ id: 'coach', title: b('Coach change on Thursday', 'Cambio de coach el jueves'), body: b('Tomás leads your 6:00 PM class. Irene is back on Friday.', 'Tomás da tu clase de las 6:00 p. m. Irene vuelve el viernes.') }],
    results: {},
    history: [
      { d: b('Mon', 'lun'), what: b('Cross-training', 'Cross-training'), res: b('14:02 · Rx', '14:02 · Rx') },
      { d: b('Sat', 'sáb'), what: b('Weightlifting', 'Levantamiento'), res: b('Snatch 95 lb', 'Arranque 95 lb') },
      { d: b('Fri', 'vie'), what: b('Cross-training', 'Cross-training'), res: b('6 rounds + 4 · Scaled', '6 rondas + 4 · Escalado') },
    ],
    bests: [{ what: b('Back squat', 'Sentadilla trasera'), res: '185 lb', d: b('Oct 30', '30 oct') }, { what: b('Snatch', 'Arranque'), res: '95 lb', d: b('Nov 14', '14 nov') }],
    receipts: [{ d: b('Nov 1', '1 nov'), what: b('Unlimited', 'Ilimitado'), amt: 159 }, { d: b('Oct 1', '1 oct'), what: b('Unlimited', 'Ilimitado'), amt: 159 }],
    waiver: b('Mar 8', '8 mar'),
  },
  rafa: {
    id: 'rafa', first: 'Rafa', full: 'Rafa N.', ini: 'RN', email: 'rafa@example.com', gym: 'repecho',
    people: [{ id: 'rafa', name: 'Rafa', me: true, likes: [] }],
    plans: [{ who: 'rafa', kind: 'pack', pid: 's8', left: 2, until: b('Jan 4', '4 ene') }],
    bought: true,
    tracks: [],
    bookings: [], usual: [], alerts: [], notices: [],
    sessions: [{ day: 2, time: '07:00', mins: 60, name: b('One-on-one', 'Uno a uno'), coach: 'Nico' }],
    note: { from: 'Nico', about: b('On Monday\'s workout', 'Sobre el entreno del lunes'), text: b('Good depth on the squats. Add 5 lb on Thursday.', 'Buena profundidad en las sentadillas. Súbele 5 lb el jueves.') },
    program: {
      name: b('Strength base', 'Base de fuerza'), week: 3, of: 8, day: b('Day 2', 'Día 2'),
      parts: [
        { name: b('Goblet squat', 'Sentadilla goblet'), text: b('4 x 10 with 35 lb', '4 x 10 con 35 lb') },
        { name: b('Push-ups', 'Flexiones'), text: b('4 x 8, slow on the way down', '4 x 8, lento al bajar') },
        { name: b('Farmer carry', 'Caminata de granjero'), text: b('4 x 40 m with 40 lb in each hand', '4 x 40 m con 40 lb en cada mano') },
        { name: b('Walk', 'Caminata'), text: b('20 minutes, easy pace', '20 minutos, a paso suave') },
      ],
      days: [
        { d: b('Monday', 'Lunes'), what: b('Day 1, on your own', 'Día 1, por tu cuenta'), state: 'done' },
        { d: b('Today', 'Hoy'), what: b('Day 2, on your own', 'Día 2, por tu cuenta'), state: 'today' },
        { d: b('Thursday', 'Jueves'), what: b('Session with Nico', 'Sesión con Nico'), state: 'next' },
        { d: b('Saturday', 'Sábado'), what: b('Day 3, on your own', 'Día 3, por tu cuenta'), state: 'next' },
      ],
    },
    ticks: [false, false, false, false],
    history: [{ d: b('Mon', 'lun'), what: b('Day 1', 'Día 1'), res: b('All 4 parts done', 'Las 4 partes hechas') }, { d: b('Thu', 'jue'), what: b('Session with Nico', 'Sesión con Nico'), res: b('Deadlift 135 lb', 'Peso muerto 135 lb') }],
    bests: [{ what: b('Deadlift', 'Peso muerto'), res: '135 lb', d: b('Nov 12', '12 nov') }],
    receipts: [{ d: b('Oct 20', '20 oct'), what: b('8 sessions', '8 sesiones'), amt: 320 }],
    waiver: b('Sep 14', '14 sep'),
  },
  carmen: {
    id: 'carmen', first: 'Carmen', full: 'Carmen L.', ini: 'CL', email: 'carmen@example.com', gym: 'tablado',
    people: [{ id: 'carmen', name: 'Carmen', me: true, likes: ['yo'] }, { id: 'mateo', name: 'Mateo', age: 12, minor: true, likes: ['te'] }],
    plans: [
      { who: 'carmen', kind: 'pack', pid: 'p5', left: 1, until: b('Dec 12', '12 dic') },
      { who: 'mateo', kind: 'plan', name: b('Teens, 2 classes a week', 'Teens, 2 clases por semana'), price: 65, renews: b('Dec 15', '15 dic'), due: true },
    ],
    bought: true,
    tracks: [],
    bookings: [{ who: 'mateo', day: 4, time: '09:00', cls: 'te' }],
    usual: [{ who: 'carmen', day: 4, time: '09:00', cls: 'yo' }],
    alerts: [{ id: 'due-mateo', kind: 'due', who: 'mateo', amount: 65, since: b('Nov 15', '15 nov') }],
    notices: [],
    receipts: [{ d: b('Oct 28', '28 oct'), what: b('5-class pack', 'Paquete de 5 clases'), amt: 115 }, { d: b('Oct 15', '15 oct'), what: b('Teens, 2 classes a week', 'Teens, 2 clases por semana'), amt: 65 }],
    waiver: b('Aug 30', '30 ago'),
  },
};

/* ---------- screen words ---------- */
export const W = {
  dateLong: b('Tuesday, November 17', 'Martes, 17 de noviembre'),
  hi: b('Hi', 'Hola'),
  today: b('Today', 'Hoy'), tomorrow: b('Tomorrow', 'Mañana'),
  home: b('Home', 'Inicio'), schedule: b('Schedule', 'Horario'), workouts: b('Workouts', 'Entreno'), family: b('Family', 'Familia'),
  plan: b('Plan and payments', 'Plan y pagos'), account: b('Account', 'Cuenta'), about: b('About', 'Sobre'),
  menu: b('Sections', 'Secciones'), tabsLabel: b('Sections', 'Secciones'), back: b('Back', 'Volver'), close: b('Close', 'Cerrar'),
  signedIn: b('Signed in as', 'Entraste como'),
  news: b('News', 'Aviso'),
  needsYou: b('Needs you', 'Requiere tu atención'), forYou: b('For you', 'Para ti'), from: b('From', 'De'),
  gotIt: b('Got it', 'Entendido'), notNow: b('Not now', 'Ahora no'),
  book: b('Book', 'Reservar'), bookClass: b('Book a class', 'Reservar clase'), bookAnother: b('Book another class', 'Reservar otra clase'), booked: b('Booked', 'Reservada'),
  cancel: b('Cancel booking', 'Cancelar reserva'), cancelSession: b('Cancel this session', 'Cancelar esta sesión'),
  cantMakeIt: b('Can\'t make it?', '¿No puedes ir?'),
  full: b('Full', 'Llena'), waitJoin: b('Join the waitlist', 'Unirme a la lista de espera'), waitLeave: b('Leave the waitlist', 'Salir de la lista de espera'),
  waiting: b('Waitlist', 'Lista de espera'), waitNote: b('We email you if a spot opens.', 'Te avisamos por email si se abre un espacio.'),
  waitOn: b('You are first in line.', 'Eres la primera persona en la lista.'),
  youBooked: b('You are booked.', 'Tienes reserva.'),
  workout: b('Workout', 'Entreno'), scaled: b('Scaled', 'Escalado'), rx: b('Rx', 'Rx'),
  logScore: b('Log score', 'Anotar resultado'), editScore: b('Edit score', 'Editar resultado'), logTitle: b('Log your score', 'Anota tu resultado'),
  logged: b('logged', 'anotado'), newBest: b('New best', 'Nueva marca'),
  save: b('Save', 'Guardar'), logEmpty: b('Type at least one result.', 'Escribe al menos un resultado.'),
  weight: b('Weight, lb', 'Peso, lb'), time: b('Time, min:sec', 'Tiempo, min:seg'), reps: b('Reps', 'Repeticiones'), repsShort: b('reps', 'reps'),
  alsoToday: b('Also today', 'También hoy'), todayWorkouts: b('Today\'s workouts', 'Entrenos de hoy'),      // "plan" is kept for what she pays for
  thisWeek: b('This week', 'Esta semana'), usual: b('Your usual', 'Tu clase de siempre'),
  yourPlan: b('Your plan', 'Tu plan'),
  payPer: b('Pay per class', 'Pago por clase'),
  payFailed: b('Payment failed', 'Pago fallido'),
  buy: b('Buy', 'Comprar'), offer: b('Offer', 'Oferta'), forWord: b('For', 'Para'),
  cardLine: b('Card on file, ending 4242', 'Tarjeta guardada, termina en 4242'),
  receiptLine: b('The receipt goes to your email.', 'El recibo llega a tu email.'),
  you: b('You', 'Tú'), me: b('Me', 'Yo'), forWhom: b('Booking for', 'Reserva para'),
  yourPlanDay: b('Your program', 'Tu programa'), week: b('Week', 'Semana'), of: b('of', 'de'), done: b('Done', 'Hecho'), withWord: b('with', 'con'),
  noSession: b('No session booked', 'Sin sesión reservada'),
  nothingBooked: b('Nothing booked yet', 'Nada reservado todavía'), nothingBookedLine: b('Your next class shows here.', 'Tu próxima clase aparece aquí.'),
  noneThisDay: b('None of your usual classes this day.', 'Ninguna de tus clases de siempre este día.'), noneAtAll: b('No classes this day.', 'No hay clases este día.'),
  showAll: b('Show all classes', 'Ver todas las clases'), showMine: b('Show only my classes', 'Ver solo mis clases'),
  spots: b('spots left', 'espacios libres'), spot: b('spot left', 'espacio libre'),
  recent: b('Recent results', 'Resultados recientes'), bests: b('Personal bests', 'Marcas personales'), thisWeekPlan: b('This week in your program', 'Esta semana en tu programa'),
  card: b('Card', 'Tarjeta'), receipts: b('Receipts', 'Recibos'), options: b('Other options', 'Otras opciones'), aMonth: b('a month', 'al mes'),
  current: b('Yours now', 'El tuyo'),
  pause: b('Need to pause or stop?', '¿Necesitas pausar o parar?'), askPause: b('Ask to pause', 'Pedir una pausa'),
  hours: b('Hours', 'Horas'), where: b('Where', 'Dónde'), contact: b('Contact', 'Contacto'), allNews: b('News', 'Avisos'), noNews: b('Nothing new right now.', 'Nada nuevo por ahora.'),
  language: b('Language', 'Idioma'), notifications: b('Notices', 'Avisos'), notifLine: b('By email. Texts come later.', 'Por email. Los mensajes de texto llegan después.'),
  documents: b('Documents', 'Documentos'), yourGyms: b('Your places', 'Tus lugares'), signOut: b('Sign out', 'Salir'),
  bookFor: b('Book for', 'Reservar para'), addChild: b('To add another child, ask at the front desk for now.', 'Para añadir a otro menor, por ahora pídelo en recepción.'),
  years: b('years old', 'años'),
  sketch: b('A sketch. It shows what lives here, not the final design.', 'Un boceto. Muestra qué vive aquí, no el diseño final.'),
  undo: b('Undo', 'Deshacer'),
  mockOnly: b('Not part of this mockup.', 'No es parte de esta maqueta.'),
};

/* Sentences with numbers in them, one set per language. */
export const F = {
  en: {
    unit: (u, n) => (u === 'session' ? (n === 1 ? 'session' : 'sessions') : (n === 1 ? 'class' : 'classes')),
    left: (n, u) => (n === 0 ? `No ${F.en.unit(u, 2)} left` : `${n} ${F.en.unit(u, n)} left`),
    useBy: d => `use by ${d}`,
    renews: (d, price) => `Renews ${d} · $${price} a month`,
    perUnit: (price, u) => `$${price} a ${F.en.unit(u, 1)}. No plan yet.`,
    introTitle: (n, u, price) => `First pack: ${n} ${F.en.unit(u, n)} for $${price}`,
    packTitle: (n, u, price) => `${n} ${F.en.unit(u, n)} for $${price}`,
    introLine: (full, save) => `One by one they cost $${full}. You save $${save}.`,
    biggerTitle: (n, u, price) => `Next pack: ${n} ${F.en.unit(u, n)} for $${price}`,
    biggerLine: (each, now, u) => `$${each} a ${F.en.unit(u, 1)}. Yours works out to $${now}.`,
    sameTitle: (n, u, price) => `${n} more ${F.en.unit(u, n)} for $${price}`,
    sameLine: (each, u) => `$${each} a ${F.en.unit(u, 1)}, same as now.`,
    buyN: (n, u) => `Buy ${n} ${F.en.unit(u, n)}`,
    payAmt: amt => `Pay $${amt}`,
    bookPay: amt => `Book and pay $${amt}`,
    uses: (left, u) => (left === 1 ? `Uses your last ${F.en.unit(u, 1)}.` : `Uses 1 of your ${left} ${F.en.unit(u, left)}.`),
    included: name => `Included in ${name}.`,
    charged: amt => `$${amt}, charged to your card ending 4242.`,
    emptyTitle: u => `That was the last ${F.en.unit(u, 1)} on your pack`,
    emptyLine: u => `Buy the next one to keep ${u === 'session' ? 'training' : 'booking'} without paying one by one.`,
    dueTitle: (name, mine) => (mine ? 'Your payment did not go through' : `${name}'s payment did not go through`),
    dueLine: (plan, amt, since) => `${plan}. $${amt} was due ${since}.`,
    toastBooked: when => `Booked for ${when}.`,
    toastLast: u => ` That was your last ${F.en.unit(u, 1)}.`,
    toastCharged: amt => ` $${amt} charged to your card.`,
    toastAdded: (amt, n, u) => `Paid $${amt}. ${n} ${F.en.unit(u, n)} added.`,
    toastCancelled: () => 'Booking cancelled.',
    toastWait: () => 'You are on the waitlist.',
    toastLeft: () => 'You left the waitlist.',
    toastSaved: () => 'Score saved.',
    toastPaid: amt => `Paid $${amt}. The receipt is in your email.`,
    toastSession: who => `Session cancelled. ${who} has been told.`,
    toastPause: gym => `Sent to ${gym}. They answer by email.`,
    sessionLine: who => `${who} sets your session times. Cancel here and ${who} is told right away.`,
    noSessionLine: who => `${who} books your sessions. The next one shows here.`,
    waiver: d => `Waiver signed ${d}`,
    waiverBy: (d, who) => `Waiver signed by ${who} on ${d}, at the desk`,
    onlyPlace: gym => `Only ${gym} for now`,
    spotsOf: (taken, cap) => `${taken} of ${cap} taken`,
  },
  es: {
    unit: (u, n) => (u === 'session' ? (n === 1 ? 'sesión' : 'sesiones') : (n === 1 ? 'clase' : 'clases')),
    left: (n, u) => (n === 0 ? `No te quedan ${F.es.unit(u, 2)}` : n === 1 ? `Te queda 1 ${F.es.unit(u, 1)}` : `Te quedan ${n} ${F.es.unit(u, n)}`),
    useBy: d => `hasta el ${d}`,
    renews: (d, price) => `Se renueva el ${d} · $${price} al mes`,
    perUnit: (price, u) => `$${price} por ${F.es.unit(u, 1)}. Aún sin plan.`,
    introTitle: (n, u, price) => `Primer paquete: ${n} ${F.es.unit(u, n)} por $${price}`,
    packTitle: (n, u, price) => `${n} ${F.es.unit(u, n)} por $${price}`,
    introLine: (full, save) => `Una por una cuestan $${full}. Ahorras $${save}.`,
    biggerTitle: (n, u, price) => `Próximo paquete: ${n} ${F.es.unit(u, n)} por $${price}`,
    biggerLine: (each, now, u) => `$${each} por ${F.es.unit(u, 1)}. El tuyo sale a $${now}.`,
    sameTitle: (n, u, price) => `${n} ${F.es.unit(u, n)} más por $${price}`,
    sameLine: (each, u) => `$${each} por ${F.es.unit(u, 1)}, igual que ahora.`,
    buyN: (n, u) => `Comprar ${n} ${F.es.unit(u, n)}`,
    payAmt: amt => `Pagar $${amt}`,
    bookPay: amt => `Reservar y pagar $${amt}`,
    uses: (left, u) => (left === 1 ? `Usa tu última ${F.es.unit(u, 1)}.` : `Usa 1 de tus ${left} ${F.es.unit(u, left)}.`),
    included: name => `Incluida en ${name}.`,
    charged: amt => `$${amt}, a tu tarjeta terminada en 4242.`,
    emptyTitle: u => `Esa fue la última ${F.es.unit(u, 1)} de tu paquete`,
    emptyLine: u => `Compra el próximo para seguir ${u === 'session' ? 'entrenando' : 'reservando'} sin pagar una por una.`,
    dueTitle: (name, mine) => (mine ? 'Tu pago no pasó' : `El pago de ${name} no pasó`),
    dueLine: (plan, amt, since) => `${plan}. $${amt} vencieron el ${since}.`,
    toastBooked: when => `Reserva hecha: ${when}${when.endsWith('.') ? '' : '.'}`,      // "p. m." already ends in a period
    toastLast: u => ` Era tu última ${F.es.unit(u, 1)}.`,
    toastCharged: amt => ` Se cobraron $${amt} a tu tarjeta.`,
    toastAdded: (amt, n, u) => `Pagaste $${amt}. Se sumaron ${n} ${F.es.unit(u, n)}.`,
    toastCancelled: () => 'Reserva cancelada.',
    toastWait: () => 'Estás en la lista de espera.',
    toastLeft: () => 'Saliste de la lista de espera.',
    toastSaved: () => 'Resultado guardado.',
    toastPaid: amt => `Pagaste $${amt}. El recibo está en tu email.`,
    toastSession: who => `Sesión cancelada. ${who} ya lo sabe.`,
    toastPause: gym => `Enviado a ${gym}. Te responden por email.`,
    sessionLine: who => `${who} fija las horas de tus sesiones. Cancela aquí y ${who} se entera al momento.`,
    noSessionLine: who => `${who} reserva tus sesiones. La próxima aparece aquí.`,
    waiver: d => `Relevo firmado el ${d}`,
    waiverBy: (d, who) => `Relevo firmado por ${who} el ${d}, en recepción`,
    onlyPlace: gym => `Solo ${gym} por ahora`,
    spotsOf: (taken, cap) => `${taken} de ${cap} ocupados`,
  },
};
