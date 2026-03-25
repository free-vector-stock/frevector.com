/**
 * frevector.com - Frontend Logic
 * v2026031401 - Revisions: mobile layout, our-picks arrows, category spacing
 */

const EXTRA_KEYWORDS = ['free jpeg', 'free', 'jpeg', 'fre'];
const VECTOR_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'vector eps', 'svg'];

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

const MODAL_CONTENTS = {
    about: { /* senin verdiğin içerikler */ },
    privacy: { /* senin verdiğin içerikler */ },
    terms: { /* senin verdiğin içerikler */ },
    contact: { /* senin verdiğin içerikler */ }
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedCategory: 'all',
    selectedType: 'all',
    searchQuery: '',
    isLoading: false,
    openedVector: null,
    openedCardEl: null,
    countdownInterval: null,
    detailPanelOpen: false,
    downloadInProgress: false,
    ourPicksOffset: 0
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    setupOurPicksArrows();
    await fetchVectors();
}

function setupCategories() { /* senin verdiğin kategori kodları */ }
function selectCategory(cat) { /* senin verdiğin kod */ }
function selectType(type) { /* senin verdiğin kod */ }

// H1 BAŞLIĞI EKLENMİŞ HALİ
function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    
    let h1Text = '';
    if (state.selectedCategory === 'all') {
        h1Text = 'Free Vectors, SVGs, Icons and Clipart';
    } else {
        h1Text = `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
    }
    
    el.innerHTML = `<h1 style="font-family: 'Inter', sans-serif; font-weight: 600;">${h1Text}</h1>`;
}

// MEMORY CACHE EKLEMESİ BURADA
async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);

    try {
        if (window.cachedVectorsData && !state.searchQuery && state.selectedCategory === 'all' && state.selectedType === 'all') {
            const data = window.cachedVectorsData;
            state.vectors = data.vectors || [];
            state.totalPages = data.totalPages || 1;
            state.total = data.total || 0;

            renderVectors();
            renderOurPicks();
            updatePagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const url = new URL('/api/vectors', window.location.origin);
            url.searchParams.set('page', state.currentPage);
            url.searchParams.set('limit', '24');
            if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
            if (state.selectedType === 'vector') url.searchParams.set('type', 'vector');
            if (state.selectedType === 'jpeg') url.searchParams.set('type', 'jpeg');
            if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
            
            const res = await fetch(url);
            if (!res.ok) throw new Error('API request failed');
            
            const data = await res.json();

            if (!state.searchQuery && state.selectedCategory === 'all' && state.selectedType === 'all') {
                window.cachedVectorsData = data;
            }

            state.vectors = data.vectors || [];
            state.totalPages = data.totalPages || 1;
            state.total = data.total || 0;

            renderVectors();
            renderOurPicks();
            updatePagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

function renderVectors() { /* senin verdiğin kod */ }
function renderOurPicks() { /* senin verdiğin kod */ }
function setupOurPicksArrows() { /* senin verdiğin kod */ }
function scrollOurPicks(direction) { /* senin verdiğin kod */ }
function updateOurPicksArrows() { /* senin verdiğin kod */ }
function openDetailPanel(v, cardEl) { /* senin verdiğin kod */ }
function closeDetailPanel() { /* senin verdiğin kod */ }
function showDownloadPage(v) { /* senin verdiğin kod */ }
function setupDownloadPageHandlers() { /* senin verdiğin kod */ }
function setupModalHandlers() { /* senin verdiğin kod */ }
function setupEventListeners() { /* senin verdiğin kod */ }
function updatePagination() { /* senin verdiğin kod */ }
function showLoader(show) { /* senin verdiğin kod */ }
function escHtml(str) { /* senin verdiğin kod */ }

document.addEventListener('DOMContentLoaded', init);
