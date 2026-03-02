import { getCurrentUser, getProfileRole, logout } from './auth.js';

function normalizePath(pathname) {
  return pathname === '/' ? '/index.html' : pathname;
}

function getMainLinks(role) {
  const links = [{ href: '/index.html', label: 'Home' }];

  if (role === 'user' || role === 'admin') {
    links.push(
      { href: '/dashboard.html', label: 'Dashboard' },
      { href: '/create-post.html', label: 'Create Post' }
    );
  }

  if (role === 'admin') {
    links.push({ href: '/admin.html', label: 'Admin' });
  }

  return links;
}

function getAuthLinks(role, userLabel = '') {
  if (role === 'guest') {
    return `
      <a class="btn btn-outline-primary btn-sm" href="/login.html" data-link>Login</a>
      <a class="btn btn-primary btn-sm" href="/register.html" data-link>Register</a>
    `;
  }

  const safeLabel = userLabel || 'User';

  return `
    <span class="badge text-bg-light border d-inline-flex align-items-center">${safeLabel}</span>
    <a class="btn btn-outline-danger btn-sm" href="#" data-action="logout">Logout</a>
  `;
}

function renderMainLinks(pathname, role) {
  const normalizedPath = normalizePath(pathname);

  return getMainLinks(role)
    .map((link) => {
      const isActive = normalizePath(link.href) === normalizedPath;

      return `
        <li class="nav-item">
          <a class="nav-link px-2 ${isActive ? 'active' : ''}" href="${link.href}" data-link ${isActive ? 'aria-current="page"' : ''}>${link.label}</a>
        </li>
      `;
    })
    .join('');
}

function setSessionUiState(role) {
  if (role === 'guest') {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    return;
  }

  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('role', role);
}

export async function renderNavbar(pathname = window.location.pathname) {
  const mainLinksElement = document.getElementById('nav-main-links');
  const authLinksElement = document.getElementById('nav-auth-links');

  if (!mainLinksElement || !authLinksElement) {
    return;
  }

  let role = 'guest';
  let userLabel = '';

  try {
    const user = await getCurrentUser();

    if (user) {
      role = await getProfileRole(user.id);
      userLabel = user.email ?? user.id;
    }
  } catch {
    role = 'guest';
    userLabel = '';
  }

  setSessionUiState(role);

  mainLinksElement.innerHTML = renderMainLinks(pathname, role);
  authLinksElement.innerHTML = getAuthLinks(role, userLabel);

  const logoutLink = authLinksElement.querySelector('[data-action="logout"]');

  if (logoutLink) {
    logoutLink.addEventListener('click', async (event) => {
      event.preventDefault();
      try {
        await logout();
      } catch {
      }
    });
  }
}
