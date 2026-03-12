/**
 * frevector.com - Frontend Logic
 */

const EXTRA_KEYWORDS = ['free jpeg', 'free', 'jpeg', 'fre'];
const VECTOR_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'vector eps', 'svg'];

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

const MODAL_CONTENTS = {
    about: {
        title: 'About Us',
        content: `<h2>ABOUT US</h2>
<p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
<p>The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process.</p>
<p>Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p>
<p><strong>Frevector.com includes the following content:</strong></p>
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
        title: 'Privacy Policy',
        content: `<h2>PRIVACY POLICY</h2>
<p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>
<h3>1. Data Collected</h3>
<p>When you visit the site, certain anonymous data may be collected automatically. This data does not directly identify you.</p>
<p><strong>Collected data may include:</strong></p>
<ul>
<li>Cookies</li>
<li>Browser and device information</li>
<li>IP address (for anonymous analytical purposes)</li>
<li>Page visit and interaction data</li>
<li>Analytical usage information</li>
</ul>
<h3>2. Purposes of Data Use</h3>
<p>The collected data may be used for the following purposes:</p>
<ul>
<li>Improving site performance</li>
<li>Enhancing user experience</li>
<li>Detecting technical issues</li>
<li>Ensuring security</li>
<li>Supporting the content development process</li>
</ul>
<h3>3. Personal Data</h3>
<p>Personal data (name, email, etc.) is only processed when voluntarily shared by the user—for example, via emails sent for communication purposes. Frevector does not sell user data to third parties or share it for commercial purposes.</p>
<h3>4. Cookie Policy</h3>
<p>Cookies may be used on the site to support site functions, remember user preferences, and measure performance. Users can limit or disable the use of cookies through their browser settings.</p>
<h3>5. Data Security</h3>
<p>Necessary technical and administrative measures are taken to protect data. However, it cannot be guaranteed that data transmission over the internet is completely secure.</p>`
    },
    terms: {
        title: 'Terms of Service',
        content: `<h2>TERMS OF SERVICE</h2>
<p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
<h3>1. Content Ownership</h3>
<p>All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
<h3>2. Right of Use</h3>
<p>Downloaded files can be used in personal and commercial projects. The user may edit the files for their own projects and incorporate them into their work.</p>
<h3>3. Prohibited Uses</h3>
<p><strong>The following actions are prohibited:</strong></p>
<ul>
<li>Redistributing files</li>
<li>Uploading to other sites</li>
<li>Selling files digitally or physically</li>
<li>Sharing as an archive, package, or collection</li>
<li>Presenting Frevector content as a resource on other platforms</li>
</ul>
<h3>4. Liability</h3>
<p>Frevector cannot be held responsible for any direct or indirect damages arising from the use of the content. Technical malfunctions or temporary access issues may occur on the platform from time to time.</p>
<h3>5. Right to Change</h3>
<p>Frevector reserves the right to update the terms of service and site content as necessary.</p>`
    },
    contact: {
        title: 'Contact',
        content: `<div style="text-align: center;">
<h2>Contact Us</h2>
<p style="margin-bottom: 30px; font-size: 16px;">If you have any questions about Frevector.com or have something you would like to communicate, you can contact us.</p>
<div style="background: #f5f5f5; padding: 30px; border-radius: 8px; display: inline-block;">
<p style="margin: 0 0 15px 0; font-size: 14px; color: #666;"><strong>Email Address:</strong></p>
<p style="margin: 0;"><a href="mailto:hakankacar2014@gmail.com" style="color: #0066cc; text-decoration: none; font-size: 18px; font-weight: 600; cursor: pointer;">hakankacar2014@gmail.com</a></p>
</div>
<p style="margin-top: 30px; font-size: 14px; color: #666;">Frevector values open and clear communication with its users.</p>
</div>`
    }
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedCategory: 'all',
    searchQuery: '',
    isLoading: false,
    openedVector: null,
    openedCardEl: null,
    countdownInterval: null,
    detailPanelOpen: false,
    downloadInProgress: false
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    await fetchVectors();
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = 'category-item active';
    allLink.dataset.cat = 'all';
    allLink.textContent = 'All';
    allLink.addEventListener('click', (e) => { e.preventDefault(); selectCategory('all'); });
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'category-item';
        a.dataset.cat = cat;
        a.textContent = cat;
        a.addEventListener('click', (e) => { e.preventDefault(); selectCategory(cat); });
        list.appendChild(a);
    });
}

function selectCategory(cat) {
    state.selectedCategory = cat;
    state.currentPage = 1;
    state.searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    closeDetailPanel();
    document.querySelectorAll('.category-item').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === cat);
    });
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    const cat = state.selectedCategory === 'all' ? 'Vector' : state.selectedCategory;
    el.textContent = `Free ${cat} Vector, SVG, EPS & JPEG Downloads`;
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
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('API request failed');
        
        const data = await res.json();

        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        renderVectors();
        renderOurPicks();
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
        const grid = document.getElementById('vectorsGrid');
        if (grid) grid.innerHTML = '<div class="no-results">Error loading vectors. Please try again.</div>';
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

function renderOurPicks() {
    const section = document.getElementById('ourPicksSection');
    const track = document.getElementById('ourPicksTrack');
    if (!section || !track || !state.vectors.length) return;

    track.innerHTML = '';
    const picks = state.vectors.slice(0, 10);
    
    picks.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const thumbnail = v.thumbnail;
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
                ${typeLabel}
            </div>
            <div class="vc-info">
                <div class="vc-title">${escHtml(v.title)}</div>
            </div>
        `;
        card.addEventListener('click', () => openDetailPanel(v, card));
        track.appendChild(card);
    });

    section.style.display = 'block';

    const prev = document.getElementById('picksPrev');
    const next = document.getElementById('picksNext');
    if (prev) prev.onclick = () => track.scrollBy({ left: -320, behavior: 'smooth' });
    if (next) next.onclick = () => track.scrollBy({ left: 320, behavior: 'smooth' });
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No vectors found.</div>';
        return;
    }

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        if (state.openedVector && state.openedVector.name === v.name) card.classList.add('card-active');
        
        const thumbnail = v.thumbnail;
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';

        // Requirement: Extra keywords added to keywords display
        let displayKeywords = [...EXTRA_KEYWORDS];
        if (!v.isJpegOnly) displayKeywords = [...displayKeywords, ...VECTOR_KEYWORDS];
        if (v.keywords && Array.isArray(v.keywords)) {
            displayKeywords = [...displayKeywords, ...v.keywords];
        }
        const keywordsStr = [...new Set(displayKeywords)].join(', ');

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
                ${typeLabel}
            </div>
            <div class="vc-info">
                <div class="vc-title">${escHtml(v.title)}</div>
                <div class="vc-description">${escHtml(v.description || "")}</div>
                <div class="vc-keywords">${escHtml(keywordsStr)}</div>
            </div>
        `;
        card.addEventListener('click', () => openDetailPanel(v, card));
        grid.appendChild(card);
    });
}

function openDetailPanel(v, cardEl) {
    if (state.openedVector && state.openedVector.name === v.name) {
        closeDetailPanel();
        return;
    }

    closeDetailPanel();
    state.openedVector = v;
    state.openedCardEl = cardEl;
    cardEl.classList.add('card-active');

    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel';
    
    // Calculate keywords for detail panel
    let displayKeywords = [...EXTRA_KEYWORDS];
    if (!v.isJpegOnly) displayKeywords = [...displayKeywords, ...VECTOR_KEYWORDS];
    if (v.keywords && Array.isArray(v.keywords)) {
        displayKeywords = [...displayKeywords, ...v.keywords];
    }
    const finalKeywords = [...new Set(displayKeywords)];

    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left">
                <img class="detail-img" src="${v.originalUrl || v.thumbnail}" alt="${escHtml(v.title)}">
                <table class="detail-table">
                    <tr><td class="dt-label">File Format</td><td class="dt-value">${v.isJpegOnly ? 'JPEG' : 'EPS / SVG / JPEG'}</td></tr>
                    <tr><td class="dt-label">Category</td><td class="dt-value">${escHtml(v.category)}</td></tr>
                    <tr><td class="dt-label">Resolution</td><td class="dt-value">High Quality / Fully Scalable</td></tr>
                    <tr><td class="dt-label">License</td><td class="dt-value">Free for Personal & Commercial Use</td></tr>
                    <tr><td class="dt-label">File Size</td><td class="dt-value">${v.fileSize || 'N/A'}</td></tr>
                </table>
            </div>
            <div class="detail-right">
                <h2 class="detail-title">${escHtml(v.title)}</h2>
                <p class="detail-desc">${escHtml(v.description || "No description available.")}</p>
                <div class="detail-keywords">
                    ${finalKeywords.map(kw => `<span class="kw-tag">${escHtml(kw)}</span>`).join('')}
                </div>
                <div style="margin-top: 20px; display: flex; gap: 12px; align-items: center;">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD NOW</button>
                    <button class="detail-close-btn" id="mainCloseBtn">CLOSE</button>
                </div>
            </div>
        </div>
    `;

    // Insert panel after the row containing the card
    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.children);
    const index = cards.indexOf(cardEl);
    const columns = getGridColumns();
    const insertAfterIndex = Math.min(cards.length - 1, Math.floor(index / columns) * columns + (columns - 1));
    grid.insertBefore(panel, cards[insertAfterIndex].nextSibling);

    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;

    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    state.detailPanelOpen = true;
}

