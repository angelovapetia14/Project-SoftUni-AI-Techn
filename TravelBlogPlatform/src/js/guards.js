import { getCurrentUser } from './auth.js';
import { navigateTo } from '../router.js';

export async function requireAuth() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      navigateTo('/login.html');
      return null;
    }

    return user;
  } catch {
    navigateTo('/login.html');
    return null;
  }
}
