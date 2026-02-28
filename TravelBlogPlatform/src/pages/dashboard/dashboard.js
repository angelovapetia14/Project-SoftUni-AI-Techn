import template from './dashboard.html?raw';
import './dashboard.css';

export function getDashboardPage() {
  return {
    html: template
  };
}
