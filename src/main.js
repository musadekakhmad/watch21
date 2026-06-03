import { navigateTo } from './router.js';

// ==================== API CONFIGURATION ====================
const BASE_URL = '/api';
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

// ==================== SMART LINKS ====================
const SMART_LINK_WATCH = 'https://fundingfashioned.com/vhbf8p8z?key=3f0a60cacfeef5cbf4cea11782912d42';

// ==================== POPUNDER TRACKING (Global - 1x per session, tanpa tabrakan) ====================
function initPopunder() {
  if (sessionStorage.getItem('popunder_triggered') === 'true') return;

  // Popunder akan terpicu pada klik pertama user di mana saja di website
  window.addEventListener('click', function injectPopunder() {
    const popunderScript = document.createElement('script');
    popunderScript.src = "https://fundingfashioned.com/37/1f/da/371fdaf18eab7b324f31bd160fa2eeb6.js";
    document.body.appendChild(popunderScript);
    
    sessionStorage.setItem('popunder_triggered', 'true');
    console.log('Popunder triggered on first click');
    
    // Hapus event listener agar tidak inject berulang kali
    window.removeEventListener('click', injectPopunder);
  }, { once: true });
}

// ==================== SMART LINK TRACKING PER JUDUL (1x per title) ====================
const watchedTitles = new Set();

function getSmartLinkForTitle(titleId, titleName) {
  const key = `${titleId}`;
  if (watchedTitles.has(key)) {
    return SMART_LINK_WATCH;
  }
  watchedTitles.add(key);
  return SMART_LINK_WATCH;
}

// ==================== GLOBAL STATE ====================
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

const app = document.getElementById('app');

// ==================== API FUNCTIONS ====================
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

async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(
    `${BASE_URL}${endpoint}`,
    window.location.origin
  );

  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.append(k, v);
  });

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

function getImageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE}/${size}${path}` : 'https://placehold.co/500x750/1a1a1a/e50914?text=No+Poster';
}

// ==================== SKELETON LOADER ====================
function createSkeletonCard() {
  const skeleton = document.createElement('div');
  skeleton.className = 'card skeleton-card';
  skeleton.innerHTML = `
    <div style="width:100%; aspect-ratio:2/3; background: #2a2a2a; border-radius: 8px;"></div>
    <div style="padding:0.5rem;">
      <div style="height:12px; background:#2a2a2a; margin-bottom:0.5rem; border-radius:4px;"></div>
      <div style="height:10px; background:#2a2a2a; width:60%; border-radius:4px;"></div>
    </div>
  `;
  return skeleton;
}

function showSkeletons(grid, count = 18) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    grid.appendChild(createSkeletonCard());
  }
}

// ==================== COMPONENTS ====================
function createCard(item) {
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average?.toFixed(1) || 'N/A';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${getImageUrl(item.poster_path)}" alt="Watch ${title} ${year} free online" loading="lazy">
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div>${year} | ★ ${rating}</div>
    </div>
  `;
  card.onclick = () =>
  navigateTo(
    `/${type}/${slugify(item.title || item.name)}/${item.id}`
  );
  return card;
}

// ==================== DYNAMIC META DESCRIPTION ====================
function updateMetaDescription(title, year, overview, rating, director, cast) {
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  
  const shortOverview = overview.length > 120 ? overview.substring(0, 120) + '...' : overview;
  metaDesc.setAttribute('content', `Watch ${title} (${year}) free online. ${shortOverview} Rating: ${rating}/10. Director: ${director}. Cast: ${cast.substring(0, 100)}. Stream now on WATCH21!`);
  
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', `Watch ${title} (${year}) free online. ${shortOverview}`);
  
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', `${title} (${year}) - WATCH21`);
}