function getGridColumns() {
    const width = window.innerWidth;
    if (width >= 1200) return 6;
    if (width >= 992) return 5;
    if (width >= 768) return 4;
    if (width >= 576) return 3;
    return 2;
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.remove();
    if (state.openedCardEl) state.openedCardEl.classList.remove('card-active');
    state.openedVector = null;
    state.openedCardEl = null;
    state.detailPanelOpen = false;
}

function showDownloadPage(v) {
    const downloadPage = document.getElementById('downloadPage');
    if (!downloadPage) return;

    const id = v.name;
    const dpTitle = document.getElementById('dpTitle');
    const dpImg = document.getElementById('dpImg');
    const dpDownloadBtn = document.getElementById('dpDownloadBtn');
    const countdownBox = document.getElementById('countdownBox');
    const countdownNum = document.getElementById('countdownNum');

    if (dpTitle) dpTitle.textContent = v.title;
    if (dpImg) dpImg.src = v.originalUrl || v.thumbnail;
    
    if (dpDownloadBtn) {
        dpDownloadBtn.style.display = 'block';
        dpDownloadBtn.onclick = () => {
            if (state.downloadInProgress) return;
            state.downloadInProgress = true;
            dpDownloadBtn.style.display = 'none';
            if (countdownBox) countdownBox.style.display = 'block';
            
            let countdown = 4; // Requirement: 4 seconds
            if (countdownNum) countdownNum.textContent = countdown;
            
            if (state.countdownInterval) clearInterval(state.countdownInterval);
            state.countdownInterval = setInterval(() => {
                countdown--;
                if (countdownNum) countdownNum.textContent = countdown;
                if (countdown <= 0) {
                    clearInterval(state.countdownInterval);
                    const downloadUrl = `/api/download?slug=${encodeURIComponent(id)}`;
                    window.location.href = downloadUrl;
                    setTimeout(() => {
                        downloadPage.style.display = 'none';
                        document.body.style.overflow = '';
                        state.downloadInProgress = false;
                        dpDownloadBtn.style.display = 'block';
                        if (countdownBox) countdownBox.style.display = 'none';
                    }, 1000);
                }
            }, 1000);
        };
    }

    const dpClose = document.getElementById('dpClose');
    if (dpClose) {
        dpClose.onclick = () => {
            downloadPage.style.display = 'none';
            document.body.style.overflow = '';
            if (state.countdownInterval) clearInterval(state.countdownInterval);
            state.downloadInProgress = false;
        };
    }

    downloadPage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function setupDownloadPageHandlers() {
    const downloadPage = document.getElementById('downloadPage');
    if (!downloadPage) return;

    window.addEventListener('click', (e) => {
        if (e.target === downloadPage) {
            downloadPage.style.display = 'none';
            document.body.style.overflow = '';
            if (state.countdownInterval) clearInterval(state.countdownInterval);
            state.downloadInProgress = false;
        }
    });
}

function setupModalHandlers() {
    const modal = document.getElementById('infoModal');
    const closeBtn = document.getElementById('infoModalClose');

    if (closeBtn) {
        closeBtn.onclick = (e) => { 
            e.stopPropagation();
            if (modal) modal.style.display = 'none'; 
        };
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        const modalBox = document.querySelector('.info-modal-box');
        if (modalBox) {
            modalBox.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const type = btn.dataset.modal;
            const content = MODAL_CONTENTS[type];
            if (content && modal) {
                const body = document.getElementById('infoModalBody');
                if (body) body.innerHTML = content.content;
                modal.style.display = 'flex';
            }
        });
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    if (searchInput) {
        searchInput.onkeydown = (e) => { if (e.key === 'Enter') { state.searchQuery = searchInput.value; state.currentPage = 1; fetchVectors(); } };
    }
    if (searchBtn) {
        searchBtn.onclick = () => { state.searchQuery = searchInput.value; state.currentPage = 1; fetchVectors(); };
    }

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.onchange = () => { state.currentPage = 1; fetchVectors(); };
    }
}

function updatePagination() {
    const prev = document.getElementById('prevPage');
    const next = document.getElementById('nextPage');
    const info = document.getElementById('pageInfo');
    if (prev) prev.disabled = state.currentPage <= 1;
    if (next) next.disabled = state.currentPage >= state.totalPages;
    if (info) info.textContent = `Page ${state.currentPage} of ${state.totalPages}`;

    if (prev) prev.onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    if (next) next.onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
