/**
 * frevector.com - Frontend Logic
 * Fixed: Detail panel IDs, pagination sync, and download button.
 */

const EXTRA_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];

const CATEGORIES = [
    'Abstract', 'Animals/Wildlife', 'The Arts', 'Backgrounds/Textures', 'Beauty/Fashion',
    'Buildings/Landmarks', 'Business/Finance', 'Celebrities', 'Drink', 'Education',
    'Font', 'Food', 'Healthcare/Medical', 'Holidays', 'Icon', 'Industrial',
    'Interiors', 'Logo', 'Miscellaneous', 'Nature', 'Objects', 'Parks/Outdoor',
    'People', 'Religion', 'Science', 'Signs/Symbols', 'Sports/Recreation',
    'Technology', 'Transportation', 'Vintage'
];

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedCategory: 'all',
    searchQuery: '',
    isLoading: false,
    openedVector: null,
    openedCardEl: null,
    countdownInterval: null
};

async function init() {
    setupCategories();
    setupEventListeners();
    await fetchVectors();
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = 'category-item active';
    allLink.dataset.cat = 'all';
    allLink.textContent = 'All';
    allLink.addEventListener('click', (e) => { e.preventDefault(); selectCategory('all'); });
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'category-item';
        a.dataset.cat = cat;
        a.textContent = cat;
        a.addEventListener('click', (e) => { e.preventDefault(); selectCategory(cat); });
        list.appendChild(a);
    });
}

