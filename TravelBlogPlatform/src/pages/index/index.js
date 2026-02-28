import template from './index.html?raw';
import './index.css';

export function getIndexPage() {
  return {
    html: template
  };
}
