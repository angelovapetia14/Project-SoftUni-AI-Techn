import template from './dashboard.html?raw';
import './dashboard.css';
import { initDashboard } from '../../js/dashboard.js';

export function getDashboardPage() {
  return {
    title: 'Dashboard | Travel Blog Platform',
    html: template,
    async attach() {
      await initDashboard();
    }
  };
}
