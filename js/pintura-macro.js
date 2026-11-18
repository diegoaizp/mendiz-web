(() => {
  const gallery = document.querySelector('[data-paint-macros]');
  const dialog = document.querySelector('#paint-macro-dialog');
  if (!gallery || !dialog) return;
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  let opener;
  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('[data-paint-macro]');
    if (!button) return;
    opener = button;
    const label = button.dataset.paintLabel;
    title.textContent = label === 'Violeta-verde' ? 'Camaleón violeta-verde' : `${label} metalizado`;
    image.alt = `Detalle ampliado de pintura ${title.textContent.toLowerCase()}, acabado brillo`;
    image.src = `assets/img/f14-sl-slp/pintura-macro/${button.dataset.paintMacro}.webp`;
    dialog.showModal();
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
})();
