import template from './login.html?raw';
import './login.css';
import { login } from '../../js/auth.js';
import { showError } from '../../js/toast.js';
import { navigateTo } from '../../router.js';

function setInlineError(message) {
  const errorContainer = document.getElementById('login-error');

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

function getLoginErrorMessage(error) {
  const fallbackMessage = 'Login failed. Please try again.';
  const errorMessage = error?.message ?? fallbackMessage;
  const normalizedMessage = errorMessage.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Wrong email or password.';
  }

  if (normalizedMessage.includes('password')) {
    return 'Wrong password. Please try again.';
  }

  return errorMessage;
}

function showLoginError(message) {
  setInlineError(message);
  showError(message);
}

function setLoginLoadingState({ isLoading, submitButton, inputs, defaultButtonText }) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isLoading;
  submitButton.setAttribute('aria-busy', String(isLoading));
  submitButton.innerHTML = isLoading
    ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...'
    : defaultButtonText;

  inputs.forEach((inputElement) => {
    if (!inputElement) {
      return;
    }

    inputElement.disabled = isLoading;
  });
}

export function getLoginPage() {
  return {
    title: 'Login | Travel Blog Platform',
    html: template,
    attach() {
      const form = document.getElementById('login-form');
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const submitButton = form?.querySelector('button[type="submit"]');
      const defaultButtonText = submitButton?.textContent ?? 'Login';
      const formInputs = [emailInput, passwordInput];

      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        setInlineError('');

        setLoginLoadingState({
          isLoading: true,
          submitButton,
          inputs: formInputs,
          defaultButtonText
        });

        const email = (emailInput?.value ?? '').trim().toLowerCase();

        try {
          const { role } = await login(email, passwordInput?.value ?? '');
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('role', role ?? 'user');
          navigateTo('/dashboard.html');
        } catch (error) {
          setLoginLoadingState({
            isLoading: false,
            submitButton,
            inputs: formInputs,
            defaultButtonText
          });

          showLoginError(getLoginErrorMessage(error));
        }
      });

      [emailInput, passwordInput].forEach((inputElement) => {
        inputElement?.addEventListener('input', () => {
          setInlineError('');
        });
      });
    }
  };
}
