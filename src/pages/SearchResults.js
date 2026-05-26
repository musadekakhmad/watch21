import { searchMulti } from '../api.js';
import Card from '../components/Card.js';
import LoadMore from '../components/LoadMore.js';

export default async function SearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  const container = document.createElement('div');
  const titleEl = document.createElement('h2');
  titleEl.style.padding = '1rem 2rem 0';
  container.appendChild(titleEl);
  const grid = document.createElement('div');
  grid.className = 'movie-grid';
  container.appendChild(grid);
  let currentPage = 1;
  let totalPages = 1;
  let isLoading = false;
  let loadMoreBtn = null;

  async function loadSearch(page, append = false) {
    if (!query || isLoading) return;
    isLoading = true;
    if (loadMoreBtn) loadMoreBtn.remove();
    if (!append) titleEl.innerText = `Search results for "${query}"`;
    try {
      const data = await searchMulti(query, page);
      totalPages = data.total_pages;
      const cards = data.results
        .filter(item => item.media_type !== 'person')
        .map(item => Card(item));
      if (append) {
        cards.forEach(c => grid.appendChild(c));
      } else {
        grid.innerHTML = '';
        cards.forEach(c => grid.appendChild(c));
      }
      if (page < totalPages && cards.length) {
        loadMoreBtn = LoadMore(() => {
          currentPage++;
          loadSearch(currentPage, true);
        }, false);
        container.appendChild(loadMoreBtn);
      } else if (loadMoreBtn) loadMoreBtn.remove();
      if (!cards.length && !append) grid.innerHTML = '<div style="padding:2rem;">No results found.</div>';
    } catch (err) {
      grid.innerHTML = '<div>Search error</div>';
    } finally {
      isLoading = false;
    }
  }

  await loadSearch(1);
  return container;
}