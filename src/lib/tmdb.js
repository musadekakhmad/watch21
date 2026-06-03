const API_KEY = process.env.TMDB_API_KEY;

const BASE_URL =
    process.env.TMDB_BASE_URL ||
    import.meta.env.VITE_TMDB_BASE_URL;

export async function fetchTMDB(endpoint, params = {}) {

    const url = new URL(`${BASE_URL}${endpoint}`);

    url.searchParams.append("api_key", API_KEY);

    Object.entries(params)
        .forEach(([k,v]) => {
            url.searchParams.append(k,v);
        });

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(
            `TMDB Error ${res.status}`
        );
    }

    return res.json();
}