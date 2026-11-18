/* ==========================================================================
   MENDIZ — Interacciones compartidas
   ========================================================================== */
(() => {

// Scroll suave (Lenis) --------------------------------------------------------
// Solo suaviza la rueda/trackpad en escritorio; el táctil sigue siendo nativo.
// Se desactiva con «reducir movimiento». El scroll sigue siendo el de la
// ventana, así que los listeners de 'scroll' y los sticky funcionan igual.
const lenis = window.Lenis && window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  ? new window.Lenis({
    lerp: 0.12,              // suavizado ligero (0.1 es el valor por defecto de Lenis)
    autoRaf: true,
    allowNestedScroll: true, // el menú móvil y otros contenedores con scroll propio
    // Los gestos horizontales del trackpad son de los carruseles (scroll-snap):
    // se dejan al navegador.
    virtualScroll: ({ deltaX, deltaY }) => Math.abs(deltaY) >= Math.abs(deltaX),
  })
  : null;

// Lleva a un punto de la página: con Lenis si está activo, nativo si no.
function smoothScrollTo(target, behavior = 'smooth') {
  if (lenis) {
    lenis.scrollTo(target, { immediate: behavior !== 'smooth', force: true });
    return;
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior });
  else target.scrollIntoView({ behavior });
}

// Cierre por clic en el fondo para <dialog> en navegadores sin soporte nativo de
// closedby="any": exige inicio y fin del gesto fuera de la caja del modal para
// no cerrar accidentalmente al arrastrar una selección de texto hacia el fondo.
function bindDialogDismiss(dialog) {
  if ('closedBy' in HTMLDialogElement.prototype) return;
  let pressedOutside = false;
  dialog.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const r = dialog.getBoundingClientRect();
    pressedOutside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  });
  dialog.addEventListener('pointerup', (e) => {
    if (!pressedOutside) return;
    pressedOutside = false;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { pressedOutside = false; });
}

document.querySelectorAll('dialog[closedby="any"]').forEach(bindDialogDismiss);
window.MENDIZ = { lenis, smoothScrollTo };

// Anclas internas: respetan el scroll-margin-top de cada sección.
// Los manejadores propios que llaman a preventDefault() tienen prioridad.
// Con teclado (detail 0) se deja el salto nativo: así el foco pasa al destino
// (enlace «Saltar al contenido», índices).
if (lenis) {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.detail === 0 || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href^="#"]');
    const hash = link?.getAttribute('href');
    if (!hash || hash === '#') return;
    let target;
    try { target = document.querySelector(hash); } catch { return; }
    if (!target) return;
    e.preventDefault();
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    lenis.scrollTo(target, { offset: -margin });
    history.pushState(null, '', hash);
  });
}

// Header y mega menú ---------------------------------------------------------
// Marcado: tools/header.py · estilos: css/components.css (Header).
// Escritorio: cada sección abre su panel al pasar el ratón o al pulsar. Dentro,
// cada lista despliega la columna siguiente (Bicis: categoría → tipo → modelos)
// y la imagen de la derecha pasa a la foto de cada modelo al señalarlo.
// Con teclado: ↑ ↓ dentro de una lista, → entra en la columna siguiente, ← vuelve.
// Móvil: cajón con capas que entran desde la derecha (sección → grupo → tipo).
// Cada [data-mega-menu-group] controla su [data-mega-menu-panel] (aria-controls); los enlaces
// de una misma <ul> son hermanos y solo se activa uno a la vez.
const header = document.querySelector('[data-header]');
const navToggle = header?.querySelector('[data-nav-toggle]');
const siteNav = document.getElementById('site-nav');
const desktopMQ = window.matchMedia('(min-width: 1280px)');
const hoverMQ = window.matchMedia('(hover: hover) and (pointer: fine)');

let openPanel = null;
let hoverTimer;
let groupTimer;

const toggleOf = (panel) => header.querySelector(`[data-mega-menu-toggle][aria-controls="${panel.id}"]`);
const panelOf = (link) => document.getElementById(link.getAttribute('aria-controls'));
const linkOf = (layer) => header.querySelector(`[data-mega-menu-group][aria-controls="${layer.id}"]`);
// Enlaces hermanos: los de la misma lista
const siblings = (link) => [...link.closest('ul').querySelectorAll(':scope > li > [data-mega-menu-group]')];
// La imagen destacada vive en el grupo de categoría (también para sus tipos)
const teaserScope = (el) => el.closest('.mega-menu__group') || el.closest('[data-mega-menu]');
// Primer elemento al que se puede llevar el foco (el botón Volver solo se ve en móvil)
const firstFocusable = (el) => [...el.querySelectorAll('a[href], button:not([disabled])')]
  .find((n) => n.getClientRects().length);

// Vista previa del modelo en la imagen del grupo
function preview(link) {
  const teaser = link.closest('.mega-menu__group')?.querySelector('[data-mega-menu-teaser]');
  if (!teaser) return;
  const box = teaser.querySelector('.mega-menu__preview');
  const img = box.querySelector('img');
  if (img.getAttribute('src') !== link.dataset.preview) img.src = link.dataset.preview;
  box.querySelector('.mega-menu__preview-name').textContent = link.dataset.previewName;
  box.querySelector('.mega-menu__preview-note').textContent = link.dataset.previewNote;
  teaser.classList.add('is-previewing');
}
function endPreview(scope) {
  scope.querySelectorAll('.is-previewing').forEach((t) => t.classList.remove('is-previewing'));
}

// Precarga las fotos de los modelos del grupo visible (no las de todo el menú)
function preloadGroup(group) {
  if (!group || group.dataset.preloaded) return;
  group.dataset.preloaded = 'true';
  group.querySelectorAll('[data-preview]').forEach((a) => { new Image().src = a.dataset.preview; });
}

function activateGroup(link) {
  siblings(link).forEach((l) => {
    l.classList.toggle('is-active', l === link);
    panelOf(l).classList.toggle('is-active', l === link);
  });
  endPreview(teaserScope(link));
  if (desktopMQ.matches) preloadGroup(panelOf(link).closest('.mega-menu__group'));
}

// Capa blanca común de los paneles (escritorio): queda fija y solo cambia de
// alto al pasar de un panel a otro; sigue al panel si su contenido cambia.
const backdrop = header?.querySelector('[data-mega-menu-backdrop]');
const panelSize = backdrop && 'ResizeObserver' in window
  ? new ResizeObserver(() => { if (openPanel) backdrop.style.setProperty('--mega-menu-h', `${openPanel.offsetHeight}px`); })
  : null;
function showBackdrop(panel, animate) {
  if (!backdrop || !desktopMQ.matches) return;
  if (!animate) {
    backdrop.classList.add('is-instant');
    backdrop.style.setProperty('--mega-menu-h', `${panel.offsetHeight}px`);
    backdrop.getBoundingClientRect(); // fija el alto sin animar
    backdrop.classList.remove('is-instant');
  } else {
    backdrop.style.setProperty('--mega-menu-h', `${panel.offsetHeight}px`);
  }
  backdrop.classList.add('is-open');
  panelSize?.disconnect();
  panelSize?.observe(panel);
}

function setPanel(panel, open, { focus = false } = {}) {
  if (!panel) return;
  const wasOpen = !!openPanel;
  if (open && openPanel && openPanel !== panel) setPanel(openPanel, false);
  panel.classList.toggle('is-open', open);
  toggleOf(panel).setAttribute('aria-expanded', open);

  if (open) {
    openPanel = panel;
    showBackdrop(panel, wasOpen);
    if (desktopMQ.matches) preloadGroup(panel.querySelector('[data-mega-menu-panel].is-active'));
    if (focus) firstFocusable(panel)?.focus({ preventScroll: true });
    return;
  }
  if (openPanel === panel) {
    openPanel = null;
    backdrop?.classList.remove('is-open');
    panelSize?.disconnect();
  }
  endPreview(panel);
  panel.querySelectorAll('[data-mega-menu-panel].is-open').forEach((g) => g.classList.remove('is-open'));
  // Al cerrar, cada lista vuelve a su estado de partida: su elemento de partida
  // o, en los paneles plegados (Bicis), nada desplegado
  new Set([...panel.querySelectorAll('[data-mega-menu-group]')].map((l) => l.closest('ul'))).forEach((ul) => {
    const links = [...ul.querySelectorAll(':scope > li > [data-mega-menu-group]')];
    const start = links.find((l) => l.hasAttribute('data-start'));
    if (start) activateGroup(start);
    else links.forEach((l) => { l.classList.remove('is-active'); panelOf(l).classList.remove('is-active'); });
  });
}

