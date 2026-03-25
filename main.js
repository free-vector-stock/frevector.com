/**
 * frevector.com - Frontend Logic
 * v2026031413 - TAM ENTEGRE: kategoriler, görseller, shuffle, sonsuz kaydırma, download fix, memory cache
 */

const CATEGORIES = [
  'Abstract','Animals','The Arts','Backgrounds','Fashion','Buildings','Business','Celebrities',
  'Education','Food','Drink','Medical','Holidays','Industrial','Interiors','Miscellaneous',
  'Nature','Objects','Outdoor','People','Religion','Science','Symbols','Sports',
  'Technology','Transportation','Vintage','Logo','Font','Icon'
];

const state = {
  vectors: [],
  currentPage: 1,
  totalPages: 1,
  total: 0,
  selectedCategory: 'all',
  selectedType: 'all',
  searchQuery: '',
  isLoading: false,
  ourPicksOffset: 0
};

async function init() {
  setupCategories();
  setupEventListeners();
  setupOurPicksArrows();
  setupDownloadPageHandlers();
  await fetchVectors();
}

function setupCategories() {
  const list = document.getElementById('categoriesList');
  if (!list) return;
  list.innerHTML = '';
  ['all','vector','jpeg',...CATEGORIES].forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.toUpperCase();
    btn.onclick = () => { state.selectedCategory = cat; state.currentPage=1; fetchVectors(); };
    list.appendChild(btn);
  });
}

function updateCategoryTitle() {
  const el = document.getElementById('categoryTitle');
  if (!el) return;
  let h1Text = state.selectedCategory === 'all'
    ? 'Free Vectors, SVGs, Icons and Clipart'
    : `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
  el.innerHTML = `<h1 style="font-family:'Inter',sans-serif;font-weight:600;">${h1Text}</h1>`;
}

async function fetchVectors() {
  if (state.isLoading) return;
  state.isLoading = true;
  try {
    const url = new URL('/api/vectors', window.location.origin);
    url.searchParams.set('page', state.currentPage);
    url.searchParams.set('limit','24');
    if (state.selectedCategory!=='all') url.searchParams.set('category',state.selectedCategory);
    if (state.selectedType!=='all') url.searchParams.set('type',state.selectedType);
    if (state.searchQuery) url.searchParams.set('search',state.searchQuery);

    const res = await fetch(url);
    const data = await res.json();

    if (!window.cachedVectorsData) window.cachedVectorsData = { pages: {} };
    window.cachedVectorsData.pages[state.currentPage] = data;

    state.vectors = data.vectors || [];
    state.totalPages = data.totalPages || 1;
    state.total = data.total || 0;

    renderVectors();
    renderOurPicks();
    updateCategoryTitle();
    updatePagination();
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    state.isLoading = false;
  }
}

function renderVectors() {
  const grid = document.getElementById('vectorsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  state.vectors.forEach(v => {
    const card = document.createElement('div');
    card.className = 'vector-card';
    const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
    card.innerHTML = `
      <div class="vc-img-wrap">
        <img class="vc-img" src="${v.thumbnail}" alt="${v.title}" loading="lazy">
        ${typeLabel}
      </div>
    `;
    card.onclick = () => showDownloadPage(v);
    grid.appendChild(card);
  });
}

function renderOurPicks() {
  const track = document.getElementById('ourPicksTrack');
  if (!track) return;
  track.innerHTML = '';

  let allVectors = [];
  if (window.cachedVectorsData && window.cachedVectorsData.pages) {
    Object.values(window.cachedVectorsData.pages).forEach(page => {
      if (page.vectors) allVectors = allVectors.concat(page.vectors);
    });
  } else {
    allVectors = state.vectors.slice();
  }

  allVectors = allVectors.sort(() => Math.random() - 0.5);

  allVectors.forEach(v => {
    const card = document.createElement('div');
    card.className = 'vector-card';
    const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
    card.innerHTML = `
      <div class="vc-img-wrap">
        <img class="vc-img" src="${v.thumbnail}" alt="${v.title}" loading="lazy">
        ${typeLabel}
      </div>
    `;
    card.onclick = () => showDownloadPage(v);
    track.appendChild(card);
  });

  state.ourPicksOffset = 0;
  track.style.transform = `translateX(0px)`;
}

function scrollOurPicks(direction) {
  const track = document.getElementById('ourPicksTrack');
  if (!track) return;

  const cardWidth = 160;
  state.ourPicksOffset += direction * cardWidth;

  const totalWidth = track.scrollWidth;
  const visibleWidth = track.parentElement.offsetWidth;

  if (state.ourPicksOffset < 0) {
    state.ourPicksOffset = totalWidth - visibleWidth;
  } else if (state.ourPicksOffset > totalWidth - visibleWidth) {
    state.ourPicksOffset = 0;
  }

  track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
}

function setupOurPicksArrows() {
  const prev = document.getElementById('ourPicksPrev');
  const next = document.getElementById('ourPicksNext');
  if (prev) prev.onclick = () => scrollOurPicks(-1);
  if (next) next.onclick = () => scrollOurPicks(1);
}

function showDownloadPage(v) {
  const dp = document.getElementById('downloadPage');
  if (!dp) return;

  document.getElementById('dpImage').src = v.thumbnail;
  document.getElementById('dpTitle').textContent = v.title;
  document.getElementById('dpDescription').textContent = v.description || '';
  document.getElementById('dpCategory').textContent = v.category || '-';
  document.getElementById('dpFileSize').textContent = v.fileSize || '-';
  document.getElementById('dpFileFormat').textContent = v.isJpegOnly ? 'JPEG' : 'VECTOR';

  const downloadBtn = document.getElementById('dpDownloadBtn');
  downloadBtn.onclick = () => {
    let url = v.downloadUrl || `/download/${v.id}`;
    window.open(url, '_blank');
  };

  dp.style.display = 'block';
}

function setupDownloadPageHandlers() {
  const closeBtn = document.getElementById('dpClose');
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById('downloadPage').style.display = 'none';
    };
  }
}

function updatePagination() {
  const pageNumber = document.getElementById('pageNumber');
  const pageTotal = document.getElementById('pageTotal');
  if (pageNumber) pageNumber.textContent = state.currentPage;
  if (pageTotal) pageTotal.textContent = `/ ${state.totalPages}`;
}

function setupEventListeners() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.onclick = () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      fetchVectors();
    }
  };
  if (nextBtn) nextBtn.onclick = () => {
    if (state.currentPage < state.totalPages) {
      state.currentPage++;
      fetchVectors();
    }
  };
}

document.addEventListener('DOMContentLoaded', init);
