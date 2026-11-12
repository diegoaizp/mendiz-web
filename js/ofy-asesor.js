/* ==========================================================================
   MENDIZ — Only For You · «Configura tu Mendiz» (only-for-you-configura.html)
   Árbol de decisión que termina en un montaje concreto y lleva al
   configurador con ese montaje marcado.

   · Diez niveles (LEVELS), siempre en este orden:
       1 Tipo de bicicleta · 2 Disciplina · 3 Modalidad · 4 Material del
       cuadro · 5 Sistema de eje · 6 Gama de carbono · 7 Versión ·
       8 Horquilla · 9 Transmisión · 10 Ruedas
   · Cada respuesta filtra los montajes (js/ofy-montajes.js, generado con
     tools/ofy-asesor.py). Un nivel solo se pregunta si los montajes que
     quedan tienen más de un valor; si no, se da por resuelto y se salta.
   · En cuanto queda un único montaje (o se acaban los niveles) se muestra
     la ficha de la bici con ese montaje y «Configurar», que abre
     configurador-f14.html?modelo=…&montaje=…&color=…
   · Del nivel 6 en adelante hay «Sin preferencia»: no filtra y, si al final
     encajan varios montajes, se propone el más económico.
   · Cada paso tiene su dirección en el hash (#/ = primera pregunta;
     #/muscular/carretera/rendimiento/sl/shimano-105-di2/dt-swiss-a-1800,
     un resultado): atrás/adelante funcionan y el resultado se comparte.
   · Todas las opciones llevan imagen; mientras falta, un placeholder con el
     nombre del archivo esperado (ver «Imágenes de las opciones»).
   · Mismo marcado y estilos que «¿Qué Mendiz es para ti?»
     (css/que-mendiz.css); lo propio, en css/ofy-asesor.css.
   ========================================================================== */
