import template from './register.html?raw';
import './register.css';
import { register } from '../../js/auth.js';
import { showError, showSuccess } from '../../js/toast.js';
import { navigateTo } from '../../router.js';

function setInlineError(message) {
  const errorContainer = document.getElementById('register-error');

  if (!errorContainer) {
    return;
  }

  if (!message) {
    errorContainer.textContent = '';
    errorContainer.classList.add('d-none');
    return;
  }

  errorContainer.textContent = message;
  errorContainer.classList.remove('d-none');
}

function showRegistrationError(message) {
  setInlineError(message);

  if (typeof showError === 'function') {
    showError(message);
    return;
  }

  console.error(message);
}

export function getRegisterPage() {
  return {
    title: 'Register | Travel Blog Platform',
    html: template,
    attach() {
      const form = document.getElementById('register-form');
      const emailInput = document.getElementById('register-email');
      const passwordInput = document.getElementById('register-password');
      const confirmPasswordInput = document.getElementById('register-confirm-password');

      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        setInlineError('');

        const email = (emailInput?.value ?? '').trim();
        const password = passwordInput?.value ?? '';
        const confirmPassword = confirmPasswordInput?.value ?? '';

        if (password.length < 6) {
          showRegistrationError('Password must be at least 6 characters long.');
          return;
        }

        if (password !== confirmPassword) {
          showRegistrationError('Passwords do not match.');
          return;
        }

        try {
          await register(email, password);
          showSuccess('Registration successful. Redirecting to login...');
          setTimeout(() => {
            navigateTo('/login');
          }, 800);
        } catch (error) {
          showRegistrationError(error.message || 'Registration failed. Please try again.');
        }
      });

      [emailInput, passwordInput, confirmPasswordInput].forEach((inputElement) => {
        inputElement?.addEventListener('input', () => {
          setInlineError('');
        });
      });
    }
  };
}
