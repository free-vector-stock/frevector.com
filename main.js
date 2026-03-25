/**
 * frevector.com - Frontend Logic
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

let state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    currentCategory: 'All',
    currentType: 'all',
    searchQuery: '',
    picksIndex: 0,
    downloadCountdown: null
};

document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    setupEventListeners();
    fetchVectors();
});

function initCategories() {
    const list = document.getElementById('categoryList');
    CATEGORIES.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.textContent = cat;
        li.onclick = () => {
            state.currentCategory = cat;
            state.currentPage = 1;
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            updateH1(cat);
            fetchVectors();
        };
        list.appendChild(li);
    });
}

function updateH1(cat) {
    const h1 = document.getElementById('categoryH1');
    h1.textContent = cat === 'All' ? 'Free Vectors, SVGs, Icons and Clipart' : `Free ${cat} Vectors, SVGs, Icons and Clipart`;
}

function fetchVectors() {
    showLoader(true);
    let url = `/api/vectors?page=${state.currentPage}&category=${encodeURIComponent(state.currentCategory)}&type=${state.currentType}&search=${encodeURIComponent(state.searchQuery)}`;
    
    fetch(url).then(res => res.json()).then(data => {
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        renderGrid();
        if (state.currentPage === 1) renderPicks(data.ourPicks || []);
        updatePagination();
        showLoader(false);
    }).catch(() => showLoader(false));
}

function renderGrid() {
    const grid = document.getElementById('vectorGrid');
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const isJpeg = v.file_name?.toLowerCase().includes('jpeg');
        card.innerHTML = `
            <div class="vc-img-container">
                <span class="type-badge">${isJpeg ? 'JPEG' : 'VECTOR'}</span>
                <img src="${v.thumbnail_url}" class="vc-img" loading="lazy">
            </div>
        `;
        card.onclick = () => openDetail(v, card);
        grid.appendChild(card);
    });
}

function openDetail(v, card) {
    const existing = document.getElementById('detailPanel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="detail-content">
            <img src="${v.thumbnail_url}" class="detail-img">
            <div>
                <h2>${v.title}</h2>
                <div style="margin: 20px 0; display: flex; flex-wrap: wrap; gap: 8px;">
                    ${(v.keywords || '').split(',').slice(0, 5).map(k => `<span style="background:var(--bg-secondary); padding:4px 8px; border-radius:4px; font-size:12px;">${k.trim()}</span>`).join('')}
                </div>
                <button class="download-page-btn" onclick="openDownloadPage(${JSON.stringify(v).replace(/"/g, '&quot;')})">DOWNLOAD PAGE</button>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:15px; right:15px; background:none; border:none; cursor:pointer; font-size:24px; color:var(--text-muted);">✕</button>
        </div>
    `;

    const grid = document.getElementById('vectorGrid');
    const cards = Array.from(grid.children);
    const index = cards.indexOf(card);
    const itemsPerRow = window.innerWidth > 768 ? 4 : 2;
    const rowEnd = Math.min(Math.floor(index / itemsPerRow) * itemsPerRow + (itemsPerRow - 1), cards.length - 1);
    grid.insertBefore(panel, cards[rowEnd].nextSibling);
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderPicks(picks) {
    const track = document.getElementById('ourPicksTrack');
    track.innerHTML = '';
    picks.forEach(p => {
        const div = document.createElement('div');
        div.className = 'picks-item';
        div.innerHTML = `<img src="${p.thumbnail_url}">`;
        div.onclick = () => openDownloadPage(p);
        track.appendChild(div);
    });
}

function openDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.thumbnail_url;
    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpCategory').textContent = v.category || '-';
    document.getElementById('dpFileFormat').textContent = v.file_name?.split('.').pop().toUpperCase() || 'EPS';
    document.getElementById('dpFileSize').textContent = v.size || 'N/A';
    
    const btn = document.getElementById('dpDownloadBtn');
    const countBox = document.getElementById('dpCountdownBox');
    btn.style.display = 'block';
    countBox.style.display = 'none';

    btn.onclick = () => {
        btn.style.display = 'none';
        countBox.style.display = 'block';
        let count = 4;
        document.getElementById('dpCountdown').textContent = count;
        if (state.downloadCountdown) clearInterval(state.downloadCountdown);
        state.downloadCountdown = setInterval(() => {
            count--;
            document.getElementById('dpCountdown').textContent = count;
            if (count <= 0) {
                clearInterval(state.downloadCountdown);
                window.location.href = v.download_url;
            }
        }, 1000);
    };

    dp.style.display = 'block';
    window.scrollTo(0,0);
}

function setupEventListeners() {
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
    
    document.getElementById('searchInput').onkeypress = (e) => {
        if (e.key === 'Enter') {
            state.searchQuery = e.target.value;
            state.currentPage = 1;
            fetchVectors();
        }
    };

    document.querySelectorAll('[data-type]').forEach(btn => {
        btn.onclick = () => {
            state.currentType = btn.dataset.type;
            state.currentPage = 1;
            document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            fetchVectors();
        };
    });

    document.getElementById('picksNext').onclick = () => {
        state.picksIndex++;
        document.getElementById('ourPicksTrack').style.transform = `translateX(-${state.picksIndex * 220}px)`;
    };
    document.getElementById('picksPrev').onclick = () => {
        if (state.picksIndex > 0) {
            state.picksIndex--;
            document.getElementById('ourPicksTrack').style.transform = `translateX(-${state.picksIndex * 220}px)`;
        }
    };

    document.getElementById('dpBackBtn').onclick = () => {
        document.getElementById('downloadPage').style.display = 'none';
        if (state.downloadCountdown) clearInterval(state.downloadCountdown);
    };
}

function showLoader(show) { document.getElementById('loader').style.display = show ? 'flex' : 'none'; }
function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}
