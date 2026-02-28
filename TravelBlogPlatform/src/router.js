import { getIndexPage } from './pages/index/index.js';
import { getDashboardPage } from './pages/dashboard/dashboard.js';

const implementedRoutes = {
  '/': getIndexPage,
  '/dashboard': getDashboardPage
};

const scaffoldedRoutes = ['/login', '/register', '/create-post', '/post-details', '/edit-post', '/admin'];

function getScaffoldMessage(pathname, searchParams) {
  const id = searchParams.get('id');
  const idLine = id ? `<p class="mb-0">Requested id: <strong>${id}</strong></p>` : '';

  return {
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
