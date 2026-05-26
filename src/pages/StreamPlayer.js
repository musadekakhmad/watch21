export default async function StreamPlayer(params) {
  const { type, id } = params;
  const container = document.createElement('div');
  container.className = 'player-container';
  const streamUrl1 = `https://vidsrc.me/embed/${type}/${id}`;
  const streamUrl2 = `https://vidsrc.to/embed/${type}/${id}`;
  container.innerHTML = `
    <h2 style="margin-bottom: 1rem;">External Streaming Options</h2>
    <div class="stream-buttons">
      <a href="${streamUrl1}" target="_blank" rel="noopener noreferrer" class="stream-link">Stream 1 (Vidsrc.me)</a>
      <a href="${streamUrl2}" target="_blank" rel="noopener noreferrer" class="stream-link">Stream 2 (Vidsrc.to)</a>
    </div>
    <div style="text-align:center; margin-top:2rem;">
      <p style="color:#aaa">⚠️ External player, we do not host any content.</p>
      <a href="#" onclick="window.history.back(); return false;" style="color:#e50914; text-decoration:none;">← Go back</a>
    </div>
  `;
  return container;
}