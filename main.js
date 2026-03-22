/**
 * frevector.com - Core Script
 */

const MODAL_DATA = {
    about: { content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design...</p>` },
    privacy: { content: `<h2>PRIVACY POLICY</h2><p>Your privacy is important to us. All assets are served securely...</p>` },
    terms: { content: `<h2>TERMS OF SERVICE</h2><p>Our resources are free for personal and commercial use with attribution...</p>` },
    contact: { content: `<h2>CONTACT</h2><p>For inquiries: info@frevector.com</p>` }
};

const state = {
    vectors: [], currentPage: 1, totalPages: 1, 
    selectedCategory: 'all', selectedType: 'all', searchQuery: '', sortOrder: '',
    isLoading: false, picksOffset: 0, pickItemWidth: 130 
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupTypeFilters();
    setupFooterModals();
    await fetchVectors();
    fetchOurPicks();
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true; showLoader(true);
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        if (state.sortOrder) url.searchParams.set('sort', state.sortOrder);
        
        const res = await fetch(url);
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        renderVectors();
        updatePagination();
        updateH1();
    } catch (err) { console.error(err); }
    finally { state.isLoading = false; showLoader(false); }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        const card = createVectorCard(v);
        card.onclick = () => showDetailPanel(v, card, grid);
        grid.appendChild(card);
    });
}

function createVectorCard(v) {
    const isJpeg = v.name.toLowerCase().includes('-jpeg-');
    const badge = isJpeg ? 'JPEG' : 'VECTOR';
    const card = document.createElement('div');
    card.className = 'vector-card';
    card.innerHTML = `
        <div class="vc-img-wrap">
            <div class="vc-type-badge">${badge}</div>
            <img class="vc-img" src="${v.thumbnail}" alt="${v.title}">
        </div>
        <div class="vc-info"><div class="vc-description">${v.title}</div></div>
    `;
    return card;
}

function showDetailPanel(v, cardElement, container) {
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    const existing = document.querySelector('.detail-panel');
    if (existing) existing.remove();

    cardElement.classList.add('card-active');
    const panel = document.createElement('div');
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="dp-left"><img src="${v.thumbnail}"></div>
        <div class="dp-info">
            <h2 class="dp-title">${v.title}</h2>
            <div class="dp-kw">${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}</div>
            <button class="download-btn-short" id="openDLPage">DOWNLOAD PAGE</button>
        </div>
    `;
    
    cardElement.after(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('openDLPage').onclick = () => openDownloadPage(v);
}

// DOWNLOAD PAGE FONKSİYONU (Ayrı sayfa akışı)
function openDownloadPage(v) {
    const overlay = document.getElementById('downloadPageOverlay');
    const img = document.getElementById('dlPreviewImg');
    const title = document.getElementById('dlPageTitle');
    const format = document.getElementById('dlPageFormat');
    const finalBtn = document.getElementById('finalDownloadBtn');
    const timerBox = document.getElementById('dlTimerBox');
    const countdown = document.getElementById('countdownNum');

    img.src = v.thumbnail;
    title.textContent = v.title;
    format.textContent = v.name.toLowerCase().includes('-jpeg-') ? 'JPEG' : 'VECTOR (SVG/EPS)';
    
    overlay.style.display = 'block';
    finalBtn.style.display = 'block';
    timerBox.style.display = 'none';
    document.body.style.overflow = 'hidden';

    finalBtn.onclick = () => {
        finalBtn.style.display = 'none';
        timerBox.style.display = 'block';
        let count = 4;
        countdown.textContent = count;

        const itv = setInterval(() => {
            count--;
            countdown.textContent = count;
            if (count <= 0) {
                clearInterval(itv);
                window.location.href = `/api/download?slug=${v.name}`;
                setTimeout(() => {
                    overlay.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 1000);
            }
        }, 1000);
    };

    document.getElementById('closeDLPage').onclick = () => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
}

async function fetchOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const res = await fetch(`/api/vectors?limit=15`);
    const data = await res.json();
    const items = data.vectors || [];
    
    const extended = [...items, ...items, ...items];
    track.innerHTML = '';
    extended.forEach(v => {
        const card = createVectorCard(v);
        card.onclick = () => openDownloadPage(v);
        track.appendChild(card);
    });

    state.picksOffset = -(items.length * state.pickItemWidth);
    track.style.transform = `translateX(${state.picksOffset}px)`;

    document.getElementById('ourPicksNext').onclick = () => {
        state.picksOffset -= state.pickItemWidth;
        track.style.transition = "transform 0.4s ease";
        track.style.transform = `translateX(${state.picksOffset}px)`;
        if (Math.abs(state.picksOffset) >= (items.length * 2 * state.pickItemWidth)) {
            setTimeout(() => { track.style.transition = "none"; state.picksOffset = -(items.length * state.pickItemWidth); track.style.transform = `translateX(${state.picksOffset}px)`; }, 400);
        }
    };

    document.getElementById('ourPicksPrev').onclick = () => {
        state.picksOffset += state.pickItemWidth;
        track.style.transition = "transform 0.4s ease";
        track.style.transform = `translateX(${state.picksOffset}px)`;
        if (state.picksOffset >= 0) {
            setTimeout(() => { track.style.transition = "none"; state.picksOffset = -(items.length * state.pickItemWidth); track.style.transform = `translateX(${state.picksOffset}px)`; }, 400);
        }
    };
}

function setupFooterModals() {
    const modal = document.getElementById('infoModal');
    const body = document.getElementById('infoModalBody');
    document.querySelectorAll('.modal-trigger').forEach(link => {
        link.onclick = () => {
            body.innerHTML = MODAL_DATA[link.dataset.modal].content;
            modal.style.display = 'flex';
        };
    });
    document.getElementById('infoModalClose').onclick = () => modal.style.display = 'none';
}

function updateH1() {
    const h1 = document.getElementById('categoryTitle');
    if (state.selectedCategory === 'all') {
        h1.textContent = "Free Vectors, SVGs, Icons and Clipart";
    } else {
        h1.textContent = `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
    }
}

function setupEventListeners() {
    let timer;
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value; state.currentPage = 1;
        clearTimeout(timer); timer = setTimeout(fetchVectors, 300);
    };
    document.getElementById('sortFilter').onchange = (e) => {
        state.sortOrder = e.target.value; state.currentPage = 1; fetchVectors();
    };
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = '';
    const cats = ['all', 'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Food', 'Logo'];
    cats.forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = () => { state.selectedCategory = cat; state.currentPage = 1; setupCategories(); fetchVectors(); };
        list.appendChild(a);
    });
}

function setupTypeFilters() {
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-filter').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            state.selectedType = btn.dataset.type; state.currentPage = 1; fetchVectors();
        };
    });
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }
document.addEventListener('DOMContentLoaded', init);
