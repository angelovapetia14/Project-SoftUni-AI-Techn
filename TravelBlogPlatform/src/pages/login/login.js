import template from './login.html?raw';
import './login.css';

function navigateHome() {
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new Event('app:navigate'));
}

export function getLoginPage() {
  return {
    title: 'Login | Travel Blog Platform',
    html: template,
    attach() {
      const form = document.getElementById('login-form');
      const emailInput = document.getElementById('login-email');

      form?.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = (emailInput?.value ?? '').trim().toLowerCase();
        const role = email.includes('admin') ? 'admin' : 'user';

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', role);

        navigateHome();
      });
    }
  };
}
