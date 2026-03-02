import { assertSupabaseClient } from './supabaseClient.js';
import { deletePost, getPostById } from './posts.js';
import { getProfileRole } from './auth.js';
import { showError } from './toast.js';

const FALLBACK_IMAGE = 'https://placehold.co/1600x900?text=No+Image';

async function getCurrentUserContext() {
  const supabase = assertSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { userId: null, role: 'guest' };
  }

  let role = 'user';

  try {
    role = await getProfileRole(user.id);
  } catch {
  }

  return {
    userId: user.id,
    role
  };
}

function setDeleteButtonLoadingState(button, isLoading) {
  if (!button) {
    return;
  }

  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Deleting...';
    return;
  }

  button.disabled = false;
  button.innerHTML = button.dataset.originalHtml || 'Delete';
}

function renderPostDetails(post, isOwner) {
  const heroElement = document.getElementById('post-details-hero');
  const titleElement = document.getElementById('post-title');
  const destinationElement = document.getElementById('post-destination');
  const descriptionElement = document.getElementById('post-description');
  const editButton = document.getElementById('edit-btn');
  const deleteButton = document.getElementById('delete-btn');

  if (
    !heroElement ||
    !titleElement ||
    !destinationElement ||
    !descriptionElement ||
    !editButton ||
    !deleteButton
  ) {
    return;
  }

  const imageUrl = post.image_url || FALLBACK_IMAGE;

  heroElement.style.backgroundImage = `linear-gradient(rgba(10, 30, 58, 0.2), rgba(10, 30, 58, 0.2)), url('${imageUrl}')`;
  titleElement.textContent = post.title ?? '';
  destinationElement.textContent = `Destination: ${post.destination ?? 'Unknown destination'}`;
  descriptionElement.textContent = post.description ?? '';
  editButton.setAttribute('href', `/edit-post.html?id=${post.id}`);

  if (!isOwner) {
    deleteButton.style.display = 'none';
  }
}

export async function initPostDetailsPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const postId = searchParams.get('id');

  if (!postId) {
    showError('Липсва ID на публикация');
    window.location.href = '/index.html';
    return;
  }

  try {
    const [post, userContext] = await Promise.all([getPostById(postId), getCurrentUserContext()]);
    const isGuest = !userContext.userId;
    const isAdmin = userContext.role === 'admin';
    const isOwner = userContext.userId === post.user_id;

    renderPostDetails(post, isOwner);

    const deleteButton = document.getElementById('delete-btn');
    const editButton = document.getElementById('edit-btn');

    if (isGuest || isAdmin) {
      deleteButton?.remove();
      editButton?.remove();
      return;
    }

    if (!isOwner) {
      deleteButton?.remove();
      editButton?.remove();
      return;
    }

    deleteButton?.addEventListener('click', async () => {
      const confirmed = window.confirm('Сигурни ли сте?');

      if (!confirmed) {
        return;
      }

      try {
        setDeleteButtonLoadingState(deleteButton, true);
        await deletePost(postId);
      } catch (error) {
        showError(error?.message || 'Неуспешно изтриване на публикацията.');
        setDeleteButtonLoadingState(deleteButton, false);
      }
    });
  } catch (error) {
    if (!error?.toastShown) {
      showError(error?.message || 'Неуспешно зареждане на публикацията.');
    }
    window.location.href = '/index.html';
  }
}
