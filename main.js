/**
 * frevector.com - Frontend Logic
 * v2026031408 - Performance, Dark Mode, H1, Search & Modal Integration
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

const MODAL_CONTENTS = {
    about: {
        title: 'About Us',
        content: `<h2>About Us</h2><p>Frevector.com is an independent design platform...</p>
                  <p>All designs on the site are created exclusively by Frevector artists.</p>
                  <p><strong>Contact:</strong> <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>`
    },
    privacy: {
        title: 'Privacy Policy',
        content: `<h2>Privacy Policy</h2><p>As Frevector.com, we prioritize user privacy...</p>`
    },
    terms: {
        title: 'Terms of Service',
        content: `<h2>Terms of Service</h2><p>Every visitor using Frevector.com is deemed to have accepted the following terms...</p>`
    },
    contact: {
        title: 'Contact',
        content: `<h2>Contact</h2><p>Email: <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>`
    }
};

let state = {
    allVectors: [],
    filteredVectors: [],
    currentPage: 1,
    itemsPerPage: 24,
    totalPages: 1,
    currentCategory: 'All',
    currentType: 'all', // all, vector, jpeg
    searchQuery: '',
    picksIndex: 0
};

document.addEventListener('DOMContentLoaded', async () => {
    initDarkMode();
    renderCategories();
    initEventListeners();
    await fetchVectors();
    initOurPicks();
});

function initDarkMode() {
    const btn = document.getElementById('darkModeToggle');
    const body = document.body;
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        btn.innerText = '☀️ Light Mode';
    }
    btn.onclick = () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        btn.innerText = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    };
}

async function fetchVectors() {
    showLoader(true);
    try {
        const res = await fetch('/api/vectors');
        const data = await res.json();
        state.allVectors = data;
        applyFilters();
    } catch (e) { console.error("Fetch error", e); }
    showLoader(false);
}

function applyFilters() {
    let filtered = state.allVectors;

    // 1. Type Filter
    if (state.currentType !== 'all') {
        filtered = filtered.filter(v => {
            const isJpeg = v.name.toLowerCase().includes('-jpeg-');
            return state.currentType === 'jpeg' ? isJpeg : !isJpeg;
        });
    }

    // 2. Category Filter
    if (state.currentCategory !== 'All') {
        filtered = filtered.filter(v => v.category === state.currentCategory);
    }

    // 3. Search (Keywords & Title Real-time)
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(v => 
            v.title.toLowerCase().includes(q) || 
            (v.keywords && v.keywords.some(k => k.toLowerCase().includes(q)))
        );
    }

    state.filteredVectors = filtered;
    state.totalPages = Math.ceil(filtered.length / state.itemsPerPage);
    renderGrid();
    updateH1();
    updateOurPicks();
}

function renderGrid() {
    const grid = document.getElementById('vectorsGrid');
    grid.innerHTML = '';
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const items = state.filteredVectors.slice(start, start + state.itemsPerPage);

    items.forEach(v => {
        const isJpeg = v.name.toLowerCase().includes('-jpeg-');
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="vc-img-container">
                <span class="vc-badge">${isJpeg ? 'JPEG' : 'VECTOR'}</span>
                <img src="/vector-assets/${v.category}/${isJpeg?'jpeg':'vector'}/${v.name}.jpeg" class="vc-img" alt="${v.title}" loading="lazy">
            </div>
        `;
        card.onclick = () => showDownloadPage(v);
        grid.appendChild(card);
    });
    updatePagination();
}

function updateH1() {
    const h1 = document.getElementById('categoryTitle');
    const name = state.currentCategory === 'All' ? 'Abstract' : state.currentCategory;
    h1.innerText = `Free ${name} Vectors, SVGs, Icons and Clipart`;
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    const isJpeg = v.name.toLowerCase().includes('-jpeg-');
    
    document.getElementById('dpImage').src = `/vector-assets/${v.category}/${isJpeg?'jpeg':'vector'}/${v.name}.jpeg`;
    document.getElementById('dpTitle').innerText = v.title;
    document.getElementById('dpKeywords').innerText = v.keywords ? v.keywords.join(', ') : '';
    document.getElementById('dpCategory').innerText = v.category;
    document.getElementById('dpFileFormat').innerText = isJpeg ? 'JPEG' : 'EPS, SVG, JPEG';

    const btn = document.getElementById('dpDownloadBtn');
    const box = document.getElementById('dpCountdownBox');
    const counter = document.getElementById('dpCountdown');
    let timer = null;

    btn.style.display = 'inline-block';
    box.style.display = 'none';

    btn.onclick = () => {
        btn.style.display = 'none';
        box.style.display = 'block';
        let count = 4;
        counter.innerText = count;
        timer = setInterval(() => {
            count--;
            counter.innerText = count;
            if (count <= 0) {
                clearInterval(timer);
                window.location.href = `/api/download?slug=${v.name}`;
            }
        }, 1000);
    };

    document.getElementById('dpClose').onclick = document.getElementById('dpBackBtn').onclick = () => {
        if (timer) clearInterval(timer);
        dp.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    dp.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function initOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    document.getElementById('ourPicksPrev').onclick = () => movePicks(-1);
    document.getElementById('ourPicksNext').onclick = () => movePicks(1);
}

function updateOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    track.innerHTML = '';
    const items = [...state.filteredVectors].sort(() => 0.5 - Math.random()).slice(0, 15);
    items.forEach(v => {
        const isJpeg = v.name.toLowerCase().includes('-jpeg-');
        const div = document.createElement('div');
        div.className = 'pick-item';
        div.innerHTML = `<img src="/vector-assets/${v.category}/${isJpeg?'jpeg':'vector'}/${v.name}.jpeg" class="pick-img" loading="lazy">`;
        div.onclick = () => showDownloadPage(v);
        track.appendChild(div);
    });
}

function movePicks(dir) {
    const track = document.getElementById('ourPicksTrack');
    state.picksIndex += dir;
    if (state.picksIndex < 0) state.picksIndex = 0;
    track.style.transform = `translateX(-${state.picksIndex * 132}px)`;
}

function renderCategories() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = '<a href="#" class="cat-item active" data-cat="All">All</a>';
    CATEGORIES.forEach(c => {
        const a = document.createElement('a');
        a.href = '#'; a.className = 'cat-item'; a.dataset.cat = c; a.innerText = c;
        list.appendChild(a);
    });
}

function initEventListeners() {
    document.addEventListener('click', e => {
        const catLink = e.target.closest('[data-cat]');
        if (catLink) {
            e.preventDefault();
            document.querySelectorAll('[data-cat]').forEach(el => el.classList.remove('active'));
            catLink.classList.add('active');
            state.currentCategory = catLink.dataset.cat;
            state.currentPage = 1;
            applyFilters();
        }

        const typeLink = e.target.closest('[data-type]');
        if (typeLink) {
            e.preventDefault();
            document.querySelectorAll('[data-type]').forEach(el => el.classList.remove('active'));
            typeLink.classList.add('active');
            state.currentType = typeLink.dataset.type;
            state.currentPage = 1;
            applyFilters();
        }

        const trigger = e.target.closest('.modal-trigger');
        if (trigger) {
            e.preventDefault();
            const m = MODAL_CONTENTS[trigger.dataset.modal];
            document.getElementById('infoModalBody').innerHTML = m.content;
            document.getElementById('infoModal').style.display = 'flex';
        }
    });

    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
    
    const searchInput = document.getElementById('searchInput');
    searchInput.oninput = () => {
        state.searchQuery = searchInput.value;
        state.currentPage = 1;
        applyFilters();
    };

    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; renderGrid(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; renderGrid(); } };
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }
