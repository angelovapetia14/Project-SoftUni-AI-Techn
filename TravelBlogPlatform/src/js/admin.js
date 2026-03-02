import { getCurrentUser, getProfileRole } from './auth.js';
import { navigateTo } from '../router.js';
import { showError, showInfo } from './toast.js';
import {
  deleteCommentAdmin,
  deletePostAdmin,
  deleteUserAdmin,
  getCommentsForAdmin,
  getPostsForAdmin,
  getUsersForAdmin,
  updateCommentAdmin,
  updateUserRoleAdmin
} from './adminService.js';

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function truncateContent(content, maxLength = 80) {
  if (!content) {
    return '—';
  }

  return content.length <= maxLength ? content : `${content.slice(0, maxLength)}...`;
}

function getPostRowTemplate(post) {
  const displayDate = post.travel_date || post.created_at;

  return `
    <tr>
      <td>${escapeHtml(post.title ?? 'Untitled')}</td>
      <td>${escapeHtml(post.destination ?? 'Unknown destination')}</td>
      <td>${escapeHtml(post.authorDisplay ?? 'Unknown user')}</td>
      <td>${formatDate(displayDate)}</td>
      <td class="text-end">
        <a href="/post-details.html?id=${post.id}" data-link class="btn btn-outline-secondary btn-sm me-2">View</a>
        <a href="/edit-post.html?id=${post.id}" data-link class="btn btn-outline-primary btn-sm me-2">Edit</a>
        <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete-post" data-id="${post.id}">Delete</button>
      </td>
    </tr>
  `;
}

function getCommentAuthor(comment) {
  return comment?.profiles?.username || comment?.profiles?.email || 'Unknown user';
}

function getCommentPostTitle(comment) {
  return comment?.posts?.title || 'Untitled post';
}

function getCommentRowTemplate(comment) {
  return `
    <tr>
      <td>${escapeHtml(truncateContent(comment.content, 70))}</td>
      <td>${escapeHtml(getCommentAuthor(comment))}</td>
      <td>${escapeHtml(getCommentPostTitle(comment))}</td>
      <td>${formatDate(comment.created_at)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-outline-secondary btn-sm me-2" data-action="view-comment" data-id="${comment.id}">View</button>
        <button type="button" class="btn btn-outline-primary btn-sm me-2" data-action="edit-comment" data-id="${comment.id}">Edit</button>
        <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete-comment" data-id="${comment.id}">Delete</button>
      </td>
    </tr>
  `;
}

function getUserRowTemplate(user, currentUserId) {
  const isCurrentUser = user.id === currentUserId;

  return `
    <tr>
      <td>${escapeHtml(user.email ?? '—')}</td>
      <td>${escapeHtml(user.username ?? '—')}</td>
      <td>
        <select class="form-select form-select-sm" data-role-select="${user.id}" ${isCurrentUser ? 'disabled' : ''}>
          <option value="user" ${user.role === 'user' ? 'selected' : ''}>user</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
        </select>
      </td>
      <td>${formatDate(user.created_at)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-outline-primary btn-sm me-2" data-action="save-role" data-id="${user.id}" ${isCurrentUser ? 'disabled' : ''}>Save</button>
        <button type="button" class="btn btn-outline-secondary btn-sm me-2" data-action="view-user" data-id="${user.id}">View</button>
        ${isCurrentUser
          ? '<span class="text-muted small">Current admin</span>'
          : `<button type="button" class="btn btn-outline-danger btn-sm" data-action="delete-user" data-id="${user.id}" data-email="${escapeHtml(user.email ?? '')}">Delete</button>`}
      </td>
    </tr>
  `;
}

function renderPostsTable(posts) {
  const body = document.getElementById('admin-posts-table-body');

  if (!body) {
    return;
  }

  if (!posts.length) {
    body.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No posts available.</td></tr>';
    return;
  }

  body.innerHTML = posts.map(getPostRowTemplate).join('');
}

function renderCommentsTable(comments) {
  const body = document.getElementById('admin-comments-table-body');

  if (!body) {
    return;
  }

  if (!comments.length) {
    body.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No comments available.</td></tr>';
    return;
  }

  body.innerHTML = comments.map(getCommentRowTemplate).join('');
}

function renderUsersTable(users, currentUserId) {
  const body = document.getElementById('admin-users-table-body');

  if (!body) {
    return;
  }

  if (!users.length) {
    body.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No users available.</td></tr>';
    return;
  }

  body.innerHTML = users.map((user) => getUserRowTemplate(user, currentUserId)).join('');
}

