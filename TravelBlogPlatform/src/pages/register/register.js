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

function getRegisterErrorMessage(error) {
  const fallbackMessage = 'Registration failed. Please try again.';
  const errorMessage = error?.message ?? fallbackMessage;
  const normalizedMessage = errorMessage.toLowerCase();

  if (normalizedMessage.includes('password')) {
    if (normalizedMessage.includes('least') || normalizedMessage.includes('character') || normalizedMessage.includes('weak')) {
      return 'Invalid password. Password must be at least 6 characters long.';
    }

    return 'Invalid password. Please enter a stronger password.';
  }

  return errorMessage;
}

function setRegisterLoadingState({ isLoading, submitButton, inputs, defaultButtonText }) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isLoading;
  submitButton.setAttribute('aria-busy', String(isLoading));
  submitButton.innerHTML = isLoading
    ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Registering...'
    : defaultButtonText;

  inputs.forEach((inputElement) => {
    if (!inputElement) {
      return;
    }

    inputElement.disabled = isLoading;
  });
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
      const submitButton = form?.querySelector('button[type="submit"]');
      const defaultButtonText = submitButton?.textContent ?? 'Register';
      const formInputs = [emailInput, passwordInput, confirmPasswordInput];

      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        setInlineError('');

        const email = (emailInput?.value ?? '').trim();
        const password = passwordInput?.value ?? '';
        const confirmPassword = confirmPasswordInput?.value ?? '';

        if (password.length < 6) {
          showRegistrationError('Invalid password. Password must be at least 6 characters long.');
          return;
        }

        if (password !== confirmPassword) {
          showRegistrationError('Incorrect password confirmation. Passwords do not match.');
          return;
        }

        try {
          setRegisterLoadingState({
            isLoading: true,
            submitButton,
            inputs: formInputs,
            defaultButtonText
          });

          await register(email, password);
          showSuccess('Registration successful. Redirecting to login...');
          setTimeout(() => {
            navigateTo('/login');
          }, 800);
        } catch (error) {
          setRegisterLoadingState({
            isLoading: false,
            submitButton,
            inputs: formInputs,
            defaultButtonText
          });

          showRegistrationError(getRegisterErrorMessage(error));
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
