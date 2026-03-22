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
        content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p><p>All designs on the site are created exclusively by Frevector artists.</p>`
    },
    privacy: {
        title: 'PRIVACY POLICY',
        content: `<h2>PRIVACY POLICY</h2><p>At Frevector, we care about your privacy. We do not collect personal identification information unless you voluntarily provide it.</p>`
    },
    terms: {
        title: 'TERMS OF SERVICE',
        content: `<h2>TERMS OF SERVICE</h2><p>By using Frevector.com, you agree that you may not redistribute or sell our original files on other stock platforms.</p>`
    },
    contact: {
        title: 'CONTACT US',
        content: `<h2>CONTACT US</h2><p>If you have any questions, feel free to reach out to us at: <b>info@frevector.com</b></p>`
    }
};

let state = {
    allVectors: [],
    currentPage: 1,
    totalPages: 1,
    limit: 24,
    searchQuery: '',
    selectedCategory: '',
    sortOrder: '',
    countdownInterval: null
};

async function init() {
    renderCategories();
    setupEventListeners();
    setupFooterModals();
    await fetchVectors();
}

function renderCategories() {
    const list = document.getElementById('categoryList');
    list.innerHTML = '';
    
    const allLi = document.createElement('li');
    allLi.className = `cat-item ${state.selectedCategory === '' ? 'active' : ''}`;
    allLi.textContent = 'All Categories';
    allLi.onclick = () => {
        state.selectedCategory = '';
        state.currentPage = 1;
        renderCategories();
        fetchVectors();
    };
    list.appendChild(allLi);

    CATEGORIES.forEach(cat => {
        const li = document.createElement('li');
        li.className = `cat-item ${state.selectedCategory === cat ? 'active' : ''}`;
        li.textContent = cat;
        li.onclick = () => {
            state.selectedCategory = cat;
            state.currentPage = 1;
            renderCategories();
            fetchVectors();
        };
        list.appendChild(li);
    });
}

async function fetchVectors() {
    showLoader(true);
    try {
        const params = new URLSearchParams({
            page: state.currentPage,
            limit: state.limit,
            search: state.searchQuery,
            category: state.selectedCategory,
            sort: state.sortOrder
        });

        const res = await fetch(`/api/vectors?${params.toString()}`);
        const data = await res.json();
        
        state.allVectors = data.vectors;
        state.totalPages = data.totalPages;
        
        renderGrid();
        updatePagination();
    } catch (e) {
        console.error("Fetch error:", e);
    } finally {
        showLoader(false);
    }
}

function renderGrid() {
    const grid = document.getElementById('vectorGrid');
    grid.innerHTML = '';

    state.allVectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="card-img-container"><img src="${v.thumbnail}" alt="${v.title}" class="card-img" loading="lazy"></div>
            <div class="card-info"><div class="card-title">${v.title}</div></div>
        `;
        card.onclick = () => openDownloadPage(v);
        grid.appendChild(card);
    });
}

function openDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpCategory').textContent = v.category || 'Miscellaneous';
    
    const kwBox = document.getElementById('dpKeywords');
    kwBox.innerHTML = '';
    const keywords = Array.isArray(v.keywords) ? v.keywords : (v.keywords || '').split(',');
    keywords.forEach(kw => {
        if(kw.trim()){
            const span = document.createElement('span');
            span.className = 'key-tag';
            span.textContent = kw.trim();
            kwBox.appendChild(span);
        }
    });

    const dlBtn = document.getElementById('dpDownloadBtn');
    const cdBox = document.getElementById('dpCountdownBox');
    const cdNum = document.getElementById('dpCountdown');
    
    dlBtn.style.display = 'block';
    cdBox.style.display = 'none';

    dlBtn.onclick = () => {
        dlBtn.style.display = 'none';
        cdBox.style.display = 'block';
        let count = 4;
        cdNum.textContent = count;
        state.countdownInterval = setInterval(() => {
            count--;
            cdNum.textContent = count;
            if (count <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = v.downloadUrl;
            }
        }, 1000);
    };

    dp.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    document.getElementById('dpClose').onclick = () => {
        dp.style.display = 'none';
        document.body.style.overflow = 'auto';
        if(state.countdownInterval) clearInterval(state.countdownInterval);
    };
}

function setupFooterModals() {
    const modal = document.getElementById('infoModal');
    const body = document.getElementById('infoModalBody');
    const closeBtn = document.getElementById('infoModalClose');

    document.querySelectorAll('.footer-links a').forEach(link => {
        link.onclick = () => {
            const type = link.getAttribute('data-modal');
            if (MODAL_CONTENTS[type]) {
                body.innerHTML = MODAL_CONTENTS[type].content;
                modal.style.display = 'flex';
            }
        };
    });
    closeBtn.onclick = () => modal.style.display = 'none';
}

function setupEventListeners() {
    let searchTimeout;
    document.getElementById('searchInput').oninput = (e) => { 
        state.searchQuery = e.target.value.toLowerCase().trim();
        state.currentPage = 1;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => fetchVectors(), 300);
    };
    document.getElementById('sortFilter').onchange = (e) => { state.sortOrder = e.target.value; fetchVectors(); };
    document.getElementById('prevBtn').onclick = () => { if(state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if(state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }

document.addEventListener('DOMContentLoaded', init);
