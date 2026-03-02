import { createPost } from './posts.js';
import { showError } from './toast.js';

export function initCreatePostPage() {
  const form = document.getElementById('create-post-form');

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('create-title')?.value ?? '';
    const destination = document.getElementById('create-destination')?.value ?? '';
    const description = document.getElementById('create-description')?.value ?? '';
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
