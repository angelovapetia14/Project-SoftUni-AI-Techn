import { getCurrentUser, getProfileRole } from './auth.js';
import { navigateTo } from '../router.js';
import { showError } from './toast.js';

export async function requireAuth() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      showError('Please login to continue.');
      navigateTo('/login.html');
      return null;
    }

    return user;
  } catch (error) {
    showError(error.message || 'Authentication check failed.');
    navigateTo('/login.html');
    return null;
  }
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (!user) {
    return null;
  }

  try {
    const role = await getProfileRole(user.id);

    if (role !== 'admin') {
      showError('Access denied. Admins only.');
      navigateTo('/index.html');
      return null;
    }

    return user;
  } catch (error) {
    showError(error.message || 'Permission check failed.');
    navigateTo('/index.html');
    return null;
  }
}
