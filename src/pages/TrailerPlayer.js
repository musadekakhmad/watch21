import { getVideos } from '../api.js';

export default async function TrailerPlayer(params) {
  const { type, id } = params;
  const container = document.createElement('div');
  container.className = 'player-container';
  container.innerHTML = '<div style="text-align:center; padding:3rem;">Loading trailer...</div>';
  
  try {
    const videoData = await getVideos(type, id);
    const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videoData.results[0];
    
    if (trailer && trailer.key) {
      const embedUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`;
      container.innerHTML = `
        <h2 style="margin-bottom: 1rem;">Official Trailer</h2>
        <div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; margin-bottom: 2rem;">
          <iframe src="${embedUrl}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
        <a href="#" onclick="window.history.back(); return false;" style="color: #e50914; text-decoration: none;">← Back to details</a>
      `;
    } else {
      container.innerHTML = '<div style="padding:2rem; text-align:center;">No trailer available.</div>';
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="padding:2rem; text-align:center;">Error loading trailer.</div>';
  }
  return container;
}