/**
 * frevector.com - Frontend Logic
 * Fixed: Updated category list, strict R2 structure, download page, countdown timer.
 * Requirement: Keywords visibility (2 lines), Download fix, Real-time search.
 */

const EXTRA_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];

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
        content: `<h2>Contact</h2>
<p>If you have any questions about Frevector.com or have something you would like to communicate, you can contact us.</p>
<p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color: inherit; text-decoration: underline;">hakankacar2014@gmail.com</a></p>
<p>Frevector values open and clear communication with its users.</p>`
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
        const data = await res.json();

        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        renderVectors();
        
        // Show "Our Picks" on all pages
        renderOurPicks();

        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
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
    // Use first 10 vectors as "picks" for now, or random ones
    const picks = state.vectors.slice(0, 10);
    
    picks.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const id = v.name;
        const category = v.category || "Miscellaneous";
        const thumbnail = `/api/asset?key=${encodeURIComponent(category + '/' + id + '/' + id + '.jpg')}`;

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
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
        card.setAttribute('data-slug', v.name);

        const mainKws = (v.keywords || []).slice(0, 5).join(', ');
        const displayKws = mainKws || 'vector design';

        const id = v.name;
        const category = v.category || "Miscellaneous";
        const thumbnail = `/api/asset?key=${encodeURIComponent(category + '/' + id + '/' + id + '.jpg')}`;

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${thumbnail}" alt="${escHtml(v.title)}" loading="lazy"
                     onerror="this.src='https://placehold.co/280x210/f5f5f5/999?text=Preview'">
            </div>
            <div class="vc-info">
                <div class="vc-title">${escHtml(v.title)}</div>
                <div class="vc-keywords">${escHtml(displayKws)}</div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDetailPanel(v, card);
        });
        grid.appendChild(card);
    });
}

function openDetailPanel(v, cardEl) {
    state.openedVector = v;
    state.openedCardEl = cardEl;
    state.detailPanelOpen = true;
    
    const panel = document.getElementById('detailPanel');
    if (!panel) return;
    
    panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));

    const id = v.name;
    const category = v.category || "Miscellaneous";
    const thumbnail = `/api/asset?key=${encodeURIComponent(category + '/' + id + '/' + id + '.jpg')}`;
    const img = document.getElementById('detailImage');
    if (img) {
        img.src = thumbnail;
        img.alt = v.title;
        img.onerror = () => { img.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview'; };
    }

    const titleEl = document.getElementById('detailTitle');
    const descEl = document.getElementById('detailDescription');
    const catEl = document.getElementById('detailCategory');
    const sizeEl = document.getElementById('detailFileSize');
    
    if (titleEl) titleEl.textContent = v.title;
    if (descEl) descEl.textContent = v.description || '';
    if (catEl) catEl.textContent = v.category || '-';
    if (sizeEl) sizeEl.textContent = v.fileSize || '-';

    const tagsWrap = document.getElementById('detailKeywords');
    if (tagsWrap) {
        tagsWrap.innerHTML = '';
        const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
        allKws.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'kw-tag';
            span.textContent = kw;
            span.style.cursor = 'pointer';
            span.addEventListener('click', () => {
                state.searchQuery = kw;
                state.currentPage = 1;
                state.selectedCategory = 'all';
                document.getElementById('searchInput').value = kw;
                document.querySelectorAll('.category-item').forEach(el => {
                    el.classList.toggle('active', el.dataset.cat === 'all');
                });
                closeDetailPanel();
                fetchVectors();
            });
            tagsWrap.appendChild(span);
        });
    }

    const downloadBtn = document.getElementById('detailDownloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => openDownloadPage(v);
    }

    const closeBtn = document.getElementById('detailCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = closeDetailPanel;
    }

    cardEl.classList.add('card-active');
    panel.style.display = 'block';
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    state.detailPanelOpen = false;
    state.openedVector = null;
}

