import { getCurrentUser, getProfileRole } from './auth.js';
import { assertSupabaseClient } from './supabaseClient.js';
import { showError, showInfo } from './toast.js';

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
}

function getRowTemplate(post) {
  const displayDate = post.travel_date || post.created_at;

  return `
    <tr>
      <td>${post.title ?? 'Untitled'}</td>
      <td>${post.destination ?? 'Unknown destination'}</td>
      <td>${formatDate(displayDate)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete-post" data-id="${post.id}">Delete</button>
      </td>
    </tr>
  `;
}

function renderTable(posts) {
  const body = document.getElementById('admin-posts-table-body');

  if (!body) {
    return;
  }

  if (!posts.length) {
    body.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-4">No posts available.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = posts.map(getRowTemplate).join('');
}

async function getAllPostsForAdmin() {
  const supabase = assertSupabaseClient();

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, destination, created_at, travel_date')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function deletePostById(postId) {
  const supabase = assertSupabaseClient();

  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    throw error;
  }
}

export async function initAdminDashboard() {
  const tableBody = document.getElementById('admin-posts-table-body');

  if (!tableBody) {
    return;
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    const role = await getProfileRole(user.id);

    if (role !== 'admin') {
      window.location.href = '/index.html';
      return;
    }

    const loadAndRender = async () => {
      const posts = await getAllPostsForAdmin();
      renderTable(posts);
    };

    await loadAndRender();

    tableBody.addEventListener('click', async (event) => {
      const target = event.target;
      const deleteButton = target.closest('[data-action="delete-post"]');

      if (!deleteButton) {
        return;
      }

      const postId = deleteButton.getAttribute('data-id');
      const confirmed = window.confirm('Are you sure?');

      if (!confirmed) {
        return;
      }

      try {
        deleteButton.disabled = true;
        await deletePostById(postId);
        showInfo('Post deleted successfully');
        await loadAndRender();
      } catch (error) {
        deleteButton.disabled = false;
        showError(error?.message || 'Failed to delete post.');
      }
    });
  } catch (error) {
    showError(error?.message || 'Failed to load admin panel.');
  }
}