// ==================== BACK TO TOP BUTTON ====================
function addBackToTopButton() {
  if (document.getElementById('backToTop')) return;
  
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #e50914;
    color: white;
    border: none;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    cursor: pointer;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 1.2rem;
  `;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.style.opacity = '1';
    } else {
      btn.style.opacity = '0';
    }
  });
  
  btn.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  document.body.appendChild(btn);
}

// ==================== NAVBAR ====================
async function renderNavbar() {
  await fetchGenres();
  
  const movieCategories = [
    { name: 'Popular', slug: 'popular' },
    { name: 'Now Playing', slug: 'now_playing' },
    { name: 'Upcoming', slug: 'upcoming' },
    { name: 'Top Rated', slug: 'top_rated' }
  ];
  
  const tvCategories = [
    { name: 'Popular', slug: 'popular' },
    { name: 'Airing Today', slug: 'airing_today' },
    { name: 'On TV', slug: 'on_the_air' },
    { name: 'Top Rated', slug: 'top_rated' }
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
              <div class="dropdown-label">Category</div>
              ${movieCategories.map(cat => `<div class="dropdown-item" data-nav-type="category" data-media="movie" data-category="${cat.slug}">${cat.name}</div>`).join('')}
            </div>
            <div class="dropdown-group">
              <div class="dropdown-label">Genre</div>
              <div class="genre-scroll">${movieGenreHtml}</div>
            </div>
          </div>
        </div>
        <div class="nav-item dropdown">
          TV Shows <i class="fas fa-chevron-down"></i>
          <div class="dropdown-content">
            <div class="dropdown-group">
              <div class="dropdown-label">Category</div>
              ${tvCategories.map(cat => `<div class="dropdown-item" data-nav-type="category" data-media="tv" data-category="${cat.slug}">${cat.name}</div>`).join('')}
            </div>
            <div class="dropdown-group">
              <div class="dropdown-label">Genre</div>
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

// ==================== LOAD CONTENT (Home Page) ====================
async function loadContent(grid, append = false) {
  if (isLoading) return;
  isLoading = true;
  
  if (!append) {
    showSkeletons(grid);
  }
  
  try {
    let data;
    let titleText = '';
    
    if (currentQuery) {
      data = await fetchTMDB('/search/multi', { query: currentQuery, page: currentPage });
      titleText = `Search results for "${currentQuery}"`;
    } else if (currentGenreId && currentMediaType !== 'all') {
      data = await fetchTMDB(`/discover/${currentMediaType}`, { with_genres: currentGenreId, page: currentPage });
      titleText = `${currentMediaType === 'movie' ? 'Movies' : 'TV Shows'} in ${currentGenreName}`;
    } else if (currentCategory !== 'trending' && currentMediaType !== 'all') {
      data = await fetchTMDB(`/${currentMediaType}/${currentCategory}`, { page: currentPage });
      titleText = `${currentMediaType === 'movie' ? 'Movies' : 'TV Shows'} - ${currentCategory.replace(/_/g, ' ').toUpperCase()}`;
    } else {
      data = await fetchTMDB('/trending/all/day', { page: currentPage });
      titleText = 'Trending Today';
    }
    
    const cards = data.results.filter(item => item.media_type !== 'person').map(item => createCard(item));
    
    let titleEl = grid.parentElement.querySelector('.page-title');
    if (!titleEl) {
      titleEl = document.createElement('h2');
      titleEl.className = 'page-title';
      grid.parentElement.insertBefore(titleEl, grid);
    }
    titleEl.textContent = titleText;
    titleEl.style.textAlign = 'center';
    
    if (!append) grid.innerHTML = '';
    
    cards.forEach(card => grid.appendChild(card));
    
    const existingBtn = grid.parentElement.querySelector('.load-more');
    if (existingBtn) existingBtn.remove();
    
    if (currentPage < data.total_pages && cards.length > 0) {
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
    if (!append) grid.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading data. Please check your connection.</div>';
  } finally {
    isLoading = false;
  }
}

// ==================== HOME PAGE ====================
async function HomePage() {
  const container = document.createElement('div');
  const grid = document.createElement('div');
  grid.className = 'movie-grid';
  container.appendChild(grid);
  
  currentPage = 1;
  await loadContent(grid);
  
  return container;
}

// ==================== ABOUT PAGE ====================
async function AboutPage() {
  addBackToTopButton();
  
  const container = document.createElement('div');
  container.style.maxWidth = '1000px';
  container.style.margin = '2rem auto';
  container.style.padding = '2rem';
  container.style.background = '#0f0f0f';
  container.style.borderRadius = '16px';
  container.style.lineHeight = '1.6';
  container.style.textAlign = 'justify';
  
  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="color: #e50914; font-size: 2.5rem;">About WATCH21</h1>
      <p style="color: #aaa;">Your Ultimate Destination for Free Online Streaming</p>
    </div>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Welcome to WATCH21</h2>
    <p>WATCH21 is a revolutionary free streaming platform that brings the magic of cinema directly to your screen. Founded in 2024, we have quickly established ourselves as one of the most trusted and user-friendly destinations for watching movies and TV shows online without any subscription fees or hidden costs.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Our Mission</h2>
    <p>At WATCH21, we believe that great entertainment should be accessible to everyone, regardless of their budget or geographic location. Our mission is to democratize access to quality content by providing a seamless, ad-supported streaming experience that rivals premium platforms. We work tirelessly to ensure our library is constantly updated with the latest releases, timeless classics, and hidden gems from around the world.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">What Makes WATCH21 Different?</h2>
    <p>Unlike traditional streaming services that require monthly subscriptions, credit cards, and lengthy commitments, WATCH21 offers completely free access to thousands of movies and TV episodes. Our platform is designed with the user experience in mind - intuitive navigation, lightning-fast search, and multiple streaming options ensure you never miss a moment of your favorite content.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Our Content Library</h2>
    <p>WATCH21 aggregates content from the world's most comprehensive movie database, TMDB (The Movie Database). This partnership allows us to offer an extensive catalog spanning every genre imaginable - from heart-pounding action thrillers and laugh-out-loud comedies to thought-provoking documentaries and edge-of-your-seat horror films. Our TV show collection includes popular series, critically acclaimed dramas, reality shows, anime, and children's programming.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">How WATCH21 Works</h2>
    <p>Using WATCH21 is incredibly simple. Browse our homepage to discover trending content, use the search bar to find specific titles, or explore our dropdown menus to filter movies and TV shows by category (Popular, Now Playing, Upcoming, Top Rated) or by genre (Action, Comedy, Drama, Horror, Romance, Sci-Fi, Thriller, and more). Click on any poster to access detailed information including plot summaries, cast lists, directors, ratings, runtime, and release dates.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Streaming Quality & Options</h2>
    <p>WATCH21 provides multiple streaming sources to ensure reliable playback in HD quality. Our platform integrates with trusted external players that deliver smooth, buffer-free viewing experiences. Whether you're watching on a desktop computer, laptop, tablet, or smartphone, our responsive design automatically adapts to your screen size for optimal viewing.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">No Account Required</h2>
    <p>One of WATCH21's core principles is privacy. Unlike other platforms that demand personal information, email addresses, or payment details, WATCH21 allows you to start watching immediately with zero commitment. We don't track your viewing history, we don't sell your data, and we never ask for unnecessary permissions. Your privacy is completely respected.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Daily Updates</h2>
    <p>Our team works around the clock to ensure WATCH21's content library stays current. New movies and TV episodes are added daily, with trending titles prominently featured on our homepage. We monitor TMDB's real-time updates to bring you the most popular and talked-about content as soon as it becomes available.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Legal Compliance</h2>
    <p>WATCH21 operates as a streaming aggregator. We do not host any video files on our servers. All content accessed through our platform is sourced from external third-party streaming providers. We respect intellectual property rights and copyright laws, and we encourage users to support official releases whenever possible. WATCH21 provides convenience and accessibility while acknowledging the importance of creative industries.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Technical Requirements</h2>
    <p>To enjoy the best streaming experience on WATCH21, we recommend a stable internet connection of at least 5 Mbps for standard definition and 10 Mbps for HD quality. Our platform works on all modern browsers including Chrome, Firefox, Safari, and Edge. JavaScript must be enabled for full functionality. WATCH21 is also compatible with smart TVs and gaming consoles through their built-in web browsers.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Popular Genres on WATCH21</h2>
    <p>Action enthusiasts will find blockbuster franchises, superhero epics, and martial arts classics. Comedy lovers can explore everything from slapstick to sophisticated satire. Drama seekers will discover emotionally powerful narratives and award-winning performances. Horror fans can enjoy psychological thrillers, supernatural tales, and slasher classics. Sci-Fi viewers can journey through futuristic worlds and mind-bending concepts. Romance audiences will find heartwarming love stories and passionate dramas.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">International Content</h2>
    <p>WATCH21 proudly offers content from around the globe. Explore Korean dramas, Japanese anime, Bollywood musicals, European art films, Latin American telenovelas, and African cinema. Our platform celebrates diversity and brings the best of international storytelling to a worldwide audience.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Family-Friendly Options</h2>
    <p>Parents can find extensive children's programming on WATCH21, including animated features, educational content, and family-friendly adventures. While we do not offer explicit content filtering, our search and categorization system helps families discover appropriate entertainment for viewers of all ages.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Frequently Asked Questions</h2>
    <p><strong>Is WATCH21 really free?</strong> Yes! WATCH21 is completely free with no hidden fees or premium tiers. We generate revenue through advertising partnerships that allow us to maintain and improve our service.</p>
    <p><strong>Do I need to create an account?</strong> No account is required. Simply visit our website and start watching immediately.</p>
    <p><strong>How often is content updated?</strong> Our library is updated daily with new movies and TV episodes as they become available from our content partners.</p>
    <p><strong>Can I request specific movies or shows?</strong> While we don't accept individual requests, we continuously expand our catalog based on popularity and availability.</p>
    <p><strong>Why am I seeing ads?</strong> Advertising revenue allows WATCH21 to remain free for all users. Our ads are non-intrusive and help support the platform's operational costs.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Contact Information</h2>
    <p>Have questions, suggestions, or copyright concerns? Our support team is available 24/7 to assist you. Reach out to us at <strong style="color: #e50914;">support@WATCH21.com</strong> and we'll respond within 24 hours. We value your feedback and are committed to making WATCH21 the best free streaming platform available.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Future Development</h2>
    <p>WATCH21 is constantly evolving. Our development roadmap includes user watchlists, personalized recommendations based on viewing history (optional, privacy-focused), social sharing features, mobile apps for iOS and Android, and integration with additional streaming sources. We're also exploring watch party features that would allow friends to watch together remotely.</p>
    
    <h2 style="color: #e50914; margin-top: 1.5rem;">Join Our Community</h2>
    <p>Follow WATCH21 on social media for updates on new content, platform improvements, and exclusive features. Connect with fellow movie lovers, share recommendations, and discover hidden gems through our growing community of entertainment enthusiasts.</p>
    
    <div style="background: #1a1a1a; padding: 1.5rem; border-radius: 12px; margin-top: 2rem; text-align: center;">
      <p style="font-size: 1.2rem;"><strong>WATCH21 - Your Gateway to Unlimited Entertainment</strong></p>
      <p style="color: #666; margin-top: 0.5rem;">© 2026 WATCH21. All rights reserved. | Powered by TMDB API</p>
    </div>
  `;
  
  return container;
}

