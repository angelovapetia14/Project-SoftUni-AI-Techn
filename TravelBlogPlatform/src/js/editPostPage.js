import { getPostById, updatePost } from './posts.js';
import { assertSupabaseClient } from './supabaseClient.js';
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

function renderImagePreview(url) {
  const previewElement = document.getElementById('edit-image-preview');

  if (!previewElement) {
    return;
  }

  if (!url) {
    previewElement.innerHTML = '<p class="text-muted mb-0 px-3 text-center">Няма качена снимка</p>';
    return;
  }

  previewElement.innerHTML = `<img src="${url}" alt="Current post image" />`;
}

function renderSelectedImagePreview(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    renderImagePreview(event.target?.result);
  };
  reader.readAsDataURL(file);
}

export async function initEditPostPage() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');

  if (!postId) {
    showError('Липсва ID на публикация');
    window.location.href = '/index.html';
    return;
  }

  const form = document.getElementById('edit-post-form');
  const imageInput = document.getElementById('edit-image');
  const titleInput = document.getElementById('edit-title');
  const destinationInput = document.getElementById('edit-destination');
  const descriptionInput = document.getElementById('edit-description');
  const travelDateInput = document.getElementById('edit-travel-date');

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

  try {
    const supabase = assertSupabaseClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message || 'Трябва да сте логнати');
    }

    if (!user) {
      throw new Error('Трябва да сте логнати');
    }

    const post = await getPostById(postId);

    if (post.user_id !== user.id) {
      throw new Error('Нямате право да редактирате този пост');
    }

    if (titleInput) {
      titleInput.value = post.title ?? '';
    }

    if (destinationInput) {
      destinationInput.value = post.destination ?? '';
    }

    if (descriptionInput) {
      descriptionInput.value = post.description ?? '';
    }

    if (travelDateInput) {
      travelDateInput.value = post.travel_date ?? '';
    }

    renderImagePreview(post.image_url ?? null);
  } catch (error) {
    if (!error?.toastShown) {
      showError(error?.message || 'Неуспешно зареждане на публикацията.');
    }
    window.location.href = '/index.html';
    return;
  }

  imageInput?.addEventListener('change', (event) => {
    const selectedFile = event.target?.files?.[0];
    renderSelectedImagePreview(selectedFile);
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
    const travelDate = travelDateInput?.value ?? '';
    const imageFile = imageInput?.files?.[0] ?? null;

    try {
      await updatePost(postId, title, destination, description, imageFile, travelDate);
    } catch (error) {
      if (!error?.toastShown) {
        showError(error?.message || 'Неуспешно обновяване на публикацията.');
      }
    }
  });
}
