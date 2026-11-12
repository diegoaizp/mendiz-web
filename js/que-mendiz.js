/* ==========================================================================
   MENDIZ — ¿Qué Mendiz es para ti? (que-mendiz-es-para-ti.html)
   Asesor por pasos: una pregunta por pantalla hasta llegar a un modelo.

   · Cinco preguntas (STEPS): terreno → salida ideal (según el terreno) →
     qué disfrutar → asistencia → postura. Las respuestas suman puntos a los
     modelos del terreno y gana el que más tiene (ver pick).
   · Cada paso es una «página» con su propia dirección en el hash:
       (sin hash)                                 introducción y «Empezar»
       #/                                         primera pregunta (terreno)
       #/carretera/ruta/velocidad/sin/deportiva   … el resultado
     Funcionan atrás y adelante del navegador y el resultado se puede
     compartir.
   · Para cambiar una pregunta, una respuesta o un modelo, edita los datos de
     abajo; el marcado se genera solo con las clases de siempre (.bike-card,
     .btn, .eyebrow, .heading-editorial…). Estilos propios en css/que-mendiz.css.
   ========================================================================== */
(() => {
  const root = document.querySelector('[data-finder]');
  if (!root) return;
  const dealer = document.querySelector('[data-finder-dealer]');
  // Propuesta con fotos (que-mendiz-es-para-ti-fotos.html, data-finder="fotos"):
  // todas las respuestas son tarjetas con foto
  const PHOTO_MODE = root.dataset.finder === 'fotos';

  // Modelos ------------------------------------------------------------------
  // Textos, precios, fotos y enlaces tomados de los listados de categoría.
  const MODELS = {
    'f14-sl-slp': {
      name: 'F14 SL-SLP', tag: 'Carretera · Rendimiento', claim: 'Una F14 para todo tu recorrido.',
      text: 'Para entrenar y competir en recorridos variados, con subidas, llanos y bajadas.',
      price: 'Desde 3.490 €', href: 'f14-sl-slp.html', custom: 'configurador-f14.html?modelo=f14-sl-slp',
      img: 'assets/img/f14-sl-slp/f14-sl-slp-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz F14 SL-SLP · Blanco',
    },
    'f12-sl': {
      name: 'F12 SL', tag: 'Carretera · Aero', claim: 'Una carretera con vocación aero.',
      text: 'Para rodar rápido en asfalto. La F12 SL combina perfiles aerodinámicos y una posición más baja y alargada, con un cuadro de carbono SL.',
      price: 'Desde 3.390 €', href: 'f12-sl.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-f12sl-configurador',
      img: 'assets/img/f12-sl/f12-sl-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz F12 SL · Azul metalizado',
    },
    'f9-sl': {
      name: 'F9 SL', tag: 'Carretera · Gran fondo', claim: 'Gran fondo a tu ritmo.',
      text: 'La F9 SL está pensada para pasar horas en carretera. Su geometría de gran fondo acerca el manillar y eleva la posición sobre un cuadro de carbono SL.',
      price: 'Desde 2.640 €', href: 'f9-sl.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-f9sl-configurador',
      img: 'assets/img/f9-sl/f9-sl-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz F9 SL · Naranja / Negro',
    },
    'tt10': {
      name: 'TT10', tag: 'Carretera · Triatlón', claim: 'Diseñada para rodar acoplado.',
      text: 'Para triatlón y contrarreloj. La TT10 trabaja la aerodinámica del conjunto y la posición del ciclista con un cuadro de carbono SL y manillar integrado.',
      price: 'Desde 7.100 €', href: 'tt10.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-tt10-only-configurador',
      img: 'assets/img/tt10/tt10-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz TT10 · Rosa / Negro',
    },
    'g12-sl': {
      name: 'G12 SL', tag: 'Gravel racing · Carbono', claim: 'Ritmo en las pistas. Libertad en la ruta.',
      text: 'La G12 SL combina carbono SuperLight y geometría gravel racing para enlazar pistas y asfalto. Una propuesta para entrenar, competir y variar el recorrido.',
      price: 'Desde 2.150 €', href: 'g12-sl.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-g12sl-configurador',
      img: 'assets/img/g12-sl/g12-sl-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz G12 SL · Marrón Tierra',
    },
    'g11am': {
      name: 'G11AM', tag: 'Aventura · Carbono', claim: 'Haz sitio para una ruta más larga.',
      text: 'Para bikepacking y rutas all-road. La G11AM combina carbono SL, geometría racing confort y una pequeña flexión trasera para acompañarte por pistas y carretera.',
      price: 'Desde 2.250 €', href: 'g11am.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-g11am-configurador',
      img: 'assets/img/g11am/g11am-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz G11AM · Verde',
    },
    'g4-icr': {
      name: 'G4.ICR', tag: 'Aventura · Aluminio', claim: 'Empieza por un camino. Sigue explorando.',
      text: 'La G4.ICR combina cuadro de aluminio y horquilla de carbono. Una geometría cómoda y fijaciones para equipaje te permiten preparar rutas por pistas, asfalto y caminos.',
      price: 'Desde 1.390 €', href: 'g4-icr.html', custom: 'https://www.bicismendiz.com/node/6105',
      img: 'assets/img/g4-icr/g4-icr-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz G4.ICR · Arena Lamborgini',
    },
    'x40-sl-icr': {
      name: 'X40 SL-ICR', tag: 'Carbono · Doble suspensión', claim: 'Sube con ritmo. Baja con control.',
      text: 'La X40 SL-ICR reúne cuadro de carbono SL, suspensión vertical y geometría de XC. Para entrenar y competir buscando respuesta en subida y control al bajar.',
      price: 'Desde 1.840 €', href: 'x40-sl-icr.html', custom: 'https://www.bicismendiz.com/bicicletas/mtb/mendiz-x40-sl-icr-configurador',
      img: 'assets/img/x40-sl-icr/x40-sl-icr-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz X40 SL-ICR · Gris',
    },
    'x21-sl': {
      name: 'X21 SL', tag: 'Carbono · Rígida', claim: 'Una rígida con ganas de circuito.',
      text: 'La X21 SL es la rígida de carbono de la gama. Su geometría deportiva y su construcción SL están pensadas para entrenar y competir en circuitos de montaña.',
      price: 'Desde 1.490 €', href: 'x21-sl.html', custom: 'https://www.bicismendiz.com/bicicletas/mtb/mendiz-x21-sl-2026-configurador',
      img: 'assets/img/x21-sl/x21-sl-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz X21 SL · Rojo burdeos',
    },
    'x10-boost': {
      name: 'X10 BOOST', tag: 'Aluminio · Rígida', claim: 'Más caminos en tus salidas.',
      text: 'La X10 BOOST parte de un cuadro rígido de aluminio y ruedas de 29 pulgadas. Sus ejes más anchos refuerzan el conjunto para afrontar tus rutas de montaña.',
      price: 'Desde 990 €', href: 'x10-boost.html', custom: 'https://www.bicismendiz.com/node/5327',
      img: 'assets/img/x10-boost/x10-boost-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz X10 BOOST · Negro',
    },
    'x10': {
      name: 'X10', tag: 'Aluminio · Rígida', claim: 'Tu próxima ruta empieza aquí.',
      text: 'La X10 combina cuadro de aluminio, ruedas de 29 pulgadas y geometría deportiva. Para empezar en la montaña y seguir descubriendo pistas y senderos.',
      price: 'Desde 850 €', href: 'x10.html', custom: 'https://www.bicismendiz.com/node/5328',
      img: 'assets/img/x10/x10-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz X10 · Plata',
    },
    'ex41': {
      name: 'EX41', tag: 'Eléctrica · Montaña', claim: 'Más montaña en cada salida.',
      text: 'La EX41 combina doble suspensión, cuadro de carbono y asistencia Polini. Una e-MTB para afrontar desniveles y explorar la montaña con una batería de 880 Wh.',
      price: 'Desde 3.650 €', href: 'ex41.html', custom: 'https://www.bicismendiz.com/node/5306',
      img: 'assets/img/ex41/ex41-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EX41 · Gris',
    },
    'ef21': {
      name: 'EF21', tag: 'Eléctrica · Carretera · Carbono', claim: 'Sigue la ruta, también cuando sube.',
      text: 'La EF21 combina un cuadro de carbono y motor central Polini. Para seguir disfrutando de las salidas de carretera con una asistencia que acompaña tu esfuerzo.',
      price: 'Desde 5.290 €', href: 'ef21.html', custom: 'https://www.bicismendiz.com/node/5299',
      img: 'assets/img/ef21/ef21-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EF21 · Azul',
    },
    'ef4': {
      name: 'EF4', tag: 'Eléctrica · Carretera · Aluminio', claim: 'Carretera para seguir sumando kilómetros.',
      text: 'La EF4 une cuadro de aluminio, horquilla de carbono y motor Polini. Su geometría de gran fondo está pensada para acompañarte durante largas jornadas de carretera.',
      price: 'Desde 4.290 €', href: 'ef4.html', custom: 'https://www.bicismendiz.com/bicicletas/electricas/mendiz-ef4-configurador',
      img: 'assets/img/ef4/ef4-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EF4 · Negro / Rojo',
    },
    'eg21': {
      name: 'EG21', tag: 'Eléctrica · Gravel · Carbono', claim: 'La ruta sigue más allá del asfalto.',
      text: 'Para enlazar carretera, pistas y caminos. La EG21 combina cuadro de carbono, paso para cubiertas de 700 × 50 y asistencia de un motor central Polini.',
      price: 'Desde 5.390 €', href: 'eg21.html', custom: 'https://www.bicismendiz.com/node/5424',
      img: 'assets/img/eg21/eg21-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EG21 · Arena',
    },
    'eg4': {
      name: 'EG4', tag: 'Eléctrica · Gravel · Aluminio', claim: 'Pon rumbo a los caminos.',
      text: 'La EG4 combina aluminio, horquilla de carbono y motor Polini. Está pensada para rutas por pistas, grava y asfalto, con una postura cómoda y asistencia al pedaleo.',
      price: 'Desde 4.290 €', href: 'eg4.html', custom: 'https://www.bicismendiz.com/bicicletas/electricas/mendiz-eg4-configurador',
      img: 'assets/img/eg4/eg4-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EG4 · Negro / Arena',
    },
  };

  // Preguntas -----------------------------------------------------------------
  // Cinco preguntas, siempre en este orden (STEPS). La segunda cambia según el
  // terreno elegido.
  // q: pregunta · help: apoyo · kind: 'photo' (fotos de terreno) o 'text'.
  // Cada opción: id (va en la dirección), title, text, icon (Material Symbols,
  // añadirlo también al enlace de la fuente en el HTML), short (cómo se ve en
  // «Tus respuestas»), why (motivo en el resultado; null = no se muestra) y
  // score: puntos que suma a cada modelo (ver «Recomendación» más abajo).

  // Modelos de cada terreno. El orden desempata: a igualdad de puntos gana el
  // que va antes.
  const POOL = {
    carretera: ['f14-sl-slp', 'f9-sl', 'f12-sl', 'tt10', 'ef21', 'ef4'],
    gravel: ['g11am', 'g12-sl', 'g4-icr', 'eg21', 'eg4'],
    montana: ['x10-boost', 'x40-sl-icr', 'x21-sl', 'x10', 'ex41'],
  };
  const ELECTRIC = new Set(['ef21', 'ef4', 'eg21', 'eg4', 'ex41']);

  // 1 · Terreno
  const TERRAIN = {
    id: 'terreno',
    q: '¿Por dónde vas a rodar?',
    help: 'Elige el terreno en el que vas a pasar más tiempo. Si dudas, piensa en tu salida más habitual.',
    kind: 'photo',
    options: [
      { id: 'carretera', title: 'Carretera', text: 'Asfalto, puertos y carreteras secundarias.',
        img: 'assets/img/compartido/terrenos/carretera.webp', alt: 'Ciclistas en carretera con bicicletas Mendiz',
        short: 'Carretera', why: 'Ruedas sobre todo por asfalto.' },
      { id: 'gravel', title: 'Asfalto y caminos', text: 'Combinar carretera, pistas y grava.',
        img: 'assets/img/compartido/terrenos/gravel.webp', alt: 'Cicloturismo gravel junto al lago con bicicletas Mendiz',
        short: 'Asfalto y caminos', why: 'Quieres enlazar asfalto, pistas y caminos.' },
      { id: 'montana', title: 'Montaña', text: 'Pistas, senderos y zonas de piedras y raíces.',
        img: 'assets/img/compartido/terrenos/montana.webp', alt: 'Ciclista de montaña en sendero con Mendiz X40',
        short: 'Montaña', why: 'Lo tuyo son los senderos y la montaña.' },
    ],
  };

  // 2 · Salida ideal, según el terreno
  const outing = (options) => ({
    id: 'salida',
    q: '¿Cómo es tu salida ideal?',
    help: 'Piensa en la salida que más te apetece repetir.',
    kind: 'text',
    options,
  });
  const OUTING = {
    carretera: outing([
      { id: 'desconectar', title: 'Una vuelta para desconectar', text: 'Salir un rato y disfrutar pedaleando.',
        icon: 'sunny', short: 'Desconectar', why: 'Sales a desconectar y disfrutar pedaleando.',
        score: { 'f9-sl': 2, 'f14-sl-slp': 1, ef4: 2, ef21: 1 } },
      { id: 'ruta', title: 'Una mañana de ruta', text: 'Kilómetros, algún puerto y una buena parada.',
        icon: 'landscape', short: 'Mañana de ruta', why: 'Te gustan las mañanas de ruta con algún puerto.',
        score: { 'f14-sl-slp': 2, 'f9-sl': 1, ef21: 2, ef4: 1 } },
      { id: 'jornada', title: 'Una jornada larga', text: 'Pasar horas sobre la bici y descubrir nuevas rutas.',
        icon: 'schedule', short: 'Jornada larga', why: 'Quieres pasar muchas horas sobre la bici.',
        score: { 'f9-sl': 2, 'f14-sl-slp': 1, ef4: 2, ef21: 1 } },
      { id: 'competir', title: 'Entrenar y competir', text: 'Salidas exigentes, marchas o pruebas.',
        icon: 'emoji_events', short: 'Competir', why: 'Entrenas y compites en salidas exigentes.',
        score: { 'f14-sl-slp': 2, 'f12-sl': 2, tt10: 2, ef21: 1 } },
    ]),
    gravel: outing([
      { id: 'explorar', title: 'Explorar cerca de casa', text: 'Improvisar y descubrir caminos nuevos.',
        icon: 'explore', short: 'Explorar', why: 'Te gusta improvisar y descubrir caminos cerca de casa.',
        score: { 'g4-icr': 2, g11am: 1, eg4: 2, eg21: 1 } },
      { id: 'variada', title: 'Una ruta larga y variada', text: 'Enlazar asfalto y pistas durante horas.',
        icon: 'route', short: 'Ruta variada', why: 'Quieres enlazar asfalto y pistas durante horas.',
        score: { g11am: 2, 'g12-sl': 1, eg21: 2, eg4: 1 } },
      { id: 'viajar', title: 'Viajar con equipaje', text: 'Llevar bolsas y encadenar varios días.',
        icon: 'backpack', short: 'Con equipaje', why: 'Quieres viajar con equipaje y encadenar varios días.',
        score: { g11am: 3, 'g4-icr': 2, eg4: 1, eg21: 1 } },
      { id: 'competir', title: 'Entrenar y competir', text: 'Buscar ritmo en pistas y pruebas de gravel.',
        icon: 'emoji_events', short: 'Competir', why: 'Buscas ritmo en pistas y pruebas de gravel.',
        score: { 'g12-sl': 3, g11am: 1, eg21: 2 } },
    ]),
    montana: outing([
      { id: 'pistas', title: 'Pistas y caminos fáciles', text: 'Disfrutar del entorno sin complicaciones.',
        icon: 'forest', short: 'Pistas fáciles', why: 'Quieres disfrutar del entorno por pistas y caminos fáciles.',
        score: { x10: 2, 'x10-boost': 1, ex41: 1 } },
      { id: 'mixta', title: 'Una ruta con un poco de todo', text: 'Combinar subidas, pistas y senderos.',
        icon: 'alt_route', short: 'Un poco de todo', why: 'Buscas rutas que combinen subidas, pistas y senderos.',
        score: { 'x10-boost': 2, 'x40-sl-icr': 1, x10: 1, ex41: 2 } },
      { id: 'tecnica', title: 'Senderos técnicos y bajadas', text: 'Afrontar piedras, raíces y pasos exigentes.',
        icon: 'terrain', short: 'Técnico', why: 'Te atraen los senderos técnicos y las bajadas.',
        score: { 'x40-sl-icr': 3, ex41: 2, 'x10-boost': 1 } },
      { id: 'xc', title: 'Entrenar y competir en XC', text: 'Buscar ritmo en subidas y circuitos.',
        icon: 'emoji_events', short: 'XC', why: 'Entrenas y compites en XC.',
        score: { 'x21-sl': 3, 'x40-sl-icr': 2 } },
    ]),
  };

  // 3 · Qué quieres disfrutar más (puntos para los tres terrenos)
  const ENJOY = {
    id: 'disfrutar',
    q: '¿Qué te gustaría disfrutar más?',
    help: 'Elige lo que más te motiva cuando sales con la bici.',
    kind: 'text',
    options: [
      { id: 'velocidad', title: 'La velocidad', text: 'Rodar con más ritmo y mejorar mis tiempos.',
        icon: 'speed', short: 'Velocidad', why: 'Te motiva rodar con más ritmo y mejorar tus tiempos.',
        score: { 'f12-sl': 2, tt10: 1, 'f14-sl-slp': 1, ef21: 1, 'g12-sl': 2, eg21: 2, g11am: 1, 'x21-sl': 2, 'x40-sl-icr': 1 } },
      { id: 'distancia', title: 'La distancia', text: 'Ampliar mis rutas y llegar a sitios nuevos.',
        icon: 'distance', short: 'Distancia', why: 'Quieres ampliar tus rutas y llegar más lejos.',
        score: { 'f9-sl': 2, 'f14-sl-slp': 1, ef4: 2, ef21: 1, g11am: 2, 'g4-icr': 1, eg21: 1, eg4: 1, ex41: 2, 'x10-boost': 1, 'x40-sl-icr': 1 } },
      { id: 'paisaje', title: 'El paisaje y la compañía', text: 'Disfrutar del recorrido sin mirar el reloj.',
        icon: 'group', short: 'Paisaje', why: 'Disfrutas del paisaje y la compañía sin mirar el reloj.',
        score: { 'f9-sl': 2, ef4: 2, ef21: 1, 'g4-icr': 2, eg4: 2, g11am: 1, x10: 2, 'x10-boost': 1, ex41: 1 } },
      { id: 'reto', title: 'El reto del terreno', text: 'Ganar confianza en recorridos más exigentes.',
        icon: 'terrain', short: 'Reto', why: 'Quieres ganar confianza en recorridos exigentes.',
        score: { 'f14-sl-slp': 2, ef21: 2, 'g12-sl': 1, g11am: 1, eg21: 2, 'x40-sl-icr': 2, 'x10-boost': 1, ex41: 1 } },
    ],
  };

  // 4 · Asistencia: no suma puntos, filtra (ver pick)
  const ASSIST = {
    id: 'asistencia',
    q: '¿Quieres asistencia eléctrica?',
    help: 'Un motor que acompaña tu pedaleo: subes con menos esfuerzo y llegas más lejos. Sin él, la bici es más ligera y sencilla.',
    kind: 'text',
    options: [
      { id: 'sin', title: 'Sin asistencia', text: 'Disfrutar del pedaleo con mis propias piernas.',
        icon: 'pedal_bike', short: 'Sin asistencia', why: 'Prefieres pedalear sin motor.' },
      { id: 'con', title: 'Con asistencia', text: 'Contar con ayuda en las subidas y las rutas largas.',
        icon: 'bolt', short: 'Eléctrica', why: 'Quieres una asistencia que acompañe tu esfuerzo.' },
      { id: 'duda', title: 'No lo tengo claro', text: 'Descubrir qué opción encaja mejor con mis salidas.',
        icon: 'help', short: 'Asistencia por decidir', why: null },
    ],
  };

  // 5 · Postura
  const POSTURE = {
    id: 'postura',
    q: '¿Cómo prefieres sentirte sobre la bici?',
    help: 'La geometría marca tu postura: más baja y alargada para el rendimiento, más erguida para la comodidad.',
    kind: 'text',
    options: [
      { id: 'deportiva', title: 'En una posición deportiva', text: 'Me gusta una postura enfocada en el rendimiento.',
        icon: 'sprint', short: 'Deportiva', why: 'Te va una postura enfocada en el rendimiento.',
        score: { 'f12-sl': 2, tt10: 2, 'f14-sl-slp': 1, ef21: 2, 'g12-sl': 2, eg21: 2, g11am: 1, 'x21-sl': 2, 'x40-sl-icr': 1 } },
      { id: 'relajada', title: 'Más erguido y relajado', text: 'Priorizo sentirme cómodo durante la ruta.',
        icon: 'self_improvement', short: 'Relajada', why: 'Priorizas una postura erguida y cómoda.',
        score: { 'f9-sl': 2, ef4: 2, 'g4-icr': 2, eg4: 2, x10: 2, 'x10-boost': 1, ex41: 1 } },
      { id: 'intermedia', title: 'En un punto intermedio', text: 'Busco combinar comodidad y sensaciones deportivas.',
        icon: 'balance', short: 'Intermedia', why: 'Buscas un equilibrio entre comodidad y sensaciones deportivas.',
        score: { 'f14-sl-slp': 2, 'f9-sl': 1, ef21: 1, g11am: 2, eg21: 1, eg4: 1, 'x10-boost': 2, 'x40-sl-icr': 1 } },
      // Sin preferencia: un punto a la geometría más equilibrada de cada terreno
      { id: 'orientacion', title: 'Necesito orientación', text: 'Todavía no sé qué postura me va mejor.',
        icon: 'support_agent', short: 'Postura por decidir', why: null,
        score: { 'f14-sl-slp': 1, g11am: 1, 'x10-boost': 1 } },
    ],
  };

  const STEPS = [
    () => TERRAIN,
    (answers) => OUTING[answers[0].opt.id],
    () => ENJOY,
    () => ASSIST,
    () => POSTURE,
  ];

  // Recomendación ---------------------------------------------------------------
  // Suma los puntos de las respuestas a los modelos del terreno y se queda con
  // los que permite la asistencia («sin»: sin motor; «con»: eléctricas). Si no
  // lo tiene claro entran todos, con un punto menos para las eléctricas, y entre
  // las alternativas siempre aparece la mejor del otro grupo para comparar.
  // Si el filtro deja un único modelo (la EX41 en montaña), la alternativa
  // también sale del otro grupo.
  function pick(answers) {
    const terrain = answers[0].opt.id;
    const assist = answers[3].opt.id;
    const pool = POOL[terrain];
    const score = Object.fromEntries(pool.map((id) => [id, 0]));
    answers.forEach(({ opt }) => {
      Object.entries(opt.score || {}).forEach(([id, n]) => { if (id in score) score[id] += n; });
    });
    if (assist === 'duda') ELECTRIC.forEach((id) => { if (id in score) score[id] -= 1; });

    const rank = (ids) => [...ids].sort((a, b) => score[b] - score[a]);   // sort estable: empata por orden de POOL
    const allowed = assist === 'sin' ? pool.filter((id) => !ELECTRIC.has(id))
      : assist === 'con' ? pool.filter((id) => ELECTRIC.has(id))
      : pool;
    const [main, ...rest] = rank(allowed);
    const other = rank(pool.filter((id) => ELECTRIC.has(id) !== ELECTRIC.has(main)));

    let also = rest.slice(0, 2);
    if (assist === 'duda') also = [other[0], ...rest.filter((id) => id !== other[0])].slice(0, 2);
    else if (!also.length) also = other.slice(0, 1);

    return { result: true, main, also, compare: assist === 'duda' ? (ELECTRIC.has(main) ? 'sin' : 'con') : null };
  }

  // Fotos de las respuestas (solo en la propuesta con fotos) -----------------------
  // assets/img/que-mendiz/respuestas/<pregunta>-[<terreno>-]<respuesta>.webp,
  // generadas con tools/que-mendiz-respuestas.py. Salida, disfrute y asistencia
  // cambian de foto según el terreno; las respuestas de NO_PHOTO llevan su icono.
  const PHOTO_DIR = 'assets/img/que-mendiz/respuestas/';
  const PHOTO_BY_TERRAIN = new Set(['salida', 'disfrutar', 'asistencia']);
  const NO_PHOTO = new Set(['duda', 'orientacion']);
  const photoFor = (node, opt, answers) => {
    if (NO_PHOTO.has(opt.id)) return null;
    const terrain = PHOTO_BY_TERRAIN.has(node.id) ? `${answers[0].opt.id}-` : '';
    return `${PHOTO_DIR}${node.id}-${terrain}${opt.id}.webp`;
  };

  // Rutas ---------------------------------------------------------------------
  const PREFIX = '#/';
  const INTRO = '#inicio';   // cualquier hash que no empiece por #/ es la introducción
  const href = (segs) => PREFIX + segs.join('/');

  // Recorre las preguntas con los segmentos de la dirección. Se queda en el
  // último paso válido si alguno no existe. Tras la quinta, el resultado.
  function resolve(segs) {
    const answers = [];
    for (const seg of segs) {
      if (answers.length === STEPS.length) break;
      const node = STEPS[answers.length](answers);
      const opt = node.options.find((o) => o.id === seg);
      if (!opt) break;
      answers.push({ node, opt });
    }
    const node = answers.length === STEPS.length ? pick(answers) : STEPS[answers.length](answers);
    return { node, answers };
  }

  // La última ruta completa que se ha recorrido: al volver atrás se marca la
  // respuesta que se había elegido.
  const LAST = 'mendiz-finder-last';
  const store = {
    get: () => { try { return sessionStorage.getItem(LAST) || ''; } catch { return ''; } },
    set: (v) => { try { sessionStorage.setItem(LAST, v); } catch { /* sin almacenamiento */ } },
  };

  // Marcado -------------------------------------------------------------------
  const icon = (name, cls = '') => `<span class="material-symbols-outlined${cls ? ` ${cls}` : ''}" aria-hidden="true">${name}</span>`;

  function bar(answers, node) {
    const done = answers.length;
    const isResult = !!node.result;
    const total = STEPS.length;
    // Cuenta el paso en el que estás: 1 de 5 ≈ 17 %, 5 de 5 ≈ 83 %, resultado = 100 %
    const ratio = isResult ? 1 : (done + 1) / (total + 1);
    // Desde la primera pregunta, «Atrás» vuelve a la introducción
    const back = done ? href(answers.slice(0, -1).map((a) => a.opt.id)) : INTRO;
    const status = isResult ? 'Tu resultado' : `Paso ${done + 1} de ${total}`;
    const trail = answers.map((a, i) => {
      const to = href(answers.slice(0, i).map((x) => x.opt.id));
      return `<li><a href="${to}" aria-label="Cambiar: ${a.opt.short}">${a.opt.short}</a></li>`;
    }).join('');
    return `
      <div class="finder__bar">
        <a class="finder__back" href="${back}">${icon('arrow_back')}<span>Atrás</span></a>
        <p class="finder__status" aria-live="polite">${status}</p>
        ${done ? `<a class="finder__restart" href="${PREFIX}">${icon('restart_alt')}<span>Empezar de nuevo</span></a>` : '<span class="finder__restart" aria-hidden="true"></span>'}
      </div>
      <div class="finder__meter" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(ratio * 100)}">
        <span style="--p:${lastRatio}" data-p="${ratio}"></span>
      </div>
      ${trail ? `<nav class="finder__trail" aria-label="Tus respuestas"><span>Tus respuestas</span><ol>${trail}</ol></nav>` : ''}`;
  }

  function question(node, answers) {
    const segs = answers.map((a) => a.opt.id);
    // Respuesta elegida antes (si se vuelve atrás por la misma ruta)
    const last = store.get().replace(PREFIX, '').split('/').filter(Boolean);
    const prev = segs.every((s, i) => last[i] === s) ? last[segs.length] : null;
    const n = node.options.length;
    const kind = PHOTO_MODE ? 'photo' : node.kind;

    const options = node.options.map((o) => {
      const chosen = o.id === prev ? ' is-chosen' : '';
      const mark = chosen ? '<span class="finder-option__chosen">Tu elección</span>' : '';
      if (kind === 'photo') {
        // En la propuesta con fotos la foto acompaña al texto del enlace: alt vacío
        const src = PHOTO_MODE ? photoFor(node, o, answers) : o.img;
        const media = !src
          ? `<figure class="media finder-option__media finder-option__media--icon">${icon(o.icon)}</figure>`
          : PHOTO_MODE
            ? `<figure class="media finder-option__media"><img src="${src}" alt="" width="1200" height="800" decoding="async"></figure>`
            : `<figure class="media finder-option__media"><img src="${src}" alt="${o.alt}" width="1000" height="750" decoding="async"></figure>`;
        return `
          <li>
            <a class="finder-option finder-option--photo${chosen}" href="${href([...segs, o.id])}">
              ${media}
              <span class="finder-option__body">
                <span class="finder-option__head"><span class="heading-card finder-option__title">${o.title}</span>${icon('arrow_forward', 'finder-option__arrow')}</span>
                <span class="finder-option__text">${o.text}</span>
                ${mark}
              </span>
            </a>
          </li>`;
      }
      return `
        <li>
          <a class="finder-option finder-option--text${chosen}" href="${href([...segs, o.id])}">
            ${icon(o.icon, 'finder-option__icon')}
            <span class="finder-option__body">
              <span class="heading-card finder-option__title">${o.title}</span>
              <span class="finder-option__text">${o.text}</span>
            </span>
            <span class="finder-option__foot">${mark}${icon('arrow_forward', 'finder-option__arrow')}</span>
          </a>
        </li>`;
    }).join('');

    return `
      <div class="finder__step">
        <header class="finder__head">
          <h1 class="heading-editorial finder__question" id="finder-title" tabindex="-1">${node.q}</h1>
          <p class="finder__help">${node.help}</p>
        </header>
        <ul class="finder__options finder__options--${kind} finder__options--n${n}">${options}</ul>
      </div>`;
  }

  // Introducción: qué es, cómo funciona y botón para empezar
  function intro() {
    return `
      <div class="finder__step finder__start">
        <div class="finder__start-text">
          <span class="eyebrow">Te ayudamos a elegir</span>
          <h1 class="heading-editorial finder__title" id="finder-title" tabindex="-1">¿Qué Mendiz es para ti?</h1>
          <p class="lead muted finder__lead">Responde cinco preguntas sobre cómo y por dónde ruedas y te llevamos a la bici que mejor encaja contigo.</p>
          <div class="finder__start-cta">
            <a class="btn btn--lg" href="${PREFIX}">Empezar${icon('arrow_forward')}</a>
            <p class="finder__note">Menos de un minuto</p>
          </div>
        </div>
        <figure class="media finder__start-media">
          <img src="assets/img/que-mendiz/intro-sendero.webp" alt="Ciclista con una Mendiz G11 y bolsa de sillín subiendo por una pista entre pinos" width="1200" height="900" fetchpriority="high" decoding="async">
        </figure>
      </div>`;
  }

  function card(m, { wide = false, why = [], lazy = false, level = 'h2' } = {}) {
    const reasons = why.length
      ? `<div class="finder__why"><p class="finder__why-title">Encaja contigo porque</p><ul>${why.map((w) => `<li>${icon('check')}<span>${w}</span></li>`).join('')}</ul></div>`
      : '';
    return `
      <article class="bike-card${wide ? ' bike-card--wide finder__match' : ''}">
        <div class="bike-card__media">
          <img src="${m.img}" alt="${m.alt}" width="${m.w}" height="${m.h}"${m.e8 ? ' class="is-gray-bg"' : ''}${lazy ? ' loading="lazy"' : ''} decoding="async">
        </div>
        <div class="bike-card__body">
          <div class="bike-card__top"><span class="eyebrow">${m.tag}</span></div>
          <${level} class="bike-card__name display">${m.name}</${level}>
          <p class="bike-card__claim">${m.claim}</p>
          ${wide ? `<p class="bike-card__for">${m.text}</p>` : ''}
          ${reasons}
          <p class="bike-card__from">${m.price}</p>
          <div class="bike-card__foot">
            <div class="btn-row">
              ${wide ? `<a class="btn btn--secondary" href="${m.custom}">Personalizar<span class="visually-hidden"> la ${m.name}</span></a>` : ''}
              <a class="btn bike-card__cta" href="${m.href}">Conócela<span class="visually-hidden"> la ${m.name}</span></a>
            </div>
          </div>
        </div>
      </article>`;
  }

  function result({ main: id, also: alsoIds, compare }, answers) {
    const m = MODELS[id];
    // Motivos: los de terreno y asistencia y los de las respuestas que han
    // sumado puntos a este modelo
    const why = answers.filter((a) => a.opt.why && (!a.opt.score || a.opt.score[id] > 0)).map((a) => a.opt.why);
    const also = alsoIds.filter((a) => MODELS[a] && a !== id);
    const note = compare
      ? `<p class="finder__also-note">Como no tienes clara la asistencia, incluimos una opción ${compare === 'con' ? 'con motor' : 'sin motor'} para que compares.</p>`
      : '';
    return `
      <div class="finder__step finder__result">
        <header class="finder__head">
          <span class="eyebrow">Tu Mendiz</span>
          <h1 class="heading-editorial finder__question" id="finder-title" tabindex="-1">La ${m.name} es para ti</h1>
        </header>
        <div class="bike-list bike-list--clean">${card(m, { wide: true, why })}</div>
        ${also.length ? `
        <section class="finder__also" aria-labelledby="finder-also-title">
          <h2 class="heading-section finder__also-title" id="finder-also-title">También te puede encajar</h2>
          ${note}
          <div class="bike-grid finder__also-grid">${also.map((a) => card(MODELS[a], { lazy: true, level: 'h3' })).join('')}</div>
        </section>` : ''}
        <p class="finder__more">
          <a class="link-arrow" href="${PREFIX}">${icon('restart_alt')}<span>Volver a empezar</span></a>
          <a class="link-arrow" href="bicis.html"><span>Ver todas las bicis</span>${icon('arrow_forward')}</a>
        </p>
      </div>`;
  }

  // Pintado -------------------------------------------------------------------
  let firstRender = true;
  let lastRatio = 0;   // progreso del paso anterior: la barra crece (o baja) desde ahí

  function render() {
    const raw = decodeURIComponent(location.hash);

    // Introducción
    if (!raw.startsWith(PREFIX)) {
      root.innerHTML = intro();
      root.dataset.state = 'intro';
      if (dealer) dealer.hidden = true;
      document.title = '¿Qué Mendiz es para ti? · Mendiz';
      afterRender();
      return;
    }

    const segs = raw.slice(PREFIX.length).split('/').filter(Boolean);
    const { node, answers } = resolve(segs);

    // Dirección no válida: se corrige sin dejar rastro en el historial
    const canonical = href(answers.map((a) => a.opt.id));
    if (segs.length !== answers.length) history.replaceState(null, '', canonical);

    const isResult = !!node.result;
    if (isResult) store.set(canonical);

    root.innerHTML = bar(answers, node) + (isResult ? result(node, answers) : question(node, answers));
    root.dataset.state = isResult ? 'result' : 'question';
    if (dealer) dealer.hidden = !isResult;

    const title = isResult ? `La ${MODELS[node.main].name} es para ti` : node.q;
    document.title = `${title} · Mendiz`;
    afterRender();
  }

  function afterRender() {
    const fill = root.querySelector('.finder__meter span');
    if (fill) {
      lastRatio = Number(fill.dataset.p);
      fill.getBoundingClientRect();   // fija el valor de partida para que la transición se vea
      fill.style.setProperty('--p', lastRatio);
    } else {
      lastRatio = 0;
    }
    // Al cambiar de paso: arriba del asesor y el foco en el titular
    if (!firstRender) {
      const top = root.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0) - 16;
      if (window.scrollY > top) {
        // `lenis` es la instancia de js/main.js (si el scroll suave está activo)
        if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(top, { immediate: true, force: true });
        else window.scrollTo(0, top);
      }
      root.querySelector('#finder-title')?.focus({ preventScroll: true });
    }
    firstRender = false;
  }

  window.addEventListener('hashchange', render);
  render();
})();