// ==================== STATIC CACHE ====================
async function getStaticDetail(type, id) {
  try {
    const res = await fetch(`/generated/${type}/${id}.json`);

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Static cache not found');
  }

  return null;
}

// ==================== DETAIL PAGE ====================
function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function DetailPage(type, id) {
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = '<div style="padding:2rem; text-align:center;">Loading...</div>';
  
  try {
    const [details, credits, recommendations] = await Promise.all([
      fetchTMDB(`/${type}/${id}`),
      fetchTMDB(`/${type}/${id}/credits`),
      fetchTMDB(`/${type}/${id}/recommendations`)
    ]);
    
    const director = credits.crew?.find(m => m.job === 'Director')?.name || 'N/A';
    const writer = credits.crew?.find(m => m.job === 'Writer')?.name || 'N/A';
    const cast = credits.cast?.slice(0, 8).map(c => c.name).join(', ') || 'N/A';
    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || '').slice(0, 4);
    const rating = details.vote_average?.toFixed(1) || 'N/A';
    const voteCount = details.vote_count || 0;
    const runtime = type === 'movie' 
      ? (details.runtime ? `${details.runtime} min` : 'N/A')
      : (details.number_of_seasons ? `${details.number_of_seasons} seasons` : 'N/A');
    const releaseDate = details.release_date || details.first_air_date || 'Unknown';
    const genres = details.genres?.map(g => g.name).join(', ') || 'N/A';
    const overview = details.overview || 'No description available.';
    const titleId = `${type}-${id}`;
    
    updateMetaDescription(title, year, overview, rating, director, cast);
    
    // Generate related movies HTML
    let relatedHtml = '';
    if (recommendations.results && recommendations.results.length > 0) {
      const relatedMovies = recommendations.results.slice(0, 6).map(movie => `
        <div class="related-card" data-id="${movie.id}" data-type="${type}" style="cursor: pointer; text-align: center; width: 120px;">
          <img src="${getImageUrl(movie.poster_path, 'w185')}" alt="${movie.title || movie.name}" style="width: 100%; border-radius: 8px; margin-bottom: 0.5rem;">
          <div style="font-size: 0.7rem; font-weight: 500;">${movie.title || movie.name}</div>
          <div style="font-size: 0.6rem; color: #aaa;">${(movie.release_date || movie.first_air_date || '').slice(0, 4)}</div>
        </div>
      `).join('');
      
      relatedHtml = `
        <div style="margin-top: 3rem; border-top: 1px solid #333; padding-top: 2rem;">
          <h3 style="color: #e50914; margin-bottom: 1rem;">You May Also Like</h3>
          <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;">
            ${relatedMovies}
          </div>
        </div>
      `;
    }
    
    container.innerHTML = `
      <div style="margin-bottom: 1rem; font-size: 0.8rem;">
        <a href="/" style="color: #e50914; text-decoration: none;">Home</a>
>
<a href="/${type}" style="color:#e50914; text-decoration:none;">
${type.toUpperCase()}
</a>
>
<span style="color: #aaa;">
${title}
</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back</button>
      </div>
      <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
        <img src="${getImageUrl(details.poster_path, 'w342')}" alt="Watch ${title} ${year} online" style="width: 280px; border-radius: 12px;">
        <div style="flex: 1; text-align: justify;">
          <h1 style="font-size: 2rem; margin-bottom: 0.5rem; text-align: left;">${title} <span style="font-size: 1.2rem; color: #aaa;">(${year})</span></h1>
          <div style="display: flex; gap: 1rem; margin: 1rem 0; color: #ccc; flex-wrap: wrap;">
            <span>⭐ ${rating}/10 (${voteCount} votes)</span>
            <span>⏱️ ${runtime}</span>
            <span>📅 ${releaseDate}</span>
          </div>
          <div style="margin: 1rem 0;"><strong>Genres:</strong> ${genres}</div>
          <div style="margin: 1rem 0;"><strong>Plot:</strong> <span style="text-align: justify;">${overview}</span></div>
          <div style="margin: 1rem 0;"><strong>Director:</strong> ${director}</div>
          ${writer !== 'N/A' ? `<div style="margin: 1rem 0;"><strong>Writer:</strong> ${writer}</div>` : ''}
          <div style="margin: 1rem 0;"><strong>Cast:</strong> ${cast}</div>
          <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
            <button class="trailer-btn" data-type="${type}" data-id="${id}" style="background: #e50914; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">▶ Watch Trailer</button>
            <a id="watchNowLink" href="#" class="watch-now-btn" data-title-id="${titleId}" style="background: #333; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; cursor: pointer;">🎬 Watch Now</a>
          </div>
        </div>
      </div>
      ${relatedHtml}
    `;
    
    const backBtn = container.querySelector('.back-btn');
    const trailerBtn = container.querySelector('.trailer-btn');
    const watchNowLink = container.querySelector('#watchNowLink');
    
    if (backBtn) {
  backBtn.onclick = () => window.history.back();
}

if (trailerBtn) {
  trailerBtn.onclick = () =>
    navigateTo(`/trailer/${type}/${id}`);
}

if (watchNowLink) {
  watchNowLink.onclick = (e) => {
    e.preventDefault();

    const smartLink =
      getSmartLinkForTitle(titleId, title);

    window.open(
      smartLink,
      '_blank'
    );

    setTimeout(() => {
      navigateTo(
        `/stream/${type}/${id}`
      );
    }, 150);
  };
}

container
  .querySelectorAll('.related-card')
  .forEach(card => {

    card.onclick = () => {

      const movieId =
        card.getAttribute('data-id');

      const movieTitle =
        card.querySelector(
          'div'
        )?.textContent || '';

      navigateTo(
  `/${type}/${slugify(title)}/${id}`
);

    };

  });
    
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading details. Please try again.</div>';
  }
  return container;
}

