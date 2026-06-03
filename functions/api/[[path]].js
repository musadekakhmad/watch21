export async function onRequest(context) {
  const { request, env, params } = context;

  const path = params.path || "";
  const url = new URL(request.url);

  const tmdbUrl = new URL(
    `https://api.themoviedb.org/3/${path}`
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
        "Cache-Control":
          "public, max-age=3600"
      }
    }
  );
}