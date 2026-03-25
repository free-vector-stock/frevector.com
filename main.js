/**
 * frevector.com - Frontend Logic
 * v2026031411 - Categories, shuffle, infinite scroll, download fix
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
    updateCategoryTitle
