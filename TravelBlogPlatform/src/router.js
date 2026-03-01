import { getIndexPage } from './pages/index/index.js';
import { getDashboardPage } from './pages/dashboard/dashboard.js';
import { getLoginPage } from './pages/login/login.js';
import { getRegisterPage } from './pages/register/register.js';
import { getCreatePostPage } from './pages/create-post/create-post.js';
import { getPostDetailsPage } from './pages/post-details/post-details.js';
import { getAdminPage } from './pages/admin/admin.js';
import { getEditPostPage } from './pages/edit-post/edit-post.js';

const implementedRoutes = {
  '/': getIndexPage,
  '/index.html': getIndexPage,
  '/dashboard': getDashboardPage,
  '/dashboard.html': getDashboardPage,
  '/login': getLoginPage,
  '/login.html': getLoginPage,
  '/register': getRegisterPage,
  '/register.html': getRegisterPage,
  '/create-post': getCreatePostPage,
  '/create-post.html': getCreatePostPage,
  '/post-details': getPostDetailsPage,
  '/post-details.html': getPostDetailsPage,
  '/edit-post': getEditPostPage,
  '/edit-post.html': getEditPostPage,
  '/admin': getAdminPage,
  '/admin.html': getAdminPage
};

const scaffoldedRoutes = [];

const scaffoldedRouteTitles = {
  '/login': 'Login | Travel Blog Platform',
  '/register': 'Register | Travel Blog Platform',
  '/create-post': 'Create Post | Travel Blog Platform',
  '/post-details': 'Post Details | Travel Blog Platform',
  '/edit-post': 'Edit Post | Travel Blog Platform',
  '/admin': 'Admin | Travel Blog Platform'
};

function getScaffoldMessage(pathname, searchParams) {
  const id = searchParams.get('id');
  const idLine = id ? `<p class="mb-0">Requested id: <strong>${id}</strong></p>` : '';

  return {
    title: scaffoldedRouteTitles[pathname] ?? 'Travel Blog Platform',
    html: `
      <section class="text-center py-5">
        <h1 class="h3">Route scaffolded: ${pathname}</h1>
        <p class="text-muted">This route exists in navigation and router config, but no page component is created yet.</p>
        ${idLine}
      </section>
    `
  };
}

export function resolveRoute(location) {
  const pathname = location.pathname;
  const routeFactory = implementedRoutes[pathname];

  if (routeFactory) {
    return routeFactory();
  }

  if (scaffoldedRoutes.includes(pathname)) {
    return getScaffoldMessage(pathname, new URLSearchParams(location.search));
  }

  return {
    title: 'Not Found | Travel Blog Platform',
    html: `
      <section class="text-center py-5">
        <h1 class="h3">404 - Not Found</h1>
        <p class="text-muted">The requested page does not exist.</p>
      </section>
    `
  };
}

export function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('app:navigate'));
}
