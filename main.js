/**
 * frevector.com - Frontend Core Logic
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

// Footer içerikleri - Tam Liste ve İçerik Korundu
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
        <p>All files can be used in both personal and commercial projects. For details, please review our license terms.</p>` 
    },
    privacy: { 
        title: 'PRIVACY POLICY', 
        content: `<h2>PRIVACY POLICY</h2>
        <p>At Frevector.com, the privacy of our visitors is one of our main priorities. This Privacy Policy document contains types of information that is collected and recorded by Frevector.com and how we use it.</p>
        <p><strong>Log Files:</strong> Frevector.com follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>
        <p><strong>Cookies and Web Beacons:</strong> Like any other website, Frevector.com uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited.</p>` 
    },
    terms: { 
        title: 'TERMS & LICENSE', 
        content: `<h2>TERMS OF SERVICE & LICENSE</h2>
        <p>By accessing Frevector.com, you agree to comply with these terms of service and license conditions.</p>
        <p><strong>1. License Grant:</strong> We grant you a non-exclusive, non-transferable license to use the graphic resources for both personal and commercial purposes.</p>
        <p><strong>2. Restrictions:</strong> You may not:</p>
        <ul>
            <li>Sublicense, sell, or rent the resources.</li>
            <li>Distribute the original source files (EPS, SVG, AI, etc.) on other platforms.</li>
            <li>Claim the designs as your own work.</li>
        </ul>
        <p><strong>3. Attribution:</strong> Attribution is not required but is highly appreciated to support our community.</p>` 
    },
    contact: { 
        title: 'CONTACT', 
        content: `<h2>CONTACT US</h2>
        <p>If you have any questions, suggestions, or feedback, please feel free to contact us.</p>
        <p><strong>Email:</strong> hakankacar2014@gmail.com</p>
        <p>We typically respond to all inquiries within 24-48 hours.</p>` 
    }
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    selectedCategory: 'all',
    selectedType: 'all', // vector veya jpeg
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
    setupTypeFilters();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    await fetchVectors();
    setTimeout(() => {
        fetchAndRenderOurPicks();
        setupOurPicksArrows();
    }, 300);
}

// TALİMAT 7: Vector / JPEG Filtreleme
function setupTypeFilters() {
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-filter').forEach(f => {
                f.style.background = "#fff";
                f.style.color = "#000";
                f.style.borderColor = "#ddd";
            });
            btn.style.background = "#000";
            btn.style.color = "#fff";
            btn.style.borderColor = "#000";
            
            state.selectedType = btn.dataset.type;
            state.currentPage = 1;
            closeDetailPanel();
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
    const titleH1 = document.getElementById('categoryTitle');
    if(titleH1) titleH1.textContent = cat === 'all' ? "Free Vectors, SVGs, Icons and Clipart" : `Free ${cat} Vectors & JPEGs`;
    fetchVectors();
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        if (state.sortOrder) url.searchParams.set('sort', state.sortOrder);
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);

        const res = await fetch(url);
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        renderVectors();
        updatePagination();
    } catch (err) { console.error("Fetch error:", err); }
    finally { state.isLoading = false; showLoader(false); }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        // TALİMAT 8 & 10: JPEG İfadesi Kontrolü ve Etiketleme
        const isJpeg = v.name.toLowerCase().includes('jpeg');
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${v.title}" loading="lazy">
                ${isJpeg ? '<span class="vc-type-badge-jpeg">JPEG</span>' : ''}
            </div>
            <div class="vc-info">
                <div class="vc-description">${v.title || "Untitled Design"}</div>
                <div class="vc-keywords">${(v.keywords || []).slice(0, 3).join(', ')}</div>
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

function openDetailPanel(v, cardEl) {
    closeDetailPanel();
    state.openedVector = v;
    state.openedCardEl = cardEl;
    cardEl.classList.add('card-active');
    
    // TALİMAT 13: Keyword Otomatik Ekleme
    const isJpeg = v.name.toLowerCase().includes('jpeg');
    const prefix = isJpeg ? ["free jpeg", "free", "fre", "jpeg"] : ["free vector", "free svg", "free svg icon", "free eps", "free jpeg", "free", "fre", "vector eps", "svg", "jpeg"];
    const combinedKeywords = [...new Set([...prefix, ...(v.keywords || [])])];

    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left">
                <img class="detail-img" src="${v.thumbnail}" alt="${v.title}">
            </div>
            <div class="detail-right">
                <h2 class="detail-title">${v.title}</h2>
                <div class="detail-keywords">
                    ${combinedKeywords.map(k => `<span class="kw-tag">${k}</span>`).join('')}
                </div>
                <div class="detail-actions">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD PAGE</button>
                    <button class="close-panel-btn" id="mainCloseBtn">Close</button>
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.querySelectorAll('.vector-card'));
    const index = cards.indexOf(cardEl);
    let cols = 6;
    if (window.innerWidth <= 1200) cols = 4;
    if (window.innerWidth <= 768) cols = 1;
    const rowEndIndex = Math.min(cards.length - 1, Math.floor(index / cols) * cols + (cols - 1));
    grid.insertBefore(panel, cards[rowEndIndex].nextSibling);
    
    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    const isJpeg = v.name.toLowerCase().includes('jpeg');
    
    // Bilgileri doldur
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpCategory').textContent = v.category || "General";
    document.getElementById('dpFileFormat').textContent = isJpeg ? "JPEG" : "EPS, SVG, JPEG";
    
    const kwBox = document.getElementById('dpKeywords');
    kwBox.innerHTML = '';
    const isJpegKw = v.name.toLowerCase().includes('jpeg');
    const prefix = isJpegKw ? ["free jpeg", "free", "fre", "jpeg"] : ["free vector", "free svg", "free svg icon", "free eps", "free jpeg", "free", "fre", "vector eps", "svg", "jpeg"];
    const combined = [...new Set([...prefix, ...(v.keywords || [])])];
    combined.forEach(k => {
        const span = document.createElement('span');
        span.className = 'kw-tag';
        span.textContent = k;
        kwBox.appendChild(span);
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
            count--;
            cNum.textContent = count;
            if (count <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
            }
        }, 1000);
    };

    dp.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// DİĞER FONKSİYONLAR (Budanmadan Korundu)
function setupModalHandlers() { 
    document.querySelectorAll('.modal-trigger').forEach(trigger => {
        trigger.onclick = (e) => {
            e.preventDefault();
            const content = MODAL_CONTENTS[trigger.dataset.modal];
            if (content) {
                document.getElementById('infoModalBody').innerHTML = content.content;
                document.getElementById('infoModal').style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        };
    });
    const close = document.getElementById('infoModalClose');
    if(close) close.onclick = () => {
        document.getElementById('infoModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };
}

function setupEventListeners() { 
    const input = document.getElementById('searchInput');
    if(input) input.oninput = () => { state.searchQuery = input.value.trim(); state.currentPage = 1; fetchVectors(); };
    const sort = document.getElementById('sortFilter');
    if(sort) sort.onchange = () => { state.sortOrder = sort.value; state.currentPage = 1; fetchVectors(); };
    const prev = document.getElementById('prevBtn');
    if(prev) prev.onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    const next = document.getElementById('nextBtn');
    if(next) next.onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;
    try {
        const res = await fetch('/api/our-picks');
        const picks = await res.json();
        const tripled = [...picks, ...picks, ...picks];
        track.innerHTML = '';
        tripled.forEach(v => {
            const div = document.createElement('div');
            div.className = 'our-picks-item';
            div.innerHTML = `<img src="${v.thumbnail}" alt="${v.title}" onclick="showDownloadPageFromPicks('${v.name}')">`;
            track.appendChild(div);
        });
        const setWidth = picks.length * 270;
        state.ourPicksOffset = setWidth;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    } catch (e) { console.error(e); }
}

window.showDownloadPageFromPicks = async (slug) => {
    try {
        const res = await fetch(`/api/vector-detail?slug=${slug}`);
        const v = await res.json();
        showDownloadPage(v);
    } catch (e) { console.error(e); }
};

function scrollOurPicks(dir) {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    const track = document.getElementById('ourPicksTrack');
    const items = track.querySelectorAll('.our-picks-item').length / 3;
    const setWidth = items * 270;
    track.style.transition = 'transform 0.4s ease';
    state.ourPicksOffset += (dir * -270);
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    setTimeout(() => {
        track.style.transition = 'none';
        if (state.ourPicksOffset >= (setWidth * 2)) state.ourPicksOffset -= setWidth;
        if (state.ourPicksOffset <= (setWidth * 0.5)) state.ourPicksOffset += setWidth;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
        state.isTransitioning = false;
    }, 400);
}

function setupOurPicksArrows() {
    const prev = document.getElementById('ourPicksPrev');
    const next = document.getElementById('ourPicksNext');
    if(prev) prev.onclick = () => scrollOurPicks(-1);
    if(next) next.onclick = () => scrollOurPicks(1);
}

function setupDownloadPageHandlers() { 
    const closeBtn = document.getElementById('dpClose');
    if(closeBtn) closeBtn.onclick = () => { 
        document.getElementById('downloadPage').style.display = 'none'; 
        document.body.style.overflow = 'auto';
        if(state.countdownInterval) clearInterval(state.countdownInterval); 
    };
}

function updatePagination() { 
    const pNum = document.getElementById('pageNumber');
    const pTot = document.getElementById('pageTotal');
    if(pNum) pNum.textContent = state.currentPage; 
    if(pTot) pTot.textContent = `/ ${state.totalPages}`; 
}

function showLoader(s) { const l = document.getElementById('loader'); if(l) l.style.display = s ? 'flex' : 'none'; }
function closeDetailPanel() { 
    const p = document.getElementById('detailPanel'); 
    if (p) p.remove(); 
    if (state.openedCardEl) state.openedCardEl.classList.remove('card-active'); 
}

document.addEventListener('DOMContentLoaded', init);
