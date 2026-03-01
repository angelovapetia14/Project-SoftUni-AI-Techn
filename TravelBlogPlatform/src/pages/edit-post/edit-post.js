import template from './edit-post.html?raw';
import './edit-post.css';
import { requireAuth } from '../../js/guards.js';

export function getEditPostPage() {
  return {
    title: 'Edit Post | Travel Blog Platform',
    html: template,
    async attach() {
      await requireAuth();
    }
  };
}
