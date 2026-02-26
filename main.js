/**
 * frevector.com - Frontend Logic
 * Full rebuild with all requirements implemented
 */

const EXTRA_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];

const CATEGORIES = [
    'Abstract','Animals/Wildlife','The Arts','Backgrounds/Textures',
    'Beauty/Fashion','Buildings/Landmarks','Business/Finance','Celebrities',
    'Drink','Education','Font','Food','Healthcare/Medical','Holidays',
    'Icon','Industrial','Interiors','Logo','Miscellaneous','Nature',
    'Objects','Parks/Outdoor','People','Religion','Science',
    'Signs/Symbols','Sports/Recreation','Technology','Transportation','Vintage'
];

const BANNER_TEXTS = [
    "We operate our own in-house studio to produce graphic designs and offer them free of charge for both personal and commercial projects.",
    "Our goal is to provide a comprehensive and ideal platform for those seeking graphic resources.",
    "We aim to offer a wide archive of graphics, including vector illustrations, stock photos, icons, logos, and various design elements.",
    "Our only and absolute rule is that our files may not be redistributed in any way.",
    "The advertisements on our website generate revenue to enable us to continue our work. Therefore, we ask for your understanding.",
    "Our website's sustainability depends on advertising revenue. Some features may be restricted while an ad blocker is active. Please disable the blocker and refresh the page."
];

const MODAL_CONTENT = {
    about: `<h2>About Us</h2>
<p>Frevector.com is an independent design platform established to provide free access to high-quality, reliable, and completely original resources in the field of graphic design.</p>
<p>Our platform is managed by a team that produces in-house. All designs on our site are produced exclusively by Frevector artists. Our content is not taken from other platforms, copied, or rearranged. Every work is created from scratch and goes through an original production process.</p>
<p>Each design is published after going through idea development, drawing, vector editing, technical optimization, and quality control stages. Our goal is not only to provide free content, but also to create a long-term, reliable, and sustainable graphic archive.</p>
<p>Frevector.com features: Vector illustrations, Icon sets, Logo design elements, Graphic elements, Various design resources.</p>
<p>All files are available free of charge for both personal and commercial projects. Our only and absolute rule is: Files may not be redistributed, uploaded to other platforms, sold, or shared in archive/package form.</p>`,
    privacy: `<h2>Privacy Policy</h2>
<p>At Frevector.com, we value user privacy. This policy explains what data may be collected when you visit our site and how it is used.</p>
<p><strong>1. Data Collected</strong><br>When you visit our site, some anonymous data may be automatically collected. This data does not directly identify you. Collectible data includes: Cookies, Browser and device information, IP address (for anonymous analysis), Page visit and interaction data, Analytical usage information.</p>
<p><strong>2. Purposes of Use</strong><br>Collected data is used to: Improve site performance, Enhance user experience, Detect technical errors, Ensure security, Optimize content development process.</p>
<p><strong>3. Personal Data</strong><br>Personal data (name, email, etc.) is only processed when voluntarily shared by the user. Frevector does not sell, rent, or share user data with third parties for commercial purposes.</p>
<p><strong>4. Cookie Policy</strong><br>Cookies are used on our site for functionality, remembering user preferences, and performance measurement. Users can limit or disable cookie usage through browser settings.</p>`,
    terms: `<h2>Terms of Service</h2>
<p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
<p><strong>1. Content Ownership</strong><br>All graphic designs on the site are original works produced by Frevector artists. All copyrights belong to Frevector.</p>
<p><strong>2. Right of Use</strong><br>Downloaded files can be used free of charge in personal and commercial projects. Users can edit and integrate files into their own projects.</p>
<p><strong>3. Prohibited Uses</strong><br>The following actions are strictly prohibited: Redistribution of files, Uploading to other sites, Selling digitally or physically, Sharing in archive, package, or collection form, Presenting Frevector content as a free resource on other platforms.</p>
<p><strong>4. Disclaimer</strong><br>Frevector cannot be held responsible for direct or indirect damages arising from the use of content. Technical problems or temporary access issues may occasionally occur on the platform.</p>`,
    contact: `<h2>Contact</h2>
<p>For any questions, suggestions, collaboration requests, or copyright notices related to Frevector.com, please contact us.</p>
<p>Email: <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>
<p>Frevector values open and transparent communication with its users.</p>`
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedCategory: 'all',
    searchQuery: '',
    isLoading: false,
    bannerIndex: 0,
    openedVector: null,
    picksOffset: 0,
    allPickVectors: []
};

/* ===========================
   INIT
   =========================== */
async function init() {
    setupCategories();
    setupEventListeners();
    startBannerAnimation();
    await fetchVectors();
}

/* ===========================
   BANNER ANIMATION
   =========================== */
function startBannerAnimation() {
    const el = document.getElementById('bannerText');
    if (!el) return;
    el.style.transition = 'opacity 0.4s ease';
    setInterval(() => {
        el.style.opacity = '0';
        setTimeout(() => {
            state.bannerIndex = (state.bannerIndex + 1) % BANNER_TEXTS.length;
            el.textContent = BANNER_TEXTS[state.bannerIndex];
            el.style.opacity = '1';
        }, 400);
    }, 5000);
}

