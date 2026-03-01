import { requireAuth } from './guards.js';
import { assertSupabaseClient } from './supabaseClient.js';
import { showError } from './toast.js';

function updateStatElement(id, value) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.textContent = String(value);
}

async function loadDashboardStats() {
  const supabase = assertSupabaseClient();

  const [{ count: postsCount, error: postsError }, { count: commentsCount, error: commentsError }] =
    await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true })
    ]);

  if (postsError || commentsError) {
    throw postsError ?? commentsError;
  }

  updateStatElement('dashboard-posts-count', postsCount ?? 0);
  updateStatElement('dashboard-comments-count', commentsCount ?? 0);
}

export async function initDashboard() {
  const user = await requireAuth();

  if (!user) {
    return;
  }

  try {
    await loadDashboardStats();
  } catch (error) {
    showError(error.message || 'Failed to load dashboard statistics.');
    updateStatElement('dashboard-posts-count', 0);
    updateStatElement('dashboard-comments-count', 0);
  }
}
