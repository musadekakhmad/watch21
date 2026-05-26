// src/pages/MediaList.js - dynamic for movies/tv categories and genre
import { getMoviesByCategory, getTvByCategory, getDiscoverByGenre } from '../api.js';
import Card from '../components/Card.js';
import LoadMore from '../components/LoadMore.js';

export default async function MediaList(params) {
  const container = document.createElement('div');
  container.className = 'media-list-page';
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
  let currentFetcher = null;
  
  function determineFetch() {
    let type = '';
    let fetchFn = null;
    let label = '';
    if (params.category) {
      type = params.category;
      if (window.location.pathname.startsWith('/movies')) {
        fetchFn = (page) => getMoviesByCategory(type, page);
        label = `Movies - ${type.replace(/_/g, ' ').toUpperCase()}`;
      } else {
        fetchFn = (page) => getTvByCategory(type, page);
        label = `TV - ${type.replace(/_/g, ' ').toUpperCase()}`;
      }
    } else if (params.mediaType && params.genreId) {
      fetchFn = (page) => getDiscoverByGenre(params.mediaType, params.genreId, page);
      label = `${params.mediaType === 'movie' ? 'Movies' : 'TV Shows'} in ${decodeURIComponent(params.genreName)}`;
    }
    return { fetchFn, label };
  }
  
  async function loadItems(page, append = false) {
    if (isLoading) return;
    isLoading = true;
    if (loadMoreBtn) loadMoreBtn.remove();
    const { fetchFn, label } = determineFetch();
    if (!fetchFn) {
      grid.innerHTML = '<div>Invalid category</div>';
      isLoading = false;
      return;
    }
    if (!append) titleEl.innerText = label;
    try {
      const data = await fetchFn(page);
      totalPages = data.total_pages;
      const items = data.results;
      const cards = items.map(item => Card(item));
      if (append) {
        cards.forEach(c => grid.appendChild(c));
      } else {
        grid.innerHTML = '';
        cards.forEach(c => grid.appendChild(c));
      }
      if (page < totalPages) {
        loadMoreBtn = LoadMore(() => {
          currentPage++;
          loadItems(currentPage, true);
        }, false);
        container.appendChild(loadMoreBtn);
      } else if (loadMoreBtn) loadMoreBtn.remove();
    } catch (e) {
      grid.innerHTML = '<div>Error loading data</div>';
    } finally {
      isLoading = false;
    }
  }
  
  currentPage = 1;
  await loadItems(1);
  return container;
}