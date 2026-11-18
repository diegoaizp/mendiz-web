/* MENDIZ — Blog: filtro por categoría (mejora progresiva: sin JS se ven todos). */
(() => {
  const filter = document.querySelector('[data-blog-filter]');
  if (!filter) return;
  const cards = document.querySelectorAll('[data-category]');
  filter.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    const cat = btn.dataset.filter;
    filter.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    cards.forEach((c) => { c.hidden = !(cat === 'todo' || c.dataset.category === cat); });
  });
})();

/* MENDIZ — Noticia y ayuda: compartir. «Copiar enlace» copia la URL y lo confirma
   en el propio botón; «Compartir» solo aparece si el navegador soporta Web Share. */
(() => {
  const box = document.querySelector('[data-share]');
  if (!box) return;
  const copy = box.querySelector('[data-share-copy]');
  const label = box.querySelector('[data-share-label]');
  const native = box.querySelector('[data-share-native]');
  if (copy && navigator.clipboard) {
    copy.addEventListener('click', () => {
      navigator.clipboard.writeText(location.href).then(() => {
        label.textContent = 'Enlace copiado';
        setTimeout(() => { label.textContent = 'Copiar enlace'; }, 2000);
      }).catch(() => {});
    });
  }
  if (native && navigator.share) {
    native.hidden = false;
    native.addEventListener('click', () => {
      navigator.share({ title: document.title, url: location.href }).catch(() => {});
    });
  }
})();