// Cajón abierto: lo que queda fuera del header es inerte (el foco no se va a
// la página que tapa). Solo se restaura lo que se marcó aquí.
let drawerInert = [];

function setDrawer(open) {
  navToggle.setAttribute('aria-expanded', open);
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  const icon = navToggle.querySelector('.material-symbols-outlined');
  if (icon) icon.textContent = open ? 'close' : 'menu';
  siteNav.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  drawerInert.forEach((el) => { el.inert = false; });
  drawerInert = open
    ? [...document.body.children].filter((el) => !el.contains(header) && !el.inert && el.localName !== 'script')
    : [];
  drawerInert.forEach((el) => { el.inert = true; });
  if (open) lenis?.stop(); else { lenis?.start(); setPanel(openPanel, false); }
}

if (header && siteNav) {
  // Elemento de partida de cada lista (en los paneles plegados no hay)
  new Set([...header.querySelectorAll('[data-mega-menu-group]')].map((l) => l.closest('ul'))).forEach((ul) => {
    const links = [...ul.querySelectorAll(':scope > li > [data-mega-menu-group]')];
    const start = links.find((l) => l.classList.contains('is-active'))
      || (ul.closest('.mega-menu__inner--collapsed') ? null : links[0]);
    start?.setAttribute('data-start', '');
  });

  navToggle?.addEventListener('click', () => setDrawer(navToggle.getAttribute('aria-expanded') !== 'true'));

  // Enlace a otra parte de esta misma página (p. ej. only-for-you.html#modelos
  // desde only-for-you.html): no hay recarga, así que se cierra el menú antes
  // del salto. Los clics que abren capas ya llegan con preventDefault().
  siteNav.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented) return;
    const url = new URL(a.href);
    if (!url.hash || url.origin + url.pathname + url.search !== location.origin + location.pathname + location.search) return;
    if (siteNav.classList.contains('is-open')) setDrawer(false);
    else setPanel(openPanel, false);
  });

  // Secciones: pulsar
  header.querySelectorAll('[data-mega-menu-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    // La sección es un enlace a su página. En escritorio con ratón el clic
    // navega (el panel ya se abre al pasar por encima). En móvil el toque abre
    // el submenú; en táctil de escritorio el primer toque abre el panel y el
    // segundo navega.
    btn.addEventListener('click', (e) => {
      if (desktopMQ.matches && hoverMQ.matches) return;
      // En móvil, las secciones marcadas con data-mega-menu-direct navegan sin submenú
      if (!desktopMQ.matches && btn.hasAttribute('data-mega-menu-direct')) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (desktopMQ.matches && isOpen) return;
      e.preventDefault();
      setPanel(panel, true, { focus: !desktopMQ.matches });
    });
    // Teclado (escritorio): Intro navega; flecha abajo o espacio abren el panel
    btn.addEventListener('keydown', (e) => {
      if (!desktopMQ.matches || (e.key !== 'ArrowDown' && e.key !== ' ')) return;
      e.preventDefault();
      setPanel(panel, true, { focus: true });
    });

    // Secciones: pasar el ratón (solo escritorio con ratón)
    btn.closest('.nav-main__item')?.addEventListener('mouseenter', () => {
      if (!desktopMQ.matches || !hoverMQ.matches) return;
      clearTimeout(hoverTimer);
      // Entre secciones cambia al momento; desde fuera espera un instante
      hoverTimer = setTimeout(() => setPanel(panel, true), openPanel ? 0 : 140);
    });
  });

  header.addEventListener('mouseleave', () => {
    if (!desktopMQ.matches || !hoverMQ.matches || !openPanel) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => setPanel(openPanel, false), 240);
  });
  header.addEventListener('mouseenter', () => clearTimeout(hoverTimer));

  // Grupos
  header.querySelectorAll('[data-mega-menu-group]').forEach((link) => {
    link.addEventListener('mouseenter', () => {
      if (!desktopMQ.matches) return;
      clearTimeout(groupTimer);
      // Pequeño retardo: cruzar en diagonal hacia el contenido no cambia de grupo
      groupTimer = setTimeout(() => activateGroup(link), 90);
    });
    link.addEventListener('mouseleave', () => clearTimeout(groupTimer));
    link.addEventListener('focus', () => { if (desktopMQ.matches) activateGroup(link); });

    link.addEventListener('click', (e) => {
      if (desktopMQ.matches) return; // en escritorio el grupo es un enlace normal
      e.preventDefault();
      const layer = panelOf(link);
      layer.classList.add('is-open');
      layer.querySelectorAll('.mega-menu__list').forEach((l) => { l.scrollTop = 0; });
      layer.scrollTop = 0;
      firstFocusable(layer)?.focus({ preventScroll: true });
    });

    link.addEventListener('keydown', (e) => {
      if (!desktopMQ.matches) return;
      const links = siblings(link);
      const i = links.indexOf(link);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        links[(i + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length].focus();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        firstFocusable(panelOf(link))?.focus();
      }
    });
  });

  // ← vuelve a la columna anterior (escritorio)
  header.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' || !desktopMQ.matches) return;
    const layer = e.target.closest('[data-mega-menu-panel]');
    if (!layer) return;
    e.preventDefault();
    linkOf(layer)?.focus();
  });

  // Volver (móvil): de tipo a grupo, de grupo a sección, de sección a la lista principal
  header.querySelectorAll('[data-mega-menu-back]').forEach((back) => {
    back.addEventListener('click', () => {
      const layer = back.closest('[data-mega-menu-panel]');
      if (layer) {
        layer.classList.remove('is-open');
        linkOf(layer)?.focus({ preventScroll: true });
      } else {
        const panel = back.closest('[data-mega-menu]');
        setPanel(panel, false);
        toggleOf(panel).focus({ preventScroll: true });
      }
    });
  });

  // Modelos: la imagen destacada pasa a la foto de la bici
  header.querySelectorAll('[data-preview]').forEach((a) => {
    a.addEventListener('mouseenter', () => preview(a));
    a.addEventListener('focus', () => preview(a));
  });
  header.querySelectorAll('.mega-menu__models').forEach((list) => {
    list.addEventListener('mouseleave', () => endPreview(teaserScope(list)));
    list.addEventListener('focusout', (e) => {
      if (!list.contains(e.relatedTarget)) endPreview(teaserScope(list));
    });
  });

  // Cerrar: Escape, clic fuera o foco fuera del header
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    // Cierra primero la capa más profunda (móvil)
    const layers = header.querySelectorAll('[data-mega-menu-panel].is-open');
    if (layers.length) { layers[layers.length - 1].querySelector('[data-mega-menu-back]')?.click(); return; }
    if (openPanel) {
      const btn = toggleOf(openPanel);
      setPanel(openPanel, false);
      btn.focus();
    } else if (siteNav.classList.contains('is-open')) {
      setDrawer(false);
      navToggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (openPanel && desktopMQ.matches && !header.contains(e.target)) setPanel(openPanel, false);
  });
  header.addEventListener('focusout', (e) => {
    if (openPanel && desktopMQ.matches && e.relatedTarget && !header.contains(e.relatedTarget)) setPanel(openPanel, false);
  });

  // Al cruzar el corte de escritorio se cierra todo
  desktopMQ.addEventListener('change', () => {
    setPanel(openPanel, false);
    if (siteNav.classList.contains('is-open')) setDrawer(false);
  });
}

