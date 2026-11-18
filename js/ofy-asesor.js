/* ==========================================================================
   MENDIZ — Only For You · «Configura tu Mendiz» (only-for-you-configura.html)
   Árbol de decisión del ERP que termina en un montaje concreto y lleva al
   configurador con ese montaje marcado.

   · Diez niveles, siempre en este orden (js/data/niveles-decision.js):
       1 Tipo de bicicleta · 2 Disciplina · 3 Modalidad · 4 Material del
       cuadro · 5 Sistema de eje · 6 Gama de carbono · 7 Versión ·
       8 Horquilla · 9 Transmisión · 10 Ruedas
   · Cada montaje (js/data/ofy-montajes.js, generado con tools/ofy-asesor.py)
     lleva el código ERP de cada nivel. Cada respuesta filtra los montajes.
     Un nivel solo se pregunta si los montajes que quedan tienen más de un
     valor; si no, se da por resuelto y se salta.
   · En cuanto queda un único montaje (o se acaban los niveles) se muestra
     la ficha de la bici con ese montaje y «Configurar», que abre
     configurador-f14.html?modelo=…&montaje=…&color=…
   · Del nivel 6 en adelante hay «Sin preferencia»: no filtra y, si al final
     encajan varios montajes, se propone el más económico.
   · Cada paso tiene su dirección en el hash, con el id de cada opción
     (#/ = primera pregunta; #/convencional/carretera/performance/sl/
     shimano-105-di2/aluminio, un resultado): atrás/adelante funcionan y el
     resultado se comparte.
   · Mismo marcado y estilos que «¿Qué Mendiz es para ti?»
     (css/que-mendiz.css); lo propio, en css/ofy-asesor.css.
   ========================================================================== */
