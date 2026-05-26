import { navigateTo } from './router.js';

// API Configuration - from .env.local
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

// Global state
let currentPage = 1;
let isLoading = false;
let totalPages = 1;
let currentMediaType = 'all';
let currentCategory = 'trending';
let currentGenreId = null;
let currentGenreName = null;
let currentQuery = null;
let movieGenres = [];
let tvGenres = [];
let currentContainer = null;
let currentGrid = null;

// Get element
const app = document.getElementById('app');

// Fetch genres
async function fetchGenres() {
  if (movieGenres.length === 0) {
    try {
      const movieRes = await fetchTMDB('/genre/movie/list');
      const tvRes = await fetchTMDB('/genre/tv/list');
      movieGenres = movieRes.genres || [];
      tvGenres = tvRes.genres || [];
    } catch (err) {
      console.warn('Failed to fetch genres');
    }
  }
}

// Fetch function
async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Get image URL
function getImageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE}/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
}

// Card component
function createCard(item) {
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average?.toFixed(1) || 'N/A';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${getImageUrl(item.poster_path)}" alt="${title}" loading="lazy">
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div>${year} | ★ ${rating}</div>
    </div>
  `;
  card.onclick = () => navigateTo(`/detail/${type}/${item.id}`);
  return card;
}

// Render Navbar with dropdowns
async function renderNavbar() {
  await fetchGenres();
  
  const movieCategories = [
    { name: 'Popular', slug: 'popular', type: 'movie' },
    { name: 'Now Playing', slug: 'now_playing', type: 'movie' },
    { name: 'Upcoming', slug: 'upcoming', type: 'movie' },
    { name: 'Top Rated', slug: 'top_rated', type: 'movie' }
  ];
  
  const tvCategories = [
    { name: 'Popular', slug: 'popular', type: 'tv' },
    { name: 'Airing Today', slug: 'airing_today', type: 'tv' },
    { name: 'On TV', slug: 'on_the_air', type: 'tv' },
    { name: 'Top Rated', slug: 'top_rated', type: 'tv' }
  ];
  
  const movieGenreHtml = movieGenres.map(g => 
    `<div class="dropdown-item" data-nav-type="genre" data-media="movie" data-genre-id="${g.id}" data-genre-name="${g.name}">${g.name}</div>`
  ).join('');
  
  const tvGenreHtml = tvGenres.map(g => 
    `<div class="dropdown-item" data-nav-type="genre" data-media="tv" data-genre-id="${g.id}" data-genre-name="${g.name}">${g.name}</div>`
  ).join('');
  
  return `
    <div class="navbar">
      <div class="logo" data-nav="about">WATCH21</div>
      <div class="nav-links">
        <div class="nav-item" data-nav="/">Home</div>
        <div class="nav-item dropdown">
          Movies <i class="fas fa-chevron-down"></i>
          <div class="dropdown-content">
            <div class="dropdown-group">
              <div class="dropdown-label category-label">Category</div>
              ${movieCategories.map(cat => `<div class="dropdown-item" data-nav-type="category" data-media="movie" data-category="${cat.slug}">${cat.name}</div>`).join('')}
            </div>
            <div class="dropdown-group">
              <div class="dropdown-label genre-label">Genre</div>
              <div class="genre-scroll">${movieGenreHtml}</div>
            </div>
          </div>
        </div>
        <div class="nav-item dropdown">
          TV Shows <i class="fas fa-chevron-down"></i>
          <div class="dropdown-content">
            <div class="dropdown-group">
              <div class="dropdown-label category-label">Category</div>
              ${tvCategories.map(cat => `<div class="dropdown-item" data-nav-type="category" data-media="tv" data-category="${cat.slug}">${cat.name}</div>`).join('')}
            </div>
            <div class="dropdown-group">
              <div class="dropdown-label genre-label">Genre</div>
              <div class="genre-scroll">${tvGenreHtml}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search Movies / TV Shows...">
        <button id="searchBtn"><i class="fas fa-search"></i></button>
      </div>
    </div>
  `;
}

// Load content based on current filters
async function loadContent(grid, append = false) {
  if (isLoading) return;
  isLoading = true;
  
  try {
    let data;
    let titleText = '';
    
    console.log('Loading with:', { currentQuery, currentGenreId, currentCategory, currentMediaType });
    
    if (currentQuery) {
      data = await fetchTMDB('/search/multi', { query: currentQuery, page: currentPage });
      titleText = `Search results for "${currentQuery}"`;
    } else if (currentGenreId && currentMediaType !== 'all') {
      data = await fetchTMDB(`/discover/${currentMediaType}`, { with_genres: currentGenreId, page: currentPage });
      titleText = `${currentMediaType === 'movie' ? 'Movies' : 'TV Shows'} in ${currentGenreName}`;
    } else if (currentCategory !== 'trending' && currentMediaType !== 'all') {
      data = await fetchTMDB(`/${currentMediaType}/${currentCategory}`, { page: currentPage });
      const categoryName = currentCategory.replace(/_/g, ' ').toUpperCase();
      titleText = `${currentMediaType === 'movie' ? 'Movies' : 'TV Shows'} - ${categoryName}`;
    } else {
      data = await fetchTMDB('/trending/all/day', { page: currentPage });
      titleText = 'Trending Today';
    }
    
    totalPages = data.total_pages;
    const cards = data.results.filter(item => item.media_type !== 'person').map(item => createCard(item));
    
    // Find or create title element with proper padding
    let titleEl = grid.parentElement.querySelector('.page-title');
    if (!titleEl) {
      titleEl = document.createElement('h2');
      titleEl.className = 'page-title';
      grid.parentElement.insertBefore(titleEl, grid);
    }
    titleEl.textContent = titleText;
    // Add proper spacing - padding top 1.5rem (approx 1cm), margin top 0
    titleEl.style.paddingTop = '1.5rem';
    titleEl.style.paddingBottom = '0.5rem';
    titleEl.style.paddingLeft = '2rem';
    titleEl.style.paddingRight = '2rem';
    titleEl.style.marginTop = '0';
    titleEl.style.marginBottom = '0';
    
    if (!append) {
      grid.innerHTML = '';
    }
    
    cards.forEach(card => grid.appendChild(card));
    
    // Remove existing load more button
    const existingBtn = grid.parentElement.querySelector('.load-more');
    if (existingBtn) existingBtn.remove();
    
    if (currentPage < totalPages && cards.length > 0) {
      const loadMoreDiv = document.createElement('div');
      loadMoreDiv.className = 'load-more';
      const btn = document.createElement('button');
      btn.textContent = 'Load More';
      btn.onclick = async () => { 
        currentPage++; 
        await loadContent(grid, true);
      };
      loadMoreDiv.appendChild(btn);
      grid.parentElement.appendChild(loadMoreDiv);
    }
    
    if (cards.length === 0 && !append) {
      grid.innerHTML = '<div style="padding:2rem; text-align:center;">No results found</div>';
    }
  } catch (err) {
    console.error(err);
    if (!append) grid.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading data. Please try again.</div>';
  } finally {
    isLoading = false;
  }
}

// Home Page
async function HomePage() {
  const container = document.createElement('div');
  const grid = document.createElement('div');
  grid.className = 'movie-grid';
  container.appendChild(grid);
  
  currentPage = 1;
  await loadContent(grid);
  return container;
}

// About Page
async function AboutPage() {
  const container = document.createElement('div');
  container.className = 'about-container';
  container.innerHTML = `
    <div class="about-content">
      <h1>About Watch21 - Free Streaming Platform</h1>
      <p>Watch21 is your premier destination for streaming movies and TV shows online. Founded in 2024, we've quickly become one of the most trusted platforms for entertainment enthusiasts worldwide.</p>
      
      <h2>Watch Movies Online Free</h2>
      <p>Watch21 offers thousands of movies and TV shows completely free. No subscription, no credit card required. Our extensive library includes Hollywood blockbusters, indie films, classic cinema, and popular TV series from around the world.</p>
      
      <h2>How to Stream on Watch21</h2>
      <p>Using Watch21 is simple. Browse our collection, click on any movie or show, and choose your preferred streaming source. We provide multiple streaming options for reliable playback.</p>
      
      <h2>Best Free Movie Streaming Site</h2>
      <p>Watch21 stands out from other streaming sites because we prioritize user experience. Our interface is clean, fast, and mobile-friendly. We update our content daily with the latest releases and trending titles from TMDB.</p>
      
      <h2>Popular Categories</h2>
      <p>Browse movies by genre including Action, Comedy, Drama, Horror, Romance, Sci-Fi, and Thriller. Our TV show collection includes popular series, documentaries, reality shows, and anime.</p>
      
      <h2>Why Choose Watch21?</h2>
      <ul>
        <li>100% Free - No hidden fees or subscriptions</li>
        <li>No Account Required - Start watching instantly</li>
        <li>HD Quality Streaming - Crystal clear video</li>
        <li>Daily Updates - New content added every day</li>
        <li>Mobile Friendly - Watch on any device</li>
        <li>Fast Streaming - Multiple server options</li>
        <li>Privacy Focused - No tracking or data collection</li>
      </ul>
      
      <h2>Legal Information</h2>
      <p>Watch21 is a streaming aggregator. We do not host any video files on our servers. All content is sourced from external third-party streaming platforms. We respect copyright laws and intellectual property rights.</p>
      
      <h2>Contact Us</h2>
      <p>Have questions, suggestions, or copyright concerns? Contact our team at support@watch21.com. We respond to all inquiries within 24 hours.</p>
      
      <p><strong>Watch21 - Your Gateway to Unlimited Entertainment</strong></p>
      <p><em>Last updated: May 2026</em></p>
    </div>
  `;
  return container;
}

// Detail Page
async function DetailPage(type, id) {
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = '<div style="padding:2rem; text-align:center;">Loading...</div>';
  
  try {
    const [details, credits, videos] = await Promise.all([
      fetchTMDB(`/${type}/${id}`),
      fetchTMDB(`/${type}/${id}/credits`),
      fetchTMDB(`/${type}/${id}/videos`)
    ]);
    
    const director = credits.crew?.find(m => m.job === 'Director')?.name || 'N/A';
    const writer = credits.crew?.find(m => m.job === 'Writer')?.name || 'N/A';
    const cast = credits.cast?.slice(0, 10).map(c => c.name).join(', ') || 'N/A';
    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || '').slice(0, 4);
    const rating = details.vote_average?.toFixed(1) || 'N/A';
    const voteCount = details.vote_count || 0;
    const runtime = type === 'movie' 
      ? (details.runtime ? `${details.runtime} min` : 'N/A')
      : (details.number_of_seasons ? `${details.number_of_seasons} season${details.number_of_seasons > 1 ? 's' : ''}` : 'N/A');
    const releaseDate = details.release_date || details.first_air_date || 'Unknown';
    const genres = details.genres?.map(g => g.name).join(', ') || 'N/A';
    const overview = details.overview || 'No description available.';
    
    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back</button>
      </div>
      <div style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: space-between;">
        <img src="${getImageUrl(details.poster_path, 'w342')}" alt="${title}" style="width: 280px; border-radius: 12px;">
        <div style="flex: 1; min-width: 250px;">
          <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${title} <span style="font-size: 1.2rem; color: #aaa;">(${year})</span></h1>
          <div style="display: flex; gap: 1rem; margin: 1rem 0; color: #ccc; flex-wrap: wrap;">
            <span>⭐ ${rating}/10 (${voteCount} votes)</span>
            <span>⏱️ ${runtime}</span>
            <span>📅 ${releaseDate}</span>
          </div>
          <div style="margin: 1rem 0;"><strong>Genres:</strong> ${genres}</div>
          <div style="margin: 1rem 0;"><strong>Plot Summary:</strong> ${overview}</div>
          <div style="margin: 1rem 0;"><strong>Director:</strong> ${director}</div>
          ${writer !== 'N/A' ? `<div style="margin: 1rem 0;"><strong>Writer:</strong> ${writer}</div>` : ''}
          <div style="margin: 1rem 0;"><strong>Cast:</strong> ${cast}</div>
          <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
            <button class="trailer-btn" data-type="${type}" data-id="${id}" style="background: #e50914; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">▶ Watch Trailer</button>
            <button class="stream-btn" data-type="${type}" data-id="${id}" style="background: #333; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">🎬 Watch Now</button>
          </div>
        </div>
      </div>
    `;
    
    const backBtn = container.querySelector('.back-btn');
    const trailerBtn = container.querySelector('.trailer-btn');
    const streamBtn = container.querySelector('.stream-btn');
    
    if (backBtn) backBtn.onclick = () => window.history.back();
    if (trailerBtn) trailerBtn.onclick = () => navigateTo(`/trailer/${type}/${id}`);
    if (streamBtn) streamBtn.onclick = () => navigateTo(`/stream/${type}/${id}`);
    
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading details. Please try again.</div>';
  }
  return container;
}

