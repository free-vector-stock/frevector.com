/**
 * frevector.com - Core Script
 */

const CATEGORY_H1_MAP = {
    'Abstract': 'Free Abstract Vectors, SVGs, Icons and Clipart',
    'Animals': 'Free Animal Vectors, SVGs, Icons and Clipart',
    'The Arts': 'Free Art Vectors, SVGs, Icons and Clipart',
    'Backgrounds': 'Free Background Vectors, SVGs, Icons and Clipart',
    'Fashion': 'Free Fashion Vectors, SVGs, Icons and Clipart',
    'Buildings': 'Free Building Vectors, SVGs, Icons and Clipart',
    'Business': 'Free Business Vectors, SVGs, Icons and Clipart',
    'Celebrities': 'Free Celebrity Vectors, SVGs, Icons and Clipart',
    'Education': 'Free Education Vectors, SVGs, Icons and Clipart',
    'Food': 'Free Food Vectors, SVGs, Icons and Clipart',
    'Drink': 'Free Drink Vectors, SVGs, Icons and Clipart',
    'Medical': 'Free Medical Vectors, SVGs, Icons and Clipart',
    'Holidays': 'Free Holiday Vectors, SVGs, Icons and Clipart',
    'Industrial': 'Free Industrial Vectors, SVGs, Icons and Clipart',
    'Interiors': 'Free Interior Vectors, SVGs, Icons and Clipart',
    'Miscellaneous': 'Free Miscellaneous Vectors, SVGs, Icons and Clipart',
    'Nature': 'Free Nature Vectors, SVGs, Icons and Clipart',
    'Objects': 'Free Object Vectors, SVGs, Icons and Clipart',
    'Outdoor': 'Free Outdoor Vectors, SVGs, Icons and Clipart',
    'People': 'Free People Vectors, SVGs, Icons and Clipart',
    'Religion': 'Free Religion Vectors, SVGs, Icons and Clipart',
    'Science': 'Free Science Vectors, SVGs, Icons and Clipart',
    'Symbols': 'Free Symbol Vectors, SVGs, Icons and Clipart',
    'Sports': 'Free Sports Vectors, SVGs, Icons and Clipart',
    'Technology': 'Free Technology Vectors, SVGs, Icons and Clipart',
    'Transportation': 'Free Transportation Vectors, SVGs, Icons and Clipart',
    'Vintage': 'Free Vintage Vectors, SVGs, Icons and Clipart',
    'Logo': 'Free Logo Vectors, SVGs, Icons and Clipart',
    'Font': 'Free Font Vectors, SVGs, Icons and Clipart',
    'Icon': 'Free Icon Vectors, SVGs, Icons and Clipart'
};

const state = {
    vectors: [], currentPage: 1, totalPages: 1, 
    selectedCategory: 'all', selectedType: 'all', searchQuery: '',
    isLoading: false, picksOffset: 0, itemWidth: 175
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupTypeFilters();
    await fetchVectors();
    fetchAndRenderOurPicks();
}

// ARAMA SİSTEMİ (Kural 31 - Real Time & Keyword Based)
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

// DETAY PANELİ (Kural 18 & 25 & 26 Çözümü)
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
            <button class="download-btn-short" id="startDL">DOWNLOAD PAGE</button>
        </div>
    `;
    
    // Eğer Selection kısmından tıklandıysa ana gridin en üstüne çık veya oraya odaklan
    if (container.id === 'ourPicksTrack') {
        window.scrollTo({top: 0, behavior: 'smooth'});
        const mainGrid = document.getElementById('vectorsGrid');
        mainGrid.prepend(panel);
    } else {
        cardElement.after(panel);
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('startDL').onclick = () => runDownloadProcess(v);
}

function runDownloadProcess(v) {
    const overlay = document.getElementById('downloadOverlay');
    const counterEl = document.getElementById('dlCounter');
    document.getElementById('dlPreviewArea').innerHTML = `<img src="${v.thumbnail}" style="max-height:100px;"><h3>${v.title}</h3>`;
    overlay.style.display = 'flex';
    let count = 4;
    counterEl.textContent = count;
    const itv = setInterval(() => {
        count--;
        counterEl.textContent = count;
        if (count <= 0) {
            clearInterval(itv);
            window.location.href = `/api/download?slug=${v.name}`;
            setTimeout(() => { overlay.style.display = 'none'; }, 2000);
        }
    }, 1000);
    document.getElementById('closeDL').onclick = () => { clearInterval(itv); overlay.style.display = 'none'; };
}

// Our Selections Infinite (Kural 26)
async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const res = await fetch(`/api/vectors?limit=15&category=${state.selectedCategory === 'all' ? '' : state.selectedCategory}`);
    const data = await res.json();
    const items = data.vectors || [];
    
    track.innerHTML = '';
    const fullList = [...items, ...items.slice(0, 6)]; // Klonlama
    fullList.forEach(v => {
        const card = createVectorCard(v);
        card.style.minWidth = '160px';
        // Selection içindekine tıklandığında "saçmasapan" açılmaması için:
        card.onclick = () => showDetailPanel(v, card, track);
        track.appendChild(card);
    });

    document.getElementById('ourPicksNext').onclick = () => {
        state.picksOffset -= state.itemWidth;
        if (Math.abs(state.picksOffset) >= (items.length * state.itemWidth)) state.picksOffset = 0;
        track.style.transform = `translateX(${state.picksOffset}px)`;
    };
    document.getElementById('ourPicksPrev').onclick = () => {
        state.picksOffset = (state.picksOffset >= 0) ? -(items.length - 1) * state.itemWidth : state.picksOffset + state.itemWidth;
        track.style.transform = `translateX(${state.picksOffset}px)`;
    };
}

function setupEventListeners() {
    let timer;
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value; state.currentPage = 1;
        clearTimeout(timer); timer = setTimeout(fetchVectors, 300); // Real-time
    };
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = '';
    ['all', ...Object.keys(CATEGORY_H1_MAP)].forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = (e) => {
            e.preventDefault(); state.selectedCategory = cat; state.currentPage = 1;
            document.getElementById('categoryTitle').textContent = cat === 'all' ? "Free Vectors, SVGs, Icons and Clipart" : CATEGORY_H1_MAP[cat];
            setupCategories(); fetchVectors(); fetchAndRenderOurPicks();
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

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }
document.addEventListener('DOMContentLoaded', init);