// Header superpuesto (home): sólido en cuanto se hace scroll ----------------
const overlayHeader = document.querySelector('.site-header--overlay');
if (overlayHeader) {
  const updateHeader = () => overlayHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

// Fichas con subnav: el header se oculta al bajar y reaparece al subir --------
// Solo cuando la subnav ya está fija arriba; la subnav ocupa entonces su sitio
// (html.is-header-hidden → top: 0, ver components.css). Con un panel abierto, el
// menú móvil abierto o el foco dentro del header, no se oculta.
const stickySubnav = document.querySelector('.subnav');
if (header && stickySubnav) {
  const root = document.documentElement;
  let lastY = window.scrollY;
  let ticking = false;
  const setHidden = (hide) => {
    header.classList.toggle('is-hidden', hide);
    root.classList.toggle('is-header-hidden', hide);
  };
  const busy = () => header.querySelector('.is-open') || header.contains(document.activeElement) && header.matches(':focus-within');
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const dy = y - lastY;
    if (Math.abs(dy) < 6) return;
    lastY = y;
    if (dy < 0 || y < 8 || busy()) {
      setHidden(false);
    } else {
      const headerH = header.offsetHeight;
      const stuck = stickySubnav.getBoundingClientRect().top <= headerH + 1;
      if (stuck) setHidden(true);
    }
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  header.addEventListener('focusin', () => setHidden(false));
}

// Filtros de solo texto (categorías en el listado, cuadro en montajes) --------
// [data-filter-group] = selector de los elementos a filtrar por data-type;
// [data-filter-param] = parámetro de la URL donde se guarda la elección.
document.querySelectorAll('[data-filter-group]').forEach((group) => {
  const buttons = group.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll(group.dataset.filterGroup);
  const param = group.dataset.filterParam;
  const count = group.nextElementSibling?.matches('[data-count]') ? group.nextElementSibling : null;
  // Aviso opcional cuando el filtro no deja nada (p. ej. Ofertas sin gravel)
  const empty = group.parentElement.querySelector('[data-empty]');

  function apply(type) {
    let visible = 0;
    buttons.forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.filter === type));
    items.forEach((item) => {
      const show = type === 'todas' || item.dataset.type === type;
      item.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = `${visible} ${visible === 1 ? 'resultado' : 'resultados'}`;
    if (empty) empty.hidden = visible > 0;

    const url = new URL(location.href);
    if (type === 'todas') url.searchParams.delete(param);
    else url.searchParams.set(param, type);
    history.replaceState(null, '', url);
  }

  buttons.forEach((btn) => btn.addEventListener('click', () => apply(btn.dataset.filter)));
  const initial = new URLSearchParams(location.search).get(param);
  if (initial && group.querySelector(`[data-filter="${CSS.escape(initial)}"]`)) apply(initial);
});

// Rail: flechas que desplazan una tarjeta y se desactivan en los extremos ------
document.querySelectorAll('[data-rail-controls]').forEach((controls) => {
  const track = document.getElementById(controls.dataset.railControls);
  const prev = controls.querySelector('[data-rail-prev]');
  const next = controls.querySelector('[data-rail-next]');
  if (!track || !track.firstElementChild || !prev || !next) return;

  // columnGap puede ser «normal» (NaN): sin el || 0 la flecha no desplazaría nada
  const step = () => track.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
  const update = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    controls.classList.toggle('is-static', track.scrollWidth <= track.clientWidth + 2);
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// Rail con tarjeta principal ([data-rail-focus]: Diseño, Integración) ------------
// La tarjeta alineada con la retícula es la principal (.is-active). Al hacer
// clic con el ratón o el dedo en otra que pueda llegar a esa posición
// (.is-pickable, p. ej. la que asoma), el rail se desplaza hasta ella y el clic
// no sigue sus enlaces. Si la tarjeta ya no puede moverse (final del rail), el
// clic funciona normal. Con teclado (Intro sobre un enlace) el enlace funciona
// siempre.
document.querySelectorAll('[data-rail-focus]').forEach((track) => {
  const cards = [...track.children];
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const start = () => track.getBoundingClientRect().left + (parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0);
  // Desplazamiento que lleva la tarjeta a la posición principal (limitado al rail)
  const targetFor = (card) => {
    const max = track.scrollWidth - track.clientWidth;
    return Math.min(max, Math.max(0, track.scrollLeft + card.getBoundingClientRect().left - start()));
  };
  const canMove = (card) => Math.abs(targetFor(card) - track.scrollLeft) > 2;
  const activeIndex = () => {
    const x = start();
    let best = 0;
    let min = Infinity;
    cards.forEach((card, i) => {
      const d = Math.abs(card.getBoundingClientRect().left - x);
      if (d < min) { min = d; best = i; }
    });
    return best;
  };
  let ticking = false;
  const mark = () => {
    ticking = false;
    const a = activeIndex();
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === a);
      card.classList.toggle('is-pickable', i !== a && canMove(card));
    });
  };

  track.addEventListener('click', (e) => {
    if (e.detail === 0) return; // activación por teclado
    const card = cards.find((c) => c.contains(e.target));
    if (!card || cards.indexOf(card) === activeIndex() || !canMove(card)) return;
    e.preventDefault();
    track.scrollTo({ left: targetFor(card), behavior: motion.matches ? 'smooth' : 'auto' });
  });
  track.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(mark); }
  }, { passive: true });
  window.addEventListener('resize', mark);
  mark();
});

