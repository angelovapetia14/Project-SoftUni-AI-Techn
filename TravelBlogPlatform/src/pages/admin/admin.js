import template from './admin.html?raw';
import './admin.css';
import { requireAdmin } from '../../js/guards.js';

const adminPosts = [
  { id: 1, title: 'Journey Through Japan', author: 'Jivko', destination: 'Japan' },
  { id: 2, title: 'Summer in Bali', author: 'Maria', destination: 'Bali' },
  { id: 3, title: 'Italian Lake Adventures', author: 'Georgi', destination: 'Italy' }
];

function getRowTemplate(post) {
  return `
    <tr>
      <td>${post.title}</td>
      <td>${post.author}</td>
      <td>${post.destination}</td>
      <td class="text-end">
        <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete-post" data-id="${post.id}">Delete</button>
      </td>
    </tr>
  `;
}

function renderTable() {
  const body = document.getElementById('admin-posts-table-body');

  if (!body) {
    return;
  }

  body.innerHTML = adminPosts.map(getRowTemplate).join('');

  body.querySelectorAll('[data-action="delete-post"]').forEach((button) => {
    button.addEventListener('click', () => {
      window.alert('Delete action is UI-only in this stage.');
    });
  });
}

export function getAdminPage() {
  return {
    title: 'Admin Dashboard | Travel Blog Platform',
    html: template,
    async attach() {
      const user = await requireAdmin();

      if (!user) {
        return;
      }

      renderTable();
    }
  };
}
