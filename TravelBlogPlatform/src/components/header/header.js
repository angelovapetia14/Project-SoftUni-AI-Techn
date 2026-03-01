import template from './header.html?raw';
import './header.css';

function getSessionState() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const role = localStorage.getItem('role') ?? 'guest';

  return {
    isAuthenticated,
    role,
    isAdmin: isAuthenticated && role === 'admin'
  };
}

function getMainLinks(normalizedPath, isAuthenticated, isAdmin) {
  const links = [{ href: '/', label: 'Home' }];

  if (isAuthenticated) {
    links.push({ href: '/create-post', label: 'Create Post' });
  }

  if (isAdmin) {
    links.push({ href: '/admin', label: 'Admin' });
  }

  return links
    .map(
      (link) => `
        <li class="nav-item">
          <a class="nav-link px-2 ${normalizedPath === link.href ? 'active' : ''}" href="${link.href}" data-link ${normalizedPath === link.href ? 'aria-current="page"' : ''}>
            ${link.label}
          </a>
        </li>
      `
    )
    .join('');
}

function getAuthLinks(isAuthenticated, role) {
  if (isAuthenticated) {
    const badgeClass = role === 'admin' ? 'text-bg-primary' : 'text-bg-secondary';
    const badgeLabel = role === 'admin' ? 'Admin' : 'User';

    return `
      <span class="badge ${badgeClass} align-self-center" aria-label="Current role">${badgeLabel}</span>
      <button class="btn btn-outline-danger btn-sm" type="button" data-action="logout">Logout</button>
    `;
  }

  return `
    <a class="btn btn-outline-primary btn-sm" href="/login" data-link>Login</a>
    <a class="btn btn-primary btn-sm" href="/register" data-link>Register</a>
  `;
}

export function renderHeader(pathname) {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const { isAuthenticated, role, isAdmin } = getSessionState();

  return template
    .replace('<ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2" id="nav-main-links"></ul>', `<ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2" id="nav-main-links">${getMainLinks(normalizedPath, isAuthenticated, isAdmin)}</ul>`)
    .replace('<div class="d-flex gap-2 ms-lg-3 mt-3 mt-lg-0" id="nav-auth-links"></div>', `<div class="d-flex gap-2 ms-lg-3 mt-3 mt-lg-0" id="nav-auth-links">${getAuthLinks(isAuthenticated, role)}</div>`);
}
