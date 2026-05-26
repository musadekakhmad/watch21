import { navigateTo } from '../router.js';
import { getMovieGenres, getTvGenres } from '../api.js';

let movieGenres = [];
let tvGenres = [];

async function loadGenres() {
  if (movieGenres.length === 0) {
    try {
      const movieData = await getMovieGenres();
      movieGenres = movieData.genres || [];
      const tvData = await getTvGenres();
      tvGenres = tvData.genres || [];
    } catch (err) {
      console.warn('Genre fetch error, using empty list', err);
      movieGenres = [];
      tvGenres = [];
    }
  }
}

function buildDropdowns() {
  const movieCategories = [
    { name: 'Popular', slug: 'popular' },
    { name: 'Now Playing', slug: 'now_playing' },
    { name: 'Upcoming', slug: 'upcoming' },
    { name: 'Top Rated', slug: 'top_rated' }
  ];
  const tvCategories = [
    { name: 'Popular', slug: 'popular' },
    { name: 'Airing Today', slug: 'airing_today' },
    { name: 'On Tv', slug: 'on_the_air' },
    { name: 'Top Rated', slug: 'top_rated' }
  ];
  
  const movieCategoryHtml = movieCategories.map(cat => 
    `<div class="dropdown-item" data-nav-link="/movies/${cat.slug}">${cat.name}</div>`
  ).join('');
  
  const tvCategoryHtml = tvCategories.map(cat => 
    `<div class="dropdown-item" data-nav-link="/tv/${cat.slug}">${cat.name}</div>`
  ).join('');
  
  const movieGenreHtml = movieGenres.map(genre => 
    `<div class="dropdown-item" data-nav-link="/genre/movie/${genre.id}/${encodeURIComponent(genre.name)}">${genre.name}</div>`
  ).join('');
  
  const tvGenreHtml = tvGenres.map(genre => 
    `<div class="dropdown-item" data-nav-link="/genre/tv/${genre.id}/${encodeURIComponent(genre.name)}">${genre.name}</div>`
  ).join('');
  
  return `
    <div class="nav-item">
      Movies <i class="fas fa-chevron-down"></i>
      <div class="dropdown-content">
        <div class="dropdown-item has-sub">Category <i class="fas fa-chevron-right"></i>
          <div class="sub-dropdown">${movieCategoryHtml}</div>
        </div>
        <div class="dropdown-item has-sub">Genre <i class="fas fa-chevron-right"></i>
          <div class="sub-dropdown genre-scroll" style="max-height:300px; overflow-y:auto;">${movieGenreHtml || '<div>Loading...</div>'}</div>
        </div>
      </div>
    </div>
    <div class="nav-item">
      TV Show <i class="fas fa-chevron-down"></i>
      <div class="dropdown-content">
        <div class="dropdown-item has-sub">Category <i class="fas fa-chevron-right"></i>
          <div class="sub-dropdown">${tvCategoryHtml}</div>
        </div>
        <div class="dropdown-item has-sub">Genre <i class="fas fa-chevron-right"></i>
          <div class="sub-dropdown genre-scroll" style="max-height:300px; overflow-y:auto;">${tvGenreHtml || '<div>Loading...</div>'}</div>
        </div>
      </div>
    </div>
  `;
}

export default async function Navbar(container) {
  await loadGenres();
  container.innerHTML = `
    <nav class="navbar">
      <div class="logo" data-nav-link="/">WATCH21</div>
      <div class="nav-links">
        <div class="nav-item" data-nav-link="/">Home</div>
        ${buildDropdowns()}
        <div class="search-box">
          <input type="text" id="search-input" placeholder="Search movies, TV shows..." />
          <button id="search-btn"><i class="fas fa-search"></i></button>
        </div>
      </div>
    </nav>
  `;
  
  // Attach event listeners
  container.querySelectorAll('[data-nav-link]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const path = el.getAttribute('data-nav-link');
      if (path) navigateTo(path);
    });
  });
  
  const searchInput = container.querySelector('#search-input');
  const searchBtn = container.querySelector('#search-btn');
  const performSearch = () => {
    const query = searchInput.value.trim();
    if (query) navigateTo(`/search?q=${encodeURIComponent(query)}`);
  };
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
}