// Bicis destacadas (home): carrusel con nombre fijo ----------------------------
// Las bicis se colocan según una posición continua (pos): la bici i está a
// d = i − pos bicis de la central (con vuelta, el carrusel no tiene fin). Al
// cambiar, pos se anima con rAF, así el movimiento lateral es continuo también
// al arrastrar o al saltar varias bicis. El nombre grande y la ficha no se
// mueven con la bici: cambian en su sitio (sube el actual, entra el siguiente
// por debajo; transiciones en css/home.css). «Descubrir» queda fijo y solo
// cambia su enlace.
// Pase automático: la línea de progreso activa se rellena (animación CSS) y,
// al terminar, pasa a la siguiente. Se para al pasar el ratón por el panel, con
// el foco dentro, fuera de pantalla, con la pestaña oculta y con el botón de
// pausa. Con «reducir movimiento» no hay pase automático ni desplazamiento.
document.querySelectorAll('[data-showcase]').forEach((root) => {
  const panel = root.querySelector('[data-showcase-panel]');
  const stage = root.querySelector('[data-showcase-stage]');
  const list = root.querySelector('.home-showcase__bikes');
  const ghosts = [...root.querySelectorAll('.home-showcase__ghost-mask > span')];
  const slides = [...root.querySelectorAll('.home-showcase__slide')];
  const dots = [...root.querySelectorAll('.home-showcase__dot')];
  const info = root.querySelector('[data-showcase-info]');
  const toggle = root.querySelector('[data-showcase-toggle]');
  const cta = root.querySelector('[data-showcase-cta]');
  const ctaName = root.querySelector('[data-showcase-cta-name]');
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const total = slides.length;
  if (!panel || !stage || !list || !info || total < 2 || dots.length !== total) return;

  // Con menos de 4 bicis la vuelta se vería: se duplican (solo decorativas)
  const originals = [...list.children];
  while (list.children.length < 4) {
    originals.forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      list.append(copy);
    });
  }
  const bikes = [...list.children];
  const count = bikes.length;

  const DURATION = 1000;          // ms por bici
  const SIDE_SCALE = 0.85;        // escala de las vecinas (poco cambio de tamaño)
  const SIDE_OPACITY = 0.45;      // opacidad de las vecinas
  const autoplayMs = parseInt(root.dataset.autoplay, 10) || 0;
  root.style.setProperty('--autoplay', `${autoplayMs}ms`);
  root.style.setProperty('--home-showcase-dur', `${DURATION}ms`);

  const mod = (a, b) => ((a % b) + b) % b;
  // Distancia más corta de la bici i a la posición pos, en (−count/2, count/2]
  const offset = (i, p) => {
    const d = mod(i - p, count);
    return d > count / 2 ? d - count : d;
  };
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const easeOut = (t) => 1 - (1 - t) ** 3;

  let pos = 0;
  let active = 0;
  let raf = 0;
  let animating = false;

  const render = () => {
    bikes.forEach((bike, i) => {
      const d = offset(i, pos);
      const a = Math.min(Math.abs(d), 2);
      const scale = a <= 1 ? 1 - (1 - SIDE_SCALE) * a : SIDE_SCALE - 0.05 * (a - 1);
      // Las vecinas se ven atenuadas; a partir de 1,2 bicis se desvanecen y
      // en ±2 (fuera del panel, donde dan la vuelta) ya no se ven
      const opacity = a <= 1 ? 1 - (1 - SIDE_OPACITY) * a : SIDE_OPACITY * Math.max(0, (1.7 - a) / 0.7);
      bike.style.setProperty('--x', Math.max(-2.5, Math.min(2.5, d)).toFixed(4));
      bike.style.setProperty('--s', scale.toFixed(4));
      bike.style.opacity = opacity.toFixed(3);
      bike.style.zIndex = String(10 - Math.round(a * 2));
      bike.style.visibility = opacity < 0.01 ? 'hidden' : '';
    });
  };

  // Nombre y ficha: el actual sube y el nuevo entra por debajo
  const timers = new WeakMap();
  const roll = (items, from, to) => {
    if (from === to) return;
    const out = items[from];
    const inn = items[to];
    clearTimeout(timers.get(inn));
    inn.classList.remove('is-leaving');
    out.classList.remove('is-active');
    out.classList.add('is-leaving');
    timers.set(out, setTimeout(() => out.classList.remove('is-leaving'), DURATION + 200));
    inn.classList.add('is-active');
  };

  const setActive = (next) => {
    if (next === active) return;
    roll(ghosts, active, next);
    roll(slides, active, next);
    dots[active].removeAttribute('aria-current');
    dots[next].setAttribute('aria-current', 'true');
    active = next;
    // «Descubrir» no se mueve: solo cambia su enlace
    if (cta) {
      cta.href = slides[next].dataset.href;
      if (ctaName) ctaName.textContent = ` la ${slides[next].querySelector('.home-showcase__name').textContent.trim()}`;
    }
    syncA11y();
  };

  const syncA11y = () => {
    slides.forEach((slide, i) => {
      slide.inert = i !== active;
      if (i !== active) slide.setAttribute('aria-hidden', 'true');
      else slide.removeAttribute('aria-hidden');
    });
    bikes.forEach((bike, i) => {
      const isCurrent = i < total && i === active;
      if (isCurrent) bike.removeAttribute('aria-hidden');
      else bike.setAttribute('aria-hidden', 'true');
      bike.classList.toggle('is-pickable', mod(i, total) !== active);
    });
  };

  // Lleva la posición a target (índice de bici, puede salirse de 0…count-1)
  const animateTo = (target, interrupted = false) => {
    cancelAnimationFrame(raf);
    const from = pos;
    const dist = target - from;
    const done = () => {
      animating = false;
      pos = mod(Math.round(pos), count);
      render();
    };
    if (!motion.matches || Math.abs(dist) < 0.001) { pos = target; done(); return; }
    // Más lejos, algo más de tiempo (sin llegar a sumar una bici entera)
    const dur = DURATION * Math.min(1.6, 0.55 + 0.45 * Math.sqrt(Math.abs(dist)));
    const ease = interrupted ? easeOut : easeInOut;
    const t0 = performance.now();
    animating = true;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      pos = from + dist * ease(t);
      render();
      if (t < 1) raf = requestAnimationFrame(tick);
      else done();
    };
    raf = requestAnimationFrame(tick);
  };

  // Mueve steps bicis (± = derecha/izquierda) desde la que está centrada
  const go = (steps, base = Math.round(pos)) => {
    const target = base + steps;
    setActive(mod(target, total));
    animateTo(target, animating);
  };
  // A la bici k por el camino más corto
  const goTo = (k) => {
    const base = Math.round(pos);
    let steps = mod(k - mod(base, total), total);
    if (steps > total / 2) steps -= total;
    if (steps) go(steps, base);
  };

  root.querySelector('[data-showcase-prev]')?.addEventListener('click', () => go(-1));
  root.querySelector('[data-showcase-next]')?.addEventListener('click', () => go(1));
  dots.forEach((dot, k) => dot.addEventListener('click', () => goTo(k)));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });

  // Arrastre (ratón y dedo) -----------------------------------------------------
  let drag = null;
  let suppressClick = false;
  const stepPx = () => bikes[0].offsetWidth * (parseFloat(getComputedStyle(panel).getPropertyValue('--spread')) || 1);

  stage.addEventListener('pointerdown', (e) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('button')) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, pos, moved: false, step: stepPx(), lastX: e.clientX, lastT: e.timeStamp, v: 0 };
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return;
      drag.moved = true;
      cancelAnimationFrame(raf);
      animating = false;
      drag.pos = pos;
      drag.x = e.clientX;
      stage.setPointerCapture(e.pointerId);
      root.classList.add('is-dragging');
      setPaused('drag', true);
      return;
    }
    const dt = e.timeStamp - drag.lastT;
    if (dt > 0) drag.v = 0.8 * ((e.clientX - drag.lastX) / dt) + 0.2 * drag.v;
    drag.lastX = e.clientX;
    drag.lastT = e.timeStamp;
    pos = drag.pos - dx / drag.step;
    render();
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { moved, v, pos: startPos } = drag;
    drag = null;
    if (!moved) return;
    suppressClick = true;
    root.classList.remove('is-dragging');
    setPaused('drag', false);
    // Proyecta la inercia del gesto y redondea a la bici más cercana
    // (la inercia suma como mucho media bici: un gesto no salta de más)
    const fling = Math.max(-0.6, Math.min(0.6, v * 180 / stepPx()));
    let target = Math.round(pos - fling);
    // Un gesto rápido, aunque sea corto, pasa al menos una bici
    const start = Math.round(startPos);
    if (target === start && Math.abs(v) > 0.3) target = start - Math.sign(v);
    const next = mod(target, total);
    const same = next === active;
    setActive(next);
    animateTo(target, true);
    if (same) restartProgress();
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // Clic: en la central abre su ficha; en una vecina la trae al centro
  stage.addEventListener('click', (e) => {
    if (suppressClick) { suppressClick = false; return; }
    if (e.target.closest('button')) return; // flechas
    const x = e.clientX;
    const bike = bikes.find((b) => {
      if (b.style.visibility === 'hidden') return false;
      const r = b.getBoundingClientRect();
      return x >= r.left && x <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (!bike) return;
    const d = Math.round(offset(bikes.indexOf(bike), pos));
    if (d === 0) cta?.click();
    else go(d);
  });

  // Gesto horizontal del trackpad
  let wheelX = 0;
  let wheelLock = 0;
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (e.timeStamp < wheelLock) return;
    wheelX += e.deltaX;
    if (Math.abs(wheelX) > 40) {
      go(Math.sign(wheelX));
      wheelX = 0;
      wheelLock = e.timeStamp + DURATION * 0.7;
    }
  }, { passive: false });

  // Pase automático ---------------------------------------------------------------
  const reasons = new Set();
  const autoplay = () => autoplayMs > 0 && motion.matches;
  function setPaused(reason, on) {
    if (on) reasons.add(reason); else reasons.delete(reason);
    const paused = reasons.size > 0;
    root.classList.toggle('is-paused', paused);
    // Solo se anuncia el cambio de bici si no gira solo
    info.setAttribute('aria-live', autoplay() && !paused ? 'off' : 'polite');
  }
  function restartProgress() {
    // Reinicia la línea activa (su ::after) cuando se vuelve a la misma bici
    const dot = dots[active];
    dot.removeAttribute('aria-current');
    void dot.offsetWidth;
    dot.setAttribute('aria-current', 'true');
  }
  const setMode = () => {
    root.classList.toggle('is-autoplay', autoplay());
    if (toggle) toggle.hidden = !autoplay();
    setPaused('motion', !autoplay());
  };

  root.querySelector('.home-showcase__dots')?.addEventListener('animationend', (e) => {
    if (e.animationName === 'showcase-progress' && autoplay() && !reasons.size) go(1);
  });
  toggle?.addEventListener('click', () => {
    const paused = !reasons.has('user');
    setPaused('user', paused);
    toggle.setAttribute('aria-label', paused ? 'Reanudar el pase automático' : 'Pausar el pase automático');
    toggle.firstElementChild.textContent = paused ? 'play_arrow' : 'pause';
  });
  panel.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setPaused('hover', true); });
  panel.addEventListener('pointerleave', () => setPaused('hover', false));
  // Solo con teclado: un clic de ratón en las flechas no detiene el pase
  root.addEventListener('focusin', (e) => { if (e.target !== toggle && e.target.matches(':focus-visible')) setPaused('focus', true); });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget) || e.relatedTarget === toggle) setPaused('focus', false); });
  document.addEventListener('visibilitychange', () => setPaused('hidden', document.hidden));

  // Fuera de pantalla: pausa. Cerca: carga ya todas las fotos (las vecinas
  // están recortadas por el panel y la carga diferida las dejaría para el final)
  setPaused('offscreen', true);
  new IntersectionObserver(([entry]) => setPaused('offscreen', !entry.isIntersecting), { threshold: 0.35 }).observe(panel);
  const preload = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    bikes.forEach((b) => { const img = b.querySelector('img'); if (img) img.loading = 'eager'; });
    preload.disconnect();
  }, { rootMargin: '600px 0px' });
  preload.observe(panel);

  motion.addEventListener('change', setMode);
  setMode();
  syncA11y();
  render();
});

