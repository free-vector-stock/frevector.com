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
    contact: { title: 'CONTACT & COPYRIGHT', content: `<h2>CONTACT</h2><p>If you have any questions, feedback or copyright issues regarding Frevector.com, please get in touch.</p><p><strong>Email:</strong> hakankacar2014@gmail.com</p>` }
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    selectedCategory: 'all',
    selectedType: 'all',
    searchQuery: '',
    isLoading: false,
    ourPicksOffset: 0
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
    
    const cats = ['all', ...CATEGORIES];
    cats.forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        a.onclick = (e) => {
            e.preventDefault();
            state.selectedCategory = cat;
            state.currentPage = 1;
            document.getElementById('categoryTitle').textContent = cat === 'all' ? "Free Vectors, SVGs, Icons and Clipart" : `Free ${cat} Vectors`;
            setupCategories();
            fetchVectors();
        };
        list.appendChild(a);
    });
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
            <div class="vc-info">
                <div class="vc-description">${v.title || "Untitled"}</div>
            </div>
        `;
        card.onclick = () => showDetailPanel(v, card);
        grid.appendChild(card);
    });
}

function showDetailPanel(v, cardElement) {
    // Önceki aktif kartları ve panelleri temizle
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    const existing = document.querySelector('.detail-panel');
    if (existing) existing.remove();

    cardElement.classList.add('card-active');

    const panel = document.createElement('div');
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="dp-left">
            <img src="${v.thumbnail}" class="dp-thumb">
        </div>
        <div class="dp-info">
            <h2 class="dp-title">${v.title}</h2>
            <div class="dp-meta-row"><strong>Format:</strong> ${(v.type || 'vector').toUpperCase()}</div>
            <div class="dp-meta-row"><strong>Category:</strong> ${v.category || '-'}</div>
            <div class="dp-meta-row"><strong>License:</strong> Free for Personal & Commercial Use</div>
            <div class="dp-kw-container">
                ${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}
            </div>
            <button class="download-btn-short" id="dlTrigger">DOWNLOAD</button>
            <div id="dlWait" style="display:none; margin-top:15px; font-weight:800;">Your download starts in <span id="timer">4</span>s...</div>
        </div>
    `;

    // Paneli kartın bulunduğu satırın sonuna ekle
    cardElement.after(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });

    document.getElementById('dlTrigger').onclick = () => {
        const btn = document.getElementById('dlTrigger');
        const wait = document.getElementById('dlWait');
        btn.style.display = 'none';
        wait.style.display = 'block';
        let count = 4;
        const interval = setInterval(() => {
            count--;
            document.getElementById('timer').textContent = count;
            if (count <= 0) {
                clearInterval(interval);
                window.location.href = `/api/download?slug=${v.name}`;
                wait.innerHTML = "Download started!";
            }
        }, 1000);
    };
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const res = await fetch('/api/vectors?limit=12');
    const data = await res.json();
    const picks = data.vectors || [];
    track.innerHTML = '';
    picks.forEach(v => {
        const div = document.createElement('div');
        div.className = 'vector-card';
        div.style.minWidth = '160px';
        div.innerHTML = `
            <div class="vc-img-wrap" style="aspect-ratio: 1; height:120px;">
                <div class="vc-type-badge">${(v.type || 'vector').toUpperCase()}</div>
                <img class="vc-img" src="${v.thumbnail}">
            </div>`;
        div.onclick = () => showDetailPanel(v, div);
        track.appendChild(div);
    });
}

function setupOurPicksArrows() {
    document.getElementById('ourPicksNext').onclick = () => {
        state.ourPicksOffset -= 220;
        document.getElementById('ourPicksTrack').style.transform = `translateX(${state.ourPicksOffset}px)`;
    };
    document.getElementById('ourPicksPrev').onclick = () => {
        state.ourPicksOffset = Math.min(0, state.ourPicksOffset + 220);
        document.getElementById('ourPicksTrack').style.transform = `translateX(${state.ourPicksOffset}px)`;
    };
}

function setupEventListeners() {
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
    
    let st;
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value;
        state.currentPage = 1;
        clearTimeout(st);
        st = setTimeout(fetchVectors, 400);
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
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }

document.addEventListener('DOMContentLoaded', init);