function selectCategory(cat) {
    state.selectedCategory = cat;
    state.currentPage = 1;
    state.searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    closeDetailPanel();
    document.querySelectorAll('.category-item').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === cat);
    });
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    const cat = state.selectedCategory === 'all' ? 'Vector' : state.selectedCategory;
    el.textContent = `Free ${cat} Vector, SVG, EPS & JPEG Downloads`;
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        
        const res = await fetch(url);
        const data = await res.json();

        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        renderVectors();
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No vectors found.</div>';
        return;
    }

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.setAttribute('data-slug', v.name);

        const extraKws = EXTRA_KEYWORDS.join(', ');
        const mainKws = (v.keywords || []).slice(0, 3).join(', ');
        const displayKws = mainKws ? `${extraKws}, ${mainKws}` : extraKws;

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy"
                     onerror="this.src='https://placehold.co/280x210/f5f5f5/999?text=Preview'">
            </div>
            <div class="vc-info">
                <div class="vc-title">${escHtml(v.title)}</div>
                <div class="vc-keywords">${escHtml(displayKws)}</div>
            </div>
        `;

        card.addEventListener('click', () => openDetailPanel(v, card));
        grid.appendChild(card);
    });
}

function openDetailPanel(v, cardEl) {
    state.openedVector = v;
    state.openedCardEl = cardEl;
    const panel = document.getElementById('detailPanel');
    if (!panel) {
        console.error('Detail panel element not found');
        return;
    }
    
    // Close any existing detail panel first (without clearing state)
    panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));;

    const img = document.getElementById('detailImage');
    if (img) {
        img.src = v.thumbnail;
        img.alt = v.title;
        img.onerror = () => { img.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview'; };
    }

    const titleEl = document.getElementById('detailTitle');
    const descEl = document.getElementById('detailDescription');
    const catEl = document.getElementById('detailCategory');
    const sizeEl = document.getElementById('detailFileSize');
    
    if (titleEl) titleEl.textContent = v.title;
    if (descEl) descEl.textContent = v.description || '';
    if (catEl) catEl.textContent = v.category || '-';
    if (sizeEl) sizeEl.textContent = v.fileSize || '-';

    // Breadcrumb
    const breadcrumbCatEl = document.getElementById('breadcrumbCategory');
    const breadcrumbTitleEl = document.getElementById('breadcrumbTitle');
    if (breadcrumbCatEl) {
        breadcrumbCatEl.textContent = v.category || 'All';
        breadcrumbCatEl.onclick = (e) => { e.preventDefault(); selectCategory(v.category); };
    }
    if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = v.title;

    // Keywords
    const kwContainer = document.getElementById('detailKeywords');
    if (kwContainer) {
        kwContainer.innerHTML = '';
        const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
        allKws.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'kw-tag';
            span.textContent = kw;
            span.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = kw;
                state.searchQuery = kw;
                state.currentPage = 1;
                closeDetailPanel();
                fetchVectors();
            });
            kwContainer.appendChild(span);
        });
    }

    const grid = document.getElementById('vectorsGrid');
    if (grid && cardEl) {
        // Find all cards currently in the grid
        const cards = Array.from(grid.querySelectorAll('.vector-card'));
        const cardIndex = cards.indexOf(cardEl);
        
        if (cardIndex !== -1) {
            // Find the last card in the same row
            const cardTop = cardEl.offsetTop;
            let lastInRowIndex = cardIndex;
            for (let i = cardIndex + 1; i < cards.length; i++) {
                if (cards[i].offsetTop === cardTop) {
                    lastInRowIndex = i;
                } else {
                    break;
                }
            }
            
            // Insert panel after the last card in the row
            if (lastInRowIndex < cards.length) {
                cards[lastInRowIndex].after(panel);
            } else {
                grid.appendChild(panel);
            }
        } else {
            grid.appendChild(panel);
        }
    } else if (grid) {
        grid.appendChild(panel);
    }

    panel.style.display = 'block';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    if (cardEl) cardEl.classList.add('card-active');

    setTimeout(() => { 
        try {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
        } catch (e) {
            console.error('Scroll error:', e);
        }
    }, 50);
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    state.openedVector = null;
    state.openedCardEl = null;
}

function updatePagination() {
    const pageNumEl = document.getElementById('pageNumber');
    const pageTotalEl = document.getElementById('pageTotal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (pageNumEl) pageNumEl.textContent = state.currentPage;
    if (pageTotalEl) pageTotalEl.textContent = `/ ${state.totalPages}`;
    
    if (prevBtn) prevBtn.disabled = state.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = state.currentPage >= state.totalPages;
}

function setupEventListeners() {
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        state.searchQuery = searchInput ? searchInput.value.trim() : '';
        state.currentPage = 1;
        fetchVectors();
    });
    document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            state.searchQuery = e.target.value.trim();
            state.currentPage = 1;
            fetchVectors();
        }
    });
    
    document.getElementById('detailCloseBtn')?.addEventListener('click', closeDetailPanel);
    
    document.getElementById('detailDownloadBtn')?.addEventListener('click', () => {
        if (!state.openedVector) {
            console.error('No vector selected');
            return;
        }
        openDownloadPage(state.openedVector);
    });

    document.getElementById('dpClose')?.addEventListener('click', closeDownloadPage);

    document.getElementById('dpDownloadBtn')?.addEventListener('click', () => {
        if (!state.openedVector) {
            console.error('No vector selected for download');
            return;
        }
        startDownloadCountdown();
    });

    document.getElementById('prevBtn')?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            fetchVectors();
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            fetchVectors();
        }
    });

    document.getElementById('breadcrumbHome')?.addEventListener('click', (e) => {
        e.preventDefault();
        selectCategory('all');
    });
}

function openDownloadPage(vector) {
    const page = document.getElementById('downloadPage');
    if (!page) return;

    // Set content
    const titleEl = document.getElementById('dpTitle');
    const descEl = document.getElementById('dpDescription');
    const imgEl = document.getElementById('dpImage');
    const catEl = document.getElementById('dpCategory');
    const sizeEl = document.getElementById('dpFileSize');
    const kwContainer = document.getElementById('dpKeywords');

    if (titleEl) titleEl.textContent = vector.title;
    if (descEl) descEl.textContent = vector.description || '';
    
    // Update header info
    const headerTitleEl = document.getElementById('dpHeaderTitle');
    const headerDescEl = document.getElementById('dpHeaderDesc');
    if (headerTitleEl) headerTitleEl.textContent = `Free ${vector.category || ''} Vector, SVG, EPS & JPEG Downloads`;
    if (headerDescEl) headerDescEl.textContent = vector.description || '';
    
    if (imgEl) {
        imgEl.src = vector.thumbnail;
        imgEl.alt = vector.title;
        imgEl.onerror = () => { imgEl.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview'; };
    }
    if (catEl) catEl.textContent = vector.category || '-';
    if (sizeEl) sizeEl.textContent = vector.fileSize || '-';

    // Keywords
    if (kwContainer) {
        kwContainer.innerHTML = '';
        const allKws = [...EXTRA_KEYWORDS, ...(vector.keywords || [])];
        allKws.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'dp-kw';
            span.textContent = kw;
            kwContainer.appendChild(span);
        });
    }

    // Reset countdown box
    const countdownBox = document.getElementById('dpCountdownBox');
    const countdownNum = document.getElementById('dpCountdown');
    const downloadBtn = document.getElementById('dpDownloadBtn');
    const countdownStatus = document.getElementById('dpCountdownStatus');
    if (countdownBox) countdownBox.style.display = 'none';
    if (countdownNum) countdownNum.textContent = '4';
    if (countdownStatus) countdownStatus.textContent = 'Your download will start in';
    if (downloadBtn) downloadBtn.style.display = 'block';

    // Show download page
    page.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDownloadPage() {
    const page = document.getElementById('downloadPage');
    if (page) page.style.display = 'none';
    document.body.style.overflow = '';
    
    // Stop countdown if running
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
    }
    state.openedVector = null;
}

function startDownloadCountdown() {
    if (!state.openedVector) {
        console.error('No vector for countdown');
        return;
    }

    const downloadBtn = document.getElementById('dpDownloadBtn');
    const countdownBox = document.getElementById('dpCountdownBox');
    const countdownNum = document.getElementById('dpCountdown');
    const countdownStatus = document.getElementById('dpCountdownStatus');

    if (downloadBtn) downloadBtn.style.display = 'none';
    if (countdownBox) countdownBox.style.display = 'block';
    if (countdownStatus) countdownStatus.textContent = 'Your download will start in';

    let count = 4;
    if (countdownNum) countdownNum.textContent = count;

    // Stop any existing countdown
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
    }

    state.countdownInterval = setInterval(() => {
        count--;
        if (countdownNum) countdownNum.textContent = count;

        if (count <= 0) {
            clearInterval(state.countdownInterval);
            state.countdownInterval = null;
            
            // Trigger download
            if (state.openedVector) {
                triggerDownload(state.openedVector);
            }
        }
    }, 1000);
}

function triggerDownload(vector) {
    try {
        // Use the download API endpoint which increments counter
        const downloadUrl = `/api/download?slug=${encodeURIComponent(vector.name)}`;
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        const fileName = vector.name || 'vector';
        a.download = fileName + '.zip';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            try { document.body.removeChild(a); } catch (e) {}
        }, 100);
    } catch (err) {
        console.error('Download error:', err);
        alert('Download başlatılamadı. Lütfen tekrar deneyin.');
    }
}

function showLoader(show) {
    const l = document.getElementById('loader');
    if (l) l.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
