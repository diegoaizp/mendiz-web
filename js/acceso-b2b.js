/* ==========================================================================
   MENDIZ — Acceso B2B
   · Mostrar / ocultar la contraseña.
   · Validación en el propio formulario (sin los globos del navegador):
     el error aparece bajo el campo y el foco va al primero que falla.
   · Envío: mientras el formulario lleve data-demo, no sale de la página y
     muestra un aviso. Para conectarlo con el sistema B2B, pon la URL real en
     action, quita data-demo y el formulario se enviará con normalidad.
   ========================================================================== */
(() => {
  const form = document.querySelector('[data-b2b-form]');
  if (!form) return;

  // Contraseña visible ------------------------------------------------------
  form.querySelectorAll('[data-password-toggle]').forEach((btn) => {
    const input = document.getElementById(btn.getAttribute('aria-controls'));
    const icon = btn.querySelector('.material-symbols-outlined');
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
      icon.textContent = show ? 'visibility_off' : 'visibility';
    });
  });

  // Validación ---------------------------------------------------------------
  const MESSAGES = {
    user: 'Escribe tu correo electrónico o tu número de cliente.',
    password: 'Escribe tu contraseña.',
  };
  const fields = [...form.querySelectorAll('input[required]')];

  const setError = (input, message) => {
    const box = input.closest('.field');
    const error = document.getElementById(`${input.id}-error`);
    box.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    error.hidden = !message;
    error.querySelector('[data-text]').textContent = message || '';
  };

  const check = (input) => {
    const message = input.value.trim() ? '' : MESSAGES[input.name];
    setError(input, message);
    return !message;
  };

  fields.forEach((input) => {
    // Tras el primer error, el campo se corrige mientras se escribe
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') check(input);
    });
  });

  // Envío ---------------------------------------------------------------------
  const submit = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-status]');
  const label = submit.textContent;

  form.addEventListener('submit', (event) => {
    status.hidden = true;
    const invalid = fields.filter((input) => !check(input));
    if (invalid.length) {
      event.preventDefault();
      invalid[0].focus();
      return;
    }
    if (!form.hasAttribute('data-demo')) {
      submit.setAttribute('aria-busy', 'true');
      submit.textContent = 'Entrando…';
      return; // envío real
    }
    event.preventDefault();
    submit.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    submit.textContent = 'Entrando…';
    setTimeout(() => {
      submit.removeAttribute('aria-busy');
      submit.disabled = false;
      submit.textContent = label;
      status.hidden = false;
    }, 900);
  });
})();
