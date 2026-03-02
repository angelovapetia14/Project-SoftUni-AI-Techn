import template from './admin.html?raw';
import './admin.css';
import { initAdminDashboard } from '../../js/admin.js';

export function getAdminPage() {
  return {
    title: 'Admin Dashboard | Travel Blog Platform',
    html: template,
    async attach() {
      await initAdminDashboard();
    }
  };
}