function openDownloadPage(v) {
    const downloadPage = document.getElementById('downloadPage');
    if (!downloadPage) return;

    const id = v.name;
    const category = v.category || "Miscellaneous";
    const thumbnail = `/api/asset?key=${encodeURIComponent(category + '/' + id + '/' + id + '.jpg')}`;
    
    // Set header info
    const dpHeaderTitle = document.getElementById('dpHeaderTitle');
    const dpHeaderDesc = document.getElementById('dpHeaderDesc');
    if (dpHeaderTitle) dpHeaderTitle.textContent = v.title;
    if (dpHeaderDesc) dpHeaderDesc.textContent = v.description || '';

    // Set main content
    const dpImage = document.getElementById('dpImage');
    if (dpImage) {
        dpImage.src = thumbnail;
        dpImage.alt = v.title;
        dpImage.onerror = () => { dpImage.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview'; };
    }

    const dpTitle = document.getElementById('dpTitle');
    const dpDesc = document.getElementById('dpDescription');
    const dpCategory = document.getElementById('dpCategory');
    const dpFileSize = document.getElementById('dpFileSize');
    
    if (dpTitle) dpTitle.textContent = v.title;
    if (dpDesc) dpDesc.textContent = v.description || '';
    if (dpCategory) dpCategory.textContent = v.category || '-';
    if (dpFileSize) dpFileSize.textContent = v.fileSize || '-';

    // Set keywords
    const dpKeywords = document.getElementById('dpKeywords');
    if (dpKeywords) {
        dpKeywords.innerHTML = '';
        const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
        allKws.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'kw-tag';
            span.textContent = kw;
            span.style.cursor = 'pointer';
            span.addEventListener('click', () => {
                state.searchQuery = kw;
                state.currentPage = 1;
                state.selectedCategory = 'all';
                document.getElementById('searchInput').value = kw;
                document.querySelectorAll('.category-item').forEach(el => {
                    el.classList.toggle('active', el.dataset.cat === 'all');
                });
                downloadPage.style.display = 'none';
                if (state.countdownInterval) clearInterval(state.countdownInterval);
                fetchVectors();
            });
            dpKeywords.appendChild(span);
        });
    }

    // Setup download button
    const dpDownloadBtn = document.getElementById('dpDownloadBtn');
    if (dpDownloadBtn) {
        dpDownloadBtn.onclick = () => startCountdown(v);
    }

    // Setup close button
    const dpClose = document.getElementById('dpClose');
    if (dpClose) {
        dpClose.onclick = () => {
            downloadPage.style.display = 'none';
            if (state.countdownInterval) clearInterval(state.countdownInterval);
        };
    }

    // Reset countdown box
    const dpCountdownBox = document.getElementById('dpCountdownBox');
    if (dpCountdownBox) dpCountdownBox.style.display = 'none';

    downloadPage.style.display = 'flex';
    closeDetailPanel();
}

function startCountdown(v) {
    const dpCountdownBox = document.getElementById('dpCountdownBox');
    const dpCountdown = document.getElementById('dpCountdown');
    const dpDownloadBtn = document.getElementById('dpDownloadBtn');
    
    if (!dpCountdownBox || !dpCountdown) return;

    dpDownloadBtn.disabled = true;
    dpCountdownBox.style.display = 'block';
    
    let count = 4;
    dpCountdown.textContent = count;
    
    if (state.countdownInterval) clearInterval(state.countdownInterval);
    
    state.countdownInterval = setInterval(() => {
        count--;
        if (count >= 0) {
            dpCountdown.textContent = count;
        }
        
        if (count <= 0) {
            clearInterval(state.countdownInterval);
            dpCountdownBox.style.display = 'none';
            executeDownload(v);
            dpDownloadBtn.disabled = false;
        }
    }, 1000);
}

async function executeDownload(v) {
    try {
        state.downloadInProgress = true;
        const res = await fetch(`/api/download?slug=${encodeURIComponent(v.name)}`);
        
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${v.name}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Download failed. Please try again.');
        }
    } catch (err) {
        console.error('Download error:', err);
        alert('Download error. Please try again.');
    } finally {
        state.downloadInProgress = false;
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase().trim();
            state.currentPage = 1;
            clearTimeout(state.searchTimeout);
            if (state.searchQuery.length === 0) {
                fetchVectors();
            } else {
                state.searchTimeout = setTimeout(() => fetchVectors(), 200);
            }
        });
    }

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            state.currentPage = 1;
            fetchVectors();
        });
    }

    document.addEventListener('click', (e) => {
        if (state.detailPanelOpen && !e.target.closest('.vector-card') && !e.target.closest('#detailPanel')) {
            closeDetailPanel();
        }
    });

    window.addEventListener('resize', () => {
        if (state.detailPanelOpen && state.openedVector && state.openedCardEl) {
            openDetailPanel(state.openedVector, state.openedCardEl);
        }
    });
}

function updatePagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageNumber = document.getElementById('pageNumber');
    const pageTotal = document.getElementById('pageTotal');

    if (pageNumber) pageNumber.textContent = state.currentPage;
    if (pageTotal) pageTotal.textContent = `/ ${state.totalPages}`;

    if (prevBtn) {
        prevBtn.disabled = state.currentPage === 1;
        prevBtn.onclick = () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                fetchVectors();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = state.currentPage === state.totalPages;
        nextBtn.onclick = () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                fetchVectors();
            }
        };
    }
}

function setupDownloadPageHandlers() {
    const downloadPage = document.getElementById('downloadPage');
    if (!downloadPage) return;

    window.addEventListener('click', (e) => {
        if (e.target === downloadPage) {
            downloadPage.style.display = 'none';
            if (state.countdownInterval) clearInterval(state.countdownInterval);
        }
    });
}

function setupModalHandlers() {
    const modal = document.getElementById('infoModal');
    const closeBtn = document.getElementById('infoModalClose');

    if (closeBtn) {
        closeBtn.onclick = () => { modal.style.display = 'none'; };
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === document.getElementById('downloadPage')) {
            document.getElementById('downloadPage').style.display = 'none';
            if (state.countdownInterval) clearInterval(state.countdownInterval);
        }
    };

    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
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

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
