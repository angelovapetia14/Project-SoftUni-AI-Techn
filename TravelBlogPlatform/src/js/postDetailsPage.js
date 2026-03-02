import { assertSupabaseClient } from './supabaseClient.js';
import { deletePost, getPostById } from './posts.js';
import { addComment, deleteComment, getCommentsByPostId, updateComment } from './comments.js';
import { showError } from './toast.js';

const FALLBACK_IMAGE = 'https://placehold.co/1600x900?text=No+Image';

async function getCurrentUserContext() {
  const supabase = assertSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { userId: null };
  }

  return {
    userId: user.id
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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatAuthor(profile) {
  return profile?.username || profile?.email || 'Unknown user';
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString();
}

function getCommentItem(comment, currentUserId) {
  const isOwner = currentUserId && comment.user_id === currentUserId;

  return `
    <article class="comment-item" data-comment-id="${comment.id}">
      <div class="d-flex justify-content-between align-items-center mb-2 gap-2">
        <p class="comment-meta text-muted mb-0">${escapeHtml(formatAuthor(comment.profiles))} • ${escapeHtml(formatDate(comment.created_at))}</p>
        ${
          isOwner
            ? `
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-primary" data-edit-comment-id="${comment.id}">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-delete-comment-id="${comment.id}">Delete</button>
              </div>
            `
            : ''
        }
      </div>
      <p class="comment-content mb-0" data-comment-content="${comment.id}">${escapeHtml(comment.content)}</p>
    </article>
  `;
}

function renderComments(comments, currentUserId) {
  const commentsList = document.getElementById('comments-list');

  if (!commentsList) {
    return;
  }

  if (!comments.length) {
    commentsList.innerHTML = '<p class="mb-0 text-muted">No comments yet.</p>';
    return;
  }

  commentsList.innerHTML = comments.map((comment) => getCommentItem(comment, currentUserId)).join('');
}

function scrollToHighlightedComment(commentId) {
  if (!commentId) {
    return false;
  }

  const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);

  if (!commentElement) {
    return false;
  }

  commentElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

  commentElement.classList.add('comment-item-highlight');

  window.setTimeout(() => {
    commentElement.classList.remove('comment-item-highlight');
  }, 2500);

  return true;
}

async function loadAndRenderComments(postId, currentUserId) {
  const comments = await getCommentsByPostId(postId);
  renderComments(comments, currentUserId);
  return comments;
}

function setupCommentForm(postId, currentUserId) {
  const form = document.getElementById('comment-form');
  const input = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-btn');
  const guestNote = document.getElementById('comment-guest-note');

  if (!form || !input || !submitButton || !guestNote) {
    return;
  }

  if (!currentUserId) {
    form.classList.add('d-none');
    guestNote.classList.remove('d-none');
    return;
  }

  form.classList.remove('d-none');
  guestNote.classList.add('d-none');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      submitButton.disabled = true;
      await addComment(postId, input.value);
      input.value = '';
      await loadAndRenderComments(postId, currentUserId);
    } catch (error) {
      showError(error?.message || 'Failed to add comment.');
    } finally {
      submitButton.disabled = false;
    }
  });
}

function setupCommentActions(postId, currentUserId) {
  const commentsList = document.getElementById('comments-list');

  if (!commentsList || !currentUserId) {
    return;
  }

  commentsList.addEventListener('click', async (event) => {
    const target = event.target;
    const editButton = target.closest('[data-edit-comment-id]');
    const deleteButton = target.closest('[data-delete-comment-id]');

    if (editButton) {
      const commentId = editButton.getAttribute('data-edit-comment-id');
      const contentElement = document.querySelector(`[data-comment-content="${commentId}"]`);
      const currentContent = contentElement?.textContent ?? '';
      const updatedContent = window.prompt('Edit comment:', currentContent);

      if (updatedContent === null) {
        return;
      }

      try {
        await updateComment(commentId, updatedContent);
        await loadAndRenderComments(postId, currentUserId);
      } catch (error) {
        showError(error?.message || 'Failed to edit comment.');
      }

      return;
    }

    if (deleteButton) {
      const commentId = deleteButton.getAttribute('data-delete-comment-id');
      const confirmed = window.confirm('Are you sure?');

      if (!confirmed) {
        return;
      }

      try {
        deleteButton.disabled = true;
        await deleteComment(commentId);
        await loadAndRenderComments(postId, currentUserId);
      } catch (error) {
        showError(error?.message || 'Failed to delete comment.');
        deleteButton.disabled = false;
      }
    }
  });
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

  if (isOwner) {
    editButton.setAttribute('href', `/edit-post.html?id=${post.id}`);
    editButton.classList.remove('d-none');
    deleteButton.classList.remove('d-none');
    return;
  }

  editButton.classList.add('d-none');
  deleteButton.classList.add('d-none');
}

export async function initPostDetailsPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const postId = searchParams.get('id');
  const commentId = searchParams.get('commentId');

  if (!postId) {
    showError('Missing post ID');
    window.location.href = '/index.html';
    return;
  }

  try {
    const [post, userContext] = await Promise.all([getPostById(postId), getCurrentUserContext()]);
    const isOwner = Boolean(userContext.userId && userContext.userId === post.user_id);

    renderPostDetails(post, isOwner);

    const deleteButton = document.getElementById('delete-btn');

    setupCommentForm(postId, userContext.userId);
    setupCommentActions(postId, userContext.userId);
    await loadAndRenderComments(postId, userContext.userId);

    if (commentId) {
      window.requestAnimationFrame(() => {
        scrollToHighlightedComment(commentId);
      });
    }

    if (!isOwner) {
      return;
    }

    deleteButton?.addEventListener('click', async () => {
      const confirmed = window.confirm('Are you sure?');

      if (!confirmed) {
        return;
      }

      try {
        setDeleteButtonLoadingState(deleteButton, true);
        await deletePost(postId);
      } catch (error) {
        showError(error?.message || 'Failed to delete post.');
        setDeleteButtonLoadingState(deleteButton, false);
      }
    });
  } catch (error) {
    if (!error?.toastShown) {
      showError(error?.message || 'Failed to load post.');
    }
    window.location.href = '/index.html';
  }
}
