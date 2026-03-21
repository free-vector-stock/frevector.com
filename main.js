/**
 * frevector.com - Frontend Logic
 * v2026031401 - Revisions: seamless infinite loop for our-picks
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
            <p style="margin-bottom:12px;">Cookies may be used on the site to support site functions, remember user preferences, and measure performance.</p>
        `
    },
    terms: {
        title: 'Terms of Service',
        content: `
            <h2 style="margin-bottom:16px;">Terms of Service</h2>
            <p style="margin-bottom:12px;">Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Content Ownership</h3>
            <p style="margin-bottom:12px;">All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
        `
    },
    contact: {
        title: 'Contact',
        content: `
            <h2 style="margin-bottom:16px;">Contact</h2>
            <p style="margin-bottom:12px;">If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p>
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

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        const typeContainer = document.createElement('div');
        typeContainer.style.padding = '0 16px 8px';
        typeContainer.style.marginBottom = '8px';
        typeContainer.style.borderBottom = '1px solid #ddd';
        
        const typeLabel = document.createElement('div');
        typeLabel.style.fontSize = '10px';
        typeLabel.style.fontWeight = '600';
        typeLabel.style.color = '#666';
        typeLabel.style.marginBottom = '4px';
        typeLabel.textContent = 'TYPE';
        typeContainer.appendChild(typeLabel);
        
        ['all', 'vector', 'jpeg'].forEach(t => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'category-item' + (state.selectedType === t ? ' active' : '');
            a.textContent = t.charAt(0).toUpperCase() + t.slice(1);
            a.onclick = (e) => { e.preventDefault(); selectType(t); };
            typeContainer.appendChild(a);
        });
        list.appendChild(typeContainer);
    }

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
    state.searchQuery = '';
    closeDetailPanel();
    setupCategories();
    updateCategoryTitle();
    fetchVectors();
}

function selectType(type) {
    state.selectedType = type;
    state.currentPage = 1;
    closeDetailPanel();
    setupCategories();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    el.textContent = state.selectedCategory === 'all' ? 'Free Vectors, SVGs, Icons and Clipart' : `Free ${state.selectedCategory} Vectors`;
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
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        
        const res = await fetch(url);
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        
        renderVectors();
        await fetchAndRenderOurPicks(); 
        updatePagination();
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

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const typeBadge = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        card.innerHTML = `
            <div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" alt="${v.title}" loading="lazy">${typeBadge}</div>
            <div class="vc-info"><div class="vc-description">${v.description || ""}</div></div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('limit', '20');
        const res = await fetch(url);
        const data = await res.json();
        let picks = data.vectors || [];
        
        track.innerHTML = '';
        state.ourPicksOffset = 0;
        track.style.transform = `translateX(0px)`;

        const createCard = (v) => {
            const card = document.createElement('div');
            card.className = 'vector-card';
            card.innerHTML = `<div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" loading="lazy"></div>`;
            card.onclick = () => openDetailPanel(v, card);
            return card;
        };

        // KESİNTİSİZ DÖNGÜ İÇİN 4 KOPYA
        const quadPicks = [...picks, ...picks, ...picks, ...picks];
        quadPicks.forEach(v => track.appendChild(createCard(v)));

        state.originalPicksCount = picks.length;
        state.ourPicksOffset = picks.length * 90; 
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    } catch (err) { console.error(err); }
}

function setupOurPicksArrows() {
    const prev = document.getElementById('ourPicksPrev');
    const next = document.getElementById('ourPicksNext');
    if (prev) prev.onclick = () => scrollOurPicks(-1);
    if (next) next.onclick = () => scrollOurPicks(1);
}

function scrollOurPicks(direction) {
    if (state.isTransitioning) return;
    const track = document.getElementById('ourPicksTrack');
    const singleSetWidth = state.originalPicksCount * 90;

    state.isTransitioning = true;
    track.style.transition = 'transform 0.4s ease-in-out';
    state.ourPicksOffset += (direction * -270);
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;

    setTimeout(() => {
        track.style.transition = 'none';
        if (state.ourPicksOffset >= (singleSetWidth * 2)) state.ourPicksOffset -= singleSetWidth;
        if (state.ourPicksOffset <= (singleSetWidth * 0.5)) state.ourPicksOffset += singleSetWidth;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
        state.isTransitioning = false;
    }, 400);
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
                <button class="download-btn" id="mainDownloadBtn">DOWNLOAD</button>
                <button class="detail-close-btn" id="mainCloseBtn">Close</button>
            </div>
        </div>
    `;

    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.children);
    const index = cards.indexOf(cardEl);
    const columns = window.innerWidth >= 1200 ? 6 : (window.innerWidth >= 768 ? 4 : 1);
    const insertAfter = Math.min(cards.length - 1, Math.floor(index / columns) * columns + (columns - 1));
    grid.insertBefore(panel, cards[insertAfter].nextSibling);

    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
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
    const btn = document.getElementById('dpDownloadBtn');
    const countBox = document.getElementById('dpCountdownBox');
    
    btn.style.display = 'block';
    countBox.style.display = 'none';
    btn.onclick = () => {
        btn.style.display = 'none';
        countBox.style.display = 'block';
        let c = 4;
        state.countdownInterval = setInterval(() => {
            c--;
            document.getElementById('dpCountdown').textContent = c;
            if (c <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
            }
        }, 1000);
    };
    dp.style.display = 'flex';
}

function setupDownloadPageHandlers() {
    const close = document.getElementById('dpClose');
    if (close) close.onclick = () => {
        document.getElementById('downloadPage').style.display = 'none';
        clearInterval(state.countdownInterval);
    };
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.onclick = () => {
            const c = MODAL_CONTENTS[btn.dataset.modal];
            document.getElementById('infoModalBody').innerHTML = c.content;
            document.getElementById('infoModal').style.display = 'flex';
        };
    });
    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
}

function setupEventListeners() {
    document.getElementById('searchBtn').onclick = () => {
        state.searchQuery = document.getElementById('searchInput').value;
        state.currentPage = 1;
        fetchVectors();
    };
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }

document.addEventListener('DOMContentLoaded', init);
