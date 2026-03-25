/**
 * frevector.com - Frontend Logic
 * v2026032502 - Full Integration: Dark Mode, Performance, Smooth Transitions
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
            <p style="margin-bottom:12px;">All files can be used in both personal and commercial projects.</p>
            <p>Frevector is a platform that values labor, original production, and an ethical approach to design.</p>
        `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `
            <h2 style="margin-bottom:16px;">Privacy Policy</h2>
            <p style="margin-bottom:12px;">As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>
        `
    },
    terms: {
        title: 'Terms of Service',
        content: `
            <h2 style="margin-bottom:16px;">Terms of Service</h2>
            <p style="margin-bottom:12px;">All graphic designs on the site are original works prepared by Frevector artists. Downloaded files can be used in personal and commercial projects.</p>
        `
    },
    contact: {
        title: 'Contact',
        content: `
            <h2 style="margin-bottom:16px;">Contact</h2>
            <p style="margin-bottom:16px;"><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:inherit;text-decoration:underline;">hakankacar2014@gmail.com</a></p>
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
    ourPicksOffset: 0
};

// --- INITIALIZATION ---
async function init() {
    setupTheme(); // Dark mode başlatıcı
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    setupOurPicksArrows();
    await fetchVectors();
}

// --- DARK MODE LOGIC ---
function setupTheme() {
    const btn = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!btn || !icon) return;

    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.textContent = '☀️';
    }

    btn.onclick = (e) => {
        e.preventDefault();
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            icon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            icon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    };
}

// --- CATEGORY & UI SETUP ---
function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        const typeContainer = document.createElement('div');
        typeContainer.style = 'padding:0 16px 8px; margin-bottom:8px; border-bottom:1px solid var(--border-color);';
        
        const typeLabel = document.createElement('div');
        typeLabel.style = 'font-size:10px; font-weight:600; color:var(--text-muted); margin-bottom:4px;';
        typeLabel.textContent = 'TYPE';
        typeContainer.appendChild(typeLabel);
        
        ['all', 'vector', 'jpeg'].forEach(t => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = `category-item ${state.selectedType === t ? 'active' : ''}`;
            a.textContent = t.toUpperCase();
            a.onclick = (e) => { e.preventDefault(); selectType(t); };
            typeContainer.appendChild(a);
        });
        list.appendChild(typeContainer);
    }

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
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
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

// --- DATA FETCHING ---
async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showSkeleton(true);

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        
        const res = await fetch(url);
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
            <div class="skeleton-card" style="height:220px; border-radius:8px; background:var(--card-bg); opacity:0.6;"></div>
        `).join('');
    }
}

// --- RENDERING ---
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
        card.className = 'vector-card fade-in';
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
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
    
    state.vectors.slice(0, 15).forEach(v => {
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
}

// --- PANELS & MODALS ---
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
                <div class="detail-meta">
                    <p><strong>Format:</strong> ${fileFormat}</p>
                    <p><strong>License:</strong> Free for Personal & Commercial Use</p>
                </div>
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

// --- EVENT HANDLERS ---
function setupEventListeners() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');
    if (input) input.onkeydown = (e) => { if (e.key === 'Enter') { state.searchQuery = input.value; state.currentPage = 1; fetchVectors(); } };
    if (btn) btn.onclick = () => { state.searchQuery = input.value; state.currentPage = 1; fetchVectors(); };

    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function setupOurPicksArrows() {
    const prev = document.getElementById('ourPicksPrev');
    const next = document.getElementById('ourPicksNext');
    if (!prev || !next) return;
    prev.onclick = () => document.getElementById('ourPicksTrack').scrollBy({ left: -250, behavior: 'smooth' });
    next.onclick = () => document.getElementById('ourPicksTrack').scrollBy({ left: 250, behavior: 'smooth' });
}

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

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
