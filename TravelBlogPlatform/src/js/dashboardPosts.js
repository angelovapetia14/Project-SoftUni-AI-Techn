import { assertSupabaseClient } from './supabaseClient.js';
import { deletePost, getAllPosts } from './posts.js';
import { showError } from './toast.js';

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x450?text=No+Image';

function shortenText(text, maxLength = 100) {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

async function getCurrentUserId() {
  const supabase = assertSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user?.id ?? null;
}

function getPostCard(post, currentUserId) {
  const imageUrl = post.image_url || PLACEHOLDER_IMAGE;
  const isOwner = currentUserId && post.user_id === currentUserId;

  return `
    <div class="col-12 col-md-4">
      <article class="card h-100 shadow-sm">
        <img src="${imageUrl}" class="card-img-top post-image" alt="${post.title}" />
        <div class="card-body d-flex flex-column">
          <h2 class="h5 card-title">${post.title}</h2>
          <p class="text-muted mb-2">${post.destination || 'Unknown destination'}</p>
          <p class="card-text text-muted flex-grow-1">${shortenText(post.description, 100)}</p>
          <div class="d-flex gap-2">
            <a href="/post-details.html?id=${post.id}" data-link class="btn btn-primary">Read More</a>
            ${
              isOwner
                ? `
                  <a href="/edit-post.html?id=${post.id}" data-link class="btn btn-outline-primary">Edit</a>
                  <button type="button" class="btn btn-outline-danger" data-delete-post-id="${post.id}">Delete</button>
                `
                : ''
            }
          </div>
        </div>
      </article>
    </div>
  `;
}

function renderEmpty(container) {
  container.innerHTML = `
    <div class="col-12">
      <p class="mb-0">Няма публикации.</p>
    </div>
  `;
}

function bindDeleteEvents(container) {
  if (container.dataset.deleteBound === 'true') {
    return;
  }

  container.dataset.deleteBound = 'true';

  container.addEventListener('click', async (event) => {
    const target = event.target;
    const deleteButton = target.closest('[data-delete-post-id]');

    if (!deleteButton) {
      return;
    }

    const postId = deleteButton.getAttribute('data-delete-post-id');
    const confirmed = window.confirm('Сигурни ли сте?');

    if (!confirmed) {
      return;
    }

    try {
      deleteButton.dataset.originalHtml = deleteButton.innerHTML;
      deleteButton.disabled = true;
      deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Deleting...';
      await deletePost(postId);
    } catch (error) {
      showError(error?.message || 'Неуспешно изтриване на публикацията.');
      deleteButton.disabled = false;
      deleteButton.innerHTML = deleteButton.dataset.originalHtml || 'Delete';
    }
  });
}

export async function initDashboardPosts() {
  const container = document.getElementById('dashboard-posts');

  if (!container) {
    return;
  }

  try {
    bindDeleteEvents(container);

    const [posts, currentUserId] = await Promise.all([getAllPosts(), getCurrentUserId()]);

    if (!posts.length) {
      renderEmpty(container);
      return;
    }

    container.innerHTML = posts.map((post) => getPostCard(post, currentUserId)).join('');
  } catch (error) {
    if (!error?.toastShown) {
      showError(error?.message || 'Неуспешно зареждане на публикациите.');
    }

    renderEmpty(container);
  }
}
