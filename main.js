/**
 * frevector.com - Frontend Logic
 * Fixed: Detail panel IDs, pagination sync, download button, modal contents in English, click issue
 */

const EXTRA_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];

const CATEGORIES = [
    'Abstract', 'Animals/Wildlife', 'The Arts', 'Backgrounds/Textures', 'Beauty/Fashion',
    'Buildings/Landmarks', 'Business/Finance', 'Celebrities', 'Drink', 'Education',
    'Font', 'Food', 'Healthcare/Medical', 'Holidays', 'Icon', 'Industrial',
    'Interiors', 'Logo', 'Miscellaneous', 'Nature', 'Objects', 'Parks/Outdoor',
    'People', 'Religion', 'Science', 'Signs/Symbols', 'Sports/Recreation',
    'Technology', 'Transportation', 'Vintage'
];

const MODAL_CONTENTS = {
    about: {
        title: 'About Us',
        content: `<h2>About Us</h2>
<p>Frevector.com is an independent design platform created to provide access to original resources in the field of graphic design.</p>
<p>The platform is run by a team that produces in its own internal studio. All designs on the site are prepared only by Frevector artists. Content is not taken from other platforms, copied, or rearranged. Each work is created from scratch and goes through an original production process.</p>
<p>Each design is shared after idea development, drawing, vector editing, technical adjustments, and quality control stages. Our aim is to create a growing and reliably usable graphic archive over time.</p>
<p><strong>Frevector.com includes the following content:</strong></p>
<ul>
<li>Vector illustrations</li>
<li>Icon sets</li>
<li>Logo design elements</li>
<li>Graphic elements</li>
<li>Various design resources</li>
</ul>
<p>All files can be used in personal and commercial projects.</p>
<p>Our only rule is this: Files cannot be redistributed, uploaded to other platforms, sold, or shared again in package form.</p>
<p>Frevector is a platform that values effort, original production, and ethical design understanding.</p>`
    },
    privacy: {
        title: 'Privacy Policy',
        content: `<h2>Privacy Policy</h2>
<p>At Frevector.com, we value user privacy. This policy explains what data may be collected when you visit the site and how it may be used.</p>
<h3>1. Data Collected</h3>
<p>When you visit the site, some anonymous data may be automatically collected. This data does not directly identify you.</p>
<p><strong>Data that may be collected:</strong></p>
<ul>
<li>Cookies</li>
<li>Browser and device information</li>
<li>IP address (for anonymous analysis purposes)</li>
<li>Page visit and interaction data</li>
<li>Analytics usage information</li>
</ul>
<h3>2. Purposes of Data Use</h3>
<p>Collected data may be used for the following purposes:</p>
<ul>
<li>Improve site performance</li>
<li>Enhance user experience</li>
<li>Identify technical issues</li>
<li>Ensure security</li>
<li>Support content development process</li>
</ul>
<h3>3. Personal Data</h3>
<p>Personal data (name, email, etc.) is processed only when voluntarily shared by the user. For example, emails sent for contact purposes fall under this category.</p>
<p>Frevector does not sell user data to third parties or share it for commercial purposes.</p>
<h3>4. Cookie Policy</h3>
<p>Cookies may be used on the site. Cookies are used to support site functionality, remember user preferences, and measure performance.</p>
<p>Users can restrict or disable cookie usage from their browser settings.</p>
<h3>5. Data Security</h3>
<p>Necessary technical and administrative measures are taken to protect data. However, the security of data transmitted over the internet cannot be guaranteed.</p>`
    },
    terms: {
        title: 'Terms of Service',
        content: `<h2>Terms of Service</h2>
<p>Every visitor using Frevector.com is considered to have accepted the following terms.</p>
<h3>1. Content Ownership</h3>
<p>All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
<h3>2. Right of Use</h3>
<p>Downloaded files can be used in personal and commercial projects. Users can edit files for their own projects and include them in their work.</p>
<h3>3. Prohibited Uses</h3>
<p><strong>The following operations are prohibited:</strong></p>
<ul>
<li>Redistribution of files</li>
<li>Uploading to other websites</li>
<li>Selling digitally or physically</li>
<li>Sharing in archive or package form</li>
<li>Presenting Frevector content as a source on other platforms</li>
</ul>
<h3>4. Liability</h3>
<p>Frevector cannot be held responsible for direct or indirect damages that may result from the use of content. The platform may occasionally experience technical issues or temporary access problems.</p>
<h3>5. Right to Change</h3>
<p>Frevector reserves the right to update service terms and site content as needed.</p>`
    },
    contact: {
        title: 'Contact',
        content: `<h2>Contact</h2>
<p>If you have any questions about Frevector.com or have something you would like to communicate, you can contact us.</p>
<p><strong>Email:</strong> hakankacar2014@gmail.com</p>
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
    detailPanelOpen: false
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
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
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
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

        const extraKws = EXTRA_KEYWORDS.join(', ');
        const mainKws = (v.keywords || []).slice(0, 3).join(', ');
        const displayKws = mainKws ? `${extraKws}, ${mainKws}` : extraKws;

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy"
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
    if (!panel) {
        console.error('Detail panel element not found');
        return;
    }
    
    // Close any existing detail panel first
    panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));

    const img = document.getElementById('detailImage');
    if (img) {
        img.src = v.thumbnail;
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

    // Breadcrumb
    const breadcrumbCatEl = document.getElementById('breadcrumbCategory');
    const breadcrumbTitleEl = document.getElementById('breadcrumbTitle');
    if (breadcrumbCatEl) {
        breadcrumbCatEl.textContent = v.category || 'All';
        breadcrumbCatEl.onclick = (e) => { e.preventDefault(); selectCategory(v.category); };
    }
    if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = v.title;

    // Keywords
    const kwContainer = document.getElementById('detailKeywords');
    if (kwContainer) {
        kwContainer.innerHTML = '';
        const allKws = [...EXTRA_KEYWORDS, ...(v.keywords || [])];
        allKws.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'kw-tag';
            span.textContent = kw;
            span.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = kw;
                state.searchQuery = kw;
                state.currentPage = 1;
                closeDetailPanel();
                fetchVectors();
            });
            kwContainer.appendChild(span);
        });
    }

    const grid = document.getElementById('vectorsGrid');
    if (grid && cardEl) {
        const cards = Array.from(grid.querySelectorAll('.vector-card'));
        const cardIndex = cards.indexOf(cardEl);
        
        if (cardIndex !== -1) {
            const cardTop = cardEl.offsetTop;
            let lastInRowIndex = cardIndex;
            for (let i = cardIndex + 1; i < cards.length; i++) {
                if (cards[i].offsetTop === cardTop) {
                    lastInRowIndex = i;
                } else {
                    break;
                }
            }
            
            if (lastInRowIndex < cards.length) {
                cards[lastInRowIndex].after(panel);
            } else {
                grid.appendChild(panel);
            }
        } else {
            grid.appendChild(panel);
        }
    } else if (grid) {
        grid.appendChild(panel);
    }

    panel.style.display = 'block';
    cardEl.classList.add('card-active');

    setTimeout(() => { 
        try {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
        } catch (e) {
            console.error('Scroll error:', e);
        }
    }, 50);
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    state.openedVector = null;
    state.openedCardEl = null;
    state.detailPanelOpen = false;
}

function updatePagination() {
    const pageNumEl = document.getElementById('pageNumber');
    const pageTotalEl = document.getElementById('pageTotal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (pageNumEl) pageNumEl.textContent = state.currentPage;
    if (pageTotalEl) pageTotalEl.textContent = `/ ${state.totalPages}`;
    
    if (prevBtn) prevBtn.disabled = state.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = state.currentPage >= state.totalPages;
}

function setupEventListeners() {
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        state.searchQuery = searchInput ? searchInput.value.trim() : '';
        state.currentPage = 1;
        closeDetailPanel();
        fetchVectors();
    });
    document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            state.searchQuery = e.target.value.trim();
            state.currentPage = 1;
            closeDetailPanel();
            fetchVectors();
        }
    });
    
    document.getElementById('detailCloseBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeDetailPanel();
    });
    
    document.getElementById('detailDownloadBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!state.openedVector) {
            console.error('No vector selected');
            return;
        }
        openDownloadPage(state.openedVector);
    });

    document.getElementById('dpClose')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeDownloadPage();
    });

    document.getElementById('dpDownloadBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!state.openedVector) {
            console.error('No vector selected for download');
            return;
        }
        startDownloadCountdown();
    });

    document.getElementById('prevBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state.currentPage > 1) {
            state.currentPage--;
            closeDetailPanel();
            fetchVectors();
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            closeDetailPanel();
            fetchVectors();
        }
    });

    document.getElementById('breadcrumbHome')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectCategory('all');
    });

    // Close detail panel when clicking outside
    document.addEventListener('click', (e) => {
        if (state.detailPanelOpen) {
            const panel = document.getElementById('detailPanel');
            const grid = document.getElementById('vectorsGrid');
            if (panel && grid && !panel.contains(e.target) && !e.target.closest('.vector-card')) {
                closeDetailPanel();
            }
        }
    });
}

function setupModalHandlers() {
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const infoModal = document.getElementById('infoModal');
    const infoModalClose = document.getElementById('infoModalClose');
    const infoModalBody = document.getElementById('infoModalBody');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const modalKey = trigger.dataset.modal;
            const content = MODAL_CONTENTS[modalKey];
            if (content && infoModalBody) {
                infoModalBody.innerHTML = content.content;
                if (infoModal) infoModal.style.display = 'flex';
            }
        });
    });

    infoModalClose?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (infoModal) infoModal.style.display = 'none';
    });

    infoModal?.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            e.preventDefault();
            e.stopPropagation();
            infoModal.style.display = 'none';
        }
    });
}

function openDownloadPage(vector) {
    const page = document.getElementById('downloadPage');
    if (!page) return;

    const titleEl = document.getElementById('dpTitle');
    const descEl = document.getElementById('dpDescription');
    const imgEl = document.getElementById('dpImage');
    const catEl = document.getElementById('dpCategory');
    const sizeEl = document.getElementById('dpFileSize');
    const kwContainer = document.getElementById('dpKeywords');

    if (titleEl) titleEl.textContent = vector.title;
    if (descEl) descEl.textContent = vector.description || '';
    
    const headerTitleEl = document.getElementById('dpHeaderTitle');
    const headerDescEl = document.getElementById('dpHeaderDesc');
    if (headerTitleEl) headerTitleEl.textContent = `Free ${vector.category || ''} Vector, SVG, EPS & JPEG Downloads`;
    if (headerDescEl) headerDescEl.textContent = vector.description || '';
    
    if (imgEl) {
        imgEl.src = vector.thumbnail;
        imgEl.alt = vector.title;
        imgEl.onerror = () => { imgEl.src = 'https://placehold.co/400x300/f5f5f5/999?text=Preview'; };
    }
    if (catEl) catEl.textContent = vector.category || '-';
    if (sizeEl) sizeEl.textContent = vector.fileSize || '-';

    if (kwContainer) {
        kwContainer.innerHTML = '';
        const allKws = [...EXTRA_KEYWORDS, ...(vector.keywords || [])];
        allKws.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'dp-kw';
            span.textContent = kw;
            kwContainer.appendChild(span);
        });
    }

    const countdownBox = document.getElementById('dpCountdownBox');
    const countdownNum = document.getElementById('dpCountdown');
    const downloadBtn = document.getElementById('dpDownloadBtn');
    const countdownStatus = document.getElementById('dpCountdownStatus');
    if (countdownBox) countdownBox.style.display = 'none';
    if (countdownNum) countdownNum.textContent = '4';
    if (countdownStatus) countdownStatus.textContent = 'Your download will start in';
    if (downloadBtn) downloadBtn.style.display = 'block';

    page.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDownloadPage() {
    const page = document.getElementById('downloadPage');
    if (page) page.style.display = 'none';
    document.body.style.overflow = '';
    
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
    }
    state.openedVector = null;
}

function startDownloadCountdown() {
    if (!state.openedVector) {
        console.error('No vector for countdown');
        return;
    }

    const downloadBtn = document.getElementById('dpDownloadBtn');
    const countdownBox = document.getElementById('dpCountdownBox');
    const countdownNum = document.getElementById('dpCountdown');
    const countdownStatus = document.getElementById('dpCountdownStatus');

    if (downloadBtn) downloadBtn.style.display = 'none';
    if (countdownBox) countdownBox.style.display = 'block';
    if (countdownStatus) countdownStatus.textContent = 'Your download will start in';

    let count = 4;
    if (countdownNum) countdownNum.textContent = count;

    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
    }

    state.countdownInterval = setInterval(() => {
        count--;
        if (countdownNum) countdownNum.textContent = count;

        if (count <= 0) {
            clearInterval(state.countdownInterval);
            state.countdownInterval = null;
            
            if (state.openedVector) {
                triggerDownload(state.openedVector);
            }
        }
    }, 1000);
}

function triggerDownload(vector) {
    try {
        const downloadUrl = `/api/download?slug=${encodeURIComponent(vector.name)}`;
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        const fileName = vector.name || 'vector';
        a.download = fileName + '.zip';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            try { document.body.removeChild(a); } catch (e) {}
        }, 100);
    } catch (err) {
        console.error('Download error:', err);
        alert('Download could not be started. Please try again.');
    }
}

function showLoader(show) {
    const l = document.getElementById('loader');
    if (l) l.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
