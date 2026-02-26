/**
 * frevector.com - Frontend Logic
 * Mevcut KV verilerine (all_vectors) tam uyumlu ve "ANASAYFA DÜZENİ" görseline uygun
 */

const state = {
    allVectors: [],
    categories: [],
    selectedCategory: 'all',
    currentPage: 1,
    totalPages: 1,
    searchQuery: '',
    isLoading: false,
    featured: null
};

// --- BAŞLATMA ---
async function init() {
    setupEventListeners();
    await fetchCategories();
    await fetchVectors();
}

// --- VERİ ÇEKME ---
async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        state.categories = data.categories || [];
        renderCategories();
    } catch (e) {
        console.error("Kategori çekme hatası:", e);
    }
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('category', state.selectedCategory);
        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);

        const response = await fetch(url);
        const data = await response.json();

        state.allVectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        
        // Set featured item (first item on page 1)
        if (state.currentPage === 1 && state.allVectors.length > 0) {
            state.featured = state.allVectors[0];
            renderFeatured();
            renderSelectedForYou();
            renderKeywords();
        }
        
        renderVectors();
        updatePagination();
        updateCategoryTitle();
    } catch (e) {
        console.error("Vektör çekme hatası:", e);
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

// --- RENDER FONKSİYONLARI ---
function renderCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;

    list.innerHTML = '';
    
    // "All" kategorisi
    const allItem = createCategoryItem('All', 'all');
    list.appendChild(allItem);

    state.categories.forEach(cat => {
        const item = createCategoryItem(cat.name, cat.name);
        list.appendChild(item);
    });
}

function createCategoryItem(name, value) {
    const a = document.createElement('a');
    a.href = '#';
    a.className = `category-item ${state.selectedCategory === value ? 'active' : ''}`;
    a.textContent = name;
    a.onclick = (e) => {
        e.preventDefault();
        state.selectedCategory = value;
        state.currentPage = 1;
        state.searchQuery = '';
        document.getElementById('searchInput').value = '';
        fetchVectors();
        renderCategories();
    };
    return a;
}

function renderFeatured() {
    if (!state.featured) return;

    const v = state.featured;
    document.getElementById('featuredImage').src = v.thumbnail;
    document.getElementById('featuredTitle').textContent = v.title;
    document.getElementById('featuredDescription').textContent = v.description;
    document.getElementById('featuredCategory').textContent = v.category;
    document.getElementById('featuredFileSize').textContent = v.fileSize || '1.8 MB';

    const kwList = document.getElementById('featuredKeywords');
    kwList.innerHTML = '';
    (v.keywords || []).slice(0, 8).forEach(kw => {
        const span = document.createElement('span');
        span.className = 'keyword-badge';
        span.textContent = kw;
        kwList.appendChild(span);
    });
}

function renderSelectedForYou() {
    const grid = document.getElementById('selectedGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    // Show 10 random items from all vectors
    const randomItems = state.allVectors.sort(() => Math.random() - 0.5).slice(0, 10);
    
    randomItems.forEach(v => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        item.innerHTML = `<img src="${v.thumbnail}" alt="${v.title}" onerror="this.src='https://placehold.co/150x120/1a1a1a/666666?text=Preview'">`;
        item.onclick = () => selectFeatured(v);
        grid.appendChild(item);
    });
}

function renderKeywords() {
    const list = document.getElementById('keywordsList');
    if (!list) return;

    list.innerHTML = '';
    
    // Get all unique keywords from all vectors
    const allKeywords = new Set();
    state.allVectors.forEach(v => {
        (v.keywords || []).forEach(kw => allKeywords.add(kw));
    });

    // Show first 20 keywords
    Array.from(allKeywords).slice(0, 20).forEach(kw => {
        const btn = document.createElement('button');
        btn.className = 'keyword-btn';
        btn.textContent = kw;
        btn.onclick = (e) => {
            e.preventDefault();
            document.getElementById('searchInput').value = kw;
            state.searchQuery = kw;
            state.currentPage = 1;
            fetchVectors();
        };
        list.appendChild(btn);
    });
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (state.allVectors.length === 0) {
        grid.innerHTML = '<div class="no-results">No vectors found matching your criteria.</div>';
        return;
    }

    state.allVectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="vector-image-container">
                <img src="${v.thumbnail}" alt="${v.title}" class="vector-image" onerror="this.src='https://placehold.co/150x120/1a1a1a/666666?text=Preview'">
            </div>
            <div class="vector-info">
                <div class="vector-title">${v.title}</div>
                <div class="vector-keywords">${(v.keywords || []).slice(0, 2).join(', ')}</div>
            </div>
        `;
        card.onclick = () => selectFeatured(v);
        grid.appendChild(card);
    });
}

function selectFeatured(vector) {
    state.featured = vector;
    renderFeatured();
    // Scroll to featured section
    document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
}

function updatePagination() {
    const pageInput = document.getElementById('pageInput');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPageCount = document.getElementById('totalPageCount');
    
    if (pageInput) pageInput.value = state.currentPage;
    if (currentPageSpan) currentPageSpan.textContent = state.currentPage;
    if (totalPageCount) totalPageCount.textContent = state.totalPages;
}

function updateCategoryTitle() {
    const title = document.getElementById('categoryTitle');
    if (!title) return;
    
    const catName = state.selectedCategory === 'all' ? 'All' : state.selectedCategory;
    title.textContent = `Free ${catName} Vector, SVG, EPS & JPEG Downloads`;
}

// --- DOWNLOAD ---
function downloadFeatured() {
    if (state.featured) {
        window.location.href = `/api/download?slug=${state.featured.name}`;
    }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Arama
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.oninput = (e) => {
            state.searchQuery = e.target.value;
            state.currentPage = 1;
            clearTimeout(window.searchTimer);
            window.searchTimer = setTimeout(fetchVectors, 300);
        };
    }

    // Sayfalama
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInput = document.getElementById('pageInput');

    if (prevBtn) prevBtn.onclick = () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            fetchVectors();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (nextBtn) nextBtn.onclick = () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            fetchVectors();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (pageInput) pageInput.onchange = (e) => {
        let val = parseInt(e.target.value);
        if (val >= 1 && val <= state.totalPages) {
            state.currentPage = val;
            fetchVectors();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            pageInput.value = state.currentPage;
        }
    };

    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = downloadFeatured;
    }

    // Logo yenileme
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.onclick = (e) => {
            e.preventDefault();
            window.location.reload();
        };
    }
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', init);
