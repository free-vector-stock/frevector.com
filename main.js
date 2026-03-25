/**
 * frevector.com - Frontend Logic
 * v2026031401 - Revisions: mobile layout, our-picks arrows, category spacing
 */

const EXTRA_KEYWORDS = ['free jpeg', 'free', 'jpeg', 'fre'];
const VECTOR_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'vector eps', 'svg'];

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
    await fetchVectors();
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
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);

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
    } finally {
        state.isLoading = false;
    }
}

function renderVectors() { /* senin verdiğin kod */ }

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
        const typeLabel = v.isJ
