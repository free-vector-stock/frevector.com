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

const MODAL_CONTENTS = {
    about: { title: 'ABOUT US', content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform providing original vector resources.</p>` },
    privacy: { title: 'PRIVACY POLICY', content: `<h2>PRIVACY POLICY</h2><p>Your privacy is important to us.</p>` },
    terms: { title: 'TERMS OF SERVICE', content: `<h2>TERMS OF SERVICE</h2><p>Usage terms of Frevector graphics.</p>` },
    contact: { title: 'CONTACT', content: `<h2>CONTACT</h2><p>Email: hakankacar2014@gmail.com</p>` }
};

const state = {
    vectors: [], currentPage: 1, totalPages: 1, 
    selectedCategory: 'all', selectedType: 'all', searchQuery: '',
    isLoading: false, picksTrackOffset: 0, picksItemWidth: 175
};

async function init() {
    setupCategories();
    setupTypeFilters();
    setupEventListeners();
    setupModalHandlers();
    await fetchVectors();
    fetchAndRenderOurPicks(); // İlk açılışta seçkileri getir
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
    list.innerHTML = '';
    const cats = ['all', ...Object.keys(CATEGORY_H1_MAP)];
    cats.forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat === 'all' ? 'All' : cat;
        a.onclick = (e) => {
            e.preventDefault();
            state.selectedCategory = cat;
            state.currentPage = 1;
            // H1 Güncelleme (Kural 32)
            const h1Title = cat === 'all' ? "Free Vectors, SVGs, Icons and Clipart" : CATEGORY_H1_MAP[cat];
            document.getElementById('categoryTitle').textContent = h1Title;
            setupCategories();
            fetchVectors();
            fetchAndRenderOurPicks(); // Kategoriye göre seçkileri yenile
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
        
        // JPEG/VECTOR Tespiti (Kural 29 & 30)
        const isJpeg = v.name.toLowerCase().includes('-jpeg-');
        const badgeText = isJpeg ? 'JPEG' : 'VECTOR';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <div class="vc-type-badge">${badgeText}</div>
                <img class="vc-img" src="${v.thumbnail}" alt="${v.title}">
            </div>
            <div class="vc-info"><div class="vc-description">${v.title}</div></div>
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
        <div class="dp-left"><img src="${v.thumbnail}"></div>
        <div class="dp-info">
            <h2 class="dp-title">${v.title}</h2>
            <div class="dp-kw">${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}</div>
            <button class="download-btn-short" id="startDL">DOWNLOAD PAGE</button>
        </div>
    `;
    cardElement.after(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('startDL').onclick = () => runDownloadProcess(v);
}

function runDownloadProcess(v) {
    const overlay = document.getElementById('downloadOverlay');
    const counterEl = document.getElementById('dlCounter');
    document.getElementById('dlPreviewArea').innerHTML = `<img src="${v.thumbnail}" style="max-height:120px;"><h3>${v.title}</h3>`;
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

// Our Selections - Infinite Loop & Random (Kural 26)
async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const catParam = state.selectedCategory !== 'all' ? `&category=${state.selectedCategory}` : '';
    const res = await fetch(`/api/vectors?limit=15&page=1${catParam}`); // Sayfa 1'den karışık veri alınır
    const data = await res.json();
    const items = data.vectors || [];
    
    track.innerHTML = '';
    // Sonsuz döngü için listenin başına ve sonuna klonlar ekliyoruz
    const fullList = [...items, ...items.slice(0, 6)]; 
    
    fullList.forEach(v => {
        const isJpeg = v.name.toLowerCase().includes('-jpeg-');
        const badge = isJpeg ? 'JPEG' : 'VECTOR';
        const div = document.createElement('div');
        div.className = 'vector-card';
        div.style.minWidth = '160px';
        div.innerHTML = `
            <div class="vc-img-wrap" style="height:120px;">
                <div class="vc-type-badge">${badge}</div>
                <img class="vc-img" src="${v.thumbnail}">
            </div>`;
        div.onclick = () => { window.scrollTo({top:0, behavior:'smooth'}); showDetailPanel(v, div); };
        track.appendChild(div);
    });

    // Ok Kontrolleri
    document.getElementById('ourPicksNext').onclick = () => {
        state.picksTrackOffset -= state.picksItemWidth;
        if (Math.abs(state.picksTrackOffset) >= (items.length * state.picksItemWidth)) {
            state.picksTrackOffset = 0; // Başa sar
        }
        track.style.transform = `translateX(${state.picksTrackOffset}px)`;
    };
    document.getElementById('ourPicksPrev').onclick = () => {
        if (state.picksTrackOffset >= 0) {
            state.picksTrackOffset = -(items.length - 1) * state.picksItemWidth;
        } else {
            state.picksTrackOffset += state.picksItemWidth;
        }
        track.style.transform = `translateX(${state.picksTrackOffset}px)`;
    };
}

function setupEventListeners() {
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
    
    let timer;
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value; state.currentPage = 1;
        clearTimeout(timer); timer = setTimeout(fetchVectors, 400);
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
