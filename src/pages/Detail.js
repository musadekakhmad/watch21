import { getDetails, getCredits, getAlternativeTitles, getImageUrl, getBackdropUrl } from '../api.js';
import { navigateTo } from '../router.js';

export default async function Detail(params) {
  const { type, id } = params;
  const container = document.createElement('div');
  container.className = 'detail-container';
  container.innerHTML = '<div style="text-align:center; padding: 3rem;">Loading...</div>';
  
  try {
    const [details, credits, altTitles] = await Promise.all([
      getDetails(type, id),
      getCredits(type, id),
      getAlternativeTitles(type, id)
    ]);
    
    const backdrop = getBackdropUrl(details.backdrop_path);
    const poster = getImageUrl(details.poster_path, 'w342');
    const title = details.title || details.name;
    const releaseYear = (details.release_date || details.first_air_date || '').split('-')[0];
    const rating = details.vote_average?.toFixed(1);
    const runtime = type === 'movie' ? `${details.runtime} min` : (details.number_of_seasons ? `${details.number_of_seasons} seasons` : 'N/A');
    const releaseDate = (details.release_date || details.first_air_date || 'Unknown');
    const plot = details.overview || 'No plot summary available.';
    const akaList = altTitles.titles?.slice(0, 3).map(t => t.title) || [];
    const aka = akaList.length ? akaList.join(', ') : 'N/A';
    
    const director = credits.crew?.find(m => m.job === 'Director')?.name || 'N/A';
    const cast = credits.cast?.slice(0, 8).map(c => c.name).join(', ') || 'N/A';
    
    container.innerHTML = `
      <img class="backdrop-img" src="${backdrop}" alt="${title}" style="object-fit:cover; width:100%; height:400px; border-radius:20px; margin-bottom:1.5rem;">
      <div class="detail-header" style="display:flex; gap:2rem; flex-wrap:wrap;">
        <img class="poster-detail" src="${poster}" alt="${title}" style="width:280px; border-radius:16px;">
        <div class="detail-info" style="flex:1;">
          <h1 class="detail-title">${title} <span style="font-size:1.2rem;">(${releaseYear})</span></h1>
          <div class="detail-meta" style="display:flex; gap:1rem; margin:1rem 0;">
            <span><i class="fas fa-star" style="color:#ffb43b;"></i> ${rating}/10</span>
            <span><i class="fas fa-clock"></i> ${runtime}</span>
            <span><i class="fas fa-calendar"></i> ${releaseDate}</span>
          </div>
          <div><strong>AKA:</strong> ${aka}</div>
          <div class="genre-pills" style="display:flex; gap:0.5rem; margin:1rem 0;">
            ${details.genres?.map(g => `<span class="pill" style="background:#2a2a2a; padding:0.2rem 0.8rem; border-radius:20px;">${g.name}</span>`).join('') || ''}
          </div>
          <p><strong>Plot:</strong> ${plot}</p>
          <p><strong>Director:</strong> ${director}</p>
          <p><strong>Cast:</strong> ${cast}</p>
          <div class="player-buttons" style="display:flex; gap:1rem; margin-top:2rem;">
            <button class="player-btn" id="watch-trailer" style="background:#e50914; border:none; padding:0.8rem 1.5rem; border-radius:8px; color:white; font-weight:bold; cursor:pointer;"><i class="fab fa-youtube"></i> Watch Trailer</button>
            <button class="player-btn secondary" id="watch-stream" style="background:#2c2c2c; border:none; padding:0.8rem 1.5rem; border-radius:8px; color:white; font-weight:bold; cursor:pointer;"><i class="fas fa-play-circle"></i> Watch Now (Stream)</button>
          </div>
        </div>
      </div>
    `;
    
    const trailerBtn = container.querySelector('#watch-trailer');
    const streamBtn = container.querySelector('#watch-stream');
    trailerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(`/trailer/${type}/${id}`);
    });
    streamBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(`/stream/${type}/${id}`);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="text-align:center;padding:3rem;">Failed to load details</div>';
  }
  return container;
}