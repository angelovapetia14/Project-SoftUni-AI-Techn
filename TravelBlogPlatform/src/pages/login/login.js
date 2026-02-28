import template from './login.html?raw';
import './login.css';

export function getLoginPage() {
  return {
    title: 'Login | Travel Blog Platform',
    html: template,
    attach() {
      const form = document.getElementById('login-form');
      form?.addEventListener('submit', (event) => {
        event.preventDefault();
      });
    }
  };
}
