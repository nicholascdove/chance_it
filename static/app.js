let currentAudio = null;
let isSpinning = false;

// ── Title ──────────────────────────────────────────────────────────────────

function updateTitle(label) {
  document.getElementById('dynamic-title').innerHTML =
    `<span class="title-accent">${label}</span> or chance it?`;
}

function initializeTitle() {
  fetch('/random_option')
    .then(r => r.json())
    .then(data => { if (data.random_option) updateTitle(data.random_option); });
}

// ── Spinner ────────────────────────────────────────────────────────────────

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;

  // Hide result card and stop any playing audio
  const resultCard = document.getElementById('result-card');
  resultCard.classList.remove('visible');
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }

  fetch('/spin', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    .then(r => r.json())
    .then(data => {
      if (data.error) { alert(data.error); isSpinning = false; return; }
      animateSpinner(data.options, data.chosen_index, data.chosen, data.chosen_search);
    });
}

function animateSpinner(options, chosenIndex, chosen, chosenSearch) {
  const spinner = document.getElementById('spinner');
  spinner.innerHTML = '';
  spinner.style.transition = 'none';
  spinner.style.transform = 'translateY(0)';

  // Tripled list for seamless loop
  const loopedOptions = [...options, ...options, ...options];
  loopedOptions.forEach(label => {
    const div = document.createElement('div');
    div.className = 'spinner-item';
    div.textContent = label;
    spinner.appendChild(div);
  });

  const optionHeight = 60;
  const viewportHeight = 240;
  const centerOffset = viewportHeight / 2 - optionHeight / 2;
  const scrollPosition = (options.length * 2 + chosenIndex) * optionHeight - centerOffset;

  // Force reflow before applying transition
  spinner.getBoundingClientRect();
  spinner.style.transition = 'transform 5s cubic-bezier(0.25, 1, 0.5, 1)';
  spinner.style.transform = `translateY(-${scrollPosition}px)`;

  setTimeout(() => {
    updateTitle(chosen);
    showResult(chosen, chosenSearch);
    spinner.style.transition = '';
    isSpinning = false;
  }, 5000);
}

// ── Result card ────────────────────────────────────────────────────────────

function showResult(chosen, chosenSearch) {
  const card = document.getElementById('result-card');
  const nameEl = document.getElementById('result-name');
  const previewStatus = document.getElementById('preview-status');

  nameEl.textContent = chosen;
  previewStatus.textContent = '';
  card.classList.add('visible');

  // Fetch and play Deezer preview
  fetch(`/preview?q=${encodeURIComponent(chosenSearch)}`)
    .then(r => r.json())
    .then(({ preview_url }) => {
      if (preview_url) {
        currentAudio = new Audio(preview_url);
        currentAudio.play();
        previewStatus.textContent = '♪ Playing a preview';
      }
    })
    .catch(() => {});
}

// ── Add artist ─────────────────────────────────────────────────────────────

function addArtist() {
  const labelInput = document.getElementById('add-label');
  const searchInput = document.getElementById('add-search');
  const confirmation = document.getElementById('add-confirmation');

  const label = labelInput.value.trim();
  const search = searchInput.value.trim();
  if (!label) return;

  fetch('/add_artist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, search: search || label })
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        labelInput.value = '';
        searchInput.value = '';
        confirmation.textContent = `"${label}" added for this session`;
        confirmation.classList.add('visible');
        setTimeout(() => confirmation.classList.remove('visible'), 2500);
      }
    })
    .catch(() => {});
}

// Allow Enter key in add-artist inputs
function handleAddKey(e) {
  if (e.key === 'Enter') addArtist();
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initializeTitle);
