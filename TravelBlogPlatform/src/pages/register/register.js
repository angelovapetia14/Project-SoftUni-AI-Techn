import template from './register.html?raw';
import './register.css';

function navigateHome() {
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new Event('app:navigate'));
}

export function getRegisterPage() {
  return {
    title: 'Register | Travel Blog Platform',
    html: template,
    attach() {
      const form = document.getElementById('register-form');

      form?.addEventListener('submit', (event) => {
        event.preventDefault();

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', 'user');

        navigateHome();
      });
    }
  };
}
