import { assertSupabaseClient } from './supabaseClient.js';
import { showError } from './toast.js';

export async function createProfile(user) {
  const supabase = assertSupabaseClient();
  const username = user.email?.split('@')[0] ?? 'user';

  const profilePayload = {
    id: user.id,
    email: user.email,
    username,
    role: 'user'
  };

  const { error } = await supabase.from('profiles').insert(profilePayload);

  if (error) {
    throw error;
  }

  return profilePayload;
}

export async function register(email, password) {
  const supabase = assertSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new Error('Registration failed. Please try again.');
  }

  await createProfile(user);

  return user;
}

export async function login(email, password) {
  const supabase = assertSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new Error('Login failed. Please try again.');
  }

  let role = 'user';
  try {
    role = await getProfileRole(user.id);
  } catch {
  }

  return { user, role };
}

export async function getSession() {
  const supabase = assertSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const supabase = assertSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function getProfileRole(userId) {
  const supabase = assertSupabaseClient();

  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role ?? 'user';
}

export async function logout() {
  const supabase = assertSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    showError(error.message || 'Logout failed. Please try again.');
    throw error;
  }

  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('role');

  window.history.pushState({}, '', '/index.html');
  window.dispatchEvent(new Event('app:navigate'));
}
