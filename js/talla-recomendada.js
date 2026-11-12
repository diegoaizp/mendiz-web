/* ==========================================================================
   MENDIZ — Talla recomendada por altura (pop-up «Geometría y tallas»)
   Lo usan configurador-f14.html y montaje-f14-mpl.html. Marcado en el
   <dialog>: [data-height-form] (con un input [data-height-input] en cm), el
   botón de elegir [data-height-pick] y la salida [data-height-out].
   Elegir la talla pulsa el [data-size-pick] de esa talla de la tabla, que
   cada página ya gestiona (tarjetas de talla, resumen, URL…).
   PROVISIONAL: los rangos son los habituales en carretera y NO son una tabla
   oficial de Mendiz; validar con la marca (la guía ayuda-como-elegir-tu-talla
   está pendiente). Cambiar solo RANGES.
   ========================================================================== */
(() => {
  const form = document.querySelector('[data-height-form]');
  if (!form) return;

  // Altura mínima (cm, incluida) de cada talla; cada talla llega hasta la siguiente.
  const RANGES = [
    { size: 'XS', from: 150 },
    { size: 'S', from: 165 },
    { size: 'M', from: 172 },
    { size: 'L', from: 180 },
    { size: 'XL', from: 188 },
  ];
  const MIN = 140;
  const MAX = 210;
  const MARGIN = 2; // a ≤2 cm de un corte se avisa de que está entre dos tallas

  const input = form.querySelector('[data-height-input]');
  const out = form.querySelector('[data-height-out]');
  const pick = form.querySelector('[data-height-pick]');
  let size = null;

  const clear = (msg) => {
    size = null;
    pick.hidden = true;
    out.textContent = msg;
    out.classList.remove('is-ok');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const h = Number(String(input.value).replace(',', '.'));
    if (!Number.isFinite(h) || h < MIN || h > MAX) {
      clear(`Indica una altura entre ${MIN} y ${MAX} cm.`);
      return;
    }
    const i = RANGES.reduce((acc, r, n) => (h >= r.from ? n : acc), 0);
    size = RANGES[i].size;
    let text = `Para ${Math.round(h)} cm, te recomendamos la talla ${size}.`;
    const lower = RANGES[i - 1];
    const upper = RANGES[i + 1];
    if (upper && upper.from - h <= MARGIN) text += ` Estás cerca de la ${upper.size}: pruébala también con tu distribuidor.`;
    else if (lower && h - RANGES[i].from < MARGIN) text += ` Estás cerca de la ${lower.size}: pruébala también con tu distribuidor.`;
    out.textContent = text;
    out.classList.add('is-ok');
    pick.textContent = `Elegir talla ${size}`;
    pick.hidden = false;
  });
  input.addEventListener('input', () => { if (size) clear(''); });

  pick.addEventListener('click', () => {
    document.querySelector(`[data-size-pick="${size}"]`)?.click();
    pick.textContent = `Talla ${size} elegida`;
    pick.disabled = true;
    setTimeout(() => { pick.disabled = false; pick.textContent = `Elegir talla ${size}`; }, 1600);
  });
})();
