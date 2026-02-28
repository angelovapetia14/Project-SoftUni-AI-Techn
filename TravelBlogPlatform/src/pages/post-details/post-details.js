import template from './post-details.html?raw';
import './post-details.css';

const postsById = {
  1: {
    id: 1,
    title: 'Journey Through Japan',
    destination: 'Japan',
    image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1600&q=80',
    description:
      'From quiet temples in Kyoto to the vibrant streets of Tokyo, Japan offers a unique mix of tradition and innovation. This journey includes scenic train rides, mountain villages, and unforgettable local food experiences. You can spend mornings in peaceful gardens, afternoons exploring historic districts, and evenings enjoying city lights and street culture.'
  },
  2: {
    id: 2,
    title: 'Summer in Bali',
    destination: 'Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80',
    description:
      'Bali combines tropical beaches, jungle waterfalls, and rich cultural traditions. This post covers popular coastal areas, hidden inland spots, and practical tips for planning your stay. Whether you prefer surfing, hiking, or simply relaxing by the ocean, Bali delivers diverse experiences for every travel style.'
  },
  3: {
    id: 3,
    title: 'Italian Lake Adventures',
    destination: 'Italy',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=80',
    description:
      'Northern Italy’s lakes offer beautiful landscapes, charming towns, and incredible cuisine. This guide explores routes around Lake Como and Lake Garda, including viewpoints, ferry trips, and local food recommendations. It is a perfect destination for travelers who want a balanced trip of relaxation, nature, and culture.'
  }
};

function getPostFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const id = Number(searchParams.get('id'));

  return postsById[id] ?? postsById[1];
}

function renderPostDetails(post) {
  const heroElement = document.getElementById('post-details-hero');
  const contentElement = document.getElementById('post-details-content');

  if (!heroElement || !contentElement) {
    return;
  }

  heroElement.style.backgroundImage = `linear-gradient(rgba(10, 30, 58, 0.2), rgba(10, 30, 58, 0.2)), url('${post.image}')`;

  contentElement.innerHTML = `
    <h1 class="display-6 fw-semibold mb-3">${post.title}</h1>
    <p class="post-destination mb-4">Destination: ${post.destination}</p>
    <p class="post-description text-muted mb-4">${post.description}</p>

    <div class="d-flex flex-wrap gap-2">
      <a href="/edit-post?id=${post.id}" data-link class="btn btn-primary">Edit</a>
      <button type="button" class="btn btn-outline-danger" id="delete-post-btn">Delete</button>
      <a href="/" data-link class="btn btn-outline-secondary">Back to Home</a>
    </div>
  `;

  const deleteButton = document.getElementById('delete-post-btn');
  deleteButton?.addEventListener('click', () => {
    window.alert('Delete action is UI-only in this stage.');
  });
}

export function getPostDetailsPage() {
  return {
    title: 'Post Details | Travel Blog Platform',
    html: template,
    attach() {
      renderPostDetails(getPostFromQuery());
    }
  };
}
