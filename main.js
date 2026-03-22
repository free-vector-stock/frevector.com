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
    about: { 
        title: 'ABOUT US', 
        content: `<h2>ABOUT US</h2>
        <p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
        <p>The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process.</p>
        <p>All files can be used in both personal and commercial projects. <strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package.</p>` 
    },
    privacy: { 
        title: 'PRIVACY POLICY', 
        content: `<h2>PRIVACY POLICY</h2>
        <p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>
        <h3>1. Data Collected</h3>
        <p>Anonymous data like cookies, browser/device info, and interaction data may be collected automatically for analytics.</p>` 
    },
    terms: { 
        title: 'TERMS OF SERVICE', 
        content: `<h2>TERMS OF SERVICE</h2>
        <p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
        <h3>1. Content Ownership</h3>
        <p>All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
        <p><strong>Prohibitions:</strong> Sharing as-is, Redistribution, Selling, Bulk archives.</p>` 
    },
    contact: { 
        title: 'CONTACT & COPYRIGHT', 
        content: `<h2>CONTACT</h2>
        <p>If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p>
        <p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000; font-weight:bold;">hakankacar2014@gmail.com</a></p>` 
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

function setupTypeFilters() {
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-filter').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            state.selectedType = btn.dataset.type;
            state.currentPage = 1;
            fetchVectors().then(() => fetchAndRenderOurPicks());
        };
    });
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';
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
    setupCategories();
    document.getElementById('categoryTitle').textContent = cat === 'all' ? "Free Vectors, SVGs, Icons and Clipart" : `Free ${cat} Vectors`;
    fetchVectors().then(() => fetchAndRenderOurPicks());
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
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
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" alt="${v.title}"></div>
            <div class="vc-info">
                <div class="vc-description">${v.title || "Untitled"}</div>
                <div class="vc-keywords">${(v.keywords || []).slice(0, 3).join(', ')}</div>
            </div>
        `;
        card.onclick = () => showDownloadPage(v);
        grid.appendChild(card);
    });
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpCategory').textContent = v.category || '-';
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
            if (c <= 0) { clearInterval(state.countdownInterval); window.location.href = `/api/download?slug=${v.name}`; }
        }, 1000);
    };
    dp.style.display = 'flex';
}

function setupModalHandlers() { 
    document.querySelectorAll('.modal-trigger').forEach(b => {
        b.onclick = (e) => {
            e.preventDefault();
            const modalData = MODAL_CONTENTS[b.dataset.modal];
            if (modalData) {
                document.getElementById('infoModalBody').innerHTML = modalData.content;
                document.getElementById('infoModal').style.display = 'flex';
            }
        };
    });
    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
}

function setupOurPicksArrows() {
    document.getElementById('ourPicksPrev').onclick = () => scrollOurPicks(-1);
    document.getElementById('ourPicksNext').onclick = () => scrollOurPicks(1);
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const res = await fetch('/api/vectors?page=1&limit=15');
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
    state.ourPicksOffset = picks.length * 100;
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
}

function scrollOurPicks(dir) {
    if (state.isTransitioning) return;
    const track = document.getElementById('ourPicksTrack');
    const setWidth = state.originalPicksCount * 100;
    state.isTransitioning = true;
    track.style.transition = 'transform 0.4s ease';
    state.ourPicksOffset += (dir * -300);
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    setTimeout(() => {
        track.style.transition = 'none';
        if (state.ourPicksOffset >= (setWidth * 2)) state.ourPicksOffset -= setWidth;
        if (state.ourPicksOffset <= (setWidth * 0.5)) state.ourPicksOffset += setWidth;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
        state.isTransitioning = false;
    }, 400);
}

function setupEventListeners() { 
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } }; 
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } }; 
}

function setupDownloadPageHandlers() { 
    document.getElementById('dpClose').onclick = () => { document.getElementById('downloadPage').style.display = 'none'; clearInterval(state.countdownInterval); };
}

function updatePagination() { 
    document.getElementById('pageNumber').textContent = state.currentPage; 
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`; 
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }

document.addEventListener('DOMContentLoaded', init);