// Tema por scroll: la sección que cruza el centro decide si la página es negra --
const themedSections = document.querySelectorAll('main [data-theme]');

if (themedSections.length) {
  let themeTicking = false;
  const updateTheme = () => {
    themeTicking = false;
    const center = window.innerHeight / 2;
    const current = [...themedSections].find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= center && r.bottom > center;
    });
    document.body.classList.toggle('is-dark', current?.dataset.theme === 'dark');
  };
  const requestTheme = () => {
    if (!themeTicking) { themeTicking = true; requestAnimationFrame(updateTheme); }
  };
  window.addEventListener('scroll', requestTheme, { passive: true });
  window.addEventListener('resize', requestTheme);
  updateTheme();
}

// Navegación interna: marca la sección visible -------------------------------
// Mejora progresiva: en navegadores con CSS scroll-target-group, el estilo
// visual lo resuelve :target-current sin observadores continuos y solo se
// sincroniza aria-current en scrollend; como respaldo, IntersectionObserver.
const subnavLinks = [...document.querySelectorAll('[data-subnav] a')];

if (subnavLinks.length) {
  if (window.CSS?.supports?.('scroll-target-group: auto')) {
    const syncSubnav = () => {
      const active = subnavLinks.find((a) => a.matches(':target-current'));
      subnavLinks.forEach((a) => {
        if (a === active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    document.addEventListener('scrollend', syncSubnav, { passive: true });
    requestAnimationFrame(syncSubnav);
  } else {
    const sections = subnavLinks.map((a) => {
      const hash = a.getAttribute('href');
      try { return hash.startsWith('#') ? document.querySelector(hash) : null; } catch { return null; }
    }).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        subnavLinks.forEach((a) => {
          if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => observer.observe(s));
  }
}

// Acceso fijo a montajes ([data-builds-button], fichas) ----------------------
// Aparece cuando el hero sale de pantalla y se oculta mientras se ven el hero,
// la sección de destino (montajes), el distribuidor o el pie. El margen
// superior descuenta la cabecera y la subnavegación fijas: lo que queda debajo
// de ellas ya no cuenta como visible. Al usarlo, el foco pasa al titular de los
// montajes (el salto con desplazamiento lo hacen las anclas internas, arriba).
const buildsButton = document.querySelector('[data-builds-button]');
let buildsTarget = null;
try { buildsTarget = buildsButton && document.querySelector(buildsButton.getAttribute('href')); } catch { buildsTarget = null; }

if (buildsButton && buildsTarget && 'IntersectionObserver' in window) {
  const rootStyle = getComputedStyle(document.documentElement);
  const covered = (parseFloat(rootStyle.getPropertyValue('--header-h')) || 0)
    + (document.querySelector('.subnav') ? parseFloat(rootStyle.getPropertyValue('--subnav-h')) || 0 : 0);
  const blockers = [
    document.querySelector('.product-hero'),
    buildsTarget,
    document.querySelector('.dealer-band'),
    document.querySelector('.site-footer'),
  ].filter(Boolean);
  const inView = new Set();
  const buttonObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) inView.add(entry.target);
      else inView.delete(entry.target);
    });
    buildsButton.classList.toggle('is-visible', inView.size === 0);
  }, { rootMargin: `-${Math.round(covered)}px 0px 0px 0px` });
  blockers.forEach((el) => buttonObserver.observe(el));

  const focusTarget = buildsTarget.querySelector('h2') || buildsTarget;
  buildsButton.addEventListener('click', () => {
    if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
    // Después del salto: la navegación al ancla recoloca el foco
    setTimeout(() => focusTarget.focus({ preventScroll: true }), 0);
  });
}

// Selector de color: guarda el color en la URL y en los enlaces -------------
// Los enlaces con [data-keep] (configurador, distribuidor) heredan ?color=.
// La foto la cambia [data-stage-colors] (abajo).
const colorInputs = document.querySelectorAll('input[name="color"]');

function applyColor(value, updateUrl = true) {
  const input = [...colorInputs].find((i) => i.value === value);
  if (!input) return;
  input.checked = true;
  document.querySelectorAll('a[data-keep]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), location.href);
    url.searchParams.set('color', value);
    a.setAttribute('href', `${a.getAttribute('href').split(/[?#]/)[0]}${url.search}${url.hash}`);
  });

  if (!updateUrl) return;
  const page = new URL(location.href);
  page.searchParams.set('color', value);
  history.replaceState(null, '', page);
}

if (colorInputs.length) {
  colorInputs.forEach((i) => i.addEventListener('change', () => applyColor(i.value)));
  const fallback = ([...colorInputs].find((i) => i.checked) || colorInputs[0]).value;
  const fromUrl = new URLSearchParams(location.search).get('color');
  // Un ?color= que no existe en esta página no deja la foto en blanco
  applyColor([...colorInputs].some((i) => i.value === fromUrl) ? fromUrl : fallback, false);
}

// La bici en grande: cambio de color sin mover la bici -------------------------
// [data-stage-colors] (ficha): cada color lleva su recorte en data-src. Todos
// comparten lienzo y posición, así que basta con cambiar el src de la misma
// imagen. Se precarga antes de cambiar (sin parpadeo) y al pasar por encima
// de la muestra. El ?color= lo gestiona applyColor (arriba).
document.querySelectorAll('[data-stage-colors]').forEach((picker) => {
  const img = picker.closest('.product-stage')?.querySelector('[data-stage-bike]');
  if (!img) return;
  const inputs = [...picker.querySelectorAll('input[data-src]')];
  const cache = new Map();
  const preload = (src) => {
    if (!cache.has(src)) {
      const pre = new Image();
      pre.src = src;
      cache.set(src, pre.decode ? pre.decode().catch(() => {}) : Promise.resolve());
    }
    return cache.get(src);
  };
  let token = 0;

  function show(input) {
    const current = ++token;
    preload(input.dataset.src).then(() => {
      if (current !== token) return;
      img.src = input.dataset.src;
      if (img.dataset.alt) img.alt = img.dataset.alt.replace('{color}', input.dataset.label.toLowerCase());
    });
  }

  inputs.forEach((input) => {
    input.addEventListener('change', () => show(input));
    input.closest('label')?.addEventListener('pointerenter', () => preload(input.dataset.src), { once: true });
  });
  const checked = inputs.find((i) => i.checked);
  if (checked && img.getAttribute('src') !== checked.dataset.src) show(checked);
});

