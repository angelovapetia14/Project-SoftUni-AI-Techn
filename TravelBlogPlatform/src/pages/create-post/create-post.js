import template from './create-post.html?raw';
import './create-post.css';
import { requireAuth } from '../../js/guards.js';

function renderImagePreview(file) {
  const previewElement = document.getElementById('image-preview');

  if (!previewElement) {
    return;
  }

  if (!file) {
    previewElement.innerHTML = '<p class="text-muted mb-0 px-3 text-center">No image selected</p>';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    previewElement.innerHTML = `<img src="${event.target?.result}" alt="Selected preview" />`;
  };
  reader.readAsDataURL(file);
}

export function getCreatePostPage() {
  return {
    title: 'Create Post | Travel Blog Platform',
    html: template,
    async attach() {
      const user = await requireAuth();

      if (!user) {
        return;
      }

      const form = document.getElementById('create-post-form');
      const imageInput = document.getElementById('create-image');

      imageInput?.addEventListener('change', (event) => {
        const target = event.target;
        const file = target.files?.[0];
        renderImagePreview(file);
      });

      form?.addEventListener('submit', (event) => {
        event.preventDefault();
      });
    }
  };
}
