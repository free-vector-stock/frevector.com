/**
 * frevector.com - Frontend Logic
 * v2026031404 - Fixed: Our Picks visibility, edge-to-edge layout, persistent footer
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
        content: `<h2 style="margin-bottom:16px;">About Us</h2><p>Frevector.com is an independent design platform providing original vector resources.</p>`
    },
    privacy: {
        title: 'Privacy Policy',
        content: `<h2 style="margin-bottom:16px;">Privacy Policy</h2><p>We value your privacy and use anonymous data to improve site performance.</p>`
    },
    terms: {
        title: 'Terms of Service',
        content: `<h2 style="margin-bottom:16px;">Terms of Service</h2><p>Files are free for personal and commercial use. Redistribution is prohibited.</p>`
    },
    contact: {
        title: 'Contact',
        content: `<h2 style="margin-bottom:16px;">Contact</h2><p>Email: hakankacar2014@gmail.com</p>`
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

async function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    setupOurPicksArrows();
    
    // Footer ve genel yerleşim düzeltmesi
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.position = 'relative';
        footer.style.zIndex = '1000';
        footer.style.clear = 'both';
    }
    
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
        ['all', 'vector', 'jpeg'].forEach(t => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'category-item' + (state.selectedType === t ? ' active' : '');
            a.textContent = t.toUpperCase();
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
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (el) el.textContent = state.selectedCategory === 'all' ? 'Free Vectors, SVGs, Icons and Clipart' : `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
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
        renderOurPicks();
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
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        card.innerHTML = `<div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" loading="lazy">${typeLabel}</div>`;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

async function renderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const container = document.querySelector('.our-picks-container');
    if (!track || !container) return;
    
    track.innerHTML = '';
    state.ourPicksOffset = 0;
    track.style.transform = `translateX(0px)`;
    
    // Görünürlük için kritik CSS ayarları
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.display = 'block';
    container.style.margin = '0 50px'; // Oklar için dış boşluk
    container.style.minHeight = '120px';

    track.style.display = 'flex';
    track.style.width = 'max-content';
    track.style.visibility = 'visible';

    try {
        const res = await fetch(`/api/vectors?page=1&limit=40`);
        const data = await res.json();
        let picks = (data.vectors || []).sort(() => Math.random() - 0.5);
        
        picks.forEach(v => {
            const card = document.createElement('div');
            card.className = 'vector-card';
            card.style.minWidth = '110px';
            card.style.width = '110px';
            card.style.marginRight = '10px';
            card.style.flex = '0 0 auto';
            const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
            card.innerHTML = `<div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" style="display:block; width:100%;" loading="lazy">${typeLabel}</div>`;
            card.onclick = () => openDetailPanel(v, card);
            track.appendChild(card);
        });
    } catch (e) { console.error(e); }
    updateOurPicksArrows();
}

function setupOurPicksArrows() {
    const prevBtn = document.getElementById('ourPicksPrev');
    const nextBtn = document.getElementById('ourPicksNext');
    if (!prevBtn || !nextBtn) return;

    const btnStyle = {
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        zIndex: '1100', backgroundColor: '#fff', borderRadius: '50%',
        width: '40px', height: '40px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        border: '1px solid #eee'
    };
    
    // Okları kapsayıcının en dışına (sol ve sağ) sabitle
    Object.assign(prevBtn.style, btnStyle, { left: '5px' });
    Object.assign(nextBtn.style, btnStyle, { right: '5px' });

    prevBtn.onclick = () => scrollOurPicks(-1);
    nextBtn.onclick = () => scrollOurPicks(1);
}

function scrollOurPicks(dir) {
    const track = document.getElementById('ourPicksTrack');
    const container = track.parentElement;
    const step = container.offsetWidth * 0.7;
    const max = track.scrollWidth - container.offsetWidth;
    state.ourPicksOffset = Math.max(0, Math.min(max, state.ourPicksOffset + (dir * step)));
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    updateOurPicksArrows();
}

function updateOurPicksArrows() {
    const track = document.getElementById('ourPicksTrack');
    const prev = document.getElementById('ourPicksPrev');
    const next = document.getElementById('ourPicksNext');
    const container = track.parentElement;
    if (!track || !prev || !next || !container) return;
    
    const max = track.scrollWidth - container.offsetWidth;
    prev.style.display = state.ourPicksOffset <= 5 ? 'none' : 'flex';
    next.style.display = state.ourPicksOffset >= max - 5 ? 'none' : 'flex';
}

function openDetailPanel(v, cardEl) {
    if (state.openedVector && state.openedVector.name === v.name) { closeDetailPanel(); return; }
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
        </div>`;
    const grid = document.getElementById('vectorsGrid');
    grid.insertBefore(panel, cardEl.nextSibling);
    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
}

function closeDetailPanel() {
    const p = document.getElementById('detailPanel');
    if (p) p.remove();
    if (state.openedCardEl) state.openedCardEl.classList.remove('card-active');
    state.openedVector = null;
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.thumbnail;
    const btn = document.getElementById('dpDownloadBtn');
    const box = document.getElementById('dpCountdownBox');
    btn.style.display = 'block'; box.style.display = 'none';
    btn.onclick = () => {
        btn.style.display = 'none'; box.style.display = 'block';
        let c = 4;
        state.countdownInterval = setInterval(() => {
            c--; document.getElementById('dpCountdown').textContent = c;
            if (c <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
                setTimeout(() => { dp.style.display = 'none'; document.body.style.overflow = ''; }, 1000);
            }
        }, 1000);
    };
    dp.style.display = 'flex';
}

function setupDownloadPageHandlers() {
    const close = document.getElementById('dpClose');
    if (close) close.onclick = () => { document.getElementById('downloadPage').style.display = 'none'; clearInterval(state.countdownInterval); };
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(b => {
        b.onclick = (e) => {
            e.preventDefault();
            const c = MODAL_CONTENTS[b.dataset.modal];
            if (c) {
                document.getElementById('infoModalBody').innerHTML = c.content;
                document.getElementById('infoModal').style.display = 'flex';
            }
        };
    });
    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
}

function setupEventListeners() {
    document.getElementById('searchBtn').onclick = () => { state.searchQuery = document.getElementById('searchInput').value; state.currentPage = 1; fetchVectors(); };
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { const l = document.getElementById('loader'); if (l) l.style.display = s ? 'flex' : 'none'; }
function escHtml(s) { return s ? s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }

document.addEventListener('DOMContentLoaded', init);
