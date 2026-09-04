document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('#mainNav');

  if (navbar && window.bootstrap) {
    navbar.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992 && navbar.classList.contains('show')) {
          window.bootstrap.Collapse.getOrCreateInstance(navbar).hide();
        }
      });
    });
  }

  const imageModal = document.querySelector('#imageModal');
  if (imageModal) {
    imageModal.addEventListener('show.bs.modal', (event) => {
      const trigger = event.relatedTarget;
      const sourceImage = trigger?.querySelector('img');
      const modalImage = imageModal.querySelector('#modalImage');

      if (modalImage && sourceImage) {
        modalImage.src = sourceImage.currentSrc || sourceImage.src;
        modalImage.alt = `${sourceImage.alt} ampliado`;
      }
    });

    imageModal.addEventListener('hidden.bs.modal', () => {
      const modalImage = imageModal.querySelector('#modalImage');
      if (modalImage) modalImage.src = '';
    });
  }

  document.querySelectorAll('form:not([onsubmit])').forEach((form) => {
    form.addEventListener('submit', () => {
      if (!form.checkValidity()) return;

      const submitButton = form.querySelector('button[type="submit"]');
      if (!submitButton) return;

      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.dataset.originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Processando...';
    });
  });
});
