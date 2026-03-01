import { requireAuth } from './guards.js';

export async function initDashboard() {
  await requireAuth();
}
