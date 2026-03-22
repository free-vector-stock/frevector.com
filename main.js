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
            <li>Various design resources</li>
        </ul>
        <p>All files can be used in both personal and commercial projects.</p>
        <p><strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package.</p>
        <p>Frevector is a platform that values labor, original production, and an ethical approach to design.</p>` 
    },
    privacy: { 
        title: 'PRIVACY POLICY', 
        content: `<h2>PRIVACY POLICY</h2>
        <p>As Frevector.com, we prioritize the privacy and security of our visitors. This policy explains the types of information we collect and how we use it.</p>
        <p><strong>1. Log Files:</strong> Frevector uses log files for analytical purposes. This includes IP addresses, browser types, and date/time stamps.</p>
        <p><strong>2. Cookies:</strong> We use cookies to improve user experience and analyze site traffic.</p>
        <p><strong>3. Third-Party Links:</strong> Our site may contain links to other websites. We are not responsible for the privacy policies of these sites.</p>` 
    },
    terms: { 
        title: 'TERMS OF SERVICE', 
        content: `<h2>TERMS OF SERVICE & LICENSE</h2>
        <p><strong>1. Usage License:</strong> You can use the designs for personal or commercial purposes (advertisements, social media, websites, print media, etc.).</p>
        <p><strong>2. Prohibited Uses:</strong></p>
        <ul>
            <li>Redistribution or Selling</li>
            <li>Presenting as a resource on other sites</li>
            <li>Sharing within bulk content archives</li>
        </ul>
        <p>The Frevector license allows designs to be used in end-user projects. It does not allow the sharing of the file itself.</p>
        <hr>
        <h2>COPYRIGHT NOTICE</h2>
        <p>Frevector values original production and respects copyrights. The content on the site has been prepared by Frevector artists. Nevertheless, if you believe that any content infringes your copyright, please contact us at <strong>hakankacar2014@gmail.com</strong>.</p>
        <hr>
        <h2>FREQUENTLY ASKED QUESTIONS</h2>
        <p><strong>1. Are the files free?</strong> Yes. <strong>2. Can I sell the files?</strong> No. <strong>3. Can I use for clients?</strong> Yes. <strong>4. Can I upload to another site?</strong> No.</p>` 
    },
    contact: { 
        title: 'CONTACT', 
        content: `<h2>CONTACT US</h2>
        <p>If you have any questions, suggestions, or feedback regarding Frevector.com, please get in touch with us.</p>
        <p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>
        <p>Frevector prioritizes clear and transparent communication with its users.</p>` 
    }
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    selectedCategory: 'all',
    selectedType: 'all',
    searchQuery: '',
    sortOrder: '',
    isLoading: false,
    openedVector: null,
    openedCardEl: null,
    ourPicksOffset: 0,
    isTransitioning: false,
    countdownInterval: null
};

async function init() {
    setupCategories();
    setupTypes();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    await fetchVectors();
    setupOurPicksArrows();
}

function setupTypes() {
    const typeItems = document.querySelectorAll('#typeList .category-item');
    typeItems.forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            typeItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            state.selectedType = item.dataset.type;
            state.currentPage = 1;
            fetchVectors();
        };
    });
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';
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

function selectCategory(cat) {
    state.selectedCategory = cat;
    state.currentPage = 1;
    closeDetailPanel();
    setupCategories();
    document.getElementById('categoryTitle').textContent = cat === 'all' ? "Free Vectors, SVGs, Icons and Clipart" : `Free ${cat} Vectors`;
    fetchVectors();
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);
    try {
        const url = `/api/vectors?page=${state.currentPage}&category=${state.selectedCategory}&type=${state.selectedType}&search=${encodeURIComponent(state.searchQuery)}&sort=${state.sortOrder}`;
        const res = await fetch(url);
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        renderVectors();
        updatePagination();
        fillOurPicksFromState();
    } catch (err) { console.error(err); }
    finally { state.isLoading = false; showLoader(false); }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        // Dinamik Etiket Belirleme (Vector veya JPEG)
        const fileType = v.type ? v.type.toUpperCase() : 'VECTOR';
        card.innerHTML = `
            <div class="vc-img-wrap">
                <div class="card-type-badge">${fileType}</div>
                <img class="vc-img" src="${v.thumbnail}" alt="${v.title}">
            </div>
            <div class="vc-info">
                <div class="vc-description">${v.title}</div>
                <div class="vc-keywords">${(v.keywords || []).slice(0,3).join(', ')}</div>
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

