/**
 * frevector.com - Core Script (Tam Birleşmiş Versiyon)
 */

const MODAL_DATA = {
    about: { content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design. The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms...</p>` },
    privacy: { content: `<h2>PRIVACY POLICY</h2><p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site. Data Collected: Cookies, IP address, device info... We do not sell user data to third parties.</p>` },
    terms: { content: `<h2>TERMS OF SERVICE</h2><p>All graphic designs on the site are original works prepared by Frevector artists. Downloaded files can be used in personal and commercial projects. Prohibited: Redistributing files, selling digitally or physically, uploading to other sites.</p>` },
    contact: { content: `<h2>CONTACT</h2><p>If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p><p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>` }
};

const CATEGORIES = [
    "Abstract", "Animals", "The Arts", "Backgrounds", "Fashion", "Buildings", "Business", 
    "Celebrities", "Education", "Food", "Drink", "Medical", "Holidays", "Industrial", 
    "Interiors", "Miscellaneous", "Nature", "Objects", "Outdoor", "People", "Religion", 
    "Science", "Symbols", "Sports", "Technology", "Transportation", "Vintage", "Logo", "Font", "Icon"
];

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

function updateH1() {
    const h1 = document.getElementById('categoryTitle');
    if (state.selectedCategory === 'all') {
        h1.textContent = "Free Vectors, SVGs, Icons and Clipart";
    } else {
        // Talimat 32 formatı: Free {Category Name} Vectors, SVGs, Icons and Clipart
        h1.textContent = `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
    }
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

function openDownloadPage(v) {
    const overlay = document.getElementById('downloadPageOverlay');
    document.getElementById('dlPreviewImg').src = v.thumbnail;
    document.getElementById('dlPageTitle').textContent = v.title;
    document.getElementById('dlKeywords').innerHTML = (v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('');
    document.getElementById('dlPageFormat').textContent = v.name.toLowerCase().includes('-jpeg-') ? 'JPEG' : 'VECTOR (SVG/EPS)';
    
    overlay.style.display = 'block';
    const finalBtn = document.getElementById('finalDownloadBtn');
    const timerBox = document.getElementById('dlTimerBox');
    const countdown = document.getElementById('countdownNum');
    
    finalBtn.style.display = 'block';
    timerBox.style.display = 'none';

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
            }
        }, 1000);
    };

    document.getElementById('closeDLPage').onclick = () => overlay.style.display = 'none';
}

function setupEventListeners() {
    let timer;
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value; 
        state.currentPage = 1;
        clearTimeout(timer); 
        timer = setTimeout(fetchVectors, 300); // Real-time arama
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
    ['all', ...CATEGORIES].forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = (e) => { 
            e.preventDefault();
            state.selectedCategory = cat; 
            state.currentPage = 1; 
            setupCategories(); 
            fetchVectors(); 
        };
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

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }
document.addEventListener('DOMContentLoaded', init);
