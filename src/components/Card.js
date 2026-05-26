// src/components/Card.js - reusable media card
import { getImageUrl } from '../api.js';
import { navigateTo } from '../router.js';

export default function Card(item) {
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const id = item.id;
  const title = item.title || item.name;
  const posterPath = item.poster_path;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img class="card-img" src="${getImageUrl(posterPath, 'w342')}" alt="${title}" loading="lazy">
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div class="card-meta"><span>${year || 'TBA'}</span> <span class="rating"><i class="fas fa-star"></i> ${rating}</span></div>
    </div>
  `;
  card.addEventListener('click', () => navigateTo(`/detail/${mediaType}/${id}`));
  return card;
}