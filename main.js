/**
 * frevector.com - Frontend Logic
 * v2026032501 - Revisions: Performance Optimization, Smooth Transitions, Skeleton Loaders
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
    about: {
        title: 'About Us',
        content: `
            <h2 style="margin-bottom:16px;">About Us</h2>
            <p style="margin-bottom:12px;">Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
            <p style="margin-bottom:12px;">The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists.</p>
            <p style="margin-bottom:12px;">Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control.</p>
            <p style="margin-bottom:12px;">All files can be used in both personal and commercial projects.</p>
            <p>Frevector is a platform that values labor, original production, and an ethical approach to design.</p>
        `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `
            <h2 style="margin-bottom:16px;">Privacy Policy</h2>
            <p style="margin-bottom:12px;">As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Data Collected</h3>
            <p style="margin-bottom:8px;">Collected data may include: Cookies, Browser/Device info, IP address, and interaction data for analytical purposes.</p>
        `
    },
    terms: {
        title: 'Terms of Service',
        content: `
            <h2 style="margin-bottom:16px;">Terms of Service</h2>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Content Ownership</h3>
            <p style="margin-bottom:12px;">All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">2. Right of Use</h3>
            <p style="margin-bottom:12px;">Downloaded files can be used in personal and commercial projects. Redistribution is prohibited.</p>
        `
    },
    contact: {
        title: 'Contact',
        content: `
            <h2 style="margin-bottom:16px;">Contact</h2>
            <p style="margin-bottom:16px;"><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000;text-decoration:underline;">hakankacar2014@gmail.com</a></p>
        `
    }
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

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    const isMobile = window.innerWidth <= 768;

    // Type Selector (Vector/JPEG)
    if (!isMobile) {
        const typeContainer = document.createElement('div');
        typeContainer.className = 'type-filter-container';
        typeContainer.style = 'padding:0 16px 8px; margin-bottom:8px; border-bottom:1px solid #ddd;';
        
        const typeLabel = document.createElement('div');
        typeLabel.style = 'font-size:10px; font-weight:600; color:#666; margin-bottom:4px;';
        typeLabel.textContent = 'TYPE';
        typeContainer.appendChild(typeLabel);
        
        ['all', 'vector', 'jpeg'].forEach(t => {
            const btn = document.createElement('a');
            btn.href = '#';
            btn.className = `category-item ${state.selectedType === t ? 'active' : ''}`;
            btn.textContent = t.toUpperCase();
            btn.onclick = (e) => { e.preventDefault(); selectType(t); };
            typeContainer.appendChild(btn);
        });
        list.appendChild(typeContainer);
    }

    // Categories
    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = `category-item ${state.selectedCategory === 'all' ? 'active' : ''}`;
    allLink.textContent = 'All Categories';
    allLink.onclick = (e) => { e.preventDefault(); selectCategory('all'); };
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = `category-item ${state.selectedCategory === cat ? 'active' : ''}`;
        a.textContent = cat;
        a.onclick = (e) => { e.preventDefault(); selectCategory(cat); };
        list.appendChild(a);
    });
}

function selectCategory(cat) {
    state.selectedCategory = cat;
    state.currentPage = 1;
    resetSearchAndFetch();
}

function selectType(type) {
    state.selectedType = type;
    state.currentPage = 1;
    resetSearchAndFetch();
}

function resetSearchAndFetch() {
    state.searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    closeDetailPanel();
    setupCategories();
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    el.textContent = state.selectedCategory === 'all' 
        ? 'Free Vectors, SVGs, Icons and Clipart' 
        : `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showSkeleton(true); // Gerçekçi bir yükleme hissi için Skeleton ekledik

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('API failed');
        
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        renderVectors();
        renderOurPicks();
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        state.isLoading = false;
        showSkeleton(false);
    }
}

function showSkeleton(show) {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    if (show) {
        grid.innerHTML = Array(12).fill(0).map(() => `
            <div class="skeleton-card" style="height:200px; background:#f0f0f0; border-radius:8px; animation: pulse 1.5s infinite;"></div>
        `).join('');
    }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No results found.</div>';
        return;
    }

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card fade-in'; // Geçiş efekti eklendi
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy" onload="this.classList.add('loaded')">
                ${typeLabel}
            </div>
            <div class="vc-info">
                <div class="vc-description">${escHtml(v.description || "")}</div>
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

function renderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track || !state.vectors.length) return;
    track.innerHTML = '';
    
    state.vectors.slice(0, 20).forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
                ${typeLabel}
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        track.appendChild(card);
    });
    updateOurPicksArrows();
}

function openDetailPanel(v, cardEl) {
    if (state.openedVector && state.openedVector.name === v.name) {
        closeDetailPanel();
        return;
    }

    closeDetailPanel();
    state.openedVector = v;
    state.openedCardEl = cardEl;
    cardEl.classList.add('card-active');

    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel slide-down';
    
    const fileFormat = v.isJpegOnly ? 'JPEG' : 'EPS, SVG, JPEG';

    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left">
                <img class="detail-img" src="${v.thumbnail}" alt="${escHtml(v.title)}">
            </div>
            <div class="detail-right">
                <h2 class="detail-title">${escHtml(v.title)}</h2>
                <p class="detail-desc">${escHtml(v.description || "")}</p>
                <table class="detail-table">
                    <tr><td class="dt-label">FORMAT</td><td class="dt-value">${fileFormat}</td></tr>
                    <tr><td class="dt-label">LICENSE</td><td class="dt-value">Free for Personal & Commercial Use</td></tr>
                </table>
                <div style="margin-top: 20px; display: flex; gap: 12px;">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD</button>
                    <button class="detail-close-btn" id="mainCloseBtn">Close</button>
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.children);
    const index = cards.indexOf(cardEl);
    const columns = window.innerWidth >= 1200 ? 6 : (window.innerWidth >= 768 ? 4 : 1);
    const insertAfterIndex = Math.min(cards.length - 1, Math.floor(index / columns) * columns + (columns - 1));
    grid.insertBefore(panel, cards[insertAfterIndex] ? cards[insertAfterIndex].nextSibling : null);

    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.remove();
    if (state.openedCardEl) state.openedCardEl.classList.remove('card-active');
    state.openedVector = null;
    state.openedCardEl = null;
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    if (!dp) return;

    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpFileFormat').textContent = v.isJpegOnly ? 'JPEG' : 'EPS, SVG, JPEG';

    const btn = document.getElementById('dpDownloadBtn');
    const countBox = document.getElementById('dpCountdownBox');
    const countNum = document.getElementById('dpCountdown');

    btn.style.display = 'block';
    countBox.style.display = 'none';

    btn.onclick = () => {
        btn.style.display = 'none';
        countBox.style.display = 'block';
        let count = 3;
        countNum.textContent = count;
        state.countdownInterval = setInterval(() => {
            count--;
            countNum.textContent = count;
            if (count <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
                setTimeout(() => { dp.style.display = 'none'; document.body.style.overflow = ''; }, 1000);
            }
        }, 1000);
    };

    dp.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Helper: Escape HTML to prevent XSS
function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Event Listeners for Our Picks Arrows
function setupOurPicksArrows() {
    const prev = document.getElementById('ourPicksPrev');
    const next = document.getElementById('ourPicksNext');
    if (!prev || !next) return;
    prev.onclick = () => scrollPicks(-1);
    next.onclick = () => scrollPicks(1);
}

function scrollPicks(dir) {
    const track = document.getElementById('ourPicksTrack');
    const step = 200;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
}

function updateOurPicksArrows() {} // Handled by CSS/Native Scroll usually

function setupDownloadPageHandlers() {
    const close = document.getElementById('dpClose');
    if (close) close.onclick = () => {
        document.getElementById('downloadPage').style.display = 'none';
        document.body.style.overflow = '';
        clearInterval(state.countdownInterval);
    };
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const content = MODAL_CONTENTS[btn.dataset.modal];
            if (!content) return;
            document.getElementById('infoModalBody').innerHTML = content.content;
            document.getElementById('infoModal').style.display = 'flex';
        };
    });
    const close = document.getElementById('infoModalClose');
    if (close) close.onclick = () => document.getElementById('infoModal').style.display = 'none';
}

function setupEventListeners() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');
    const executeSearch = () => {
        state.searchQuery = input.value;
        state.currentPage = 1;
        fetchVectors();
    };
    if (input) input.onkeydown = (e) => { if (e.key === 'Enter') executeSearch(); };
    if (btn) btn.onclick = executeSearch;

    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

document.addEventListener('DOMContentLoaded', init);
