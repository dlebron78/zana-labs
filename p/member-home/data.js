/* Member home: sample data. Everything here is made up.
   Barrio Fitness is the made-up test gym Zana uses everywhere (Calle Loíza, San Juan). Repecho is the labs' sample solo trainer (see p/page-concepts).
   Words a business would type itself (class names, workouts, news) are written in both languages so the switch reads whole. */

export const b = (en, es) => ({ en, es });

/* ---------- the calendar ----------
   Today is Tuesday, November 17, 2026, and it is 4:15 PM. A day is counted from today: -1 is Monday the 16th, 0 today, 12 Sunday the 29th.
   The schedule and the workouts show one week at a time, Monday to Sunday, with arrows to the next week. A member books herself up to 7 days ahead. */
export const NOW = '16:15';
export const DAYS = {};
for (let i = -1; i <= 12; i++) DAYS[i] = { n: 17 + i, wd: (i + 1) % 7 + 1 };
export const WEEKS = [[-1, 0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11, 12]];
export const BOOK_AHEAD = 7;
export const CLOSED = { 9: b('Closed for Thanksgiving', 'Cerrado por Acción de Gracias') };      // Thursday the 26th, the gym's own news
export const WD = {   // weekday names, 1 = Monday
  short: { en: ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], es: ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'] },
  long: { en: ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], es: ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] },
};

/* ---------- the two businesses ---------- */
export const GYMS = {
  barrio: {
    id: 'barrio', name: 'Barrio Fitness', short: 'Barrio', mark: '<svg viewBox=\'0 0 32 32\' aria-hidden=\'true\'><path d=\'M8 5h9.2c4.6 0 7.3 2.2 7.3 5.8 0 2.4-1.3 4-3.4 4.7 2.7.6 4.4 2.5 4.4 5.3 0 4-3 6.2-8 6.2H8zm5 4.2v5h3.6c1.9 0 3-.9 3-2.5s-1.1-2.5-3-2.5zm0 8.8v5.8h4.1c2.2 0 3.4-1 3.4-2.9s-1.2-2.9-3.4-2.9z\' fill=\'currentColor\'/></svg>',
    frame: '#C4161C',                 // Barrio's red: it paints the bar, its notice strip and nothing else
    addr: 'Calle Loíza 1950, San Juan',
    classes: true,                    // runs classes a member reserves herself
    hood: 'Santurce, San Juan',
    hours: [b('Monday to Friday, 5:30 AM to 8:30 PM', 'Lunes a viernes, 5:30 a. m. a 8:30 p. m.'), b('Saturday, 7:00 AM to 12:00 PM', 'Sábado, 7:00 a. m. a 12:00 p. m.'), b('Sunday, 9:30 AM to 11:30 AM', 'Domingo, 9:30 a. m. a 11:30 a. m.')],
    email: 'hola@barrio.example', phone: '787-555-0100',
    news: {
      title: b('No classes on Thursday the 26th', 'No hay clases el jueves 26'),
      body: b('We close for Thanksgiving. Friday the 27th we are back at 6:00 AM with the usual schedule.', 'Cerramos por Acción de Gracias. El viernes 27 volvemos a las 6:00 a. m. con el horario de siempre.'),
      when: b('Posted yesterday', 'Publicado ayer'),
    },
    single: 25,                       // the price of one class, paid one by one
    unit: 'class',
    cancelHrs: 2,                     // the gym switched its cancel window on: canon ships it off, 2 hours when on [ENTITLEMENT_TIMING_DECISION D8]
    graceUntil: b('Fri, Nov 20', 'vie 20 nov'),      // the gym's grace setting [PHO-181], a placeholder of 5 days after the due date
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
    cancelHrs: 0,
    products: [
      { id: 's8', kind: 'pack', n: 8, price: 320, name: b('8 sessions', '8 sesiones') },
      { id: 'mo', kind: 'plan', price: 420, name: b('Monthly plan', 'Plan mensual') },
    ],
    intro: null,
  },
};