// Geometría: la fila de la tabla resalta su medida en el esquema -------------
const geoRows = document.querySelectorAll('tr[data-geometry]');

function highlightGeo(key) {
  document.querySelectorAll('[data-geometry]').forEach((el) => el.classList.toggle('is-highlighted', el.dataset.geometry === key));
}

geoRows.forEach((row) => {
  row.addEventListener('mouseenter', () => highlightGeo(row.dataset.geometry));
  row.addEventListener('mouseleave', () => highlightGeo(null));
});
document.querySelectorAll('svg [data-geometry]').forEach((g) => {
  g.addEventListener('mouseenter', () => highlightGeo(g.dataset.geometry));
  g.addEventListener('mouseleave', () => highlightGeo(null));
});

// Geometría: el selector de talla resalta su columna --------------------------
const sizePicks = document.querySelectorAll('[data-size-pick]');

function pickSize(size) {
  sizePicks.forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.sizePick === size));
  document.querySelectorAll('.geometry-table [data-size]').forEach((cell) => cell.classList.toggle('is-size', cell.dataset.size === size));
}

if (sizePicks.length) {
  sizePicks.forEach((btn) => btn.addEventListener('click', () => pickSize(btn.dataset.sizePick)));
  pickSize(([...sizePicks].find((b) => b.getAttribute('aria-pressed') === 'true') || sizePicks[0]).dataset.sizePick);
}

// Historia con scroll (.scroll-story) ----------------------------------------
// En escritorio y sin movimiento reducido, fija la escena y reparte los
// detalles a lo largo del scroll: --r (0 → 1) hace subir la imagen de cada
// detalle sobre la anterior; el texto cambia a mitad de la subida.
document.querySelectorAll('[data-scroll-story]').forEach((section) => {
  const track = section.querySelector('.scroll-story__track');
  const stage = section.querySelector('.scroll-story__stage');
  const items = [...section.querySelectorAll('.scroll-story__item')];
  if (!track || !stage) return;
  const mq = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  const HOLD = 0.15; // fracción de cada tramo en la que la imagen queda quieta
  const clamp = (v) => Math.min(Math.max(v, 0), 1);
  let ticking = false;

  function update() {
    ticking = false;
    if (!section.classList.contains('is-pinned') || items.length < 2) return;
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const distance = track.offsetHeight - stage.offsetHeight;
    const progress = distance > 0 ? clamp((top - track.getBoundingClientRect().top) / distance) : 0;
    const pos = progress * (items.length - 1);
    let active = 0;
    items.forEach((item, i) => {
      const r = i === 0 ? 1 : clamp((pos - (i - 1) - HOLD) / (1 - 2 * HOLD));
      item.style.setProperty('--r', r.toFixed(4));
      if (r >= 0.5) active = i;
    });
    items.forEach((item, i) => item.classList.toggle('is-active', i === active));
  }

  function setMode() {
    section.classList.toggle('is-pinned', mq.matches);
    if (!mq.matches) items.forEach((item) => { item.style.removeProperty('--r'); item.classList.remove('is-active'); });
    update();
  }

  // Con la escena fijada, los detalles no tienen posición propia en la página:
  // los enlaces a su #id (y el hash al cargar) llevan al tramo de scroll del detalle.
  function scrollToItem(i, behavior = 'smooth') {
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const distance = track.offsetHeight - stage.offsetHeight;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    const progress = items.length > 1 ? i / (items.length - 1) : 0;
    smoothScrollTo(trackTop - top + progress * distance, behavior);
  }

  items.forEach((item, i) => {
    if (!item.id) return;
    document.querySelectorAll(`a[href="#${CSS.escape(item.id)}"]`).forEach((a) => {
      a.addEventListener('click', (e) => {
        if (!section.classList.contains('is-pinned')) return;
        e.preventDefault();
        scrollToItem(i);
        history.replaceState(null, '', `#${item.id}`);
      });
    });
  });

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  mq.addEventListener('change', setMode);
  setMode();

  const fromHash = items.findIndex((item) => item.id && `#${item.id}` === location.hash);
  if (fromHash > -1 && section.classList.contains('is-pinned')) {
    window.addEventListener('load', () => scrollToItem(fromHash, 'auto'), { once: true });
  }
});

// Vídeos decorativos: con movimiento reducido se quedan en el póster ---------
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video[autoplay]').forEach((v) => {
    v.removeAttribute('autoplay');
    v.pause();
  });
}

// Vídeos con botón de pausa ([data-ofy-film]) ---------------------------------
// Only For You (vídeo y cierre «Empieza a configurar») y su bloque en la home.
// Cada [data-ofy-film] lleva su vídeo y su botón [data-ofy-film-toggle].
document.querySelectorAll('[data-ofy-film]').forEach((root) => {
  const video = root.querySelector('video');
  const toggle = root.querySelector('[data-ofy-film-toggle]');
  if (!video || !toggle) return;

  const icon = toggle.querySelector('.material-symbols-outlined');
  const label = toggle.querySelector('[data-ofy-film-label]');

  // El botón refleja el estado real del vídeo (también si el navegador
  // bloquea la reproducción automática).
  const sync = () => {
    const paused = video.paused;
    icon.textContent = paused ? 'play_arrow' : 'pause';
    label.textContent = paused ? 'Reproducir' : 'Pausar';
  };
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);

  // Fuera de pantalla no gasta: se pausa y, al volver, sigue solo si no
  // lo había pausado la persona.
  let userPaused = false;
  toggle.addEventListener('click', () => {
    if (video.paused) { userPaused = false; video.play().catch(() => {}); }
    else { userPaused = true; video.pause(); }
  });
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) { if (!video.paused) video.pause(); }
    else if (!userPaused && video.hasAttribute('autoplay')) video.play().catch(() => {});
  }, { threshold: 0.15 }).observe(video);

  if (!video.hasAttribute('autoplay')) sync();
});

// Nombre que sube con el scroll ----------------------------------------------------
// [data-rise] (ficha, la bici en grande): --rise-y desplaza el nombre gris de
// detrás de la bici. Entra desde abajo (+RISE del alto del marco) y sube de
// forma continua hasta −RISE mientras el marco cruza la pantalla; centrado
// cuando el marco está a media pantalla. Sin movimiento reducido: quieto.
const riseEls = [...document.querySelectorAll('[data-rise]')];

if (riseEls.length) {
  const mq = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const RISE = 0.6;
  let ticking = false;

  const update = () => {
    ticking = false;
    if (!mq.matches) return;
    const vh = window.innerHeight;
    riseEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = Math.min(Math.max((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1), 1);
      el.style.setProperty('--rise-y', `${(p * RISE * r.height).toFixed(1)}px`);
    });
  };

  const setMode = () => {
    if (!mq.matches) riseEls.forEach((el) => el.style.removeProperty('--rise-y'));
    update();
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  mq.addEventListener('change', setMode);
  setMode();
}

