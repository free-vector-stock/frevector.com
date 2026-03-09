/**
 * frevector.com - Frontend Logic
 * Fixed: Updated category list, strict R2 structure.
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

        // Requirement: Strict "icon/" folder structure
        const thumbnail = `/api/asset?key=${encodeURIComponent(v.name)}.jpg`;

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

    const thumbnail = `/api/asset?key=${encodeURIComponent(v.name)}.jpg`;
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

    const tagsWrap = document.getElementById('detailTags');
    if (tagsWrap) {
        tagsWrap.innerHTML = '';
        (v.keywords || []).forEach(kw => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = kw;
            tagsWrap.appendChild(span);
        });
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => startDownload(v);
    }

    cardEl.classList.add('card-active');
    panel.style.display = 'block';
    
    const rect = cardEl.getBoundingClientRect();
    const panelHeight = panel.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    
    if (spaceBelow < panelHeight + 20) {
        panel.style.top = (rect.top + window.scrollY - panelHeight - 10) + 'px';
    } else {
        panel.style.top = (rect.bottom + window.scrollY + 10) + 'px';
    }
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.style.display = 'none';
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    state.detailPanelOpen = false;
    state.openedVector = null;
}

function startDownload(v) {
    const modal = document.getElementById('downloadModal');
    const counter = document.getElementById('downloadCounter');
    const loader = document.getElementById('downloadLoader');
    const success = document.getElementById('downloadSuccess');
    const fileName = document.getElementById('downloadFileName');
    
    if (!modal) return;
    
    modal.style.display = 'flex';
    counter.style.display = 'block';
    loader.style.display = 'none';
    success.style.display = 'none';
    fileName.textContent = `${v.name}.zip`;
    
    let seconds = 5;
    counter.textContent = seconds;
    
    if (state.countdownInterval) clearInterval(state.countdownInterval);
    
    state.countdownInterval = setInterval(() => {
        seconds--;
        counter.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(state.countdownInterval);
            counter.style.display = 'none';
            loader.style.display = 'block';
            executeDownload(v);
        }
    }, 1000);
}

async function executeDownload(v) {
    try {
        const res = await fetch(`/api/download?slug=${v.name}`);
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
            
            document.getElementById('downloadLoader').style.display = 'none';
            document.getElementById('downloadSuccess').style.display = 'block';
            
            setTimeout(() => {
                document.getElementById('downloadModal').style.display = 'none';
            }, 2000);
        } else {
            alert('Download failed. Please try again.');
            document.getElementById('downloadModal').style.display = 'none';
        }
    } catch (err) {
        console.error(err);
        document.getElementById('downloadModal').style.display = 'none';
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase();
            state.currentPage = 1;
            // Debounce search
            clearTimeout(state.searchTimeout);
            state.searchTimeout = setTimeout(() => fetchVectors(), 400);
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
    const wrap = document.getElementById('pagination');
    if (!wrap) return;
    wrap.innerHTML = '';
    
    if (state.totalPages <= 1) return;

    const createBtn = (text, page, active = false, disabled = false) => {
        const btn = document.createElement('button');
        btn.className = `pag-btn ${active ? 'active' : ''}`;
        btn.textContent = text;
        btn.disabled = disabled;
        if (!disabled && !active) {
            btn.onclick = () => {
                state.currentPage = page;
                fetchVectors();
            };
        }
        return btn;
    };

    wrap.appendChild(createBtn('Prev', state.currentPage - 1, false, state.currentPage === 1));

    let start = Math.max(1, state.currentPage - 2);
    let end = Math.min(state.totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
        wrap.appendChild(createBtn(i, i, i === state.currentPage));
    }

    wrap.appendChild(createBtn('Next', state.currentPage + 1, false, state.currentPage === state.totalPages));
}

function setupModalHandlers() {
    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = modal?.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.onclick = () => { modal.style.display = 'none'; };
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === document.getElementById('downloadModal')) {
            clearInterval(state.countdownInterval);
            document.getElementById('downloadModal').style.display = 'none';
        }
    };

    document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const type = btn.dataset.modal;
            const content = MODAL_CONTENTS[type];
            if (content) {
                modalTitle.textContent = content.title;
                modalBody.innerHTML = content.content;
                modal.style.display = 'flex';
            }
        };
    });
}

function showLoader(show) {
    const loader = document.getElementById('mainLoader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