(() => {
  const root = document.querySelector('[data-ofy-advisor]');
  const DATA = window.MENDIZ_OFY;
  const NIVELES = window.MENDIZ_NIVELES;
  if (!root || !DATA || !NIVELES) return;
  const dealer = document.querySelector('[data-finder-dealer]');
  const MODELS = DATA.modelos;
  const ALL = DATA.montajes;

  // Niveles -------------------------------------------------------------------
  // Los diez del ERP. any: admite «Sin preferencia» (del nivel 6 en adelante).
  // byErp: opción por código ERP (los montajes llevan el código).
  const ANY = 'sin-preferencia';
  const FIRST_ANY = NIVELES.findIndex((lv) => lv.field === 'gama');
  const LEVELS = NIVELES.map((lv, i) => ({
    ...lv,
    any: i >= FIRST_ANY,
    byErp: new Map(lv.options.map((o) => [o.erp, o])),
    order: lv.options.map((o) => o.erp),
  }));
  const optionOf = (level, b) => level.byErp.get(b[level.field]);

  // Utilidades -------------------------------------------------------------------
  const euros = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
  const byPrice = (list) => list.toSorted((a, b) => a.precio - b.precio);
  const icon = (name, cls = '') => `<span class="material-symbols-outlined${cls ? ` ${cls}` : ''}" aria-hidden="true">${name}</span>`;

  // Opciones de un nivel con los montajes que quedan: un valor por opción,
  // con su precio de partida. Del nivel 6 en adelante, de la más económica a
  // la más cara; antes, en el orden del ERP.
  function optionsFor(level, cands) {
    const groups = new Map();
    cands.forEach((b) => {
      const v = b[level.field];
      if (v == null) return;
      if (!groups.has(v)) groups.set(v, []);
      groups.get(v).push(b);
    });
    const opts = [...groups.entries()].map(([erp, list]) => {
      const first = byPrice(list)[0];
      let meta = level.byErp.get(erp);
      // Ruedas: la categoría del ERP y, debajo, los juegos concretos
      if (level.field === 'ruedas') {
        const names = [...new Set(byPrice(list).map((b) => b.ruedasLabel))];
        meta = { ...meta, text: `${names.join(', ')}. ${meta.text}`, img: first.ruedasImg, alt: '' };
      }
      return { ...meta, min: first.precio, n: list.length };
    });
    return level.any
      ? opts.sort((a, b) => a.min - b.min)
      : opts.sort((a, b) => level.order.indexOf(a.erp) - level.order.indexOf(b.erp));
  }

  // E-Bike: la disciplina se pregunta siempre. Solo la de montaña tiene montaje
  // configurable (EX41); carretera y gravel llevan al listado de eléctricas.
  const discipline = LEVELS.find((lv) => lv.field === 'disciplina');
  const E_LISTING = {
    ROAD: { ...discipline.byErp.get('ROAD'), href: 'electricas.html?tipo=carretera' },
    GRAVEL: { ...discipline.byErp.get('GRAVEL'), href: 'electricas.html?tipo=gravel' },
  };
  const extraFor = (level, cands) => (level.field === 'disciplina' && cands.every((b) => b.tipo === 'E-BIKE')
    ? Object.values(E_LISTING).filter((o) => !cands.some((b) => b.disciplina === o.erp)) : []);

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
      const opts = optionsFor(level, cands);
      const extra = extraFor(level, cands);
      if (opts.length + extra.length < 2) continue;
      const seg = segs[answers.length];
      const opt = seg === ANY && level.any
        ? { id: ANY, title: 'Sin preferencia', min: byPrice(cands)[0].precio }
        : opts.find((o) => o.id === seg);
      if (!opt) return { question: { level, index: i, opts, extra, cands }, answers };
      answers.push({ level, opt });
      if (opt.id !== ANY) cands = cands.filter((b) => b[level.field] === opt.erp);
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
    const all = extra.length
      ? [...opts, ...extra].sort((a, b) => level.order.indexOf(a.erp) - level.order.indexOf(b.erp))
      : opts;
    const allWithAny = level.any
      ? [...all, { id: ANY, title: 'Sin preferencia', text: 'Seguimos sin filtrar. Podrás cambiarlo en el configurador.', icon: 'help', min: byPrice(cands)[0].precio, n: cands.length }]
      : all;
    const price = (o) => o.min == null ? '' : `<span class="ofy-option__price">${o.n > 1 ? 'Desde ' : ''}${euros(o.min)}</span>`;

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
          <p class="finder__help">${level.help}</p>
        </header>
        <ul class="finder__options finder__options--photo finder__options--n${allWithAny.length}">${items}</ul>
      </div>`;
  }

  // Imagen de cada opción. Sin foto (o si falla al cargar), el marcador con el
  // icono de la opción. La foto acompaña al texto del enlace: alt vacío, salvo
  // las fotos de uso, que ya lo traen.
  const placeholder = (name) => `<span class="ofy-placeholder" aria-hidden="true">${icon(name || 'image')}</span>`;
  function media(level, o) {
    if (level.field === 'disciplina' && o.img) {
      return `<figure class="media finder-option__media"><img src="${o.img}" alt="${o.alt || ''}" width="1000" height="750" decoding="async"></figure>`;
    }
    if (o.id === ANY || !o.img) {
      return `<figure class="media finder-option__media ofy-media">${placeholder(o.icon)}</figure>`;
    }
    const isLifestyle = ['tipo', 'modalidad'].includes(level.field);
    const isComponent = ['gama', 'horquilla', 'transmision', 'ruedas'].includes(level.field);
    return `<figure class="media finder-option__media ofy-media ofy-media--photo${isLifestyle ? ' ofy-media--lifestyle' : ''}${isComponent ? ' ofy-media--component' : ''}">
      <img src="${o.img}" alt="${o.alt || ''}" width="1200" height="800" decoding="async">
    </figure>`;
  }
  // Si falla una imagen, muestra el marcador visual sin dejar icono roto.
  root.addEventListener('error', (e) => {
    if (!(e.target instanceof HTMLImageElement) || !e.target.closest('.ofy-media')) return;
    const figure = e.target.closest('.ofy-media');
    e.target.remove();
    figure.insertAdjacentHTML('afterbegin', placeholder());
  }, true);

  function configHref(b) {
    const m = MODELS[b.modelo];
    const q = new URLSearchParams({ modelo: b.modelo, montaje: b.code });
    if (m.color) q.set('color', m.color);
    return `configurador-f14.html?${q.toString().replace(/&/g, '&amp;')}`;
  }

  function result({ build: b, cands }, answers) {
    const m = MODELS[b.modelo];
    const asked = new Set(answers.map((a) => a.level.field));
    // Los diez niveles con el valor del montaje (los que no aplican se omiten).
    // Los que no se han preguntado salen del modelo: se marcan.
    const rows = LEVELS.map((level) => {
      const opt = optionOf(level, b);
      if (!opt) return '';
      const value = level.field === 'ruedas' ? `${opt.title} · ${b.ruedasLabel}` : opt.title;
      const auto = !asked.has(level.field) || answers.find((a) => a.level.field === level.field)?.opt.id === ANY;
      return `<div${auto ? ' class="is-auto"' : ''}><dt>${level.label}</dt><dd>${value}</dd></div>`;
    }).join('');
    const note = cands.length > 1
      ? `<p class="ofy-pick__note">Encajan ${cands.length} montajes con tus respuestas: partimos del más económico. En el configurador puedes cambiar transmisión y ruedas.</p>`
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
                  <a class="btn btn--secondary" href="${m.href}"><span aria-hidden="true">Conócela</span><span class="visually-hidden">Conoce la ${m.name}</span></a>
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
    document.title = `${title} · Only For You | Mendiz`;
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
        if (window.MENDIZ?.lenis) window.MENDIZ.lenis.scrollTo(top, { immediate: true, force: true });
        else window.scrollTo(0, top);
      }
      root.querySelector('#finder-title')?.focus({ preventScroll: true });
    }
    firstRender = false;
  }

  window.addEventListener('hashchange', render);
  render();
})();
