/**
 * frevector.com - Frontend Core Logic
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

// Footer içerikleri - En Güncel ve Eksiksiz Metinler
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
        <p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>
        <h3>1. Data Collected</h3>
        <p>When you visit the site, certain anonymous data may be collected automatically. This data does not directly identify you. Collected data may include: Cookies, Browser and device information, IP address (for anonymous analytical purposes), Page visit and interaction data, Analytical usage information.</p>
        <h3>2. Purposes of Data Use</h3>
        <p>The collected data may be used for: Improving site performance, Enhancing user experience, Detecting technical issues, Ensuring security, Supporting the content development process.</p>
        <h3>3. Personal Data</h3>
        <p>Personal data (name, email, etc.) is only processed when voluntarily shared by the user—for example, via emails sent for communication purposes. Frevector does not sell user data to third parties or share it for commercial purposes.</p>
        <h3>4. Cookie Policy</h3>
        <p>Cookies may be used on the site to support site functions, remember user preferences, and measure performance. Users can limit or disable the use of cookies through their browser settings.</p>
        <h3>5. Data Security</h3>
        <p>Necessary technical and administrative measures are taken to protect data. However, it cannot be guaranteed that data transmission over the internet is completely secure.</p>` 
    },
    terms: { 
        title: 'TERMS OF SERVICE & LICENSE', 
        content: `<h2>TERMS OF SERVICE</h2>
        <p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
        <h3>1. Content Ownership</h3>
        <p>All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
        <h3>2. Right of Use</h3>
        <p>Downloaded files can be used in personal and commercial projects. The user may edit the files for their own projects and incorporate them into their work.</p>
        <h3>3. Prohibited Uses</h3>
        <p>The following actions are prohibited: Redistributing files, Uploading to other sites, Selling files digitally or physically, Sharing as an archive, package, or collection, Presenting Frevector content as a resource on other platforms.</p>
        <h3>4. Liability</h3>
        <p>Frevector cannot be held responsible for any direct or indirect damages arising from the use of the content.</p>
        <h3>5. Right to Change</h3>
        <p>Frevector reserves the right to update the terms of service and site content as necessary.</p>
        <hr style="margin:20px 0;">
        <h2>LICENSE DESCRIPTION</h2>
        <p><strong>Usage Permission:</strong> Can be used in personal projects, Can be used in commercial projects, Can be edited and integrated into projects.</p>
        <p><strong>Prohibitions:</strong> Sharing files as-is, Redistribution, Selling, Presenting as a resource on other sites, Sharing within bulk content archives.</p>` 
    },
    contact: { 
        title: 'CONTACT & FAQ', 
        content: `<h2>CONTACT</h2>
        <p>If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p>
        <p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>
        <hr style="margin:20px 0;">
        <h2>FREQUENTLY ASKED QUESTIONS</h2>
        <p><strong>1. Are the files free?</strong><br>Yes. Files can be used for free in personal and commercial projects.</p>
        <p><strong>2. Can I sell the files?</strong><br>No. Selling or redistributing the files is prohibited.</p>
        <p><strong>3. Can I use the files for my clients?</strong><br>Yes. They can be used in commercial projects. However, the file itself cannot be provided as a separate product.</p>
        <p><strong>4. Can I upload the files to another site?</strong><br>No. Redistribution is not permitted.</p>
        <hr style="margin:20px 0;">
        <h2>COPYRIGHT NOTICE</h2>
        <p>Frevector values original production and respects copyrights. If you believe that any content infringes your copyright, please contact us at <strong>hakankacar2014@gmail.com</strong>.</p>` 
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
    openedCardEl: null,
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

function getH1Text(cat) {
    if (cat === 'all') return "Free Vectors, SVGs, Icons and Clipart";
    return `Free ${cat} Vectors, SVGs, Icons and Clipart`;
}

function setupTypeFilters() {
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-filter').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
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
    document.getElementById('categoryTitle').textContent = getH1Text(cat);
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
    if (!grid) return;
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const badge = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        card.innerHTML = `
            <div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" alt="${v.title}">${badge}</div>
            <div class="vc-info">
                <div class="vc-description">${v.title || "Untitled"}</div>
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
    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left"><img class="detail-img" src="${v.thumbnail}"></div>
            <div class="detail-right">
                <h2 class="detail-title">${v.title}</h2>
                <div class="detail-keywords">${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}</div>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD PAGE</button>
                    <button id="mainCloseBtn" style="background:#ddd; border:none; padding:10px 20px; cursor:pointer;">Close</button>
                </div>
            </div>
        </div>
    `;
    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.children);
    const index = cards.indexOf(cardEl);
    const cols = window.innerWidth >= 1200 ? 6 : (window.innerWidth >= 768 ? 4 : 1);
    const insertAfter = Math.min(cards.length - 1, Math.floor(index / cols) * cols + (cols - 1));
    grid.insertBefore(panel, cards[insertAfter].nextSibling);
    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeDetailPanel() {
    const p = document.getElementById('detailPanel');
    if (p) p.remove();
    if (state.openedCardEl) state.openedCardEl.classList.remove('card-active');
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpKeywords').innerHTML = (v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('') + `<span class="kw-tag" style="background:#15803d; color:white;">VECTOR</span>`;
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
            if (c <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
            }
        }, 1000);
    };
    dp.style.display = 'flex';
}

function setupModalHandlers() { 
    document.querySelectorAll('.modal-trigger').forEach(b => {
        b.onclick = (e) => {
            e.preventDefault();
            const data = MODAL_CONTENTS[b.dataset.modal];
            if (data) {
                document.getElementById('infoModalBody').innerHTML = data.content;
                document.getElementById('infoModal').style.display = 'flex';
            }
        };
    });
    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
    window.onclick = (event) => {
        const modal = document.getElementById('infoModal');
        if (event.target == modal) { modal.style.display = "none"; }
    }
}

function setupEventListeners() { 
    const input = document.getElementById('searchInput');
    let timeout = null;
    input.oninput = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            state.searchQuery = input.value.trim();
            state.currentPage = 1;
            fetchVectors();
        }, 300);
    };
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } }; 
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } }; 
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', '1');
        url.searchParams.set('limit', '15'); 
        const res = await fetch(url);
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
        state.ourPicksOffset = picks.length * 90;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    } catch (err) { console.error(err); }
}

function scrollOurPicks(dir) {
    if (state.isTransitioning) return;
    const track = document.getElementById('ourPicksTrack');
    const setWidth = state.originalPicksCount * 90;
    if (setWidth === 0) return;
    state.isTransitioning = true;
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
        if(state.countdownInterval) clearInterval(state.countdownInterval); 
    };
}

function updatePagination() { 
    const pNum = document.getElementById('pageNumber');
    const pTot = document.getElementById('pageTotal');
    if(pNum) pNum.textContent = state.currentPage; 
    if(pTot) pTot.textContent = `/ ${state.totalPages}`; 
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }

document.addEventListener('DOMContentLoaded', init);
