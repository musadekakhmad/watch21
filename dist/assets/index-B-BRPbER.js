(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();function m(e){window.history.pushState({},"",e),window.dispatchEvent(new PopStateEvent("popstate"))}const F="c45d4e8d26b9adbc0760f305d2338a06",O="https://api.themoviedb.org/3",G="https://image.tmdb.org/t/p";let d=1,b=!1,L=1,c="all",p="trending",g=null,f=null,v=null,w=[],S=[];document.getElementById("app");async function j(){if(w.length===0)try{const e=await u("/genre/movie/list"),r=await u("/genre/tv/list");w=e.genres||[],S=r.genres||[]}catch{console.warn("Failed to fetch genres")}}async function u(e,r={}){const t=new URL(`${O}${e}`);t.searchParams.append("api_key",F),Object.keys(r).forEach(a=>t.searchParams.append(a,r[a]));const o=await fetch(t);if(!o.ok)throw new Error(`HTTP ${o.status}`);return o.json()}function N(e,r="w500"){return e?`${G}/${r}${e}`:"https://via.placeholder.com/500x750?text=No+Image"}function U(e){var l;const r=e.media_type||(e.first_air_date?"tv":"movie"),t=e.title||e.name,o=(e.release_date||e.first_air_date||"").slice(0,4),a=((l=e.vote_average)==null?void 0:l.toFixed(1))||"N/A",n=document.createElement("div");return n.className="card",n.innerHTML=`
    <img src="${N(e.poster_path)}" alt="${t}" loading="lazy">
    <div class="card-info">
      <div class="card-title">${t}</div>
      <div>${o} | ★ ${a}</div>
    </div>
  `,n.onclick=()=>m(`/detail/${r}/${e.id}`),n}async function V(){await j();const e=[{name:"Popular",slug:"popular",type:"movie"},{name:"Now Playing",slug:"now_playing",type:"movie"},{name:"Upcoming",slug:"upcoming",type:"movie"},{name:"Top Rated",slug:"top_rated",type:"movie"}],r=[{name:"Popular",slug:"popular",type:"tv"},{name:"Airing Today",slug:"airing_today",type:"tv"},{name:"On TV",slug:"on_the_air",type:"tv"},{name:"Top Rated",slug:"top_rated",type:"tv"}],t=w.map(a=>`<div class="dropdown-item" data-nav-type="genre" data-media="movie" data-genre-id="${a.id}" data-genre-name="${a.name}">${a.name}</div>`).join(""),o=S.map(a=>`<div class="dropdown-item" data-nav-type="genre" data-media="tv" data-genre-id="${a.id}" data-genre-name="${a.name}">${a.name}</div>`).join("");return`
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
  `}async function A(e,r=!1){if(!b){b=!0;try{let t,o="";if(v)t=await u("/search/multi",{query:v,page:d}),o=`Search results for "${v}"`;else if(g&&c!=="all")t=await u(`/discover/${c}`,{with_genres:g,page:d}),o=`${c==="movie"?"Movies":"TV Shows"} in ${f}`;else if(p!=="trending"&&c!=="all"){t=await u(`/${c}/${p}`,{page:d});const i=p.replace(/_/g," ").toUpperCase();o=`${c==="movie"?"Movies":"TV Shows"} - ${i}`}else t=await u("/trending/all/day",{page:d}),o="Trending Today";L=t.total_pages;const a=t.results.filter(i=>i.media_type!=="person").map(i=>U(i));let n=e.parentElement.querySelector(".page-title");n||(n=document.createElement("h2"),n.className="page-title",e.parentElement.insertBefore(n,e)),n.textContent=o,n.style.paddingTop="1rem",n.style.paddingBottom="0rem",n.style.paddingLeft="2rem",n.style.paddingRight="2rem",n.style.marginTop="0",n.style.marginBottom="0",n.style.textAlign="center",n.style.fontWeight="600",r||(e.innerHTML=""),a.forEach(i=>e.appendChild(i));const l=e.parentElement.querySelector(".load-more");if(l&&l.remove(),d<L&&a.length>0){const i=document.createElement("div");i.className="load-more";const s=document.createElement("button");s.textContent="Load More",s.onclick=async()=>{d++,await A(e,!0)},i.appendChild(s),e.parentElement.appendChild(i)}a.length===0&&!r&&(e.innerHTML='<div style="padding:2rem; text-align:center;">No results found</div>')}catch(t){console.error(t),r||(e.innerHTML='<div style="padding:2rem; text-align:center;">Error loading data. Please try again.</div>')}finally{b=!1}}}async function _(){const e=document.createElement("div"),r=document.createElement("div");return r.className="movie-grid",e.appendChild(r),d=1,await A(r),e}async function R(){const e=document.createElement("div");return e.className="about-container",e.innerHTML=`
    <div class="about-content">
      <h1>About Watch21 - Free Streaming Platform</h1>
      <p>Watch21 is your premier destination for streaming movies and TV shows online. Founded in 2024, we've quickly become one of the most trusted platforms for entertainment enthusiasts worldwide.</p>
      
      <h2>Watch Movies Online Free</h2>
      <p>Watch21 offers thousands of movies and TV shows completely free. No subscription, no credit card required. Our extensive library includes Hollywood blockbusters, indie films, classic cinema, and popular TV series from around the world.</p>
      
      <h2>How to Stream on Watch21</h2>
      <p>Using Watch21 is simple. Browse our collection, click on any movie or show, and choose your preferred streaming source. We provide multiple streaming options for reliable playback.</p>
      
      <h2>Best Free Movie Streaming Site</h2>
      <p>Watch21 stands out from other streaming sites because we prioritize user experience. Our interface is clean, fast, and mobile-friendly. We update our content daily with the latest releases and trending titles from TMDB.</p>
      
      <h2>Why Choose Watch21?</h2>
      <ul>
        <li>100% Free - No hidden fees or subscriptions</li>
        <li>No Account Required - Start watching instantly</li>
        <li>HD Quality Streaming - Crystal clear video</li>
        <li>Daily Updates - New content added every day</li>
        <li>Mobile Friendly - Watch on any device</li>
        <li>Privacy Focused - No tracking or data collection</li>
      </ul>
      
      <p><strong>Watch21 - Your Gateway to Unlimited Entertainment</strong></p>
    </div>
  `,e}async function z(e,r){var o,a,n,l,i;const t=document.createElement("div");t.className="detail-container",t.innerHTML='<div style="padding:2rem; text-align:center;">Loading...</div>';try{const[s,h]=await Promise.all([u(`/${e}/${r}`),u(`/${e}/${r}/credits`)]),M=((a=(o=h.crew)==null?void 0:o.find(y=>y.job==="Director"))==null?void 0:a.name)||"N/A",P=((n=h.cast)==null?void 0:n.slice(0,10).map(y=>y.name).join(", "))||"N/A",E=s.title||s.name,B=(s.release_date||s.first_air_date||"").slice(0,4),H=((l=s.vote_average)==null?void 0:l.toFixed(1))||"N/A",C=s.vote_count||0,W=e==="movie"?s.runtime?`${s.runtime} min`:"N/A":s.number_of_seasons?`${s.number_of_seasons} season${s.number_of_seasons>1?"s":""}`:"N/A",q=s.release_date||s.first_air_date||"Unknown",I=((i=s.genres)==null?void 0:i.map(y=>y.name).join(", "))||"N/A",D=s.overview||"No description available.";t.innerHTML=`
      <div style="margin-bottom: 2rem;">
        <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back</button>
      </div>
      <div style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: space-between;">
        <img src="${N(s.poster_path,"w342")}" alt="${E}" style="width: 280px; border-radius: 12px;">
        <div style="flex: 1; min-width: 250px;">
          <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${E} <span style="font-size: 1.2rem; color: #aaa;">(${B})</span></h1>
          <div style="display: flex; gap: 1rem; margin: 1rem 0; color: #ccc; flex-wrap: wrap;">
            <span>⭐ ${H}/10 (${C} votes)</span>
            <span>⏱️ ${W}</span>
            <span>📅 ${q}</span>
          </div>
          <div style="margin: 1rem 0;"><strong>Genres:</strong> ${I}</div>
          <div style="margin: 1rem 0;"><strong>Plot:</strong> ${D}</div>
          <div style="margin: 1rem 0;"><strong>Director:</strong> ${M}</div>
          <div style="margin: 1rem 0;"><strong>Cast:</strong> ${P}</div>
          <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
            <button class="trailer-btn" data-type="${e}" data-id="${r}" style="background: #e50914; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">▶ Watch Trailer</button>
            <button class="stream-btn" data-type="${e}" data-id="${r}" style="background: #333; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">🎬 Watch Now</button>
          </div>
        </div>
      </div>
    `;const k=t.querySelector(".back-btn"),T=t.querySelector(".trailer-btn"),x=t.querySelector(".stream-btn");k&&(k.onclick=()=>window.history.back()),T&&(T.onclick=()=>m(`/trailer/${e}/${r}`)),x&&(x.onclick=()=>m(`/stream/${e}/${r}`))}catch(s){console.error(s),t.innerHTML='<div style="padding:2rem; text-align:center;">Error loading details</div>'}return t}async function Y(e,r){var o,a;const t=document.createElement("div");t.className="detail-container",t.innerHTML='<div style="padding:2rem; text-align:center;">Loading trailer...</div>';try{const n=await u(`/${e}/${r}/videos`),l=((o=n.results)==null?void 0:o.find(i=>i.type==="Trailer"&&i.site==="YouTube"))||((a=n.results)==null?void 0:a[0]);if(l!=null&&l.key){t.innerHTML=`
        <div style="margin-bottom: 1rem;">
          <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
        </div>
        <h2 style="margin-bottom: 1rem; text-align:center;">Official Trailer</h2>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden;">
          <iframe src="https://www.youtube.com/embed/${l.key}?autoplay=1&rel=0" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen" allowfullscreen></iframe>
        </div>
      `;const i=t.querySelector(".back-btn");i&&(i.onclick=()=>window.history.back())}else t.innerHTML='<div style="padding:2rem; text-align:center;">No trailer available</div>'}catch{t.innerHTML='<div style="padding:2rem; text-align:center;">Error loading trailer</div>'}return t}async function Q(e,r){const t=document.createElement("div");t.className="detail-container",t.innerHTML=`
    <div style="margin-bottom: 1rem;">
      <button class="back-btn" style="background: none; border: none; color: #e50914; cursor: pointer; font-size: 1rem;">← Back to Details</button>
    </div>
    <h2 style="margin-bottom: 2rem; text-align: center;">Streaming Options</h2>
    <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
      <button class="stream-source-btn" data-url="https://vidsrc.me/embed/${e}/${r}" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; border: none; cursor: pointer; font-weight: bold;">🎬 Stream 1</button>
      <button class="stream-source-btn" data-url="https://vidsrc.to/embed/${e}/${r}" style="background: #e50914; padding: 1rem 2rem; border-radius: 8px; color: white; border: none; cursor: pointer; font-weight: bold;">🎬 Stream 2</button>
    </div>
    <div id="streamPlayer" style="position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; display: none;">
      <iframe id="streamIframe" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="fullscreen" allowfullscreen></iframe>
    </div>
    <p style="text-align: center; margin-top: 2rem; color: #888;">⚠️ External player - we do not host content.</p>
  `;const o=t.querySelector(".back-btn");o&&(o.onclick=()=>window.history.back());const a=t.querySelectorAll(".stream-source-btn"),n=t.querySelector("#streamPlayer"),l=t.querySelector("#streamIframe");return a.forEach(i=>{i.onclick=()=>{const s=i.getAttribute("data-url");n.style.display="block",l.src=s,a.forEach(h=>h.style.opacity="0.7"),i.style.opacity="1"}}),t}function K(){const e=document.createElement("footer");return e.className="footer",e.innerHTML=`
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
  `,e}function J(){document.querySelectorAll("[data-nav]").forEach(t=>{t.addEventListener("click",o=>{o.preventDefault(),t.getAttribute("data-nav")==="about"?m("/about"):(c="all",p="trending",g=null,f=null,v=null,d=1,m("/"))})}),document.querySelectorAll('[data-nav-type="category"]').forEach(t=>{t.addEventListener("click",o=>{o.preventDefault();const a=t.getAttribute("data-media"),n=t.getAttribute("data-category");c=a,p=n,g=null,f=null,v=null,d=1,m("/")})}),document.querySelectorAll('[data-nav-type="genre"]').forEach(t=>{t.addEventListener("click",o=>{o.preventDefault();const a=t.getAttribute("data-media"),n=t.getAttribute("data-genre-id"),l=t.getAttribute("data-genre-name");c=a,p="genre",g=n,f=l,v=null,d=1,m("/")})});const e=document.getElementById("searchBtn"),r=document.getElementById("searchInput");e&&e.addEventListener("click",()=>{const t=r.value.trim();t&&(v=t,c="all",p="trending",g=null,f=null,d=1,m("/"))}),r&&r.addEventListener("keypress",t=>{if(t.key==="Enter"){const o=t.target.value.trim();o&&(v=o,c="all",p="trending",g=null,f=null,d=1,m("/"))}})}window.navigateTo=async function(e){window.history.pushState({},"",e),await $()};async function $(){const e=window.location.pathname,r=document.getElementById("app");r.innerHTML=await V();let t=null;if(e==="/"||e==="")t=await _();else if(e==="/about")t=await R();else if(e.startsWith("/detail/")){const a=e.split("/");t=await z(a[2],a[3])}else if(e.startsWith("/trailer/")){const a=e.split("/");t=await Y(a[2],a[3])}else if(e.startsWith("/stream/")){const a=e.split("/");t=await Q(a[2],a[3])}else t=await _();r.appendChild(t);const o=K();r.appendChild(o),J()}window.addEventListener("DOMContentLoaded",()=>{$(),window.addEventListener("popstate",$)});
