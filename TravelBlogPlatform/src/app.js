import { renderHeader } from './components/header/header.js';
import { renderFooter } from './components/footer/footer.js';
import { resolveRoute, navigateTo } from './router.js';
import { renderNavbar } from './js/navbar.js';

function getPathname() {
  return window.location.pathname;
}

async function renderApp() {
  const appElement = document.getElementById('app');
  const route = resolveRoute(window.location);
  document.title = route.title ?? 'Travel Blog Platform';

  appElement.innerHTML = `
    ${renderHeader()}
    <main class="container py-4" id="page-root">${route.html}</main>
    ${renderFooter()}
  `;

  await renderNavbar(getPathname());
  await route.attach?.();

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
