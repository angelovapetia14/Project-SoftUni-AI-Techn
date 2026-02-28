import template from './dashboard.html?raw';
import './dashboard.css';

export function getDashboardPage() {
  return {
    title: 'Dashboard | Travel Blog Platform',
    html: template
  };
}
