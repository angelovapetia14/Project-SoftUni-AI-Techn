import template from './post-details.html?raw';
import './post-details.css';
import { initPostDetailsPage } from '../../js/postDetailsPage.js';

export function getPostDetailsPage() {
  return {
    title: 'Post Details | Travel Blog Platform',
    html: template,
    async attach() {
      await initPostDetailsPage();
    }
  };
}
