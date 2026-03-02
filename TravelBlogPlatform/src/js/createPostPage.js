import { createPost } from './posts.js';
import { showError } from './toast.js';

function validateRequiredFields(fields) {
  let isValid = true;

  fields.forEach((field) => {
    const hasValue = Boolean(field?.value?.trim());

    field?.classList.toggle('is-invalid', !hasValue);

    if (!hasValue) {
      isValid = false;
    }
  });

  return isValid;
}

export function initCreatePostPage() {
  const form = document.getElementById('create-post-form');
  const titleInput = document.getElementById('create-title');
  const destinationInput = document.getElementById('create-destination');
  const descriptionInput = document.getElementById('create-description');

  if (!form) {
    return;
  }

  [titleInput, destinationInput, descriptionInput].forEach((field) => {
    field?.addEventListener('input', () => {
      if (field.value.trim()) {
        field.classList.remove('is-invalid');
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const requiredFields = [titleInput, destinationInput, descriptionInput];

    if (!validateRequiredFields(requiredFields)) {
      showError('Попълнете всички задължителни полета.');
      return;
    }

    const title = titleInput?.value ?? '';
    const destination = destinationInput?.value ?? '';
    const description = descriptionInput?.value ?? '';
    const travelDate = document.getElementById('create-travel-date')?.value ?? '';
    const imageFile = document.getElementById('create-image')?.files?.[0] ?? null;

    try {
      await createPost(title, destination, description, imageFile, travelDate);
    } catch (error) {
      if (!error?.toastShown) {
        showError(error?.message || 'Неуспешно създаване на публикацията.');
      }
    }
  });
}
