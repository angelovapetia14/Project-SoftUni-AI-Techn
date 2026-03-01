import { assertSupabaseClient } from './supabaseClient.js';

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
