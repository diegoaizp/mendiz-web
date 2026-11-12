// MENDIZ — Only For You (only-for-you-2.html, copia de la versión anterior)
// 1. Secuencia de scroll: nueve F14 y el vídeo final (lógica de
//    «0 archive/video only for you/scroll-demo», adaptada al escenario fijo
//    bajo la cabecera y con mensajes por tramo).
// 2. Filtro del listado: categoría + modelo, guardados en ?categoria= y
//    ?modelo= para poder enlazarlos (p. ej. desde las páginas de categoría).

// 1. Secuencia ---------------------------------------------------------------
(() => {
  const section = document.querySelector('[data-ofy-seq]');
  const stage = section?.querySelector('.ofy-sequence__stage');
  const frame = section?.querySelector('.ofy-sequence__frame');
  const video = frame?.querySelector('video');
  const play = section?.querySelector('[data-ofy-play]');
  const view = section?.querySelector('.ofy-sequence__view');
  if (!stage || !frame || !video || !play || !view) return;

  const photos = [...frame.querySelectorAll('img')];
  const captions = [...section.querySelectorAll('.ofy-sequence__caption')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Desde 768 el marco empieza a ocupar todo el visor (de margen a margen) y
  // encoge hasta un 16:9 al 60 %; en móvil ya va a sangre y solo se escala.
  const wide = matchMedia('(min-width: 768px)');
  let viewW = 0;
  let viewH = 0;
  let baseW = 1;   // tamaño del marco en la maqueta (sin transformar)
  let baseH = 1;
  // Capas de la secuencia: las nueve fotos y el vídeo. Se ven dos a la vez:
  // la actual (.is-current) encima y la anterior (.is-under) debajo, hasta el
  // siguiente cambio. Así, si la nueva tarda un fotograma en pintarse, se ve
  // la anterior y nunca el fondo del marco.
  const layers = [...photos, video];
  let shown = layers[0];

  // Mensajes: cada palabra en su máscara (.ofy-word > span) con su índice (--i)
  // para el escalonado; se conserva el tono (<b>). El texto completo queda en
  // .visually-hidden y las palabras animadas, ocultas a lectores de pantalla.
  section.querySelectorAll('.ofy-sequence__message').forEach((msg) => {
    const label = msg.textContent.replace(/\s+/g, ' ').trim();
    const words = document.createElement('span');
    words.setAttribute('aria-hidden', 'true');
    let i = 0;
    msg.childNodes.forEach((node) => {
      const tone = node.nodeType === 1 ? node.tagName.toLowerCase() : null;
      node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
        const mask = document.createElement('span');
        mask.className = 'ofy-word';
        mask.style.setProperty('--i', i++);
        const inner = document.createElement(tone || 'span');
        inner.textContent = word;
        mask.append(inner);
        if (words.childNodes.length) words.append(' ');
        words.append(mask);
      });
      // Salto de línea tras la parte en negro (<b>)
      if (tone === 'b') words.append(document.createElement('br'));
    });
    const hidden = document.createElement('span');
    hidden.className = 'visually-hidden';
    hidden.textContent = label;
    msg.replaceChildren(hidden, words);
  });

  const LAST = photos.length;          // índice del vídeo (9)

  // Fondo de la página teñido con el color de cada bici, muy desaturado
  // (claridad alta y croma mínima en OKLCH, mismo tono que el cuadro).
  // Empieza y termina en blanco: la F14 blanca (01) y el vídeo. El color se
  // pasa a --ofy-tint en <html>; la transición está en css/only-for-you.css.
  const TINTS = [
    '#ffffff',                    // 01 blanca
    'oklch(95% 0.055 95)',        // 02 amarilla
    'oklch(93.5% 0.04 265)',      // 03 azul
    'oklch(93.5% 0.045 355)',     // 04 fucsia
    'oklch(94% 0.05 60)',         // 05 naranja
    'oklch(94% 0.032 20)',        // 06 rosa
    'oklch(93.5% 0.045 27)',      // 07 roja
    'oklch(94.5% 0.028 85)',      // 08 arena
    'oklch(94% 0.04 175)',        // 09 turquesa
    '#ffffff',                    // vídeo
  ];
  const root = document.documentElement;
  // Escena → mensaje: 1-3, 4-6, 7-9 y el vídeo.
  const captionFor = (i) => (i === LAST ? 3 : Math.floor(i / 3));

  let start = 0;
  let range = 1;
  let scheduled = false;
  let current = -1;
  let manual = 0;
  let playing = false;
  let activeCaption = 0;
  let ready = false;

  // Precarga ------------------------------------------------------------------
  // Antes de que arranque el efecto se descargan y descodifican las nueve
  // fotos y se descarga el vídeo; mientras, la secuencia se queda en la
  // primera foto a tamaño completo y el marco muestra el progreso. Empieza
  // al cargar la página (mientras se ve el hero), así normalmente ya está
  // lista al llegar. Las Image descodificadas se guardan en `decoded` para
  // que el navegador no las descarte y el cambio de foto no espere.
  const loader = section.querySelector('[data-ofy-loader]');
  const loaderBar = loader?.querySelector('i');
  const decoded = [];
  let loaded = 0;
  const TOTAL_MEDIA = photos.length + 1;
  const tick = () => {
    loaded++;
    if (loaderBar) loaderBar.style.transform = `scaleX(${loaded / TOTAL_MEDIA})`;
  };

  const photoReady = photos.map((img) => new Promise((resolve) => {
    const pre = new Image();
    pre.decoding = 'async';
    pre.src = img.currentSrc || img.src;
    decoded.push(pre);
    const done = () => { tick(); resolve(); };
    (pre.decode ? pre.decode() : new Promise((r) => { pre.onload = r; pre.onerror = r; })).then(done, done);
  }));

  // Vídeo: listo cuando puede reproducirse entero (canplaythrough). Algunos
  // navegadores móviles no lo descargan del todo sin reproducirlo: entonces
  // vale con su primer fotograma y, como red de seguridad, 12 s como máximo.
  const videoReady = new Promise((resolve) => {
    let settled = false;
    const done = () => { if (!settled) { settled = true; tick(); resolve(); } };
    if (video.readyState >= 4) return done();
    video.addEventListener('canplaythrough', done, { once: true });
    video.addEventListener('error', done, { once: true });
    video.addEventListener('loadeddata', () => setTimeout(done, 4000), { once: true });
    setTimeout(done, 12000);
    video.preload = 'auto';
    video.load();
  });

  Promise.all([...photoReady, videoReady]).then(() => {
    ready = true;
    section.classList.add('is-ready');
    if (loader) loader.hidden = true;
    current = -1;
    request();
  });

  const clamp = (x) => Math.max(0, Math.min(1, x));

  // Cambio de mensaje. El sentido se decide aquí, una vez por cambio, según
  // se avance (las palabras suben) o se retroceda (bajan), y se guarda en
  // cada mensaje (--w-from / --w-to). Así un rebote del scroll no puede
  // volver a animar un mensaje que ya salió.
  function showCaption(next) {
    const prev = captions[activeCaption];
    const incoming = captions[next];
    const forward = next > activeCaption;
    captions.forEach((c) => { if (c !== prev) c.classList.remove('is-leaving'); });
    // La entrada parte de fuera de la máscara, sin transición...
    incoming.classList.remove('is-active');
    incoming.style.setProperty('--w-from', forward ? '110%' : '-110%');
    void incoming.offsetWidth;
    // ...y entra; la anterior sale hacia el lado contrario.
    incoming.classList.add('is-active');
    prev.style.setProperty('--w-to', forward ? '-110%' : '110%');
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    activeCaption = next;
  }

  // Si el navegador bloquea la reproducción, aparece el botón. Un play()
  // interrumpido por pause() (se ha salido de la escena del vídeo) rechaza
  // con AbortError: ahí no se muestra, porque el vídeo ya no está a la vista.
  function startVideo() {
    playing = true;
    video.play().then(() => { play.hidden = true; }).catch((err) => {
      playing = false;
      if (current === LAST && err?.name !== 'AbortError') play.hidden = false;
    });
  }

  function scene(index) {
    if (current === index) return;
    current = index;
    const next = layers[index];
    layers.forEach((el) => {
      el.classList.toggle('is-current', el === next);
      el.classList.toggle('is-under', el === shown && el !== next);
    });
    shown = next;
    root.style.setProperty('--ofy-tint', TINTS[index]);
    const active = captionFor(index);
    if (active !== activeCaption) showCaption(active);

    if (index === LAST) {
      if (!reduced.matches) startVideo();
      else play.hidden = false;
    } else {
      video.pause();
      video.currentTime = 0;
      playing = false;
      play.hidden = true;
    }
  }

  function update() {
    scheduled = false;

    if (reduced.matches) {
      frame.style.transform = 'none';
      frame.style.removeProperty('--ix');
      frame.style.removeProperty('--iy');
      frame.style.removeProperty('--fx');
      frame.style.removeProperty('--fy');
      scene(manual);
      // Sin reproducción automática: fuera de pantalla solo se pausa.
      if (!isVisible() && !video.paused) { video.pause(); playing = false; }
      return;
    }

    // Hasta que todo el material está cargado, la secuencia no avanza.
    const p = ready ? clamp((scrollY - start) / range) : 0;
    const progress = Math.min(1, p / 0.7);
    const index = p < 0.7 ? Math.min(LAST - 1, Math.floor(progress * LAST)) : LAST;
    // Tamaño del marco solo con transform (sin cambiar ancho ni alto, que
    // obliga a volver a pintar las fotos en cada fotograma y deja huecos en
    // blanco). El marco se escala a w × h con scale(sx, sy) y cada foto se
    // contraescala (--ix, --iy) para que su escala neta sea uniforme (k) y
    // siga cubriendo el marco como object-fit: cover, sin deformarse.
    let w;
    let h;
    if (wide.matches) {
      const endW = Math.min(viewW, viewH * 16 / 9) * 0.6;
      const endH = endW * 9 / 16;
      w = baseW + (endW - baseW) * progress;
      h = baseH + (endH - baseH) * progress;
    } else {
      const s = 1 - 0.4 * progress;
      w = baseW * s;
      h = baseH * s;
    }
    const sx = w / baseW;
    const sy = h / baseH;
    const k = Math.max(w, h * 16 / 9) / Math.max(baseW, baseH * 16 / 9);
    frame.style.transform = `scale(${sx}, ${sy})`;
    frame.style.setProperty('--ix', (k / sx).toFixed(5));
    frame.style.setProperty('--iy', (k / sy).toFixed(5));
    // El botón de reproducir, sin deformar: escala inversa del marco
    frame.style.setProperty('--fx', (1 / sx).toFixed(5));
    frame.style.setProperty('--fy', (1 / sy).toFixed(5));
    scene(index);

    // Fuera de pantalla el vídeo se pausa; al volver a la última escena, sigue.
    const visible = isVisible();
    if (!visible && !video.paused) { video.pause(); playing = false; }
    else if (visible && index === LAST && !playing && !video.ended) startVideo();
  }

  function isVisible() {
    return scrollY >= start - innerHeight * 0.5 && scrollY < start + range + innerHeight * 0.8;
  }

  function request() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }

  // El escenario se fija cuando la sección llega bajo la cabecera (top del
  // sticky) y se suelta cuando su final la alcanza.
  function measure() {
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    start = section.getBoundingClientRect().top + scrollY - stickyTop;
    range = Math.max(1, section.offsetHeight - stage.offsetHeight);
    const cs = getComputedStyle(view);
    viewW = view.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    viewH = view.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    baseW = frame.offsetWidth || 1;
    baseH = frame.offsetHeight || 1;
    // Cada foto mide su 16:9 completo y cubre el marco sin transformar; el
    // marco recorta lo que sobra. Así, al encoger hacia 16:9, se ve entera.
    frame.style.setProperty('--mw', `${Math.max(baseW, baseH * 16 / 9)}px`);
    request();
  }

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  reduced.addEventListener('change', () => { current = -1; measure(); });
  wide.addEventListener('change', measure);

  // Al terminar, el vídeo se queda en su último fotograma, sin botón. El botón
  // solo aparece si el navegador bloquea la reproducción automática o con
  // movimiento reducido.
  video.addEventListener('ended', () => { playing = false; });
  play.addEventListener('click', startVideo);
  section.querySelector('[data-ofy-next]')?.addEventListener('click', () => { manual = Math.min(LAST, manual + 1); request(); });
  section.querySelector('[data-ofy-prev]')?.addEventListener('click', () => { manual = Math.max(0, manual - 1); request(); });

  measure();
})();

