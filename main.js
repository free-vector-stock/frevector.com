/**
 * frevector.com - Frontend Logic
 * Mevcut KV verilerine (all_vectors) tam uyumlu
 */

const state = {
    allVectors: [],
    categories: [],
    selectedCategory: 'all',
    currentPage: 1,
    totalPages: 1,
    searchQuery: '',
    isLoading: false
};

// --- BAŞLATMA ---
async function init() {
    setupEventListeners();
    startBannerAnimation();
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
        
        renderVectors();
        updatePagination();
        updateCategoryTitle();
    } catch (e) {
        console.error("Vektör çekme hatası:", e);
        showLoader(false);
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
                <img src="${v.thumbnail}" alt="${v.title}" class="vector-image" onerror="this.src='https://placehold.co/400x300/1a1a1a/666666?text=Preview'">
            </div>
            <div class="vector-info">
                <div class="vector-title">${v.title}</div>
                <div class="vector-keywords">${(v.keywords || []).slice(0, 3).join(', ')}</div>
            </div>
        `;
        card.onclick = () => openDownloadModal(v.name);
        grid.appendChild(card);
    });
}

function updatePagination() {
    const pageInput = document.getElementById('pageInput');
    const totalPageCount = document.getElementById('totalPageCount');
    
    if (pageInput) pageInput.value = state.currentPage;
    if (totalPageCount) totalPageCount.textContent = `/ ${state.totalPages}`;
}

function updateCategoryTitle() {
    const title = document.getElementById('categoryTitle');
    if (!title) return;
    
    const catName = state.selectedCategory === 'all' ? 'All' : state.selectedCategory;
    title.textContent = `Free ${catName} Vector, SVG, EPS & JPEG Downloads`;
}

// --- MODAL VE İNDİRME ---
async function openDownloadModal(slug) {
    const modal = document.getElementById('downloadModal');
    if (!modal) return;

    showLoader(true);
    try {
        const response = await fetch(`/api/vectors?slug=${slug}`);
        const v = await response.json();

        document.getElementById('modalImage').src = v.thumbnail;
        document.getElementById('modalTitle').textContent = v.title;
        document.getElementById('modalDescription').textContent = v.description;
        document.getElementById('modalCategory').textContent = v.category;
        document.getElementById('modalFileSize').textContent = v.fileSize || '1.8 MB';
        
        const kwList = document.getElementById('modalKeywords');
        kwList.innerHTML = '';
        const allKws = ["free", "svg", "eps", "vector", ...(v.keywords || [])];
        allKws.slice(0, 10).forEach(kw => {
            const span = document.createElement('span');
            span.className = 'keyword-badge';
            span.textContent = kw;
            kwList.appendChild(span);
        });

        modal.style.display = 'flex';
        document.body.classList.add('no-scroll');

        // Geri sayım ve indirme
        let count = 4;
        const countdownDisplay = document.getElementById('countdownDisplay');
        countdownDisplay.textContent = count;

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                countdownDisplay.textContent = count;
            } else {
                clearInterval(timer);
                // Otomatik indirme
                window.location.href = `/api/download?slug=${v.name}`;
                setTimeout(() => closeModals(), 1000);
            }
        }, 1000);

        modal.dataset.timerId = timer;

    } catch (e) {
        console.error("Detay çekme hatası:", e);
    } finally {
        showLoader(false);
    }
}

function closeModals() {
    const downloadModal = document.getElementById('downloadModal');
    
    if (downloadModal) {
        downloadModal.style.display = 'none';
        if (downloadModal.dataset.timerId) clearInterval(parseInt(downloadModal.dataset.timerId));
    }
    
    document.body.classList.remove('no-scroll');
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
        }
    };

    if (nextBtn) nextBtn.onclick = () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            fetchVectors();
        }
    };

    if (pageInput) pageInput.onchange = (e) => {
        let val = parseInt(e.target.value);
        if (val >= 1 && val <= state.totalPages) {
            state.currentPage = val;
            fetchVectors();
        } else {
            pageInput.value = state.currentPage;
        }
    };

    // Modal kapatma
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    };

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.onclick = closeModals;
    });

    // Logo yenileme
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.onclick = (e) => {
            e.preventDefault();
            window.location.reload();
        };
    }
}

// --- BANNER ANİMASYONU ---
function startBannerAnimation() {
    const texts = document.querySelectorAll('.animated-text');
    if (texts.length === 0) return;

    let current = 0;
    setInterval(() => {
        texts[current].classList.remove('active');
        current = (current + 1) % texts.length;
        texts[current].classList.add('active');
    }, 5000);
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', init);