/* ===========================
   CATEGORIES
   =========================== */
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

/* ===========================
   FETCH VECTORS
   =========================== */
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
        const sortVal = document.getElementById('sortFilter')?.value || '';
        if (sortVal === 'newest') url.searchParams.set('sort', 'newest');
        else if (sortVal === 'oldest') url.searchParams.set('sort', 'oldest');

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        renderVectors();
        updatePagination();

        if (state.currentPage === 1) {
            renderOurPicks();
            renderKeywordTags();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
        const grid = document.getElementById('vectorsGrid');
        if (grid) grid.innerHTML = '<div class="no-results">Unable to load vectors. Please try again.</div>';
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

/* ===========================
   RENDER VECTORS
   =========================== */
function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No vectors found matching your criteria.</div>';
        return;
    }

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.setAttribute('data-slug', v.name);

        const extraKws = EXTRA_KEYWORDS.join(', ');
        const mainKws = (v.keywords || []).slice(0, 3).join(', ');
        const displayKws = mainKws ? `${extraKws}, ${mainKws}` : extraKws;

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title || '')}" loading="lazy"
                     onerror="this.src='https://placehold.co/280x210/f5f5f5/999?text=Preview'">
            </div>
            <div class="vc-info">
                <div class="vc-title">${escHtml(v.title || '')}</div>
                <div class="vc-keywords">${escHtml(displayKws)}</div>
            </div>
        `;

        card.addEventListener('click', () => openDetailPanel(v));
        grid.appendChild(card);
    });
}

/* ===========================
   DETAIL PANEL (inline)
   =========================== */
function openDetailPanel(v) {
    state.openedVector = v;
    const panel = document.getElementById('detailPanel');
    if (!panel) return;

    document.getElementById('detailImage').src = v.thumbnail;
    document.getElementById('detailImage').onerror = function() {
        this.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview';
    };
    document.getElementById('detailTitle').textContent = v.title || '';
    document.getElementById('detailDescription').textContent = v.description || '';
    document.getElementById('detailCategory').textContent = v.category || '-';
    document.getElementById('detailFileSize').textContent = v.fileSize || '-';

    const kwContainer = document.getElementById('detailKeywords');
    kwContainer.innerHTML = '';
    const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
    allKws.slice(0, 20).forEach(kw => {
        const span = document.createElement('span');
        span.className = 'kw-tag';
        span.textContent = kw;
        span.addEventListener('click', () => {
            document.getElementById('searchInput').value = kw;
            state.searchQuery = kw;
            state.currentPage = 1;
            closeDetailPanel();
            fetchVectors();
        });
        kwContainer.appendChild(span);
    });

    panel.style.display = 'block';

    // Scroll panel into view
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.style.display = 'none';
    state.openedVector = null;
}

/* ===========================
   OUR PICKS (page 1 only)
   =========================== */
function renderOurPicks() {
    const section = document.getElementById('ourPicksSection');
    if (!section) return;

    if (state.currentPage !== 1 || state.vectors.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    state.allPickVectors = [...state.vectors].sort(() => Math.random() - 0.5);
    state.picksOffset = 0;
    renderPicksTrack();
}

function renderPicksTrack() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;
    track.innerHTML = '';

    const visible = 9;
    const items = state.allPickVectors.slice(state.picksOffset, state.picksOffset + visible);

    items.forEach(v => {
        const div = document.createElement('div');
        div.className = 'pick-item';
        div.innerHTML = `<img src="${v.thumbnail}" alt="${escHtml(v.title || '')}" loading="lazy"
            onerror="this.src='https://placehold.co/160x120/f5f5f5/999?text=Preview'">`;
        div.addEventListener('click', () => openDetailPanel(v));
        track.appendChild(div);
    });
}

/* ===========================
   KEYWORD TAGS
   =========================== */
function renderKeywordTags() {
    const section = document.getElementById('keywordTagsSection');
    const list = document.getElementById('keywordTagsList');
    if (!section || !list) return;

    if (state.currentPage !== 1 || state.vectors.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = '';

    const kwCount = {};
    state.vectors.forEach(v => {
        (v.keywords || []).forEach(kw => {
            kwCount[kw] = (kwCount[kw] || 0) + 1;
        });
    });

    const topKws = Object.entries(kwCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([kw]) => kw);

    topKws.forEach(kw => {
        const btn = document.createElement('button');
        btn.className = 'ktag';
        btn.textContent = kw;
        btn.addEventListener('click', () => {
            document.getElementById('searchInput').value = kw;
            state.searchQuery = kw;
            state.currentPage = 1;
            fetchVectors();
        });
        list.appendChild(btn);
    });
}

/* ===========================
   PAGINATION
   =========================== */
function updatePagination() {
    const pageNum = document.getElementById('pageNumber');
    const pageTotal = document.getElementById('pageTotal');
    const nextBtn = document.getElementById('nextPageBtn');

    if (pageNum) pageNum.textContent = state.currentPage;
    if (pageTotal) pageTotal.textContent = `/ ${state.totalPages}`;
    if (nextBtn) nextBtn.style.display = state.currentPage < state.totalPages ? 'block' : 'none';
}

/* ===========================
   DOWNLOAD PAGE
   =========================== */
function openDownloadPage(v) {
    const page = document.getElementById('downloadPage');
    if (!page) return;

    // Header info
    const cat = v.category || 'Vector';
    document.getElementById('dpHeaderTitle').textContent = `Free ${cat} Vector, SVG, EPS & JPEG Downloads`;
    document.getElementById('dpHeaderDesc').textContent =
        `Download professional high-quality ${cat.toLowerCase()} vector graphics for your creative projects. ` +
        `Our collection features premium EPS, SVG, and JPEG files that are fully scalable. ` +
        `All assets at Frevector are provided under a free license for both personal and commercial use.`;

    // Image
    const img = document.getElementById('dpImage');
    img.src = v.thumbnail;
    img.onerror = function() { this.src = 'https://placehold.co/420x315/f5f5f5/999?text=Preview'; };

    // Title (no filename)
    document.getElementById('dpTitle').textContent = v.title || '';

    // Keywords
    const kwContainer = document.getElementById('dpKeywords');
    kwContainer.innerHTML = '';
    const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
    allKws.forEach(kw => {
        const span = document.createElement('span');
        span.className = 'dp-kw';
        span.textContent = kw;
        kwContainer.appendChild(span);
    });

    // Table
    document.getElementById('dpCategory').textContent = v.category || '-';
    document.getElementById('dpFileSize').textContent = v.fileSize || '-';

    page.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Countdown
    startCountdown(v);
}

function closeDownloadPage() {
    const page = document.getElementById('downloadPage');
    if (page) page.style.display = 'none';
    document.body.style.overflow = '';
    if (window._countdownTimer) {
        clearInterval(window._countdownTimer);
        window._countdownTimer = null;
    }
}

function startCountdown(v) {
    const el = document.getElementById('dpCountdown');
    if (!el) return;

    let count = 4;
    el.textContent = count;

    if (window._countdownTimer) clearInterval(window._countdownTimer);

    window._countdownTimer = setInterval(() => {
        count--;
        el.textContent = count;
        if (count <= 0) {
            clearInterval(window._countdownTimer);
            window._countdownTimer = null;
            // Trigger download
            const a = document.createElement('a');
            a.href = `/api/download?slug=${encodeURIComponent(v.name)}`;
            a.download = `${v.name}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }, 1000);
}