// La bici en uso: el marco se abre con el scroll ----------------------------------
// [data-in-use] (ficha, entre características y detalles). Solo en escritorio y
// sin movimiento reducido: --in-use-p (0 → 1) ensancha el marco y, con él, la
// foto (CSS .in-use__frame) mientras su borde superior sube del 95 % al 40 % de la
// pantalla. El valor sigue al scroll con un pequeño amortiguado, para que un
// salto (scroll rápido, ancla, tecla Fin) se vea como apertura y no como corte.
// No fija la sección ni toca el scroll. Si la foto no carga, quita el bloque.
// Con vídeo (.in-use__video): sin sonido y en bucle, solo mientras se ve; la
// primera vez salta a data-start (el segundo del póster) para no dar un salto
// de imagen. Con movimiento reducido se queda en el póster. Si el vídeo falla,
// queda el póster sin botón (o se quita el bloque si tampoco hay póster).
document.querySelectorAll('[data-in-use]').forEach((root) => {
  const frame = root.querySelector('.in-use__frame');
  const img = frame?.querySelector(':scope > img');
  const video = frame?.querySelector(':scope > video');
  if (!frame || !(img?.getAttribute('src') || video)) { root.remove(); return; }
  img?.addEventListener('error', () => root.remove(), { once: true });

  if (video) {
    const play = frame.querySelector('.in-use__play');
    const sources = [...video.querySelectorAll('source')];
    sources.at(-1)?.addEventListener('error', () => {
      if (!video.getAttribute('poster')) { root.remove(); return; }
      if (play) play.hidden = true;
    });
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = parseFloat(video.dataset.start) || 0;
    let started = false;
    let visible = false;
    const run = () => {
      if (!visible || still.matches || document.querySelector('.video-modal[open]')) return;
      if (started) { video.play().catch(() => {}); return; }
      started = true;
      video.preload = 'auto';
      const go = () => {
        if (start && video.duration > start) {
          video.addEventListener('seeked', () => { if (visible) video.play().catch(() => {}); }, { once: true });
          video.currentTime = start;
        } else video.play().catch(() => {});
      };
      if (video.readyState >= 1) go();
      else { video.addEventListener('loadedmetadata', go, { once: true }); video.load(); }
    };
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) run();
      else if (!video.paused) video.pause();
    }, { threshold: 0.15 }).observe(frame);
    still.addEventListener('change', () => (still.matches ? video.pause() : run()));
  }

  const mq = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  const START = 0.95;
  const END = 0.4;
  const clamp = (v) => Math.min(Math.max(v, 0), 1);
  const ease = (t) => t * t * (3 - 2 * t); // entrada y salida suaves
  let target = 1;
  let current = 1;
  let raf = 0;
  let last = 0;

  const measure = () => {
    const vh = window.innerHeight;
    const top = frame.getBoundingClientRect().top;
    target = ease(clamp((vh * START - top) / (vh * (START - END))));
  };
  const apply = () => frame.style.setProperty('--in-use-p', current.toFixed(4));

  const tick = (now) => {
    const dt = last ? Math.min(now - last, 64) : 16.7;
    last = now;
    current += (target - current) * (1 - Math.pow(0.75, dt / 16.7));
    if (Math.abs(target - current) < 0.0005) current = target;
    apply();
    raf = current === target ? 0 : requestAnimationFrame(tick);
    if (!raf) last = 0;
  };

  const onScroll = () => {
    if (!mq.matches) return;
    measure();
    if (!raf && target !== current) raf = requestAnimationFrame(tick);
  };

  const setMode = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (!mq.matches) { frame.style.removeProperty('--in-use-p'); return; }
    measure();
    current = target; // al cargar o cambiar de modo, sin animar
    apply();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  mq.addEventListener('change', setMode);
  setMode();
});

// Galería a sangre: transición por revelado ----------------------------------
// Scroll nativo para dedo/trackpad; las flechas interpolan durante 1100 ms con
// una curva suave (sin arranque brusco ni frenazo). El borde del marco barre la
// pantalla y es lo que descubre la foto nueva: la de atrás (la que se va) apenas
// se mueve y la de delante (la que entra) se desplaza un poco más. Sin zoom ni
// huecos. Sin vuelta al inicio: en la primera y en la última foto se desactiva
// la flecha correspondiente y el autoplay se detiene al llegar al final.
document.querySelectorAll('[data-gallery]').forEach((root) => {
  const track = root.querySelector('.gallery__track');
  const current = root.querySelector('[data-gallery-current]');
  const total = root.querySelector('[data-gallery-total]');
  if (!track || !current || !total) return;
  const slides = [...track.children];
  if (!slides.length) return;
  const imgs = slides.map((slide) => slide.querySelector('img'));
  const prev = root.querySelector('[data-gallery-prev]');
  const next = root.querySelector('[data-gallery-next]');
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const pad = (n) => String(n).padStart(2, '0');
  const last = slides.length - 1;
  // Recorrido visible de cada foto respecto al de su marco.
  const DRIFT_OUT = 0.06;
  const DRIFT_IN = 0.24;
  const DURATION = 1100;
  let index = 0;
  let base = 0; // foto en reposo al empezar el gesto: es «la de atrás»
  let targetIndex = 0;
  let animation = 0;
  let pending = 0;
  // Gesto táctil: mientras el dedo arrastra, la foto sigue al
  // dedo 1:1 con el scroll nativo y su ajuste (snap). El revelado con
  // transform se reserva a las flechas y al autoplay: aplicado bajo el dedo,
  // la foto de atrás contrarrestaba el 94 % del recorrido y parecía atascarse
  // hasta que el snap la soltaba de golpe.
  let touching = false;  // dedo sobre la galería
  let touchMode = false; // sin revelado hasta que la galería vuelve al reposo
  let userSwiped = false; // tras el primer gesto, el autoplay no vuelve

  total.textContent = pad(slides.length);
  current.textContent = pad(1);

  const setButtons = (i) => {
    const focused = document.activeElement;
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= last;
    // Si la flecha con foco se desactiva, el foco pasa a la otra.
    if (focused && focused.disabled) (focused === prev ? next : prev)?.focus();
  };
  const sync = () => {
    const w = track.clientWidth;
    if (!w) return;
    const position = track.scrollLeft / w;
    index = Math.max(0, Math.min(last, Math.round(position)));
    current.textContent = pad(index + 1);
    if (!animation) setButtons(index);
    const atRest = Math.abs(track.scrollLeft - index * w) < 1;
    if (touchMode) {
      // Fotos planas mientras dura el gesto y la inercia; en reposo, la visible
      // pasa a ser la de atrás y vuelve el revelado (las vecinas están fuera
      // de pantalla: el cambio no se ve).
      if (touching || !atRest) return;
      touchMode = false;
    }
    // En reposo exacto, la foto visible pasa a ser la de atrás del siguiente gesto
    // (las vecinas están fuera de pantalla: el cambio no se ve).
    if (atRest) base = index;
    imgs.forEach((img, i) => {
      if (!img) return;
      const distance = Math.max(-1, Math.min(1, i - position));
      const drift = i === base ? DRIFT_OUT : DRIFT_IN;
      img.style.transform = motion.matches
        ? `translate3d(${(-distance * w * (1 - drift)).toFixed(2)}px,0,0)`
        : 'none';
    });
  };
  const cancel = () => {
    cancelAnimationFrame(animation);
    animation = 0;
    root.classList.remove('is-sliding');
  };
  // Curva suave de entrada y salida: cubic-bezier(0.45, 0.05, 0.25, 1).
  const bezier = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  const ease = (progress) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20; i++) {
      const t = (lo + hi) / 2;
      if (bezier(t, 0.45, 0.25) < progress) lo = t; else hi = t;
    }
    return bezier((lo + hi) / 2, 0.05, 1);
  };
  const go = (i, animate = motion.matches) => {
    const n = Math.max(0, Math.min(last, i));
    const from = track.scrollLeft;
    const to = n * track.clientWidth;
    cancel();
    targetIndex = n;
    setButtons(n);
    // Cargar el destino antes de que entre en pantalla.
    if (imgs[n]) imgs[n].loading = 'eager';
    if (!animate || Math.abs(to - from) < 1) {
      track.scrollTo({ left: to, behavior: 'instant' });
      sync();
      return;
    }
    root.classList.add('is-sliding');
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / DURATION);
      track.scrollTo({ left: from + (to - from) * ease(progress), behavior: 'instant' });
      sync();
      if (progress < 1) animation = requestAnimationFrame(step);
      else {
        track.scrollTo({ left: to, behavior: 'instant' });
        cancel();
        sync();
      }
    };
    animation = requestAnimationFrame(step);
  };
  const navigate = (direction, event) => go(
    (animation ? targetIndex : index) + direction,
    motion.matches && event.detail !== 0
  );
  prev?.addEventListener('click', (e) => navigate(-1, e));
  next?.addEventListener('click', (e) => navigate(1, e));
  track.addEventListener('scroll', () => {
    if (!animation && !pending) pending = requestAnimationFrame(() => { pending = 0; sync(); });
  }, { passive: true });
  track.addEventListener('pointerdown', cancel, { passive: true });
  track.addEventListener('touchstart', () => {
    touching = true;
    touchMode = true;
    userSwiped = true;
    cancel();
    clearInterval(timer);
    timer = null;
    imgs.forEach((img) => { if (img) img.style.transform = 'none'; });
  }, { passive: true });
  const touchEnd = () => {
    touching = false;
    // Si no hubo desplazamiento (un toque), no llegará ningún scroll: comprobar ya.
    requestAnimationFrame(sync);
  };
  track.addEventListener('touchend', touchEnd, { passive: true });
  track.addEventListener('touchcancel', touchEnd, { passive: true });
  track.addEventListener('wheel', cancel, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + (e.key === 'ArrowLeft' ? -1 : 1), false);
    }
  });
  new ResizeObserver(() => go(animation ? targetIndex : index, false)).observe(track);

  // Conservar autoplay; pausar con ratón, foco, pestaña oculta o movimiento reducido.
  let timer = null;
  let visible = false;
  let hovered = false;
  const tick = () => {
    clearInterval(timer);
    timer = null;
    if (slides.length > 1 && visible && !hovered && !touchMode && !userSwiped
        && !root.contains(document.activeElement)
        && !document.hidden && motion.matches && (animation ? targetIndex : index) < last) {
      timer = setInterval(() => {
        const from = animation ? targetIndex : index;
        if (from >= last) { clearInterval(timer); timer = null; return; }
        go(from + 1);
      }, 3000);
    }
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; tick(); }, { threshold: 0.4 }).observe(root);
  root.addEventListener('pointerenter', (e) => { hovered = e.pointerType !== 'touch'; tick(); });
  root.addEventListener('pointerleave', () => { hovered = false; tick(); });
  root.addEventListener('focusin', tick);
  root.addEventListener('focusout', () => requestAnimationFrame(tick));
  document.addEventListener('visibilitychange', tick);
  motion.addEventListener('change', () => { go(animation ? targetIndex : index, false); tick(); });
  sync();
});

