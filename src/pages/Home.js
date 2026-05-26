// src/pages/Home.js - trending daily with load more
import { getTrending } from '../api.js';
import Card from '../components/Card.js';
import LoadMore from '../components/LoadMore.js';

let currentPage = 1;
let isLoading = false;
let totalPages = 1;

export default async function Home() {
  const container = document.createElement('div');
  container.className = 'home-page';
  
  const grid = document.createElement('div');
  grid.className = 'movie-grid';
  container.appendChild(grid);
  
  let loadMoreBtn = null;
  
  async function loadItems(page, append = false) {
    if (isLoading) return;
    isLoading = true;
    if (loadMoreBtn) loadMoreBtn.remove();
    try {
      const data = await getTrending(page);
      totalPages = data.total_pages;
      const items = data.results;
      const cards = items.map(item => Card(item));
      if (append) {
        cards.forEach(card => grid.appendChild(card));
      } else {
        grid.innerHTML = '';
        cards.forEach(card => grid.appendChild(card));
      }
      if (page < totalPages) {
        loadMoreBtn = LoadMore(() => {
          currentPage++;
          loadItems(currentPage, true);
        }, false);
        container.appendChild(loadMoreBtn);
      } else if (loadMoreBtn) loadMoreBtn.remove();
    } catch (err) {
      grid.innerHTML = '<div style="padding:2rem; text-align:center">Failed to load trending. Try again.</div>';
    } finally {
      isLoading = false;
    }
  }
  
  currentPage = 1;
  await loadItems(1, false);
  return container;
}