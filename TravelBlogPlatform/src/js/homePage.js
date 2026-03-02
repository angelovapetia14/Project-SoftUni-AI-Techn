import { getAllPosts } from './posts.js';
import { showError } from './toast.js';

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x450?text=No+Image';

function shortenText(text, maxLength = 100) {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function getPostCard(post) {
  const imageUrl = post.image_url || PLACEHOLDER_IMAGE;

  return `
    <div class="col-12 col-md-4">
      <article class="card h-100 shadow-sm">
        <img src="${imageUrl}" class="card-img-top post-image" alt="${post.title}" />
        <div class="card-body d-flex flex-column">
          <h2 class="h5 card-title">${post.title}</h2>
          <p class="text-muted mb-2">${post.destination || 'Unknown destination'}</p>
          <p class="card-text text-muted flex-grow-1">${shortenText(post.description, 100)}</p>
          <a href="/post-details.html?id=${post.id}" data-link class="btn btn-primary align-self-start">Read More</a>
        </div>
      </article>
    </div>
  `;
}

function renderEmpty(container, message = 'No posts yet.') {
  container.innerHTML = `
    <div class="col-12">
      <p class="mb-0">${message}</p>
    </div>
  `;
}

function renderPosts(container, posts) {
  if (!posts.length) {
    renderEmpty(container);
    return;
  }

  container.innerHTML = posts.map(getPostCard).join('');
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

export async function initHomePage() {
  const container = document.getElementById('posts-container');
  const form = document.getElementById('home-search-form');
  const searchInput = document.getElementById('home-search-input');

  if (!container) {
    return;
  }

  try {
    const posts = await getAllPosts();
    renderPosts(container, posts);

    const runFilter = () => {
      const query = normalizeText(searchInput?.value);

      if (!query) {
        renderPosts(container, posts);
        return;
      }

      const filteredPosts = posts.filter((post) => {
        const title = normalizeText(post.title);
        const destination = normalizeText(post.destination);
        return title.includes(query) || destination.includes(query);
      });

      if (!filteredPosts.length) {
        renderEmpty(container, 'No posts found.');
        return;
      }

      renderPosts(container, filteredPosts);
    };

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      runFilter();
    });

    searchInput?.addEventListener('input', runFilter);
  } catch (error) {
    if (!error?.toastShown) {
      showError(error?.message || 'Failed to load posts.');
    }

    renderEmpty(container);
  }
}
