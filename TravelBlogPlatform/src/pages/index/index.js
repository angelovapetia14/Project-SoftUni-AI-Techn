import template from './index.html?raw';
import './index.css';

const demoPosts = [
  {
    id: 1,
    title: 'Journey Through Japan',
    image:
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=900&q=80',
    excerpt: 'Experience peaceful temples, mountain landscapes, and vibrant city life across Japan.'
  },
  {
    id: 2,
    title: 'Summer in Bali',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
    excerpt: 'A tropical escape with beaches, jungle waterfalls, and unforgettable sunsets.'
  },
  {
    id: 3,
    title: 'Italian Lake Adventures',
    image:
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80',
    excerpt: 'Explore lakeside towns, mountain roads, and classic Italian food traditions.'
  }
];

function getPostCard(post) {
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="card h-100 shadow-sm">
        <img src="${post.image}" class="card-img-top post-image" alt="${post.title}" />
        <div class="card-body d-flex flex-column">
          <h2 class="h4 card-title">${post.title}</h2>
          <p class="card-text text-muted flex-grow-1">${post.excerpt}</p>
          <a href="/post-details?id=${post.id}" data-link class="btn btn-primary align-self-start">Read More</a>
        </div>
      </article>
    </div>
  `;
}

function renderPosts(posts) {
  const container = document.getElementById('posts-container');

  if (!container) {
    return;
  }

  if (!posts.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light border mb-0">No posts match your search.</div>
      </div>
    `;

    return;
  }

  container.innerHTML = posts.map(getPostCard).join('');
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

export function getIndexPage() {
  return {
    title: 'Home | Travel Blog Platform',
    html: template,
    attach() {
      renderPosts(demoPosts);

      const form = document.getElementById('home-search-form');
      const searchInput = document.getElementById('home-search-input');

      form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = normalizeText(searchInput?.value ?? '');

        if (!query) {
          renderPosts(demoPosts);
          return;
        }

        const filteredPosts = demoPosts.filter((post) => {
          return normalizeText(`${post.title} ${post.excerpt}`).includes(query);
        });

        renderPosts(filteredPosts);
      });
    }
  };
}
