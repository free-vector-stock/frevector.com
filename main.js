/**
 * frevector.com - Frontend Logic
 * v2026031402 - Fixed: Click events, titles, and keywords display
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
        content: `<h2>About Us</h2><p>Frevector.com is an independent design platform providing original graphic resources.</p>`
    },
    privacy: {
        title: 'Privacy Policy',
        content: `<h2>Privacy Policy</h2><p>We prioritize user privacy and use cookies for performance.</p>`
    },
    terms: {
        title: 'Terms of Service',
        content: `<h2>Terms of Service</h2><p>All designs are original works. Redistribution is prohibited.</p>`
    },
    contact: {
        title: 'Contact',
        content: `<h2>Contact</h2><p>Email: <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>`
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
    ourPicksOffset: 0,
    isTransitioning: false,
    originalPicksCount: 0
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

    const typeContainer = document.createElement('div');
    typeContainer.className = 'type-filter-container';
    ['all', 'vector', 'jpeg'].forEach(t => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'category-item' + (state.selectedType === t ? ' active' : '');
        a.textContent = t.toUpperCase();
        a.onclick = (e) => { e.preventDefault(); state.selectedType = t; state.currentPage = 1; setupCategories(); fetchVectors(); };
        typeContainer.appendChild(a);
    });
    list.appendChild(typeContainer);

    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = 'category-item' + (state.selectedCategory === 'all' ? ' active' : '');
    allLink.textContent = 'All Categories';
    allLink.onclick = (e) => { e.preventDefault(); selectCategory('all'); };
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = (e) => { e.preventDefault(); selectCategory(cat); };
        list.appendChild(a);
    });
}

function selectCategory(cat) {
    state.selectedCategory = cat;
    state.currentPage = 1;
    closeDetailPanel();
    setupCategories();
    fetchVectors();
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        
        const res = await fetch(url);
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        renderVectors();
        await fetchAndRenderOurPicks();
        updatePagination();
    } catch (err) { console.error(err); }
    finally { state.isLoading = false; showLoader(false); }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const typeBadge = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        const displayKeywords = (v.keywords || []).slice(0, 3).join(', ');
        
        card.innerHTML = `
            <div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" alt="${v.title}">${typeBadge}</div>
            <div class="vc-info">
                <div class="vc-description">${v.title || "Untitled"}</div>
                <div class="vc-keywords">${displayKeywords}</div>
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;
    try {
        const res = await fetch('/api/vectors?limit=15');
        const data = await res.json();
        const picks = data.vectors || [];
        track.innerHTML = '';
        state.originalPicksCount = picks.length;
        
        const quadPicks = [...picks, ...picks, ...picks, ...picks];
        quadPicks.forEach(v => {
            const card = document.createElement('div');
            card.className = 'vector-card';
            card.innerHTML = `<div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}"></div>`;
            card.onclick = () => openDetailPanel(v, card);
            track.appendChild(card);
        });
        state.ourPicksOffset = picks.length * 90;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    } catch (err) { console.error(err); }
}

function openDetailPanel(v, cardEl) {
    closeDetailPanel();
    state.openedVector = v;
    state.openedCardEl = cardEl;
    cardEl.classList.add('card-active');

    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left"><img class="detail-img" src="${v.thumbnail}"></div>
            <div class="detail-right">
                <h2 class="detail-title">${v.title}</h2>
                <p class="detail-desc">${v.description || ""}</p>
                <div class="detail-keywords">${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}</div>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD</button>
                    <button class="detail-close-btn" id="mainCloseBtn">Close</button>
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.children);
    const index = cards.indexOf(cardEl);
    if(index === -1) { showDownloadPage(v); return; }

    const cols = window.innerWidth >= 1200 ? 6 : (window.innerWidth >= 768 ? 4 : 1);
    const insertAfter = Math.min(cards.length - 1, Math.floor(index / cols) * cols + (cols - 1));
    grid.insertBefore(panel, cards[insertAfter].nextSibling);

    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeDetailPanel() {
    const p = document.getElementById('detailPanel');
    if (p) p.remove();
    if (state.openedCardEl) state.openedCardEl.classList.remove('card-active');
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpDownloadBtn').style.display = 'block';
    document.getElementById('dpCountdownBox').style.display = 'none';
    document.getElementById('dpDownloadBtn').onclick = () => {
        document.getElementById('dpDownloadBtn').style.display = 'none';
        document.getElementById('dpCountdownBox').style.display = 'block';
        let c = 4;
        state.countdownInterval = setInterval(() => {
            c--;
            document.getElementById('dpCountdown').textContent = c;
            if (c <= 0) { clearInterval(state.countdownInterval); window.location.href = `/api/download?slug=${v.name}`; }
        }, 1000);
    };
    dp.style.display = 'flex';
}

function setupOurPicksArrows() {
    document.getElementById('ourPicksPrev').onclick = () => scrollOurPicks(-1);
    document.getElementById('ourPicksNext').onclick = () => scrollOurPicks(1);
}

function scrollOurPicks(dir) {
    if (state.isTransitioning) return;
    const track = document.getElementById('ourPicksTrack');
    const setWidth = state.originalPicksCount * 90;
    state.isTransitioning = true;
    track.style.transition = 'transform 0.4s ease';
    state.ourPicksOffset += (dir * -270);
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    setTimeout(() => {
        track.style.transition = 'none';
        if (state.ourPicksOffset >= (setWidth * 2)) state.ourPicksOffset -= setWidth;
        if (state.ourPicksOffset <= (setWidth * 0.5)) state.ourPicksOffset += setWidth;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
        state.isTransitioning = false;
    }, 400);
}

function setupDownloadPageHandlers() { document.getElementById('dpClose').onclick = () => { document.getElementById('downloadPage').style.display = 'none'; clearInterval(state.countdownInterval); }; }
function setupModalHandlers() { document.querySelectorAll('.modal-trigger').forEach(b => b.onclick = () => { const c = MODAL_CONTENTS[b.dataset.modal]; document.getElementById('infoModalBody').innerHTML = c.content; document.getElementById('infoModal').style.display = 'flex'; }); document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none'; }
function setupEventListeners() { document.getElementById('searchBtn').onclick = () => { state.searchQuery = document.getElementById('searchInput').value; state.currentPage = 1; fetchVectors(); }; document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } }; document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } }; }
function updatePagination() { document.getElementById('pageNumber').textContent = state.currentPage; document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`; }
function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }

document.addEventListener('DOMContentLoaded', init);
