/**
 * frevector.com - Frontend Core Logic
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

const MODAL_CONTENTS = {
    about: { title: 'ABOUT US', content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p><p>The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists.</p>` },
    privacy: { title: 'PRIVACY POLICY', content: `<h2>PRIVACY POLICY</h2><p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>` },
    terms: { title: 'TERMS OF SERVICE', content: `<h2>TERMS OF SERVICE</h2><p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p>` },
    contact: { title: 'CONTACT & COPYRIGHT', content: `<h2>CONTACT</h2><p>If you have any questions or copyright issues regarding Frevector.com, please get in touch.</p><p><strong>Email:</strong> hakankacar2014@gmail.com</p>` }
};

const state = {
    vectors: [], currentPage: 1, totalPages: 1, selectedCategory: 'all', selectedType: 'all', searchQuery: '', isLoading: false,
    ourPicksOffset: 0, picksCount: 0
};

async function init() {
    setupCategories();
    setupTypeFilters();
    setupEventListeners();
    setupModalHandlers();
    setupOurPicksArrows();
    await fetchVectors();
    fetchAndRenderOurPicks();
}

function setupTypeFilters() {
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-filter').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            state.selectedType = btn.dataset.type;
            state.currentPage = 1;
            fetchVectors();
        };
    });
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';
    ['all', ...CATEGORIES].forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = (e) => {
            e.preventDefault();
            state.selectedCategory = cat;
            state.currentPage = 1;
            document.getElementById('categoryTitle').textContent = cat === 'all' ? "Free Vectors, SVGs, Icons and Clipart" : `Free ${cat} Vectors`;
            setupCategories();
            fetchVectors();
            fetchAndRenderOurPicks(); // Alttaki seçkileri kategoriye göre yenile
        };
        list.appendChild(a);
    });
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
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="vc-img-wrap">
                <div class="vc-type-badge">${(v.type || 'vector').toUpperCase()}</div>
                <img class="vc-img" src="${v.thumbnail}" alt="${v.title}">
            </div>
            <div class="vc-info"><div class="vc-description">${v.title || "Untitled"}</div></div>
        `;
        card.onclick = () => showDetailPanel(v, card);
        grid.appendChild(card);
    });
}

function showDetailPanel(v, cardElement) {
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    const existing = document.querySelector('.detail-panel');
    if (existing) existing.remove();

    cardElement.classList.add('card-active');
    const panel = document.createElement('div');
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="dp-left"><img src="${v.thumbnail}" class="dp-thumb"></div>
        <div class="dp-info">
            <h2 class="dp-title">${v.title}</h2>
            <div class="dp-meta-row"><strong>Format:</strong> ${(v.type || 'vector').toUpperCase()}</div>
            <div class="dp-meta-row"><strong>Category:</strong> ${v.category || '-'}</div>
            <div class="dp-kw-container">${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}</div>
            <button class="download-btn-short" id="goToDL">DOWNLOAD PAGE</button>
        </div>
    `;
    cardElement.after(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('goToDL').onclick = () => openDownloadPage(v);
}

function openDownloadPage(v) {
    const overlay = document.getElementById('downloadOverlay');
    const counter = document.getElementById('dlCounter');
    const preview = document.getElementById('dlPreviewArea');
    preview.innerHTML = `<img src="${v.thumbnail}" style="max-height:150px; margin-bottom:20px; object-fit:contain;"><h3>${v.title}</h3>`;
    overlay.style.display = 'flex';
    let count = 4;
    counter.textContent = count;
    const interval = setInterval(() => {
        count--;
        counter.textContent = count;
        if (count <= 0) {
            clearInterval(interval);
            window.location.href = `/api/download?slug=${v.name}`;
            setTimeout(() => { overlay.style.display = 'none'; }, 2000);
        }
    }, 1000);
    document.getElementById('closeDL').onclick = () => { clearInterval(interval); overlay.style.display = 'none'; };
}

// Our Selections - Sonsuz Döngü & Karışık Getirme
async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const cat = state.selectedCategory !== 'all' ? `&category=${state.selectedCategory}` : '';
    const randomPage = Math.floor(Math.random() * 3) + 1;
    const res = await fetch(`/api/vectors?limit=12&page=${randomPage}${cat}`);
    const data = await res.json();
    const picks = data.vectors || [];
    
    // Sonsuz döngü için listenin sonuna ilk birkaç elemanı kopyalıyoruz
    track.innerHTML = '';
    const allPicks = [...picks, ...picks.slice(0, 6)]; 
    state.picksCount = picks.length;

    allPicks.forEach(v => {
        const div = document.createElement('div');
        div.className = 'vector-card';
        div.style.minWidth = '160px';
        div.innerHTML = `<div class="vc-img-wrap" style="height:120px;"><img class="vc-img" src="${v.thumbnail}"></div>`;
        div.onclick = () => { window.scrollTo({top:0, behavior:'smooth'}); showDetailPanel(v, div); };
        track.appendChild(div);
    });
}

function setupOurPicksArrows() {
    const track = document.getElementById('ourPicksTrack');
    document.getElementById('ourPicksNext').onclick = () => {
        state.ourPicksOffset -= 175; // 160px width + 15px gap
        if (Math.abs(state.ourPicksOffset) >= (state.picksCount * 175)) {
            state.ourPicksOffset = 0; // Başa dön
        }
        track.style.transform = `translateX(${state.ourPicksOffset}px)`;
    };
    document.getElementById('ourPicksPrev').onclick = () => {
        state.ourPicksOffset = state.ourPicksOffset >= 0 ? -(state.picksCount * 175) : state.ourPicksOffset + 175;
        track.style.transform = `translateX(${state.ourPicksOffset}px)`;
    };
}

function setupEventListeners() {
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
    let st;
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value; state.currentPage = 1;
        clearTimeout(st); st = setTimeout(fetchVectors, 400);
    };
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(b => {
        b.onclick = (e) => {
            e.preventDefault();
            const m = MODAL_CONTENTS[b.dataset.modal];
            document.getElementById('infoModalBody').innerHTML = m.content;
            document.getElementById('infoModal').style.display = 'flex';
        };
    });
    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
    window.onclick = (event) => { if (event.target == document.getElementById('infoModal')) document.getElementById('infoModal').style.display = "none"; };
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }
document.addEventListener('DOMContentLoaded', init);
