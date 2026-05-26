(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();function p(e){window.history.pushState({},"",e),window.dispatchEvent(new PopStateEvent("popstate"))}const V="c45d4e8d26b9adbc0760f305d2338a06",j="https://api.themoviedb.org/3",U="https://image.tmdb.org/t/p";let m=1,$=!1,N=1,d="all",v="trending",y=null,h=null,g=null,k=[],M=[];document.getElementById("app");async function R(){if(k.length===0)try{const e=await u("/genre/movie/list"),r=await u("/genre/tv/list");k=e.genres||[],M=r.genres||[]}catch{console.warn("Failed to fetch genres")}}async function u(e,r={}){const t=new URL(`${j}${e}`);t.searchParams.append("api_key",V),Object.keys(r).forEach(a=>t.searchParams.append(a,r[a]));const o=await fetch(t);if(!o.ok)throw new Error(`HTTP ${o.status}`);return o.json()}function P(e,r="w500"){return e?`${U}/${r}${e}`:"https://via.placeholder.com/500x750?text=No+Image"}function z(e){var i;const r=e.media_type||(e.first_air_date?"tv":"movie"),t=e.title||e.name,o=(e.release_date||e.first_air_date||"").slice(0,4),a=((i=e.vote_average)==null?void 0:i.toFixed(1))||"N/A",n=document.createElement("div");return n.className="card",n.innerHTML=`
    <img src="${P(e.poster_path)}" alt="${t}" loading="lazy">
    <div class="card-info">
      <div class="card-title">${t}</div>
      <div>${o} | ★ ${a}</div>
    </div>
  `,n.onclick=()=>p(`/detail/${r}/${e.id}`),n}async function Y(){await R();const e=[{name:"Popular",slug:"popular",type:"movie"},{name:"Now Playing",slug:"now_playing",type:"movie"},{name:"Upcoming",slug:"upcoming",type:"movie"},{name:"Top Rated",slug:"top_rated",type:"movie"}],r=[{name:"Popular",slug:"popular",type:"tv"},{name:"Airing Today",slug:"airing_today",type:"tv"},{name:"On TV",slug:"on_the_air",type:"tv"},{name:"Top Rated",slug:"top_rated",type:"tv"}],t=k.map(a=>`<div class="dropdown-item" data-nav-type="genre" data-media="movie" data-genre-id="${a.id}" data-genre-name="${a.name}">${a.name}</div>`).join(""),o=M.map(a=>`<div class="dropdown-item" data-nav-type="genre" data-media="tv" data-genre-id="${a.id}" data-genre-name="${a.name}">${a.name}</div>`).join("");return`
    <div class="navbar">
      <div class="logo" data-nav="about">WATCH21</div>
      <div class="nav-links">
        <div class="nav-item" data-nav="/">Home</div>
        <div class="nav-item dropdown">
          Movies <i class="fas fa-chevron-down"></i>
          <div class="dropdown-content">
            <div class="dropdown-group">
              <div class="dropdown-label category-label">Category</div>
              ${e.map(a=>`<div class="dropdown-item" data-nav-type="category" data-media="movie" data-category="${a.slug}">${a.name}</div>`).join("")}
            </div>
            <div class="dropdown-group">
              <div class="dropdown-label genre-label">Genre</div>
              <div class="genre-scroll">${t}</div>
            </div>
          </div>
        </div>
        <div class="nav-item dropdown">
          TV Shows <i class="fas fa-chevron-down"></i>
          <div class="dropdown-content">
            <div class="dropdown-group">
              <div class="dropdown-label category-label">Category</div>
              ${r.map(a=>`<div class="dropdown-item" data-nav-type="category" data-media="tv" data-category="${a.slug}">${a.name}</div>`).join("")}
            </div>
            <div class="dropdown-group">
              <div class="dropdown-label genre-label">Genre</div>
              <div class="genre-scroll">${o}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search Movies / TV Shows...">
        <button id="searchBtn"><i class="fas fa-search"></i></button>
      </div>
    </div>
  `}async function B(e,r=!1){if(!$){$=!0;try{let t,o="";if(console.log("Loading with:",{currentQuery:g,currentGenreId:y,currentCategory:v,currentMediaType:d}),g)t=await u("/search/multi",{query:g,page:m}),o=`Search results for "${g}"`;else if(y&&d!=="all")t=await u(`/discover/${d}`,{with_genres:y,page:m}),o=`${d==="movie"?"Movies":"TV Shows"} in ${h}`;else if(v!=="trending"&&d!=="all"){t=await u(`/${d}/${v}`,{page:m});const s=v.replace(/_/g," ").toUpperCase();o=`${d==="movie"?"Movies":"TV Shows"} - ${s}`}else t=await u("/trending/all/day",{page:m}),o="Trending Today";N=t.total_pages;const a=t.results.filter(s=>s.media_type!=="person").map(s=>z(s));let n=e.parentElement.querySelector(".page-title");n||(n=document.createElement("h2"),n.className="page-title",e.parentElement.insertBefore(n,e)),n.textContent=o,n.style.paddingTop="1.5rem",n.style.paddingBottom="0.5rem",n.style.paddingLeft="2rem",n.style.paddingRight="2rem",n.style.marginTop="0",n.style.marginBottom="0",r||(e.innerHTML=""),a.forEach(s=>e.appendChild(s));const i=e.parentElement.querySelector(".load-more");if(i&&i.remove(),m<N&&a.length>0){const s=document.createElement("div");s.className="load-more";const l=document.createElement("button");l.textContent="Load More",l.onclick=async()=>{m++,await B(e,!0)},s.appendChild(l),e.parentElement.appendChild(s)}a.length===0&&!r&&(e.innerHTML='<div style="padding:2rem; text-align:center;">No results found</div>')}catch(t){console.error(t),r||(e.innerHTML='<div style="padding:2rem; text-align:center;">Error loading data. Please try again.</div>')}finally{$=!1}}}async function A(){const e=document.createElement("div"),r=document.createElement("div");return r.className="movie-grid",e.appendChild(r),m=1,await B(r),e}async function Q(){const e=document.createElement("div");return e.className="about-container",e.innerHTML=`
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
  `,e}async function K(e,r){var o,a,n,i,s,l,b;const t=document.createElement("div");t.className="detail-container",t.innerHTML='<div style="padding:2rem; text-align:center;">Loading...</div>';try{const[c,w,te]=await Promise.all([u(`/${e}/${r}`),u(`/${e}/${r}/credits`),u(`/${e}/${r}/videos`)]),C=((a=(o=w.crew)==null?void 0:o.find(f=>f.job==="Director"))==null?void 0:a.name)||"N/A",T=((i=(n=w.crew)==null?void 0:n.find(f=>f.job==="Writer"))==null?void 0:i.name)||"N/A",H=((s=w.cast)==null?void 0:s.slice(0,10).map(f=>f.name).join(", "))||"N/A",S=c.title||c.name,W=(c.release_date||c.first_air_date||"").slice(0,4),q=((l=c.vote_average)==null?void 0:l.toFixed(1))||"N/A",D=c.vote_count||0,I=e==="movie"?c.runtime?`${c.runtime} min`:"N/A":c.number_of_seasons?`${c.number_of_seasons} season${c.number_of_seasons>1?"s":""}`:"N/A",F=c.release_date||c.first_air_date||"Unknown",O=((b=c.genres)==null?void 0:b.map(f=>f.name).join(", "))||"N/A",G=c.overview||"No description available.";t.innerHTML=`
      <div style="margin-bottom: 2rem;">
        <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back</button>
      </div>
      <div style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: space-between;">
        <img src="${P(c.poster_path,"w342")}" alt="${S}" style="width: 280px; border-radius: 12px;">
        <div style="flex: 1; min-width: 250px;">
          <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${S} <span style="font-size: 1.2rem; color: #aaa;">(${W})</span></h1>
          <div style="display: flex; gap: 1rem; margin: 1rem 0; color: #ccc; flex-wrap: wrap;">
            <span>⭐ ${q}/10 (${D} votes)</span>
            <span>⏱️ ${I}</span>
            <span>📅 ${F}</span>
          </div>
          <div style="margin: 1rem 0;"><strong>Genres:</strong> ${O}</div>
          <div style="margin: 1rem 0;"><strong>Plot Summary:</strong> ${G}</div>
          <div style="margin: 1rem 0;"><strong>Director:</strong> ${C}</div>
          ${T!=="N/A"?`<div style="margin: 1rem 0;"><strong>Writer:</strong> ${T}</div>`:""}
          <div style="margin: 1rem 0;"><strong>Cast:</strong> ${H}</div>
          <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
            <button class="trailer-btn" data-type="${e}" data-id="${r}" style="background: #e50914; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">▶ Watch Trailer</button>
            <button class="stream-btn" data-type="${e}" data-id="${r}" style="background: #333; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">🎬 Watch Now</button>
          </div>
        </div>
      </div>
    `;const x=t.querySelector(".back-btn"),L=t.querySelector(".trailer-btn"),_=t.querySelector(".stream-btn");x&&(x.onclick=()=>window.history.back()),L&&(L.onclick=()=>p(`/trailer/${e}/${r}`)),_&&(_.onclick=()=>p(`/stream/${e}/${r}`))}catch(c){console.error(c),t.innerHTML='<div style="padding:2rem; text-align:center;">Error loading details. Please try again.</div>'}return t}async function J(e,r){var o,a,n;const t=document.createElement("div");t.className="detail-container",t.innerHTML='<div style="padding:2rem; text-align:center;">Loading trailer...</div>';try{const i=await u(`/${e}/${r}/videos`),s=((o=i.results)==null?void 0:o.find(l=>l.type==="Trailer"&&l.site==="YouTube"))||((a=i.results)==null?void 0:a.find(l=>l.site==="YouTube"))||((n=i.results)==null?void 0:n[0]);if(s!=null&&s.key){t.innerHTML=`
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <h2 style="margin-bottom: 1rem;">Official Trailer</h2>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden;">
          <iframe src="https://www.youtube.com/embed/${s.key}?autoplay=1&rel=0&modestbranding=1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>
        </div>
      `;const l=t.querySelector(".back-btn");l&&(l.onclick=()=>window.history.back())}else{t.innerHTML=`
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <div style="padding:2rem; text-align:center;">No trailer available for this title</div>
      `;const l=t.querySelector(".back-btn");l&&(l.onclick=()=>window.history.back())}}catch(i){console.error(i),t.innerHTML='<div style="padding:2rem; text-align:center;">Error loading trailer</div>'}return t}async function X(e,r){const t=document.createElement("div");t.className="detail-container",t.innerHTML=`
    <div style="margin-bottom: 1rem;">
      <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
    </div>
    <h2 style="margin-bottom: 2rem; text-align: center;">Streaming Options</h2>
    <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
      <button class="stream-source-btn" data-url="https://vidsrc.me/embed/${e}/${r}" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; border: none; cursor: pointer; font-weight: bold;">🎬 Stream 1 (Vidsrc.me)</button>
      <button class="stream-source-btn" data-url="https://vidsrc.to/embed/${e}/${r}" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; border: none; cursor: pointer; font-weight: bold;">🎬 Stream 2 (Vidsrc.to)</button>
    </div>
    <div id="streamPlayer" style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; display: none;">
      <iframe id="streamIframe" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="fullscreen" allowfullscreen></iframe>
    </div>
    <p style="text-align: center; margin-top: 2rem; color: #888;">⚠️ External player - we do not host content.</p>
  `;const o=t.querySelector(".back-btn");o&&(o.onclick=()=>window.history.back());const a=t.querySelectorAll(".stream-source-btn"),n=t.querySelector("#streamPlayer"),i=t.querySelector("#streamIframe");return a.forEach(s=>{s.onclick=()=>{const l=s.getAttribute("data-url");n.style.display="block",i.src=l,a.forEach(b=>b.style.opacity="0.7"),s.style.opacity="1"}}),t}function Z(){const e=document.createElement("footer");return e.className="footer",e.innerHTML=`
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
  `,e}function ee(){document.querySelectorAll("[data-nav]").forEach(t=>{t.addEventListener("click",o=>{o.preventDefault(),t.getAttribute("data-nav")==="about"?p("/about"):(d="all",v="trending",y=null,h=null,g=null,m=1,p("/"))})}),document.querySelectorAll('[data-nav-type="category"]').forEach(t=>{t.addEventListener("click",o=>{o.preventDefault();const a=t.getAttribute("data-media"),n=t.getAttribute("data-category");console.log("Category clicked:",a,n),d=a,v=n,y=null,h=null,g=null,m=1,p("/")})}),document.querySelectorAll('[data-nav-type="genre"]').forEach(t=>{t.addEventListener("click",o=>{o.preventDefault();const a=t.getAttribute("data-media"),n=t.getAttribute("data-genre-id"),i=t.getAttribute("data-genre-name");console.log("Genre clicked:",a,n,i),d=a,v="genre",y=n,h=i,g=null,m=1,p("/")})});const e=document.getElementById("searchBtn"),r=document.getElementById("searchInput");e&&e.addEventListener("click",()=>{const t=r.value.trim();t&&(console.log("Search clicked:",t),g=t,d="all",v="trending",y=null,h=null,m=1,p("/"))}),r&&r.addEventListener("keypress",t=>{if(t.key==="Enter"){const o=t.target.value.trim();o&&(console.log("Search enter:",o),g=o,d="all",v="trending",y=null,h=null,m=1,p("/"))}})}window.navigateTo=async function(e){window.history.pushState({},"",e),await E()};async function E(){const e=window.location.pathname,r=document.getElementById("app");r.innerHTML=await Y();let t=null;if(e==="/"||e==="")t=await A();else if(e==="/about")t=await Q();else if(e.startsWith("/detail/")){const a=e.split("/");t=await K(a[2],a[3])}else if(e.startsWith("/trailer/")){const a=e.split("/");t=await J(a[2],a[3])}else if(e.startsWith("/stream/")){const a=e.split("/");t=await X(a[2],a[3])}else t=await A();r.appendChild(t);const o=Z();r.appendChild(o),ee()}window.addEventListener("DOMContentLoaded",()=>{E(),window.addEventListener("popstate",E)});
