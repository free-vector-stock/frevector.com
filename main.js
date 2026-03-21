const EXTRA_KEYWORDS = ['free jpeg', 'free', 'jpeg', 'fre'];
const VECTOR_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'vector eps', 'svg'];

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

const MODAL_CONTENTS = {
    about: { title: 'About Us', content: '<h2>About Us</h2><p>Frevector.com original design resources...</p>' },
    privacy: { title: 'Privacy Policy', content: '<h2>Privacy Policy</h2><p>Your privacy is important...</p>' },
    terms: { title: 'Terms of Service', content: '<h2>Terms of Service</h2><p>License details...</p>' },
    contact: { title: 'Contact', content: '<h2>Contact</h2><p>hakankacar2014@gmail.com</p>' }
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
    await fetchVectors();
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';
    
    // Basit kategori ve tip butonları
    ['all', 'vector', 'jpeg'].forEach(type => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedType === type ? ' active' : '');
        a.textContent = type.toUpperCase();
        a.onclick = (e) => { e.preventDefault(); selectType(type); };
        list.appendChild(a);
    });

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

function selectCategory(cat) { state.selectedCategory = cat; state.currentPage = 1; fetchVectors(); }
function selectType(type) { state.selectedType = type; state.currentPage = 1; fetchVectors(); }

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        
        const res = await fetch(url);
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;

        renderVectors();
        renderOurPicks();
        updatePagination();
    } catch (err) { console.error(err); }
    finally { state.isLoading = false; }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = state.vectors.map(v => `
        <div class="vector-card" onclick="openDetailPanel(${JSON.stringify(v).replace(/"/g, '&quot;')}, this)">
            <div class="vc-img-wrap"><img src="${v.thumbnail}" class="vc-img"></div>
            <div class="vc-info"><div>${v.title}</div></div>
        </div>
    `).join('');
}

// KRİTİK: "Our Selections For You" Render Fonksiyonu
function renderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track || !state.vectors.length) return;
    
    track.innerHTML = '';
    state.ourPicksOffset = 0;
    track.style.transform = `translateX(0px)`;

    // İlk 15 görseli yan yana diz
    state.vectors.slice(0, 15).forEach(v => {
        const item = document.createElement('div');
        item.style.flex = '0 0 120px';
        item.style.height = '80px';
        item.style.cursor = 'pointer';
        item.innerHTML = `<img src="${v.thumbnail}" style="width:100%; height:100%; object-fit:cover; border-radius:4px; border:1px solid #eee;">`;
        item.onclick = () => showDownloadPage(v);
        track.appendChild(item);
    });
}

function setupOurPicksArrows() {
    const prev = document.getElementById('ourPicksPrev');
    const next = document.getElementById('ourPicksNext');
    if (!prev || !next) return;

    next.onclick = () => {
        state.ourPicksOffset -= 250;
        document.getElementById('ourPicksTrack').style.transform = `translateX(${state.ourPicksOffset}px)`;
    };
    prev.onclick = () => {
        state.ourPicksOffset = Math.min(0, state.ourPicksOffset + 250);
        document.getElementById('ourPicksTrack').style.transform = `translateX(${state.ourPicksOffset}px)`;
    };
}

function openDetailPanel(v, el) { showDownloadPage(v); }

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpTitle').textContent = v.title;
    dp.style.display = 'flex';
}

function setupDownloadPageHandlers() {
    document.getElementById('dpClose').onclick = () => document.getElementById('downloadPage').style.display = 'none';
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.onclick = () => {
            const m = MODAL_CONTENTS[btn.dataset.modal];
            document.getElementById('infoModalBody').innerHTML = m.content;
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
    document.getElementById('prevBtn').onclick = () => { if(state.currentPage > 1) { state.currentPage--; fetchVectors(); }};
    document.getElementById('nextBtn').onclick = () => { if(state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); }};
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

document.addEventListener('DOMContentLoaded', init);
