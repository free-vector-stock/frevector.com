/**
 * frevector.com - Frontend Core Logic
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

// Footer link içerikleri
const MODAL_CONTENTS = {
    about: { 
        title: 'ABOUT US', 
        content: `<h2>ABOUT US</h2>
        <p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
        <p>The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process.</p>
        <p>Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p>
        <p>Frevector.com includes the following content: Vector illustrations, Icon sets, Logo design elements, Graphic elements, Various design resources.</p>
        <p>All files can be used in both personal and commercial projects. <strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package.</p>
        <p>Frevector is a platform that values labor, original production, and an ethical approach to design.</p>` 
    },
    privacy: { 
        title: 'PRIVACY POLICY', 
        content: `<h2>PRIVACY POLICY</h2>
        <p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>
        <h3>1. Data Collected</h3>
        <p>Anonymous data like cookies, browser/device info, IP address (for analytics), and interaction data may be collected automatically.</p>
        <h3>2. Purposes of Data Use</h3>
        <p>Data is used for improving site performance, enhancing user experience, security, and supporting the development process.</p>
        <h3>3. Personal Data</h3>
        <p>Personal data (name, email) is only processed when voluntarily shared (e.g., via email). Frevector does not sell user data to third parties.</p>
        <h3>4. Cookie Policy</h3>
        <p>Cookies may be used to support site functions. Users can limit or disable cookies through browser settings.</p>
        <h3>5. Data Security</h3>
        <p>Necessary technical measures are taken to protect data. However, complete security over the internet cannot be guaranteed.</p>` 
    },
    terms: { 
        title: 'TERMS OF SERVICE', 
        content: `<h2>TERMS OF SERVICE</h2>
        <p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
        <h3>1. Content Ownership</h3>
        <p>All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
        <h3>2. Right of Use</h3>
        <p>Downloaded files can be used in personal and commercial projects. The user may edit the files for their own projects.</p>
        <h3>3. Prohibited Uses</h3>
        <p>Redistributing files, uploading to other sites, selling files digitally or physically, or sharing as an archive/package is strictly prohibited.</p>
        <h3>4. Liability</h3>
        <p>Frevector cannot be held responsible for any damages arising from the use of the content.</p>
        <hr>
        <h2>LICENSE DESCRIPTION</h2>
        <p><strong>Usage Permission:</strong> Personal projects, Commercial projects, Editing allowed.</p>
        <p><strong>Prohibitions:</strong> Sharing as-is, Redistribution, Selling, Bulk archives.</p>` 
    },
    contact: { 
        title: 'CONTACT & COPYRIGHT', 
        content: `<h2>CONTACT</h2>
        <p>If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p>
        <p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000; font-weight:bold;">hakankacar2014@gmail.com</a></p>
        <hr>
        <h2>COPYRIGHT NOTICE</h2>
        <p>If you believe any content infringes your copyright, please contact us with proof, the link to the content, and your contact information.</p>
        <hr>
        <h2>FREQUENTLY ASKED QUESTIONS</h2>
        <p><strong>1. Are the files free?</strong> Yes, for personal and commercial projects.</p>
        <p><strong>2. Can I sell the files?</strong> No, redistribution and selling are prohibited.</p>
        <p><strong>3. Can I use for clients?</strong> Yes, but you cannot provide the file itself as a product.</p>` 
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
    let displayCat = cat;
    const specialCases = { 'Animals': 'Animal', 'The Arts': 'Art', 'Backgrounds': 'Background', 'Buildings': 'Building', 'Celebrities': 'Celebrity', 'Holidays': 'Holiday' };
    if (specialCases[cat]) displayCat = specialCases[cat];
    return `Free ${displayCat} Vectors, SVGs, Icons and Clipart`;
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
    closeDetailPanel();
    setupCategories();
    document.getElementById('categoryTitle').textContent = getH1Text(cat);
    fetchVectors().then(() => fetchAndRenderOurPicks());
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
    if (state.vectors.length === 0) {
        grid.innerHTML = '<p style="padding:20px; color:#999;">No results found.</p>';
        return;
    }
    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const typeBadge = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        card.innerHTML = `
            <div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" alt="${v.title}">${typeBadge}</div>
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
                    <button class="detail-close-btn" id="mainCloseBtn" style="background:#ddd; border:none; padding:10px 20px; cursor:pointer;">Close</button>
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
    document.getElementById('dpCategory').textContent = v.category || '-';
    document.getElementById('dpKeywords').innerHTML = (v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('');
    document.getElementById('dpDownloadBtn').style.display = 'block';
    document.getElementById('dpCountdownBox').style.display = 'none';
    document.getElementById('dpDownloadBtn').onclick = () => {
        document.getElementById('dpDownloadBtn').style.display = 'none';
        document.getElementById('dpCountdownBox').style.display = 'block';
        let c = 4;
        document.getElementById('dpCountdown').textContent = c;
        if(state.countdownInterval) clearInterval(state.countdownInterval);
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
            const modalData = MODAL_CONTENTS[b.dataset.modal];
            if (modalData) {
                document.getElementById('infoModalBody').innerHTML = modalData.content;
                document.getElementById('infoModal').style.display = 'flex';
            }
        };
    });
    document.getElementById('infoModalClose').onclick = () => document.getElementById('infoModal').style.display = 'none';
}

function setupEventListeners() { 
    let timeout = null;
    const input = document.getElementById('searchInput');
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
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        const res = await fetch(url);
        const data = await res.json();
        const picks = data.vectors || [];
        track.innerHTML = '';
        state.originalPicksCount = picks.length;
        if (picks.length === 0) return;
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
    document.getElementById('pageNumber').textContent = state.currentPage; 
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`; 
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }

document.addEventListener('DOMContentLoaded', init);