// ==================== TRAILER PAGE ====================
async function TrailerPage(type, id) {
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = '<div style="padding:2rem; text-align:center;">Loading trailer...</div>';
  
  try {
    const videos = await fetchTMDB(`/${type}/${id}/videos`);
    const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results?.[0];
    
    if (trailer?.key) {
      container.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <h2 style="margin-bottom: 1rem; text-align:center;">Official Trailer</h2>
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
    container.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading trailer</div>';
  }
  return container;
}

// ==================== STREAMING PAGE (User Friendly - Tanpa Popunder & Tanpa Smart Link) ====================
async function StreamPage(type, id) {
  // Popunder sudah di-handle oleh initPopunder() global
  // Tidak ada triggerPopunder() di sini untuk menghindari tabrakan
  
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
    </div>
    <h2 style="text-align: center; margin-bottom: 2rem;">Streaming Options</h2>
    <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
      <a id="stream1Link" href="#" class="stream-link" data-stream="1" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; transition: transform 0.2s;">▶️ Stream 1</a>
      <a id="stream2Link" href="#" class="stream-link" data-stream="2" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; transition: transform 0.2s;">▶️ Stream 2</a>
    </div>
    <div id="streamPlayer" style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; display: none;">
      <iframe id="streamIframe" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="fullscreen" allowfullscreen></iframe>
    </div>
    <p style="text-align: center; margin-top: 2rem; font-weight: 500;">
      <span style="color: #ffaa00;">🎞️</span> <span style="color: white;">Watch Movie Select Stream 1 or Stream 2</span> <span style="color: #ffaa00;">🎞️</span>
    </p>
  `;
  
  const backBtn = container.querySelector('.back-btn');
  if (backBtn) backBtn.onclick = () => window.history.back();
  
  const stream1Link = container.querySelector('#stream1Link');
  const stream2Link = container.querySelector('#stream2Link');
  const streamPlayer = container.querySelector('#streamPlayer');
  const streamIframe = container.querySelector('#streamIframe');
  
  if (stream1Link) {
    stream1Link.onclick = (e) => {
      e.preventDefault();
      // LANGSUNG BUKA PLAYER - tanpa window.open, tanpa popunder tambahan
      streamPlayer.style.display = 'block';
      streamIframe.src = `https://vidsrc.me/embed/${type}/${id}`;
      stream1Link.style.opacity = '0.7';
      if (stream2Link) stream2Link.style.opacity = '1';
    };
  }
  
  if (stream2Link) {
    stream2Link.onclick = (e) => {
      e.preventDefault();
      // LANGSUNG BUKA PLAYER - tanpa window.open, tanpa popunder tambahan
      streamPlayer.style.display = 'block';
      streamIframe.src = `https://vidsrc.to/embed/${type}/${id}`;
      stream2Link.style.opacity = '0.7';
      if (stream1Link) stream1Link.style.opacity = '1';
    };
  }
  
  return container;
}

