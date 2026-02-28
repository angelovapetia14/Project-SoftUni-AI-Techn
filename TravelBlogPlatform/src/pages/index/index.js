import template from './index.html?raw';
import './index.css';

export function getIndexPage() {
  return {
    title: 'Home | Travel Blog Platform',
    html: template
  };
}
