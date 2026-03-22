/**
 * frevector.com - Frontend Core Logic
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

// Footer içerikleri - Tam ve Eksiksiz
const MODAL_CONTENTS = {
    about: { 
        title: 'ABOUT US', 
        content: `<h2>ABOUT US</h2>
        <p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
        <p>The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms.</p>
        <p>Each work is built from scratch and undergoes an original production process. All files can be used in both personal and commercial projects. Our only rule: Files cannot be redistributed or sold as-is.</p>` 
    },
    privacy: { 
        title: 'PRIVACY POLICY', 
        content: `<h2>PRIVACY POLICY</h2>
        <p>At Frevector.com, we prioritize user privacy. We only collect anonymous data for analytics and performance improvements.</p>
        <p>We do not sell user data to third parties. Cookies may be used to enhance site functions and provide a better experience.</p>` 
    },
    terms: { 
        title: 'TERMS OF SERVICE', 
        content: `<h2>TERMS OF SERVICE</h2>
        <p>All graphic designs on the site belong to Frevector. You may use them in your personal or commercial projects.</p>
        <p>Redistributing, uploading to other platforms, or selling the files as-is is strictly prohibited. Use of the content implies acceptance of these terms.</p>` 
    },
    contact: { 
        title: 'CONTACT', 
        content: `<h2>CONTACT</h2>
        <p>If you have any questions or support requests, please feel free to reach out to us.</p>
        <p>Email: <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>` 
    }
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
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
    setupTypeFilters();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    setupOurPicksArrows();
    await fetchVectors();
    setTimeout(() => fetchAndRenderOurPicks(), 300);
}

function getH1Text(cat) {
    if (cat === 'all') return "Free Vectors, SVGs, Icons and Clipart";
    return `Free ${cat} Vectors, SVGs, Icons and Clipart`;
}

function setupTypeFilters() {
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-filter').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            state.selectedType = btn.dataset.type;
            state.currentPage = 1;
            closeDetailPanel();
            fetchVectors();
        };
    });
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';
    const allLink = document.createElement('a');
    allLink.className = 'category-item' + (state.selectedCategory === 'all' ? ' active' : '');
    allLink.textContent = 'All Categories';
    allLink.onclick = (e) => { e.preventDefault(); selectCategory('all'); };
    list.appendChild(allLink);
    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
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
    document.getElementById('categoryTitle').textContent = getH1Text(cat);
    fetchVectors();
    if(window.innerWidth <= 480) {
        document.getElementById('categoryTitle').scrollIntoView({behavior: 'smooth'});
    }
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
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        const res = await fetch(url);
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        renderVectors();
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
        const badge = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        card.innerHTML = `
            <div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" alt="${v.title}">${badge}</div>
            <div class="vc-info">
                <div class="vc-description">${v.title || "Untitled"}</div>
                <div class="vc-keywords">${(v.keywords || []).slice(0, 3).join(', ')}</div>
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
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
                <div class="detail-keywords">${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}</div>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD PAGE</button>
                    <button id="mainCloseBtn" style="background:#ddd; border:none; padding:10px 20px; cursor:pointer;">Close</button>
                </div>
            </div>
        </div>
    `;
    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.children);
    const index = cards.indexOf(cardEl);
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
    document.getElementById('dpKeywords').innerHTML = (v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('');
    document.getElementById('dpDownloadBtn').style.display = 'block';
    document.getElementById('dpCountdownBox').style.display = 'none';
    document.getElementById('dpDownloadBtn').onclick = () => {
        document.getElementById('dpDownloadBtn').style.display = 'none';
        document.getElementById('dpCountdownBox').style.display = 'block';
        let c = 4;
        document.getElementById('dpCountdown').textContent = c;
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

function setupModalHandlers() { 
    document.querySelectorAll('.modal-trigger').forEach(b => {
        b.onclick = (e) => {
            e.preventDefault();
            const data = MODAL_CONTENTS[b.dataset.modal];
            if (data) {
                document.getElementById('infoModalBody').innerHTML = data.content;
                document.getElementById('infoModal').style.display = 'flex';
            }
        };
    });
    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
}

function setupEventListeners() { 
    const input = document.getElementById('searchInput');
    let timeout = null;
    input.oninput = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            state.searchQuery = input.value.trim();
            state.currentPage = 1;
            fetchVectors();
        }, 300);
    };
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } }; 
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } }; 
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', '1');
        url.searchParams.set('limit', '15'); 
        const res = await fetch(url);
        const data = await res.json();
        const picks = data.vectors || [];
        track.innerHTML = '';
        state.originalPicksCount = picks.length;
        [...picks, ...picks, ...picks].forEach(v => {
            const card = document.createElement('div');
            card.className = 'vector-card';
            card.innerHTML = `<div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}"></div>`;
            card.onclick = () => showDownloadPage(v);
            track.appendChild(card);
        });
        state.ourPicksOffset = picks.length * 90;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    } catch (err) { console.error(err); }
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

function setupOurPicksArrows() {
    const prev = document.getElementById('ourPicksPrev');
    const next = document.getElementById('ourPicksNext');
    if(prev) prev.onclick = () => scrollOurPicks(-1);
    if(next) next.onclick = () => scrollOurPicks(1);
}

function setupDownloadPageHandlers() { 
    const closeBtn = document.getElementById('dpClose');
    if(closeBtn) closeBtn.onclick = () => { 
        document.getElementById('downloadPage').style.display = 'none'; 
        if(state.countdownInterval) clearInterval(state.countdownInterval); 
    };
}

function updatePagination() { 
    const pNum = document.getElementById('pageNumber');
    const pTot = document.getElementById('pageTotal');
    if(pNum) pNum.textContent = state.currentPage; 
    if(pTot) pTot.textContent = `/ ${state.totalPages}`; 
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }

document.addEventListener('DOMContentLoaded', init);
