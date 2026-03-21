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

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

async function init() {
    setupCategories();
    setupEventListeners();
    setupOurPicksArrows();
    await fetchVectors();
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';
    
    const types = ['all', 'vector', 'jpeg'];
    types.forEach(t => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedType === t ? ' active' : '');
        a.textContent = t.toUpperCase();
        a.onclick = (e) => { e.preventDefault(); state.selectedType = t; state.currentPage = 1; fetchVectors(); setupCategories(); };
        list.appendChild(a);
    });

    const divider = document.createElement('div');
    divider.style.margin = '10px 0';
    divider.style.borderTop = '1px solid #eee';
    list.appendChild(divider);

    const allLink = document.createElement('a');
    allLink.className = 'category-item' + (state.selectedCategory === 'all' ? ' active' : '');
    allLink.textContent = 'All Categories';
    allLink.onclick = (e) => { e.preventDefault(); state.selectedCategory = 'all'; state.currentPage = 1; fetchVectors(); setupCategories(); };
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = (e) => { e.preventDefault(); state.selectedCategory = cat; state.currentPage = 1; fetchVectors(); setupCategories(); };
        list.appendChild(a);
    });
}

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
        <div class="vector-card" onclick='showDownloadPage(${JSON.stringify(v).replace(/'/g, "&apos;")})'>
            <div class="vc-img-wrap"><img src="${v.thumbnail}" class="vc-img"></div>
            <div class="vc-info"><div>${v.title}</div></div>
        </div>
    `).join('');
}

function renderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track || !state.vectors.length) return;
    track.innerHTML = '';
    state.ourPicksOffset = 0;
    track.style.transform = `translateX(0px)`;

    state.vectors.slice(0, 15).forEach(v => {
        const div = document.createElement('div');
        div.className = 'our-picks-item';
        div.style.flex = '0 0 150px';
        div.style.height = '100px';
        div.style.cursor = 'pointer';
        div.innerHTML = `<img src="${v.thumbnail}" style="width:100%; height:100%; object-fit:cover; border-radius:4px; border:1px solid #ddd;">`;
        div.onclick = () => showDownloadPage(v);
        track.appendChild(div);
    });
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    if (!dp) return;

    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpTitle').textContent = v.title || 'Vector Asset';
    document.getElementById('dpDescription').textContent = v.description || 'High quality professional vector resource.';
    document.getElementById('dpFileFormat').textContent = v.fileFormat || 'EPS / SVG';
    document.getElementById('dpCategory').textContent = v.category || 'Vector';
    document.getElementById('dpFileSize').textContent = v.fileSize || 'Scalable';

    const kwContainer = document.getElementById('dpKeywords');
    kwContainer.innerHTML = '';
    if (v.keywords) {
        v.keywords.split(',').slice(0, 10).forEach(kw => {
            const span = document.createElement('span');
            span.className = 'kw-tag';
            span.textContent = kw.trim();
            kwContainer.appendChild(span);
        });
    }

    const dlBtn = document.getElementById('dpDownloadBtn');
    const countdownBox = document.getElementById('dpCountdownBox');
    const countdownNum = document.getElementById('dpCountdown');

    dlBtn.style.display = 'block';
    countdownBox.style.display = 'none';

    dlBtn.onclick = () => {
        dlBtn.style.display = 'none';
        countdownBox.style.display = 'block';
        let count = 4;
        countdownNum.textContent = count;
        
        const timer = setInterval(() => {
            count--;
            countdownNum.textContent = count;
            if (count <= 0) {
                clearInterval(timer);
                window.location.href = v.downloadUrl || '#';
                setTimeout(() => { dp.style.display = 'none'; }, 2000);
            }
        }, 1000);
    };

    dp.style.display = 'flex';
}

function setupOurPicksArrows() {
    const prev = document.getElementById('ourPicksPrev');
    const next = document.getElementById('ourPicksNext');
    const track = document.getElementById('ourPicksTrack');
    
    next.onclick = () => {
        const maxScroll = track.scrollWidth - track.parentElement.clientWidth;
        state.ourPicksOffset = Math.max(state.ourPicksOffset - 300, -maxScroll);
        track.style.transform = `translateX(${state.ourPicksOffset}px)`;
    };
    prev.onclick = () => {
        state.ourPicksOffset = Math.min(state.ourPicksOffset + 300, 0);
        track.style.transform = `translateX(${state.ourPicksOffset}px)`;
    };
}

function setupEventListeners() {
    document.getElementById('dpClose').onclick = () => document.getElementById('downloadPage').style.display = 'none';
    document.getElementById('prevBtn').onclick = () => { if(state.currentPage > 1) { state.currentPage--; fetchVectors(); }};
    document.getElementById('nextBtn').onclick = () => { if(state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); }};
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

document.addEventListener('DOMContentLoaded', init);
