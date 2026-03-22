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
        <p>Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p>
        <p>Frevector.com includes the following content:</p>
        <ul>
            <li>Vector illustrations</li>
            <li>Icon sets</li>
            <li>Logo design elements</li>
            <li>Graphic elements</li>
        </ul>`
    },
    privacy: {
        title: 'PRIVACY POLICY',
        content: `<h2>PRIVACY POLICY</h2>
        <p>At Frevector, we care about your privacy. This policy explains how we handle your information.</p>
        <p><b>Data Collection:</b> We do not collect personal identification information unless you voluntarily provide it. We use cookies only for basic site functionality and analytics to improve user experience.</p>
        <p><b>Usage:</b> Any information provided is used solely for service delivery and platform communication. We never sell or share your data with third parties for marketing purposes.</p>`
    },
    terms: {
        title: 'TERMS OF SERVICE',
        content: `<h2>TERMS OF SERVICE</h2>
        <p>By using Frevector.com, you agree to these terms:</p>
        <ul>
            <li>All content is provided "as is" for personal and commercial use under our license.</li>
            <li>You may not redistribute or sell our original files on other stock platforms.</li>
            <li>Attribution is not required but always appreciated.</li>
        </ul>`
    },
    contact: {
        title: 'CONTACT US',
        content: `<h2>CONTACT US</h2>
        <p>If you have any questions, suggestions, or business inquiries, feel free to reach out to us.</p>
        <p><b>Email:</b> info@frevector.com</p>
        <p>Our team usually responds within 24-48 hours.</p>`
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
    const bar = document.getElementById('categoryBar');
    bar.innerHTML = `<button class="cat-btn ${state.selectedCategory === '' ? 'active' : ''}" data-cat="">All Categories</button>`;
    
    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${state.selectedCategory === cat ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => {
            state.selectedCategory = cat;
            state.currentPage = 1;
            renderCategories();
            fetchVectors();
        };
        bar.appendChild(btn);
    });

    bar.querySelector('[data-cat=""]').onclick = () => {
        state.selectedCategory = '';
        state.currentPage = 1;
        renderCategories();
        fetchVectors();
    };
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

    if (state.allVectors.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px;">No results found.</div>';
        return;
    }

    state.allVectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${v.thumbnail}" alt="${v.title}" class="card-img" loading="lazy">
            </div>
            <div class="card-info">
                <div class="card-title">${v.title}</div>
            </div>
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
    const close = document.getElementById('infoModalClose');

    document.querySelectorAll('.footer-links a').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const type = link.getAttribute('data-modal');
            if (MODAL_CONTENTS[type]) {
                body.innerHTML = MODAL_CONTENTS[type].content;
                modal.style.display = 'flex';
            }
        };
    });

    close.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };
}

function setupEventListeners() {
    let searchTimeout;
    document.getElementById('searchInput').oninput = (e) => { 
        state.searchQuery = e.target.value.toLowerCase().trim();
        state.currentPage = 1;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchVectors();
        }, 300);
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
