import template from './register.html?raw';
import './register.css';

export function getRegisterPage() {
  return {
    title: 'Register | Travel Blog Platform',
    html: template,
    attach() {
      const form = document.getElementById('register-form');
      form?.addEventListener('submit', (event) => {
        event.preventDefault();
      });
    }
  };
}
