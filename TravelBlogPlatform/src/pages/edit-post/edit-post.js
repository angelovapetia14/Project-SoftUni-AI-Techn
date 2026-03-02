import template from './edit-post.html?raw';
import './edit-post.css';
import { requireAuth } from '../../js/guards.js';
import { initEditPostPage } from '../../js/editPostPage.js';

export function getEditPostPage() {
  return {
    title: 'Edit Post | Travel Blog Platform',
    html: template,
    async attach() {
      const user = await requireAuth();

      if (!user) {
        return;
      }

      await initEditPostPage();
    }
  };
}