function showModal(title, content) {
  const modalElement = document.getElementById('admin-view-modal');
  const modalTitle = document.getElementById('admin-view-modal-title');
  const modalBody = document.getElementById('admin-view-modal-body');

  if (!modalElement || !modalTitle || !modalBody) {
    window.alert(`${title}\n\n${String(content).replace(/<[^>]*>/g, '')}`);
    return;
  }

  modalTitle.textContent = title;
  modalBody.innerHTML = content;

  if (!window.bootstrap?.Modal) {
    window.alert(`${title}\n\n${modalBody.textContent ?? ''}`);
    return;
  }

  const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

export async function initAdminDashboard() {
  const postsTableBody = document.getElementById('admin-posts-table-body');
  const commentsTableBody = document.getElementById('admin-comments-table-body');
  const usersTableBody = document.getElementById('admin-users-table-body');

  if (!postsTableBody || !commentsTableBody || !usersTableBody) {
    return;
  }

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      window.location.href = '/index.html';
      return;
    }

    const role = await getProfileRole(currentUser.id);

    if (role !== 'admin') {
      window.location.href = '/index.html';
      return;
    }

    const state = {
      posts: [],
      comments: [],
      users: []
    };

    const loadAndRender = async () => {
      const [posts, comments, users] = await Promise.all([
        getPostsForAdmin(),
        getCommentsForAdmin(),
        getUsersForAdmin()
      ]);

      state.posts = posts;
      state.comments = comments;
      state.users = users;

      renderPostsTable(posts);
      renderCommentsTable(comments);
      renderUsersTable(users, currentUser.id);
    };

    await loadAndRender();

    postsTableBody.addEventListener('click', async (event) => {
      const deleteButton = event.target.closest('[data-action="delete-post"]');

      if (!deleteButton) {
        return;
      }

      const postId = deleteButton.getAttribute('data-id');
      const confirmed = window.confirm('Are you sure you want to delete this post?');

      if (!confirmed) {
        return;
      }

      try {
        deleteButton.disabled = true;
        await deletePostAdmin(postId);
        showInfo('Публикацията е изтрита');
        await loadAndRender();
      } catch (error) {
        deleteButton.disabled = false;
        showError(error?.message || 'Failed to delete post.');
      }
    });

    commentsTableBody.addEventListener('click', async (event) => {
      const viewButton = event.target.closest('[data-action="view-comment"]');
      const editButton = event.target.closest('[data-action="edit-comment"]');
      const deleteButton = event.target.closest('[data-action="delete-comment"]');

      if (viewButton) {
        const commentId = viewButton.getAttribute('data-id');
        const comment = state.comments.find((item) => item.id === commentId);

        if (!comment) {
          return;
        }

        if (!comment.post_id) {
          showError('Missing post ID for this comment.');
          return;
        }

        navigateTo(`/post-details.html?id=${encodeURIComponent(comment.post_id)}&commentId=${encodeURIComponent(comment.id)}`);

        return;
      }

      if (editButton) {
        const commentId = editButton.getAttribute('data-id');
        const comment = state.comments.find((item) => item.id === commentId);

        if (!comment) {
          return;
        }

        const nextContent = window.prompt('Edit comment content:', comment.content ?? '');

        if (nextContent === null) {
          return;
        }

        const trimmed = nextContent.trim();

        if (!trimmed) {
          showError('Comment content cannot be empty.');
          return;
        }

        try {
          editButton.disabled = true;
          await updateCommentAdmin(commentId, trimmed);
          showInfo('Коментарът е обновен');
          await loadAndRender();
        } catch (error) {
          editButton.disabled = false;
          showError(error?.message || 'Failed to update comment.');
        }

        return;
      }

      if (!deleteButton) {
        return;
      }

      const commentId = deleteButton.getAttribute('data-id');
      const confirmed = window.confirm('Are you sure you want to delete this comment?');

      if (!confirmed) {
        return;
      }

      try {
        deleteButton.disabled = true;
        await deleteCommentAdmin(commentId);
        showInfo('Коментарът е изтрит');
        await loadAndRender();
      } catch (error) {
        deleteButton.disabled = false;
        showError(error?.message || 'Failed to delete comment.');
      }
    });

    usersTableBody.addEventListener('click', async (event) => {
      const saveRoleButton = event.target.closest('[data-action="save-role"]');
      const deleteButton = event.target.closest('[data-action="delete-user"]');
      const viewButton = event.target.closest('[data-action="view-user"]');

      if (viewButton) {
        const userId = viewButton.getAttribute('data-id');
        const user = state.users.find((item) => item.id === userId);

        if (!user) {
          return;
        }

        showModal(
          'User profile',
          `
            <p class="mb-2"><strong>Email:</strong> ${escapeHtml(user.email ?? '—')}</p>
            <p class="mb-2"><strong>Username:</strong> ${escapeHtml(user.username ?? '—')}</p>
            <p class="mb-2"><strong>Role:</strong> ${escapeHtml(user.role ?? 'user')}</p>
            <p class="mb-0"><strong>Created at:</strong> ${escapeHtml(formatDate(user.created_at))}</p>
          `
        );

        return;
      }

      if (saveRoleButton) {
        const userId = saveRoleButton.getAttribute('data-id');
        const row = saveRoleButton.closest('tr');
        const roleSelect = row?.querySelector('[data-role-select]');
        const nextRole = roleSelect?.value;

        if (!nextRole || !['user', 'admin'].includes(nextRole)) {
          showError('Missing role value.');
          return;
        }

        try {
          saveRoleButton.disabled = true;
          await updateUserRoleAdmin(userId, nextRole);
          showInfo('Ролята е обновена');
          await loadAndRender();
        } catch (error) {
          saveRoleButton.disabled = false;
          showError(error?.message || 'Failed to update role.');
        }

        return;
      }

      if (!deleteButton) {
        return;
      }

      const userId = deleteButton.getAttribute('data-id');
      const userEmail = deleteButton.getAttribute('data-email') || 'this user';
      const confirmed = window.confirm(`Are you sure you want to delete ${userEmail}?`);

      if (!confirmed) {
        return;
      }

      try {
        deleteButton.disabled = true;
        await deleteUserAdmin(userId, currentUser.id);
        showInfo('User deleted successfully');
        await loadAndRender();
      } catch (error) {
        deleteButton.disabled = false;
        showError(error?.message || 'Failed to delete user.');
      }
    });
  } catch (error) {
    showError(error?.message || 'Failed to load admin panel.');
  }
}