(() => {
  const root = document.querySelector('[data-ofy-asesor]');
  const DATA = window.MENDIZ_OFY;
  if (!root || !DATA) return;
  const dealer = document.querySelector('[data-finder-dealer]');
  const MODELS = DATA.modelos;
  const ALL = DATA.montajes;

  // Niveles -------------------------------------------------------------------
  // id = campo del montaje · label = nombre del nivel · q/help = pregunta ·
  // any: admite «Sin preferencia» · values: textos de cada valor, con icon
  // (el del placeholder de su imagen) e img/alt si ya tiene foto. Los niveles
  // 8–10 toman los valores de los datos (dataOption) y el icono del nivel.
  const ANY = 'sin-preferencia';
  const T = 'assets/img/compartido/terrenos/';
  const LEVELS = [
    { id: 'tipo', label: 'Tipo de bicicleta', q: '¿Qué tipo de bici buscas?',
      help: 'Con o sin motor: es lo primero que define tu Mendiz.',
      values: {
        muscular: { img: 'assets/img/ofy-asesor/tipo-muscular-uso.webp', alt: 'Dos ciclistas rodando con bicicletas Mendiz por una carretera entre árboles', title: 'Sin motor', text: 'Pedalear con tus piernas, con una bici más ligera y sencilla.', icon: 'pedal_bike' },
        electrica: { img: 'assets/img/ofy-asesor/tipo-electrica-uso.webp', alt: 'Ciclista subiendo un camino de bosque con una Mendiz EG21 eléctrica', title: 'Eléctrica', text: 'Un motor Polini que acompaña tu pedaleo en las subidas.', icon: 'bolt' },
      } },
    { id: 'disciplina', label: 'Disciplina', q: '¿Por dónde vas a rodar?',
      help: 'Elige el terreno en el que vas a pasar más tiempo.',
      values: {
        carretera: { title: 'Carretera', text: 'Asfalto, puertos y carreteras secundarias.',
          img: `${T}carretera.webp`, alt: 'Ciclistas en carretera con bicicletas Mendiz' },
        gravel: { title: 'Gravel', text: 'Combinar carretera, pistas y grava.',
          img: `${T}gravel.webp`, alt: 'Cicloturismo gravel junto al lago con bicicletas Mendiz' },
        montana: { title: 'Montaña', text: 'Pistas, senderos y zonas de piedras y raíces.',
          img: `${T}montana.webp`, alt: 'Ciclista de montaña en sendero con Mendiz X40' },
      } },
    { id: 'modalidad', label: 'Modalidad', q: '¿Qué modalidad es la tuya?',
      help: 'Cada modalidad tiene su geometría: más baja y alargada para ir rápido, más erguida para ganar comodidad.',
      values: {
        rendimiento: { img: 'assets/img/ofy-asesor/modalidad-rendimiento-uso.webp', alt: 'Ciclista Mendiz afrontando una curva en carretera', title: 'Rendimiento', text: 'Entrenar y competir en recorridos variados, con subidas, llanos y bajadas.', icon: 'landscape' },
        aero: { img: 'assets/img/ofy-asesor/modalidad-aero-uso.webp', alt: 'Ciclista con una Mendiz F14 MPL en posición aerodinámica', title: 'Aero', text: 'Rodar rápido en llano y en grupo, con una posición más baja.', icon: 'speed' },
        'gran-fondo': { img: 'assets/img/ofy-asesor/modalidad-gran-fondo-uso.webp', alt: 'Dos ciclistas compartiendo una salida en carretera con bicicletas Mendiz', title: 'Gran fondo', text: 'Largas jornadas y marchas, con una posición más cómoda.', icon: 'schedule' },
        triatlon: { img: 'assets/img/ofy-asesor/modalidad-triatlon-uso.webp', alt: 'Ciclista con la Mendiz TT10 en posición aerodinámica sobre el manillar', title: 'Triatlón', text: 'Triatlón y contrarreloj, acoplado sobre el manillar.', icon: 'timer' },
        'gravel-racing': { title: 'Gravel racing', text: 'Ritmo en pistas y pruebas de gravel.', icon: 'route' },
        xc: { title: 'Cross country', text: 'Doble suspensión para subir con ritmo y bajar con control.', icon: 'terrain' },
        'e-mtb': { title: 'e-MTB', text: 'Doble suspensión de 150 mm y batería de 880 Wh.', icon: 'bolt' },
      } },
    { id: 'material', label: 'Material del cuadro', q: '¿De qué material quieres el cuadro?',
      help: 'El material marca el peso y el tacto de la bici.',
      values: {
        carbono: { title: 'Carbono', text: 'Más ligero y rígido.', icon: 'diamond' },
        aluminio: { title: 'Aluminio', text: 'Resistente y más económico.', icon: 'construction' },
      } },
    { id: 'eje', label: 'Sistema de eje', q: '¿Qué sistema de ejes necesitas?',
      help: 'Cómo se sujetan las ruedas al cuadro y a la horquilla.',
      values: {
        pasante: { title: 'Eje pasante', text: 'Ruedas firmes y bien alineadas con frenos de disco.', icon: 'sync_alt' },
        boost: { title: 'Boost', text: 'Ejes más anchos para una rueda de montaña más rígida.', icon: 'open_in_full' },
      } },
    { id: 'gama', label: 'Gama de carbono', q: '¿Qué gama de carbono prefieres?', any: true,
      help: 'SL y SLP comparten geometría, perfiles e integración; cambia la construcción del carbono y, con ella, el peso.',
      values: {
        sl: { img: 'assets/img/ofy-asesor/gama-sl-tres-capas.webp', alt: 'Tres capas de carbono Mendiz SL', title: 'SL', text: 'SuperLight: el equilibrio entre peso y precio.', icon: 'balance' },
        slp: { img: 'assets/img/ofy-asesor/gama-slp-tres-capas.webp', alt: 'Tres capas de carbono Mendiz SLP', title: 'SLP', text: 'La construcción más ligera, con los grupos más altos.', icon: 'diamond' },
      } },
    { id: 'version', label: 'Versión', q: '¿Qué versión prefieres?', any: true,
      help: 'Variantes del mismo cuadro con un enfoque distinto.',
      values: {
        estandar: { title: 'Estándar', text: 'Grupos de gama alta con ruedas de carbono.', icon: 'tune' },
        light: { title: 'Light', text: 'La versión más ligera, con ruedas Scope Artech 4.', icon: 'scale' },
        'manillar-plano': { title: 'Manillar plano', text: 'Postura más erguida y control como en una de montaña.', icon: 'horizontal_rule' },
        carretera: { title: 'Carretera', text: 'Grupo de carretera para ir rápido por asfalto y pistas.', icon: 'road' },
        '1x': { title: 'Gravel 1×', text: 'Un solo plato: más sencillo y con menos mantenimiento.', icon: 'looks_one' },
        '2x': { title: 'Gravel 2×', text: 'Dos platos: más desarrollos para rutas con desnivel.', icon: 'looks_two' },
      } },
    { id: 'horquilla', icon: 'swap_vert', label: 'Horquilla', q: '¿Qué horquilla quieres?', any: true, fromData: true,
      help: 'La suspensión delantera marca cómo absorbe la bici el terreno y cuánto pesa.' },
    { id: 'transmision', icon: 'settings', label: 'Grupo', q: '¿Qué grupo quieres?', any: true, fromData: true,
      help: 'El grupo marca cómo cambias y cómo frenas, y buena parte del precio. Con cambio electrónico, cada cambio es un toque.' },
    { id: 'ruedas', icon: 'trip_origin', label: 'Ruedas', q: '¿Y qué ruedas?', any: true, fromData: true,
      help: 'Las de carbono pesan menos y tienen perfiles más altos; las de aluminio son más resistentes y económicas.' },
  ];

  // Textos de los valores que vienen de los datos (horquilla, transmisión, ruedas)
  function dataOption(level, b) {
    if (level.id === 'horquilla') {
      const mm = b.horquillaLabel.match(/(\d+) mm/);
      return { title: b.horquillaLabel, text: mm ? `Suspensión de ${mm[1]} mm.` : 'Rígida, de carbono.' };
    }
    if (level.id === 'transmision') {
      const electronic = /Di2|AXS/.test(b.transmisionLabel);
      return { title: b.transmisionLabel, text: electronic ? 'Cambio electrónico.' : 'Cambio mecánico.' };
    }
    if (b.version === 'light') return { title: b.ruedasLabel, text: 'Versión Light: la más ligera, con ruedas de carbono.' };
    const mat = { carbono: 'Ruedas de carbono.', aluminio: 'Ruedas de aluminio.' }[b.ruedasMaterial];
    return { title: b.ruedasLabel, text: mat || 'Ruedas de serie del montaje.' };
  }
  const valueTitle = (level, b) => (level.fromData ? dataOption(level, b).title : level.values[b[level.id]]?.title);

  // Utilidades -------------------------------------------------------------------
  const euros = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
  const byPrice = (list) => [...list].sort((a, b) => a.precio - b.precio);
  const icon = (name, cls = '') => `<span class="material-symbols-outlined${cls ? ` ${cls}` : ''}" aria-hidden="true">${name}</span>`;

  // Opciones de un nivel con los montajes que quedan: un valor por opción,
  // con su precio de partida. Las de datos, de la más económica a la más cara.
  function optionsFor(level, cands) {
    const groups = new Map();
    cands.forEach((b) => {
      const v = b[level.id];
      if (v == null) return;
      if (!groups.has(v)) groups.set(v, []);
      groups.get(v).push(b);
    });
    let opts = [...groups.entries()].map(([id, list]) => {
      const first = byPrice(list)[0];
      let meta = level.fromData ? dataOption(level, first) : level.values[id];
      // Estándar / Light se distinguen por sus ruedas: se muestra el juego
      // del montaje de partida, con las alternativas explicadas en el texto.
      if (level.id === 'version' && ['estandar', 'light'].includes(id)) {
        const slpOnly = list.every((b) => b.gama === 'slp');
        const wheelNames = [...new Set(list.map((b) => b.ruedasLabel))];
        const text = id === 'light'
          ? 'Ruedas Scope Artech 4 de carbono, con Shimano Dura-Ace Di2 o SRAM RED AXS E1.'
          : slpOnly
            ? 'Fulcrum Soniq 42/47 con Dura-Ace Di2 o SRAM RED. Con Campagnolo Super Record, Hyperon o Bora Ultra TW.'
            : `Ruedas ${wheelNames.join(', ')}, según el grupo elegido.`;
        meta = { ...meta, text, img: `assets/img/ofy-asesor/ruedas-${first.ruedas}.webp`,
          alt: `Ruedas ${first.ruedasLabel}`, productMedia: true };
      }
      return { id, ...meta, min: first.precio, n: list.length };
    });
    opts = level.fromData || level.any
      ? opts.sort((a, b) => a.min - b.min)
      : opts.sort((a, b) => Object.keys(level.values).indexOf(a.id) - Object.keys(level.values).indexOf(b.id));
    return opts;
  }

  // Eléctricas: el terreno se pregunta siempre. Solo la de montaña tiene montaje
  // configurable (EX41); carretera y gravel llevan al listado de eléctricas.
  const E_LISTING = {
    carretera: { id: 'carretera', title: 'Carretera', text: 'Asfalto, puertos y carreteras secundarias.', href: 'electricas.html?tipo=carretera',
      img: `${T}carretera.webp`, alt: 'Ciclistas en carretera con bicicletas Mendiz' },
    gravel: { id: 'gravel', title: 'Gravel', text: 'Combinar carretera, pistas y grava.', href: 'electricas.html?tipo=gravel',
      img: `${T}gravel.webp`, alt: 'Cicloturismo gravel junto al lago con bicicletas Mendiz' },
  };
  const extraFor = (level, cands) => (level.id === 'disciplina' && cands.every((b) => b.tipo === 'electrica')
    ? Object.values(E_LISTING).filter((o) => !cands.some((b) => b.disciplina === o.id)) : []);

  // Estándar / Light no se pregunta aparte: lo deciden el grupo y las ruedas
  // (Light = ruedas Scope Artech 4). Primero grupo, luego ruedas.
  const skipLevel = (level, cands) => level.id === 'version'
    && cands.every((b) => b.version == null || b.version === 'estandar' || b.version === 'light');

  // Rutas -----------------------------------------------------------------------
  const PREFIX = '#/';
  const href = (segs) => PREFIX + segs.join('/');

  // Recorre los niveles con los segmentos de la dirección. Se salta los que
  // no tienen nada que elegir y se para en la primera pregunta sin respuesta
  // (o con una respuesta que no existe).
  function resolve(segs) {
    let cands = ALL;
    const answers = [];
    for (let i = 0; i < LEVELS.length; i += 1) {
      if (cands.length === 1) break;
      const level = LEVELS[i];
      if (skipLevel(level, cands)) continue;
      const opts = optionsFor(level, cands);
      const extra = extraFor(level, cands);
      if (opts.length + extra.length < 2) continue;
      const seg = segs[answers.length];
      const opt = seg === ANY && level.any
        ? { id: ANY, title: 'Sin preferencia', min: byPrice(cands)[0].precio }
        : opts.find((o) => o.id === seg);
      if (!opt) return { question: { level, index: i, opts, extra, cands }, answers };
      answers.push({ level, opt });
      if (opt.id !== ANY) cands = cands.filter((b) => b[level.id] === opt.id);
    }
    return { result: { build: byPrice(cands)[0], cands }, answers };
  }

  // La última ruta completa: al volver atrás se marca la respuesta elegida
  const LAST = 'mendiz-ofy-last';
  const store = {
    get: () => { try { return sessionStorage.getItem(LAST) || ''; } catch { return ''; } },
    set: (v) => { try { sessionStorage.setItem(LAST, v); } catch { /* sin almacenamiento */ } },
  };

  // Marcado ---------------------------------------------------------------------
  function bar(answers, ratio, isResult) {
    const done = answers.length;
    const back = done ? href(answers.slice(0, -1).map((a) => a.opt.id)) : 'only-for-you.html';
    const status = isResult ? 'Tu Mendiz' : `Paso ${done + 1}`;
    const trail = answers.map((a, i) => {
      const to = href(answers.slice(0, i).map((x) => x.opt.id));
      const text = a.opt.id === ANY ? `${a.level.label}: sin preferencia` : a.opt.title;
      return `<li><a href="${to}" aria-label="Cambiar ${a.level.label.toLowerCase()}: ${text}">${text}</a></li>`;
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

  function question({ level, opts, extra = [], cands }, answers) {
    const segs = answers.map((a) => a.opt.id);
    const last = store.get().replace(PREFIX, '').split('/').filter(Boolean);
    const prev = segs.every((s, i) => last[i] === s) ? last[segs.length] : null;
    const all = [...opts, ...extra].sort((a, b) => Object.keys(level.values || {}).indexOf(a.id) - Object.keys(level.values || {}).indexOf(b.id));
    const allWithAny = level.any
      ? [...all, { id: ANY, title: 'Sin preferencia', text: 'Seguimos sin filtrar. Podrás cambiarlo en el configurador.', icon: 'help', min: byPrice(cands)[0].precio, n: cands.length }]
      : all;
    const price = (o) => o.min == null ? '' : `<span class="ofy-option__price">${o.n > 1 ? 'Desde ' : ''}${euros(o.min)}</span>`;

    // Todas las opciones llevan imagen (ver media). La foto acompaña al texto
    // del enlace: alt vacío, salvo las fotos de terreno, que ya lo traen.
    const items = allWithAny.map((o) => {
      const chosen = o.id === prev ? ' is-chosen' : '';
      const mark = chosen ? '<span class="finder-option__chosen">Tu elección</span>' : '';
      return `
        <li>
          <a class="finder-option finder-option--photo${o.id === ANY ? ' ofy-option--any' : ''}${chosen}" href="${o.href || href([...segs, o.id])}">
            ${media(level, o)}
            <span class="finder-option__body">
              <span class="finder-option__head"><span class="heading-card finder-option__title">${o.title}</span>${icon('arrow_forward', 'finder-option__arrow')}</span>
              <span class="finder-option__text">${o.text}</span>
              ${price(o)}
              ${mark}
            </span>
          </a>
        </li>`;
    }).join('');

    return `
      <div class="finder__step">
        <header class="finder__head">
          <span class="eyebrow">${level.label}</span>
          <h1 class="heading-editorial finder__question" id="finder-title" tabindex="-1">${level.q}</h1>
          <p class="finder__help">${level.id === 'version' && cands.every((b) => b.gama === 'slp') ? 'El cuadro SLP es el mismo. Con Dura-Ace o SRAM RED, Estándar lleva Fulcrum Soniq 42/47 y Light lleva Scope Artech 4.' : level.help}</p>
        </header>
        <ul class="finder__options finder__options--photo finder__options--n${allWithAny.length}">${items}</ul>
      </div>`;
  }

  // Fotografías locales (procedencia: _archivo/2026-11-12/assets/img/ofy-asesor/fuentes.json).
  const IMG_DIR = 'assets/img/ofy-asesor/';
  const PHOTO_NOTES = {
    'ruedas-mavic-e-crossride-mullet': 'Foto de familia · combinación mullet',
    'ruedas-fulcrum-e-metal-500-e-fire-500-mullet': 'Foto de familia E-Metal · combinación mullet',
  };
  function media(level, o) {
    if (o.id === ANY) {
      return `<figure class="media finder-option__media ofy-media"><span class="ofy-placeholder" aria-hidden="true">${icon(o.icon)}</span></figure>`;
    }
    if (level.id === 'disciplina' && o.img) {
      return `<figure class="media finder-option__media"><img src="${o.img}" alt="${o.alt || ''}" width="1000" height="750" decoding="async"></figure>`;
    }
    const key = `${level.id}-${o.id}`;
    const note = PHOTO_NOTES[key];
    return `<figure class="media finder-option__media ofy-media ofy-media--photo${(level.id === 'tipo' || (level.id === 'modalidad' && o.img)) ? ' ofy-media--lifestyle' : ''}${(o.productMedia || ['gama', 'horquilla', 'transmision', 'ruedas'].includes(level.id)) ? ' ofy-media--component' : ''}${level.fromData ? ' ofy-media--component' : ''}">
      <img src="${o.img || `${IMG_DIR}${key}.webp`}" alt="${o.alt || ''}" width="1200" height="800" decoding="async">
      ${note ? `<figcaption class="ofy-media__note">${note}</figcaption>` : ''}
    </figure>`;
  }
  // A failed image never exposes filenames or leaves a broken-image icon.
  root.addEventListener('error', (e) => {
    if (!(e.target instanceof HTMLImageElement) || !e.target.closest('.ofy-media')) return;
    const figure = e.target.closest('.ofy-media');
    e.target.remove();
    figure.insertAdjacentHTML('afterbegin', `<span class="ofy-placeholder" aria-hidden="true">${icon('image')}</span>`);
  }, true);

  function configHref(b) {
    const m = MODELS[b.modelo];
    const q = new URLSearchParams({ modelo: b.modelo, montaje: b.code });
    if (m.color) q.set('color', m.color);
    return `configurador-f14.html?${q.toString().replace(/&/g, '&amp;')}`;
  }

  function result({ build: b, cands }, answers) {
    const m = MODELS[b.modelo];
    const asked = new Set(answers.map((a) => a.level.id));
    // Los diez niveles con el valor del montaje (los que no aplican se omiten).
    // Los que no se han preguntado salen del modelo: se marcan.
    const rows = LEVELS.map((level) => {
      const v = valueTitle(level, b);
      if (!v) return '';
      const auto = !asked.has(level.id) || answers.find((a) => a.level.id === level.id)?.opt.id === ANY;
      return `<div${auto ? ' class="is-auto"' : ''}><dt>${level.label}</dt><dd>${v}</dd></div>`;
    }).join('');
    const note = cands.length > 1
      ? `<p class="ofy-pick__note">Encajan ${cands.length} montajes con tus respuestas: partimos del más económico. En el configurador puedes cambiar grupo y ruedas.</p>`
      : '';

    return `
      <div class="finder__step finder__result">
        <header class="finder__head">
          <span class="eyebrow">Only For You</span>
          <h1 class="heading-editorial finder__question" id="finder-title" tabindex="-1">Tu ${m.name} está lista para configurar</h1>
        </header>
        <div class="bike-list bike-list--clean">
          <article class="bike-card bike-card--wide finder__match ofy-pick">
            <div class="bike-card__media">
              <img src="${m.img}" alt="${m.alt}" width="1200" height="800" decoding="async">
            </div>
            <div class="bike-card__body">
              <div class="bike-card__top"><span class="eyebrow">${m.tag}</span></div>
              <h2 class="bike-card__name display">${m.name}</h2>
              <p class="bike-card__claim">${m.claim}</p>
              <p class="ofy-pick__build">Montaje <strong>${b.name}</strong></p>
              <dl class="ofy-combo" aria-label="Tu combinación">${rows}</dl>
              ${note}
              <p class="bike-card__from ofy-pick__price">${euros(b.precio)}<span> · precio del montaje de serie</span></p>
              <div class="bike-card__foot">
                <div class="btn-row">
                  <a class="btn bike-card__cta" href="${configHref(b)}">Configurar mi ${m.name}</a>
                  <a class="btn btn--secondary" href="${m.href}">Conócela<span class="visually-hidden"> la ${m.name}</span></a>
                </div>
              </div>
            </div>
          </article>
        </div>
        <p class="finder__more">
          <a class="link-arrow" href="${PREFIX}">${icon('restart_alt')}<span>Volver a empezar</span></a>
          <a class="link-arrow" href="only-for-you-modelos.html"><span>Ver todos los modelos</span>${icon('arrow_forward')}</a>
        </p>
      </div>`;
  }

  // Pintado ---------------------------------------------------------------------
  let firstRender = true;
  let lastRatio = 0;

  function render() {
    const raw = decodeURIComponent(location.hash);
    const segs = raw.startsWith(PREFIX) ? raw.slice(PREFIX.length).split('/').filter(Boolean) : [];
    const state = resolve(segs);
    const { answers } = state;

    // Dirección no válida o sin hash: se corrige sin dejar rastro en el historial
    const canonical = href(answers.map((a) => a.opt.id));
    if (raw !== canonical) history.replaceState(null, '', canonical);

    const isResult = !!state.result;
    if (isResult) store.set(canonical);
    // El progreso avanza por niveles: los que se saltan también cuentan
    const ratio = isResult ? 1 : (state.question.index + 1) / (LEVELS.length + 1);

    root.innerHTML = bar(answers, ratio, isResult) + (isResult ? result(state.result, answers) : question(state.question, answers));
    root.dataset.state = isResult ? 'result' : 'question';
    if (dealer) dealer.hidden = !isResult;

    const title = isResult ? `Tu ${MODELS[state.result.build.modelo].name}` : state.question.level.q;
    document.title = `${title} · Only For You · Mendiz`;
    afterRender();
  }

  function afterRender() {
    const fill = root.querySelector('.finder__meter span');
    if (fill) {
      lastRatio = Number(fill.dataset.p);
      fill.getBoundingClientRect();   // fija el valor de partida para que la transición se vea
      fill.style.setProperty('--p', lastRatio);
    }
    // Al cambiar de paso: arriba del asesor y el foco en el titular
    if (!firstRender) {
      const top = root.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0) - 16;
      if (window.scrollY > top) {
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