function fillOurPicksFromState() {
    const track = document.getElementById('ourPicksTrack');
    if (!track || state.vectors.length === 0) return;
    let picks = [];
    while (picks.length < 60) { picks = [...picks, ...state.vectors]; }
    picks = picks.slice(0, 60);
    const tripled = [...picks, ...picks, ...picks];
    track.innerHTML = '';
    tripled.forEach(v => {
        const div = document.createElement('div');
        div.className = 'our-picks-item';
        // Our Picks bölümündeki görsellere de etiket eklendi
        const fileType = v.type ? v.type.toUpperCase() : 'VECTOR';
        div.innerHTML = `
            <div class="card-type-badge" style="font-size:8px; padding:2px 5px;">${fileType}</div>
            <img src="${v.thumbnail}" alt="${v.title}">
        `;
        div.onclick = () => showDownloadPage(v);
        track.appendChild(div);
    });
    const itemWidth = 195; 
    const setWidth = picks.length * itemWidth;
    state.ourPicksOffset = setWidth;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
}

function scrollOurPicks(dir) {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    const track = document.getElementById('ourPicksTrack');
    const itemsCount = track.querySelectorAll('.our-picks-item').length / 3;
    const itemWidth = 195; 
    const setWidth = itemsCount * itemWidth;

    track.style.transition = 'transform 0.4s ease';
    state.ourPicksOffset += (dir * -itemWidth);
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;

    setTimeout(() => {
        track.style.transition = 'none';
        if (state.ourPicksOffset >= (setWidth * 2)) state.ourPicksOffset -= setWidth;
        if (state.ourPicksOffset <= (setWidth * 0.5)) state.ourPicksOffset += setWidth;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
        state.isTransitioning = false;
    }, 400);
}

function openDetailPanel(v, cardEl) {
    closeDetailPanel();
    state.openedVector = v;
    state.openedCardEl = cardEl;
    cardEl.classList.add('card-active');
    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left"><img class="detail-img" src="${v.thumbnail}"></div>
            <div class="detail-right">
                <h2 class="detail-title">${v.title}</h2>
                <div class="detail-keywords">${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}</div>
                <div class="detail-actions">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD</button>
                    <button class="close-panel-btn" onclick="closeDetailPanel()">Close</button>
                </div>
            </div>
        </div>
    `;
    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.querySelectorAll('.vector-card'));
    const index = cards.indexOf(cardEl);
    // Dinamik sütun hesaplama (Masaüstü/Tablet/Mobil)
    let cols = window.innerWidth > 1200 ? 6 : (window.innerWidth > 768 ? 4 : 1);
    const rowEnd = Math.min(cards.length - 1, Math.floor(index / cols) * cols + (cols - 1));
    grid.insertBefore(panel, cards[rowEnd].nextSibling);
    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpCategory').textContent = v.category || "General";
    const kwBox = document.getElementById('dpKeywords');
    kwBox.innerHTML = '';
    (v.keywords || []).forEach(k => {
        const span = document.createElement('span');
        span.className = 'kw-tag'; span.textContent = k; kwBox.appendChild(span);
    });

    const dBtn = document.getElementById('dpDownloadBtn');
    const cBox = document.getElementById('dpCountdownBox');
    const cNum = document.getElementById('dpCountdown');

    dBtn.style.display = 'block';
    cBox.style.display = 'none';
    dBtn.onclick = () => {
        dBtn.style.display = 'none';
        cBox.style.display = 'block';
        let count = 4;
        cNum.textContent = count;
        state.countdownInterval = setInterval(() => {
            count--; cNum.textContent = count;
            if (count <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
            }
        }, 1000);
    };
    dp.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(trigger => {
        trigger.onclick = () => {
            const m = MODAL_CONTENTS[trigger.dataset.modal];
            document.getElementById('infoModalBody').innerHTML = m.content;
            document.getElementById('infoModal').style.display = 'flex';
        };
    });
    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
}

function setupOurPicksArrows() {
    document.getElementById('ourPicksPrev').onclick = () => scrollOurPicks(-1);
    document.getElementById('ourPicksNext').onclick = () => scrollOurPicks(1);
}

function setupDownloadPageHandlers() {
    document.getElementById('dpClose').onclick = () => {
        document.getElementById('downloadPage').style.display = 'none';
        document.body.style.overflow = 'auto';
        if(state.countdownInterval) clearInterval(state.countdownInterval);
    };
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
function closeDetailPanel() { 
    const p = document.getElementById('detailPanel'); if(p) p.remove();
    if(state.openedCardEl) state.openedCardEl.classList.remove('card-active');
}

document.addEventListener('DOMContentLoaded', init);
