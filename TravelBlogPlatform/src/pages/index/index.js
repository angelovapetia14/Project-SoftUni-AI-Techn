import template from './index.html?raw';
import './index.css';
import { initHomePage } from '../../js/homePage.js';

export function getIndexPage() {
  return {
    title: 'Home | Travel Blog Platform',
    html: template,
    async attach() {
      await initHomePage();
    }
  };
}
