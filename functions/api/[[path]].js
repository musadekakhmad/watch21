export async function onRequest(context) {
  const { request, env, params } = context;

  const url = new URL(request.url);

  // Ambil path setelah /api/
  const apiPath = url.pathname.replace(/^\/api\//, "");

  const tmdbUrl = new URL(
    `https://api.themoviedb.org/3/${apiPath}`
  );

  url.searchParams.forEach((value, key) => {
    tmdbUrl.searchParams.append(key, value);
  });

  tmdbUrl.searchParams.append(
    "api_key",
    env.TMDB_API_KEY
  );

  const response = await fetch(tmdbUrl);

  return new Response(
    await response.text(),
    {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
}