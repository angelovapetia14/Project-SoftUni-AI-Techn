function ensureToastContainer() {
  let container = document.getElementById('app-toast-container');

  if (container) {
    return container;
  }

  container = document.createElement('div');
  container.id = 'app-toast-container';
  container.className = 'toast-container position-fixed top-0 end-0 p-3';
  container.style.zIndex = '1080';

  document.body.appendChild(container);

  return container;
}

function showToast(message, variant = 'danger') {
  const container = ensureToastContainer();

  const toastElement = document.createElement('div');
  toastElement.className = `toast align-items-center text-bg-${variant} border-0`;
  toastElement.setAttribute('role', 'alert');
  toastElement.setAttribute('aria-live', 'assertive');
  toastElement.setAttribute('aria-atomic', 'true');
  toastElement.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastElement);

  if (window.bootstrap?.Toast) {
    const toast = new window.bootstrap.Toast(toastElement, { delay: 3500 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });

    return;
  }

  console.log(message);
}

export function showError(message) {
  showToast(message, 'danger');
  console.error(message);
}

export function showSuccess(message) {
  showToast(message, 'success');
}

export function showInfo(message) {
  showSuccess(message);
}