/* ===========================
   INFO MODAL
   =========================== */
function openInfoModal(type) {
    const modal = document.getElementById('infoModal');
    const body = document.getElementById('infoModalBody');
    if (!modal || !body) return;
    body.innerHTML = MODAL_CONTENT[type] || '';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

/* ===========================
   EVENT LISTENERS
   =========================== */
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            state.currentPage = 1;
            clearTimeout(window._searchTimer);
            window._searchTimer = setTimeout(() => {
                closeDetailPanel();
                fetchVectors();
            }, 350);
        });
    }

    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            state.currentPage = 1;
            fetchVectors();
        });
    }

    // Pagination
    document.getElementById('prevBtn')?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            closeDetailPanel();
            fetchVectors();
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            closeDetailPanel();
            fetchVectors();
        }
    });

    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            closeDetailPanel();
            fetchVectors();
        }
    });

    // Detail panel download button
    document.getElementById('detailDownloadBtn')?.addEventListener('click', () => {
        if (state.openedVector) openDownloadPage(state.openedVector);
    });

    // Detail panel close button
    document.getElementById('detailCloseBtn')?.addEventListener('click', closeDetailPanel);

    // Download page close
    document.getElementById('dpClose')?.addEventListener('click', closeDownloadPage);

    // Our picks arrows
    document.getElementById('picksPrev')?.addEventListener('click', () => {
        if (state.picksOffset > 0) {
            state.picksOffset = Math.max(0, state.picksOffset - 9);
            renderPicksTrack();
        }
    });

    document.getElementById('picksNext')?.addEventListener('click', () => {
        if (state.picksOffset + 9 < state.allPickVectors.length) {
            state.picksOffset += 9;
            renderPicksTrack();
        }
    });

    // Footer modal links
    document.querySelectorAll('.modal-trigger').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openInfoModal(link.dataset.modal);
        });
    });

    // Info modal close
    document.getElementById('infoModalClose')?.addEventListener('click', closeInfoModal);
    document.getElementById('infoModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeInfoModal();
    });

    // Logo click
    document.getElementById('logoLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        state.selectedCategory = 'all';
        state.currentPage = 1;
        state.searchQuery = '';
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.category-item').forEach(el => {
            el.classList.toggle('active', el.dataset.cat === 'all');
        });
        closeDetailPanel();
        updateCategoryTitle();
        fetchVectors();
    });

    // Keyboard ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDownloadPage();
            closeInfoModal();
            closeDetailPanel();
        }
    });
}

/* ===========================
   UTILITIES
   =========================== */
function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ===========================
   START
   =========================== */
document.addEventListener('DOMContentLoaded', init);
