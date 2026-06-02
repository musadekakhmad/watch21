const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

const fetchTMDB = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB Error ${res.status}`);
  return res.json();
};

export const getTrending = (page = 1) => fetchTMDB('/trending/all/day', { page });
export const getMoviesByCategory = (category, page = 1) => fetchTMDB(`/movie/${category}`, { page });
export const getTvByCategory = (category, page = 1) => fetchTMDB(`/tv/${category}`, { page });
export const getDiscoverByGenre = (mediaType, genreId, page = 1) => fetchTMDB(`/discover/${mediaType}`, { with_genres: genreId, page });
export const searchMulti = (query, page = 1) => fetchTMDB('/search/multi', { query, page });
export const getDetails = (mediaType, id) => fetchTMDB(`/${mediaType}/${id}`);
export const getCredits = (mediaType, id) => fetchTMDB(`/${mediaType}/${id}/credits`);
export const getVideos = (mediaType, id) => fetchTMDB(`/${mediaType}/${id}/videos`);
export const getAlternativeTitles = (mediaType, id) => {
  if (mediaType === 'movie') return fetchTMDB(`/movie/${id}/alternative_titles`);
  else return fetchTMDB(`/tv/${id}/alternative_titles`).catch(() => ({ titles: [] }));
};
export const getMovieGenres = () => fetchTMDB('/genre/movie/list');
export const getTvGenres = () => fetchTMDB('/genre/tv/list');

export async function getMovieIds() {

  const pages = [1,2,3,4,5];

  const results = [];

  for (const page of pages) {

    const data =
      await getMoviesByCategory(
        'popular',
        page
      );

    results.push(
      ...data.results
    );
  }

  return results;
}
export const getImageUrl = (path, size = 'w500') => path ? `${IMAGE_BASE}/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
export const getBackdropUrl = (path, size = 'original') => path ? `${IMAGE_BASE}/${size}${path}` : 'https://via.placeholder.com/1280x720?text=No+Backdrop';