// Enlaces a un acordeón cerrado (<details>): lo abren antes de saltar -------------
// También si el destino está dentro de un acordeón cerrado. Los enlaces que
// abren un pop-up ([data-dialog-open]) se quedan fuera: su FAQ es solo la
// alternativa sin JS.
document.querySelectorAll('a[href^="#"]:not([data-dialog-open])').forEach((a) => {
  const hash = a.getAttribute('href');
  if (hash.length < 2) return;
  let target;
  try { target = document.querySelector(hash); } catch { return; } // p. ej. #1-foto no es un selector válido
  const details = target?.closest('details');
  if (details) a.addEventListener('click', () => { details.open = true; });
});

// «Ver vídeo» (hero de ficha): abre el vídeo con sonido y controles en un pop-up --
// Un solo <dialog> para toda la página, creado aquí. Cierra con la X, con Esc o
// al pulsar fuera del vídeo. Al cerrar se detiene la descarga (src vacío) y el
// foco vuelve al botón (lo hace <dialog> solo). El vídeo de fondo del hero se
// pausa mientras tanto.
const videoOpeners = document.querySelectorAll('[data-video-open]');
if (videoOpeners.length) {
  const modal = document.createElement('dialog');
  modal.className = 'video-modal';
  modal.setAttribute('closedby', 'any');
  modal.innerHTML = `
    <button class="video-modal__close" type="button" aria-label="Cerrar vídeo">
      <span class="material-symbols-outlined" aria-hidden="true">close</span>
    </button>
    <video controls playsinline preload="none"></video>`;
  document.body.append(modal);
  const player = modal.querySelector('video');
  let bgVideo = null; // vídeo de fondo pausado al abrir (solo si se estaba reproduciendo)

  videoOpeners.forEach((btn) => btn.addEventListener('click', () => {
    player.src = btn.dataset.videoOpen;
    modal.style.setProperty('--ratio', btn.dataset.videoRatio || '16 / 9');
    modal.setAttribute('aria-label', btn.dataset.videoTitle || 'Vídeo');
    bgVideo = btn.closest('section, [data-in-use]')?.querySelector('video:not([controls])') || null;
    // Con «reducir movimiento» el fondo ya está parado: al cerrar no debe arrancar
    if (bgVideo?.paused) bgVideo = null;
    bgVideo?.pause();
    modal.showModal();
    lenis?.stop();
    player.play().catch(() => {}); // si el navegador bloquea el autoplay, quedan los controles
  }));

  // Si la proporción real no coincide con data-video-ratio, manda la del archivo
  player.addEventListener('loadedmetadata', () => {
    if (player.videoWidth) modal.style.setProperty('--ratio', `${player.videoWidth} / ${player.videoHeight}`);
  });
  modal.querySelector('.video-modal__close').addEventListener('click', () => modal.close());
  bindDialogDismiss(modal);
  modal.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    lenis?.start();
    bgVideo?.play().catch(() => {});
    bgVideo = null;
  });
}

// Pop-ups de detalle ([data-dialog-open="id"] → <dialog id>) ---------------------
// Tarjetas de «Cada Mendiz es única» en la ficha. El enlace apunta a la FAQ como
// alternativa sin JS; con JS abre el <dialog>. Cierra con la X
// ([data-dialog-close]), con Esc o al pulsar fuera del panel (closedby="any").
// El foco vuelve a la tarjeta (lo hace <dialog> solo).
document.querySelectorAll('[data-dialog-open]').forEach((opener) => {
  const modal = document.getElementById(opener.dataset.dialogOpen);
  if (!(modal instanceof HTMLDialogElement)) return;
  opener.addEventListener('click', (e) => {
    e.preventDefault();
    modal.showModal();
    lenis?.stop();
  });
  if (modal.dataset.dialogReady) return;
  modal.dataset.dialogReady = '';
  modal.querySelectorAll('[data-dialog-close]').forEach((btn) => btn.addEventListener('click', () => modal.close()));
  modal.addEventListener('close', () => {
    lenis?.start();
  });
});

// Home: parallax del hero y aparición de las destacadas -------------------------
// Solo con movimiento permitido. Sin JS (o con «reducir movimiento») todo se
// ve en su sitio desde el principio.
const homeHero = document.querySelector('.cover-hero');
if (homeHero && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  // Parallax: el vídeo de fondo se desplaza al 30 % de la velocidad del scroll.
  // Lenis mueve el scroll de la ventana, así que basta con el evento 'scroll'.
  const heroBg = homeHero.querySelector('.cover-hero__bg');
  if (heroBg) {
    let ticking = false;
    const updateParallax = () => {
      ticking = false;
      const y = window.scrollY;
      if (y > homeHero.offsetHeight) return; // hero fuera de pantalla: nada que mover
      heroBg.style.setProperty('--hero-shift', `${(y * 0.3).toFixed(1)}px`);
    };
    updateParallax();
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
  }

  // Aparición: solo el carrusel de bicis destacadas sube desde abajo con
  // opacidad al entrar en pantalla (una sola vez).
  const revealTargets = document.querySelectorAll('main > [data-showcase]');
  if ('IntersectionObserver' in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    revealTargets.forEach((el) => {
      el.setAttribute('data-reveal', '');
      revealObserver.observe(el);
    });
  }
}

})();
