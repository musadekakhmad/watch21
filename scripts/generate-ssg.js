import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sitemapUrls = [];

const API_KEY = process.env.VITE_TMDB_API_KEY;

async function getPopularMovies(page = 1) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`
  );

  return await res.json();
}

async function getMovie(id) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits`
  );

  return await res.json();
}

async function buildMovie(movie) {

  const director =
    movie.credits?.crew?.find(
      x => x.job === "Director"
    )?.name || "Unknown";

  const cast =
    movie.credits?.cast
      ?.slice(0,8)
      ?.map(x => x.name)
      ?.join(", ") || "Unknown";

  const genres =
    movie.genres
      ?.map(x => x.name)
      ?.join(", ") || "Unknown";

  return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<title>
${movie.title}
(${movie.release_date?.slice(0,4) || ""})
| Watch21
</title>

<meta name="description"
content="${(movie.overview || "").slice(0,150)}">

<link rel="canonical"
href="https://watch21.pages.dev/movie/${movie.id}/">

<meta property="og:title"
content="${movie.title}">

<meta property="og:description"
content="${(movie.overview || "").slice(0,150)}">

<meta property="og:image"
content="https://image.tmdb.org/t/p/w500${movie.poster_path}">

</head>

<body>

<h1>${movie.title}</h1>

<img
src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
alt="${movie.title}"
width="300"
>

<p><strong>Rating:</strong> ${movie.vote_average}</p>

<p><strong>Release Date:</strong> ${movie.release_date}</p>

<p><strong>Runtime:</strong> ${movie.runtime} min</p>

<p><strong>Genres:</strong> ${genres}</p>

<p><strong>Director:</strong> ${director}</p>

<p><strong>Cast:</strong> ${cast}</p>

<p>${movie.overview}</p>

<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Movie",
  "name":"${movie.title}",
  "datePublished":"${movie.release_date}",
  "description":"${(movie.overview || "").replace(/"/g,"'")}",
  "image":"https://image.tmdb.org/t/p/w500${movie.poster_path}"
}
</script>

</body>
</html>
`;
}

async function getMovieIds() {

  const results = [];

  for (let page = 1; page <= 5; page++) {

    const data =
      await getPopularMovies(page);

    results.push(...data.results);

  }

  return results;
}

async function generate() {

  const movies =
    await getMovieIds();

  console.log(`Found ${movies.length} movies`);

  for (const movie of movies) {

    const detail =
      await getMovie(movie.id);

    const html =
      await buildMovie(detail);

    const dir =
      path.join(
        "public",
        "movie",
        String(movie.id)
      );

    fs.mkdirSync(dir, {
      recursive: true
    });

    fs.writeFileSync(
      path.join(dir, "index.html"),
      html
    );
	
	sitemapUrls.push(
      `https://watch21.pages.dev/movie/${movie.id}/`
    );

    console.log(
      `Generated movie ${movie.id}`
    );

}

// GENERATE SITEMAP

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
<loc>https://watch21.pages.dev/</loc>
</url>

<url>
<loc>https://watch21.pages.dev/about</loc>
</url>

${sitemapUrls.map(url => `
<url>
<loc>${url}</loc>
</url>
`).join("")}

</urlset>`;

  fs.writeFileSync(
    "public/sitemap.xml",
    sitemap
  );

  console.log(
    `Sitemap generated (${sitemapUrls.length} movies)`
  );

}

generate();