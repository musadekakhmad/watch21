// src/components/LoadMore.js
export default function LoadMoreButton(onClick, isLoading = false) {
  const container = document.createElement('div');
  container.className = 'load-more-container';
  const btn = document.createElement('button');
  btn.className = 'load-more-btn';
  btn.textContent = isLoading ? 'Loading...' : 'Load More';
  btn.disabled = isLoading;
  btn.addEventListener('click', onClick);
  container.appendChild(btn);
  return container;
}