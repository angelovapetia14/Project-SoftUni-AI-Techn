import { renderHeader } from './components/header/header.js';
import { renderFooter } from './components/footer/footer.js';
import { resolveRoute, navigateTo } from './router.js';

function getPathname() {
  return window.location.pathname;
}

function renderApp() {
  const appElement = document.getElementById('app');
  const route = resolveRoute(window.location);
  document.title = route.title ?? 'Travel Blog Platform';

  appElement.innerHTML = `
    ${renderHeader(getPathname())}
    <main class="container py-4" id="page-root">${route.html}</main>
    ${renderFooter()}
  `;

  route.attach?.();

  appElement.querySelectorAll('[data-action="logout"]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('role');
      navigateTo('/');
    });
  });

  appElement.querySelectorAll('[data-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = event.currentTarget.getAttribute('href');
      navigateTo(target);
    });
  });
}

export function bootstrapApp() {
  window.addEventListener('popstate', renderApp);
  window.addEventListener('app:navigate', renderApp);
  renderApp();
}