// Trailer Page
async function TrailerPage(type, id) {
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = '<div style="padding:2rem; text-align:center;">Loading trailer...</div>';
  
  try {
    const videos = await fetchTMDB(`/${type}/${id}/videos`);
    const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results?.find(v => v.site === 'YouTube') || videos.results?.[0];
    
    if (trailer?.key) {
      container.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <h2 style="margin-bottom: 1rem;">Official Trailer</h2>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden;">
          <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>
        </div>
      `;
      const backBtn = container.querySelector('.back-btn');
      if (backBtn) backBtn.onclick = () => window.history.back();
    } else {
      container.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <div style="padding:2rem; text-align:center;">No trailer available for this title</div>
      `;
      const backBtn = container.querySelector('.back-btn');
      if (backBtn) backBtn.onclick = () => window.history.back();
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading trailer</div>';
  }
  return container;
}

// Stream Page
async function StreamPage(type, id) {
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
    </div>
    <h2 style="margin-bottom: 2rem; text-align: center;">Streaming Options</h2>
    <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
      <button class="stream-source-btn" data-url="https://vidsrc.me/embed/${type}/${id}" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; border: none; cursor: pointer; font-weight: bold;">🎬 Stream 1 </button>
      <button class="stream-source-btn" data-url="https://vidsrc.to/embed/${type}/${id}" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; border: none; cursor: pointer; font-weight: bold;">🎬 Stream 2 </button>
    </div>
    <div id="streamPlayer" style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; display: none;">
      <iframe id="streamIframe" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="fullscreen" allowfullscreen></iframe>
    </div>
    <p style="text-align: center; margin-top: 2rem; color: #888;">⚠️ Watch Now: Click Stream 1 or Stream 2 ⚠️</p>
  `;
  
  const backBtn = container.querySelector('.back-btn');
  if (backBtn) backBtn.onclick = () => window.history.back();
  
  const streamBtns = container.querySelectorAll('.stream-source-btn');
  const streamPlayer = container.querySelector('#streamPlayer');
  const streamIframe = container.querySelector('#streamIframe');
  
  streamBtns.forEach(btn => {
    btn.onclick = () => {
      const url = btn.getAttribute('data-url');
      streamPlayer.style.display = 'block';
      streamIframe.src = url;
      streamBtns.forEach(b => b.style.opacity = '0.7');
      btn.style.opacity = '1';
    };
  });
  
  return container;
}

// Footer Component
function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-section">
        <h3>Watch21</h3>
        <p>Your premier destination for streaming movies and TV shows online. Free, fast, and reliable.</p>
      </div>
      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="#" data-nav="/">Home</a></li>
          <li><a href="#" data-nav="about">About Us</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>Categories</h4>
        <ul>
          <li><a href="#" data-nav-type="category" data-media="movie" data-category="popular">Popular Movies</a></li>
          <li><a href="#" data-nav-type="category" data-media="tv" data-category="popular">Popular TV Shows</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>Follow Us</h4>
        <div class="social-links">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
        </div>
        <p>Data powered by<br><strong>TMDB API</strong></p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Watch21. All rights reserved.</p>
    </div>
  `;
  return footer;
}

// Function to attach all event listeners
function attachEventListeners() {
  // Navbar home and logo
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.getAttribute('data-nav');
      if (target === 'about') {
        navigateTo('/about');
      } else {
        currentMediaType = 'all';
        currentCategory = 'trending';
        currentGenreId = null;
        currentGenreName = null;
        currentQuery = null;
        currentPage = 1;
        navigateTo('/');
      }
    });
  });
  
  // Category dropdown items
  document.querySelectorAll('[data-nav-type="category"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const media = el.getAttribute('data-media');
      const category = el.getAttribute('data-category');
      console.log('Category clicked:', media, category);
      currentMediaType = media;
      currentCategory = category;
      currentGenreId = null;
      currentGenreName = null;
      currentQuery = null;
      currentPage = 1;
      navigateTo('/');
    });
  });
  
  // Genre dropdown items
  document.querySelectorAll('[data-nav-type="genre"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const media = el.getAttribute('data-media');
      const genreId = el.getAttribute('data-genre-id');
      const genreName = el.getAttribute('data-genre-name');
      console.log('Genre clicked:', media, genreId, genreName);
      currentMediaType = media;
      currentCategory = 'genre';
      currentGenreId = genreId;
      currentGenreName = genreName;
      currentQuery = null;
      currentPage = 1;
      navigateTo('/');
    });
  });
  
  // Search
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        console.log('Search clicked:', query);
        currentQuery = query;
        currentMediaType = 'all';
        currentCategory = 'trending';
        currentGenreId = null;
        currentGenreName = null;
        currentPage = 1;
        navigateTo('/');
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
          console.log('Search enter:', query);
          currentQuery = query;
          currentMediaType = 'all';
          currentCategory = 'trending';
          currentGenreId = null;
          currentGenreName = null;
          currentPage = 1;
          navigateTo('/');
        }
      }
    });
  }
}

// Router
window.navigateTo = async function(path) {
  window.history.pushState({}, '', path);
  await route();
};

async function route() {
  const path = window.location.pathname;
  const appElement = document.getElementById('app');
  
  // Render navbar
  appElement.innerHTML = await renderNavbar();
  
  let content = null;
  
  if (path === '/' || path === '') {
    content = await HomePage();
  } else if (path === '/about') {
    content = await AboutPage();
  } else if (path.startsWith('/detail/')) {
    const parts = path.split('/');
    content = await DetailPage(parts[2], parts[3]);
  } else if (path.startsWith('/trailer/')) {
    const parts = path.split('/');
    content = await TrailerPage(parts[2], parts[3]);
  } else if (path.startsWith('/stream/')) {
    const parts = path.split('/');
    content = await StreamPage(parts[2], parts[3]);
  } else {
    content = await HomePage();
  }
  
  appElement.appendChild(content);
  
  // Add footer
  const footer = renderFooter();
  appElement.appendChild(footer);
  
  // Attach all event listeners
  attachEventListeners();
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  route();
  window.addEventListener('popstate', route);
});