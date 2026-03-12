/**
 * frevector.com - Frontend Logic
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
        content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform...</p>`
    },
    privacy: {
        title: 'Privacy Policy',
        content: `<h2>PRIVACY POLICY</h2><p>As Frevector.com, we prioritize user privacy...</p>`
    },
    terms: {
        title: 'Terms of Service',
        content: `<h2>TERMS OF SERVICE</h2><p>Every visitor using Frevector.com is deemed to have accepted the following terms...</p>`
    },
    contact: {
        title: 'Contact',
        content: `<h2>Contact Us</h2><p>Email: hakankacar2014@gmail.com</p>`
    }
};

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
    countdownInterval: null,
    detailPanelOpen: false,
    downloadInProgress: false
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    await fetchVectors();
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = 'category-item' + (state.selectedCategory === 'all' ? ' active' : '');
    allLink.dataset.cat = 'all';
    allLink.textContent = 'All';
    allLink.onclick = (e) => { e.preventDefault(); selectCategory('all'); };
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.dataset.cat = cat;
        a.textContent = cat;
        a.onclick = (e) => { e.preventDefault(); selectCategory(cat); };
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
    setupCategories();
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    const cat = state.selectedCategory === 'all' ? '' : state.selectedCategory;
    el.textContent = cat || "Vector";
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
        if (!res.ok) throw new Error('API request failed');
        
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
        showLoader(false);
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
        card.className = 'vector-card';
        if (state.openedVector && state.openedVector.name === v.name) card.classList.add('card-active');
        
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
                ${typeLabel}
            </div>
            <div class="vc-info">
                <div class="vc-description">${escHtml(v.description || "")}</div>
                <div class="vc-keywords">${escHtml([...new Set([...EXTRA_KEYWORDS, ...(v.keywords || [])])].join(', '))}</div>
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
    
    state.vectors.slice(0, 10).forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        track.appendChild(card);
    });
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
    panel.className = 'detail-panel';
    
    const keywords = [...new Set([...EXTRA_KEYWORDS, ...(v.keywords || [])])];

    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left">
                <img class="detail-img" src="${v.thumbnail}" alt="${escHtml(v.title)}">
                <table class="detail-table">
                    <tr><td class="dt-label">FILE FORMAT</td><td class="dt-value">${v.isJpegOnly ? 'JPEG' : 'EPS, SVG, JPEG'}</td></tr>
                    <tr><td class="dt-label">CATEGORY</td><td class="dt-value">${escHtml(v.category)}</td></tr>
                    <tr><td class="dt-label">RESOLUTION</td><td class="dt-value">High Quality / Fully Scalable</td></tr>
                    <tr><td class="dt-label">LICENSE</td><td class="dt-value">Free for Personal & Commercial Use</td></tr>
                    <tr><td class="dt-label">FILE SIZE</td><td class="dt-value">${v.fileSize || 'N/A'}</td></tr>
                </table>
            </div>
            <div class="detail-right">
                <h2 class="detail-title">${escHtml(v.title)}</h2>
                <p class="detail-desc">${escHtml(v.description || "")}</p>
                <div class="detail-keywords">
                    ${keywords.map(kw => `<span class="kw-tag">${escHtml(kw)}</span>`).join('')}
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
    const columns = window.innerWidth >= 1200 ? 6 : (window.innerWidth >= 768 ? 4 : 2);
    const insertAfterIndex = Math.min(cards.length - 1, Math.floor(index / columns) * columns + (columns - 1));
    grid.insertBefore(panel, cards[insertAfterIndex].nextSibling);

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
    document.getElementById('dpDescription').textContent = v.description;
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpCategory').textContent = v.category;
    document.getElementById('dpFileSize').textContent = v.fileSize || 'N/A';

    const kwBox = document.getElementById('dpKeywords');
    const keywords = [...new Set([...EXTRA_KEYWORDS, ...(v.keywords || [])])];
    kwBox.innerHTML = keywords.map(kw => `<span class="kw-tag">${escHtml(kw)}</span>`).join('');

    const btn = document.getElementById('dpDownloadBtn');
    const countBox = document.getElementById('dpCountdownBox');
    const countNum = document.getElementById('dpCountdown');

    btn.style.display = 'block';
    countBox.style.display = 'none';

    btn.onclick = () => {
        btn.style.display = 'none';
        countBox.style.display = 'block';
        let count = 4;
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

function setupDownloadPageHandlers() {
    document.getElementById('dpClose').onclick = () => {
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
            document.getElementById('infoModalBody').innerHTML = content.content;
            document.getElementById('infoModal').style.display = 'flex';
        };
    });
    document.getElementById('infoModalClose').onclick = () => {
        document.getElementById('infoModal').style.display = 'none';
    };
}

function setupEventListeners() {
    const input = document.getElementById('searchInput');
    input.onkeydown = (e) => { if (e.key === 'Enter') { state.searchQuery = input.value; state.currentPage = 1; fetchVectors(); } };
    document.getElementById('searchBtn').onclick = () => { state.searchQuery = input.value; state.currentPage = 1; fetchVectors(); };
    document.getElementById('sortFilter').onchange = () => { state.currentPage = 1; fetchVectors(); };
    
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(show) {
    document.getElementById('loader').style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
