import template from './post-details.html?raw';
import './post-details.css';
import { getPostById } from '../../js/posts.js';
import { showError } from '../../js/toast.js';

const FALLBACK_IMAGE = 'https://placehold.co/1600x900?text=No+Image';

function renderPostDetails(post) {
  const heroElement = document.getElementById('post-details-hero');
  const contentElement = document.getElementById('post-details-content');

  if (!heroElement || !contentElement) {
    return;
  }

  const imageUrl = post.image_url || FALLBACK_IMAGE;

  heroElement.style.backgroundImage = `linear-gradient(rgba(10, 30, 58, 0.2), rgba(10, 30, 58, 0.2)), url('${imageUrl}')`;

  contentElement.innerHTML = `
    <h1 class="display-6 fw-semibold mb-3">${post.title}</h1>
    <p class="post-destination mb-4">Destination: ${post.destination ?? 'Unknown destination'}</p>
    <p class="post-description text-muted mb-4">${post.description}</p>

    <div class="d-flex flex-wrap gap-2">
      <a href="/edit-post.html?id=${post.id}" data-link class="btn btn-primary">Edit</a>
      <button type="button" class="btn btn-outline-danger" id="delete-post-btn">Delete</button>
      <a href="/index.html" data-link class="btn btn-outline-secondary">Back to Home</a>
    </div>
  `;

  const deleteButton = document.getElementById('delete-post-btn');
  deleteButton?.addEventListener('click', () => {
    window.alert('Delete action is UI-only in this stage.');
  });
}

export function getPostDetailsPage() {
  return {
    title: 'Post Details | Travel Blog Platform',
    html: template,
    async attach() {
      const searchParams = new URLSearchParams(window.location.search);
      const postId = searchParams.get('id');

      if (!postId) {
        showError('Липсва ID на публикация');
        window.location.href = '/index.html';
        return;
      }

      try {
        const post = await getPostById(postId);
        renderPostDetails(post);
      } catch (error) {
        if (!error?.toastShown) {
          showError(error?.message || 'Неуспешно зареждане на публикацията.');
        }
        window.location.href = '/index.html';
      }
    }
  };
}