// 2. Filtro categoría + modelo ---------------------------------------------------
(() => {
  const list = document.querySelector('[data-ofy-grid]');
  const select = document.querySelector('[data-ofy-model]');
  if (!list || !select) return;

  const cards = [...list.querySelectorAll('.bike-card')];
  const catButtons = [...document.querySelectorAll('[data-ofy-cat]')];
  const count = document.querySelector('[data-ofy-results]');
  const models = cards.map((card) => ({ id: card.dataset.model, name: card.dataset.name, cat: card.dataset.cat }));
  const cats = new Set(catButtons.map((b) => b.dataset.ofyCat));

  const state = { cat: 'todas', model: '' };

  function renderOptions() {
    const options = models
      .filter((m) => state.cat === 'todas' || m.cat === state.cat)
      .map((m) => new Option(m.name, m.id));
    select.replaceChildren(new Option('Todos los modelos', ''), ...options);
    select.value = state.model;
  }

  function apply() {
    catButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ofyCat === state.cat)));

    let visible = 0;
    cards.forEach((card) => {
      const show = (state.cat === 'todas' || card.dataset.cat === state.cat)
        && (!state.model || card.dataset.model === state.model);
      card.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = `${visible} ${visible === 1 ? 'modelo' : 'modelos'}`;

    const url = new URL(location.href);
    if (state.cat === 'todas') url.searchParams.delete('categoria');
    else url.searchParams.set('categoria', state.cat);
    if (state.model) url.searchParams.set('modelo', state.model);
    else url.searchParams.delete('modelo');
    history.replaceState(null, '', url);
  }

  catButtons.forEach((btn) => btn.addEventListener('click', () => {
    state.cat = btn.dataset.ofyCat;
    // Si el modelo elegido no es de esta categoría, se quita.
    if (state.model && !models.some((m) => m.id === state.model && (state.cat === 'todas' || m.cat === state.cat))) {
      state.model = '';
    }
    renderOptions();
    apply();
  }));

  // Elegir un modelo marca también su categoría.
  select.addEventListener('change', () => {
    state.model = select.value;
    const model = models.find((m) => m.id === state.model);
    if (model) state.cat = model.cat;
    renderOptions();
    apply();
  });

  // Estado inicial desde la URL
  const params = new URLSearchParams(location.search);
  const initialModel = models.find((m) => m.id === params.get('modelo'));
  const initialCat = params.get('categoria');
  if (initialModel) { state.model = initialModel.id; state.cat = initialModel.cat; }
  else if (initialCat && cats.has(initialCat)) state.cat = initialCat;

  renderOptions();
  apply();
})();