/* ---------- Barrio's classes ---------- */
export const CLASSES = {
  ct: { name: b('CrossFit', 'CrossFit'), mins: 60, cap: 12, room: b('Main floor', 'Salón principal'),
    blurb: b('Strength and conditioning for every level. Each workout has a scaled option.', 'Fuerza y acondicionamiento para todos los niveles. Cada entreno trae una opción escalada.') },
  wl: { name: b('Olympic lifting', 'Halterofilia'), mins: 60, cap: 8, room: b('Platforms', 'Plataformas'),
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
export const COACHES = { paola: 'Paola', diego: 'Diego', sofia: 'Sofía' };
/* Coach photos wait on staff profiles [PHO-402, Backlog]. Until then a coach shows as initials; these photos show where they would go. */
export const FACES = { paola: '../page-concepts/img/coach-paola.jpg', diego: '../page-concepts/img/coach-diego.jpg', sofia: '../page-concepts/img/coach-sofia.jpg' };

/* The week, by weekday (1 = Monday). Each row: time, class, coach. */
const TUE = [['06:00', 'ct', 'paola'], ['09:00', 'yo', 'sofia'], ['12:00', 'ct', 'diego'], ['17:00', 'ct', 'diego'], ['18:00', 'ct', 'paola'], ['18:30', 'yo', 'sofia'], ['19:00', 'wl', 'diego']];
const MON = [['06:00', 'ct', 'paola'], ['12:00', 'ct', 'diego'], ['16:00', 'te', 'sofia'], ['17:00', 'ct', 'diego'], ['18:00', 'ct', 'paola'], ['19:00', 'gy', 'diego']];
export const WEEK = {
  1: MON,
  2: TUE,
  3: [['06:00', 'en', 'paola'], ['12:00', 'ct', 'diego'], ['16:00', 'te', 'sofia'], ['17:00', 'ct', 'diego'], ['18:00', 'ct', 'paola'], ['19:00', 'gy', 'diego']],
  4: [['06:00', 'ct', 'paola'], ['09:00', 'yo', 'sofia'], ['12:00', 'ct', 'diego'], ['17:00', 'ct', 'paola'], ['18:00', 'ct', 'diego'], ['18:30', 'yo', 'sofia'], ['19:00', 'wl', 'paola']],
  5: [['06:00', 'ct', 'paola'], ['12:00', 'ct', 'diego'], ['17:00', 'ct', 'diego'], ['18:00', 'ct', 'paola']],
  6: [['07:00', 'en', 'paola'], ['08:00', 'ct', 'diego'], ['09:00', 'te', 'diego'], ['09:00', 'yo', 'sofia'], ['10:00', 'wl', 'paola']],
  7: [['10:00', 'yo', 'sofia']],
};
export const FULL = '1-18:00-ct';      // one full class (Wednesday 6:00 PM), to show the waitlist

/* ---------- today's workouts at Barrio, one per track ---------- */
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

/* ---------- Barrio's programmed days, this week ----------
   Each Program has a Release in Zana [phoenix: Programs.tsx, training/programs.py release_instant]: one day at a time or the whole week,
   the day before at a time (8:00 PM unless the gym changes it) or midnight. Only a day marked Ready is released. Saturday is not Ready yet. */
const P = (en, es, mins, ten, tes, extra = {}) => ({ name: b(en, es), mins, text: b(ten, tes), ...extra });
export const NOT_READY = { 4: true };
export const WODS = {
  '-1': {
    ct: { title: b('Deadlift day', 'Día de peso muerto'), parts: [
      P('Deadlift', 'Peso muerto', 20, '5 x 3 @ 80%', '5 x 3 @ 80%'),
      P('Conditioning', 'Acondicionamiento', 12, '12 minutes, as many rounds as you can: 10 deadlifts, 250 m row', '12 minutos, todas las rondas que puedas: 10 pesos muertos, 250 m de remo',
        { scaled: b('Lighter bar, 200 m row', 'Barra más liviana, 200 m de remo') }),
    ] },
    gy: { title: b('Toes to bar', 'Pies a la barra'), parts: [
      P('Toes to bar', 'Pies a la barra', 10, 'Every minute for 10 minutes: 8 toes to bar', 'Cada minuto por 10 minutos: 8 pies a la barra', { scaled: b('Hanging knee raises', 'Rodillas al pecho colgando') }),
      P('Ring support', 'Soporte en anillas', 10, '5 x 20 seconds', '5 x 20 segundos'),
    ] },
  },
  0: WORKOUTS,
  1: {
    ct: { title: b('Push press', 'Push press'), parts: [
      P('Push press', 'Push press', 20, '5 x 5, a little heavier each set', '5 x 5, un poco más pesado cada serie'),
      P('Conditioning', 'Acondicionamiento', 15, '3 rounds: 20 wall balls, 15 pull-ups, 400 m run', '3 rondas: 20 wall balls, 15 dominadas, 400 m de carrera', { scaled: b('Ring rows instead of pull-ups', 'Remos en anillas en vez de dominadas') }),
    ] },
    gy: { title: b('Muscle-up drills', 'Ejercicios de muscle-up'), parts: [
      P('Kipping swings', 'Balanceos', 10, '4 x 8', '4 x 8'),
      P('False grip holds', 'Agarre falso', 10, '4 x 20 seconds', '4 x 20 segundos'),
    ] },
    en: { title: b('Row', 'Remo'), parts: [P('Row', 'Remo', 30, '4 x 1,000 m, rest 2 minutes between each', '4 x 1.000 m, descansa 2 minutos entre cada uno')] },
  },
  2: {
    ct: { title: b('Partner day', 'Día en pareja'), parts: [
      P('Warm-up', 'Calentamiento', 10, '2 rounds: 10 lunges, 10 push-ups, 200 m run', '2 rondas: 10 zancadas, 10 flexiones, 200 m de carrera'),
      P('Partner workout', 'Entreno en pareja', 25, 'Split as you like: 100 calorie row, 80 box jumps, 60 thrusters', 'Repártanlo como quieran: 100 calorías de remo, 80 saltos al cajón, 60 thrusters',
        { scaled: b('Lighter thrusters, step-ups', 'Thrusters más livianos, subidas al cajón') }),
    ] },
    wl: { title: b('Clean and jerk', 'Envión'), parts: [
      P('Clean and jerk', 'Envión', 25, 'Every 2 minutes for 12 minutes: 1 rep @ 80%', 'Cada 2 minutos por 12 minutos: 1 repetición @ 80%'),
      P('Front squat', 'Sentadilla frontal', 15, '3 x 3', '3 x 3'),
    ] },
  },
  3: {
    ct: { title: b('Fran Friday', 'Viernes de Fran'), parts: [
      P('Thrusters and pull-ups', 'Thrusters y dominadas', 15, '21, 15, 9: thrusters at 95 lb, pull-ups', '21, 15, 9: thrusters con 95 lb, dominadas', { scaled: b('65 lb, banded pull-ups', '65 lb, dominadas con banda') }),
      P('Accessory', 'Accesorios', 15, '3 x 12 dumbbell rows', '3 x 12 remos con mancuerna'),
    ] },
  },
  4: {
    ct: { title: b('Team Saturday', 'Sábado en equipo'), parts: [
      P('Team workout', 'Entreno en equipo', 40, 'Teams of 3: 2,000 m row, 150 wall balls, 100 burpees', 'Equipos de 3: 2.000 m de remo, 150 wall balls, 100 burpees'),
    ] },
  },
};

/* ---------- the four sample members ----------
   people: who she can book and pay for. The first one is herself.
   plans: what each person holds. No plan means she pays one class at a time.
   likes: the classes she has booked before. The schedule opens on these. */
export const MEMBERS = {
  ines: {
    id: 'ines', first: 'Inés', full: 'Inés C.', ini: 'IC', email: 'ines@example.com', gym: 'barrio',
    people: [{ id: 'ines', name: 'Inés', me: true, likes: ['yo'] }],
    plans: [],
    bought: false,                    // she has never bought a pack, so the intro price is still hers
    pace: 2,                          // classes a week over her last 30 days: about $217 a month, paid one by one
    credits: 0,                       // classes she cancelled in time, kept as credit
    tracks: [],
    bookings: [{ who: 'ines', day: 0, time: '18:30', cls: 'yo', paid: 25 }],
    usual: [{ who: 'ines', day: 2, time: '18:30', cls: 'yo' }],
    alerts: [], notices: [],
    receipts: [{ d: b('Today', 'Hoy'), what: b('Single class', 'Clase suelta'), amt: 25 }, { d: b('Nov 12', '12 nov'), what: b('Single class', 'Clase suelta'), amt: 25 }, { d: b('Nov 10', '10 nov'), what: b('Single class', 'Clase suelta'), amt: 25 }],
    waiver: b('Oct 3', '3 oct'),
  },
  maria: {
    id: 'maria', first: 'María', full: 'María D.', ini: 'MD', email: 'maria@example.com', gym: 'barrio',
    people: [{ id: 'maria', name: 'María', me: true, likes: ['ct', 'wl', 'gy', 'en'] }],
    plans: [{ who: 'maria', kind: 'plan', pid: 'unl', renews: b('Dec 1', '1 dic') }],
    bought: true,
    tracks: ['ct', 'wl', 'gy', 'en'],   // the four tracks her plan covers
    bookings: [{ who: 'maria', day: 0, time: '18:00', cls: 'ct' }, { who: 'maria', day: 2, time: '18:00', cls: 'ct' }],
    usual: [],
    alerts: [],
    notices: [{ id: 'coach', title: b('Coach change on Thursday', 'Cambio de coach el jueves'), body: b('Diego leads your 6:00 PM class. Paola is back on Friday.', 'Diego da tu clase de las 6:00 p. m. Paola vuelve el viernes.') }],
    results: {},
    history: [
      { d: b('Mon', 'lun'), what: b('CrossFit', 'CrossFit'), res: b('14:02 · Rx', '14:02 · Rx') },
      { d: b('Sat', 'sáb'), what: b('Olympic lifting', 'Halterofilia'), res: b('Snatch 95 lb', 'Arranque 95 lb') },
      { d: b('Fri', 'vie'), what: b('CrossFit', 'CrossFit'), res: b('6 rounds + 4 · Scaled', '6 rondas + 4 · Escalado') },
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
    id: 'carmen', first: 'Carmen', full: 'Carmen L.', ini: 'CL', email: 'carmen@example.com', gym: 'barrio',
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
  luis: {
    id: 'luis', first: 'Luis', full: 'Luis R.', ini: 'LR', email: 'luis@example.com', gym: 'barrio',
    people: [{ id: 'luis', name: 'Luis', me: true, likes: ['ct'] }],
    plans: [{ who: 'luis', kind: 'plan', pid: 'unl', renews: b('Dec 15', '15 dic'), due: true }],
    bought: true,
    tracks: ['ct'],
    bookings: [{ who: 'luis', day: 2, time: '06:00', cls: 'ct' }],
    usual: [{ who: 'luis', day: 3, time: '06:00', cls: 'ct' }],
    alerts: [{ id: 'due-luis', kind: 'due', who: 'luis', amount: 159, since: b('Nov 15', '15 nov') }],
    notices: [],
    results: {},
    history: [{ d: b('Mon', 'lun'), what: b('CrossFit', 'CrossFit'), res: b('16:40 · Scaled', '16:40 · Escalado') }],
    bests: [{ what: b('Back squat', 'Sentadilla trasera'), res: '205 lb', d: b('Nov 2', '2 nov') }],
    receipts: [{ d: b('Oct 15', '15 oct'), what: b('Unlimited', 'Ilimitado'), amt: 159 }],
    waiver: b('Jun 2', '2 jun'),
  },
};

/* ---------- screen words ---------- */
export const W = {
  dateLong: b('Tuesday, November 17', 'Martes, 17 de noviembre'),
  hi: b('Hi', 'Hola'),
  today: b('Today', 'Hoy'), tomorrow: b('Tomorrow', 'Mañana'),
  nextWeek: b('Next week', 'La semana que viene'), prevWeek: b('Previous week', 'Semana anterior'),
  bookAheadLine: b('You can book up to 7 days ahead.', 'Puedes reservar hasta 7 días antes.'), opensTomorrow: b('Opens tomorrow', 'Abre mañana'),
  restDay: b('Rest day', 'Día de descanso'), notReady: b('Not posted yet', 'Aún no está publicado'),
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
  payToday: b('Charged today', 'Se cobra hoy'),
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
  cardBrand: b('Visa ending 4242', 'Visa que termina en 4242'), cardExp: b('Expires 08/28', 'Vence 08/28'), change: b('Change', 'Cambiar'),
  pauseLine: b('The front desk gets your request.', 'La recepción recibe tu pedido.'),
  directions: b('Directions', 'Cómo llegar'), callOrText: b('Call or text', 'Llama o escribe'), writeUs: b('Write to the gym', 'Escríbele al gym'),
  coachWord: b('Coach', 'Coach'),
  paying: b('Paying', 'Pagando'), booking: b('Booking', 'Reservando'), laptopUrl: 'barrio.zana.fit',
  meTab: b('Me', 'Yo'), upcoming: b('Your bookings', 'Tus reservas'),
  payFirst: b('Pay first', 'Paga primero'), keep: b('Keep it', 'Mantenerla'), yesCancel: b('Yes, cancel', 'Sí, cancelar'),
  cancelQ: b('Cancel this class?', '¿Cancelar esta clase?'),
  credit: b('Class credit', 'Crédito de clase'),
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
    wasDue: since => `Was due ${since}`,
    opensOn: d => `Opens ${d}`,
    goesUp: (wd, time, tonight) => (tonight ? `Goes up tonight at ${time}` : `Goes up ${wd} at ${time}`),
    relHow: (g, span, when) => `${g} shows ${span === 'week' ? 'the whole week at once' : 'workouts one day at a time'}, ${span === 'week' ? (when === 'midnight' ? 'at midnight on Monday' : 'on Sunday at 8:00 PM') : (when === 'midnight' ? 'at midnight that day' : 'the night before at 8:00 PM')}.`,
    notReadyLine: (g, wd) => `${g}'s coaches haven't marked ${wd} ready yet.`,
    restLine: wd => `Nothing is programmed for ${wd}.`,
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
    graceIn: d => `You can keep booking until ${d}.`,
    graceOut: () => 'The grace period is over, so booking is paused until it is paid.',
    payFirstLine: amt => `The plan is overdue. Pay $${amt} first, then this class books in one tap.`,
    unlTitle: price => `Unlimited: $${price} a month`,
    unlLine: (pace, monthly, save) => `You come about ${pace === 2 ? 'twice' : `${pace} times`} a week, about $${monthly} a month one by one. You'd save $${save}.`,
    switchTo: name => `Switch to ${name}`,
    cancelBack: (u, hrs) => `It's more than ${hrs} hours away, so the ${u} goes back to the pack.`,
    cancelLost: (u, hrs) => `It starts in under ${hrs} hours, so the ${u} won't go back to the pack.`,
    cancelCredit: (amt, hrs) => `It's more than ${hrs} hours away, so the $${amt} you paid stays as a credit for another class.`,
    cancelPaidLost: (amt, hrs) => `It starts in under ${hrs} hours, so the $${amt} you paid won't come back.`,
    cancelPlan: () => 'Nothing is lost on the plan. The spot goes to the next person in line.',
    cancelFor: name => `This is ${name}'s class.`,
    toastLate: () => 'Booking cancelled. It was too late to get the class back.',
    toastCredit: () => 'Booking cancelled. The class is saved as a credit.',
    usesCredit: () => 'Uses your class credit.',
    creditLine: n => `${n} class credit${n === 1 ? '' : 's'} to use`,
    bookFor: name => `Book a class for ${name}`,
    bookForMe: () => 'Book a class for you',
    classesFor: name => `Classes for ${name}`,
    toastBookedFor: (name, when) => `${name} is booked for ${when}.`,
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
    wasDue: since => `Vencía el ${since}`,
    opensOn: d => `Abre el ${d}`,
    goesUp: (wd, time, tonight) => (tonight ? `Se publica esta noche a las ${time}` : `Se publica el ${wd} a las ${time}`),
    relHow: (g, span, when) => `${g} muestra ${span === 'week' ? 'la semana entera de una vez' : 'los entrenos día a día'}, ${span === 'week' ? (when === 'midnight' ? 'a medianoche del lunes' : 'el domingo a las 8:00 p. m.') : (when === 'midnight' ? 'a medianoche de ese día' : 'la noche antes a las 8:00 p. m.')}.`,
    notReadyLine: (g, wd) => `Los coaches de ${g} aún no han marcado el ${wd} como listo.`,
    restLine: wd => `No hay nada programado para el ${wd}.`,
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
    graceIn: d => `Puedes seguir reservando hasta el ${d}.`,
    graceOut: () => 'Se acabó el plazo de gracia, así que las reservas están en pausa hasta que se pague.',
    payFirstLine: amt => `El plan está atrasado. Paga $${amt} primero y luego esta clase se reserva con un toque.`,
    unlTitle: price => `Ilimitado: $${price} al mes`,
    unlLine: (pace, monthly, save) => `Vienes unas ${pace === 2 ? 'dos' : pace} veces por semana, unos $${monthly} al mes clase por clase. Ahorrarías $${save}.`,
    switchTo: name => `Cambiar a ${name}`,
    cancelBack: (u, hrs) => `Faltan más de ${hrs} horas, así que la ${u} vuelve al paquete.`,
    cancelLost: (u, hrs) => `Empieza en menos de ${hrs} horas, así que la ${u} no vuelve al paquete.`,
    cancelCredit: (amt, hrs) => `Faltan más de ${hrs} horas, así que los $${amt} que pagaste quedan como crédito para otra clase.`,
    cancelPaidLost: (amt, hrs) => `Empieza en menos de ${hrs} horas, así que los $${amt} que pagaste no se devuelven.`,
    cancelPlan: () => 'El plan no pierde nada. El espacio pasa a la siguiente persona en la lista.',
    cancelFor: name => `Es la clase de ${name}.`,
    toastLate: () => 'Reserva cancelada. Ya era tarde para recuperar la clase.',
    toastCredit: () => 'Reserva cancelada. La clase queda como crédito.',
    usesCredit: () => 'Usa tu crédito de clase.',
    creditLine: n => `${n} ${n === 1 ? 'crédito' : 'créditos'} de clase por usar`,
    bookFor: name => `Reservar clase para ${name}`,
    bookForMe: () => 'Reservar clase para ti',
    classesFor: name => `Clases para ${name}`,
    toastBookedFor: (name, when) => `${name} tiene reserva: ${when}${when.endsWith('.') ? '' : '.'}`,
  },
};