// ==================== FOOTER ====================
function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-section">
        <h3>WATCH21</h3>
        <p>Free streaming platform for movies and TV shows.</p>
      </div>
      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="#" data-nav="/">Home</a></li>
          <li><a href="#" data-nav="about">About Us</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>Follow Us</h4>
        <div class="social-links">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
        </div>
        <p>Powered by TMDB API</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 WATCH21. All rights reserved.</p>
    </div>
  `;
  return footer;
}

// ==================== EVENT LISTENERS ====================
function attachEventListeners() {
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
  
  document.querySelectorAll('[data-nav-type="category"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      currentMediaType = el.getAttribute('data-media');
      currentCategory = el.getAttribute('data-category');
      currentGenreId = null;
      currentGenreName = null;
      currentQuery = null;
      currentPage = 1;
      navigateTo('/');
    });
  });
  
  document.querySelectorAll('[data-nav-type="genre"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      currentMediaType = el.getAttribute('data-media');
      currentGenreId = el.getAttribute('data-genre-id');
      currentGenreName = el.getAttribute('data-genre-name');
      currentCategory = 'genre';
      currentQuery = null;
      currentPage = 1;
      navigateTo('/');
    });
  });
  
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
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

// ==================== ROUTER ====================
window.navigateTo = async function(path) {
  window.history.pushState({}, '', path);
  await route();
};

async function route() {

  const path = window.location.pathname;
  const appElement = document.getElementById('app');

  appElement.innerHTML = await renderNavbar();

  let content = null;

  if (path === '/' || path === '') {

    content = await HomePage();

  }

  else if (path === '/about') {

    content = await AboutPage();

  }

  // SEO URL MOVIE
  else if (path.startsWith('/movie/')) {

    const parts = path.split('/');

    const id = parts[3];

    if (id) {
      content = await DetailPage(
        'movie',
        id
      );
    }

  }

  // SEO URL TV
  else if (path.startsWith('/tv/')) {

    const parts = path.split('/');

    const id = parts[3];

    if (id) {
      content = await DetailPage(
        'tv',
        id
      );
    }

  }

  // URL LAMA (BACKWARD COMPATIBILITY)
  else if (
  path.startsWith('/movie/') ||
  path.startsWith('/tv/')
) {
  const parts = path.split('/');

  const type = parts[1];
  const id = parts[3];

  content = await DetailPage(type, id);
}

  else if (path.startsWith('/trailer/')) {

    const parts = path.split('/');

    content = await TrailerPage(
      parts[2],
      parts[3]
    );

  }

  else if (path.startsWith('/stream/')) {

    const parts = path.split('/');

    content = await StreamPage(
      parts[2],
      parts[3]
    );

  }

  else {

    content = await HomePage();

  }

  appElement.appendChild(content);
  appElement.appendChild(renderFooter());

  attachEventListeners();
  addBackToTopButton();

}

// ==================== INITIALIZE ====================
window.addEventListener('DOMContentLoaded', () => {
  route();
  window.addEventListener('popstate', route);
  initPopunder(); // Popunder global - menangkap klik pertama user di mana saja
});