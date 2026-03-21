/**
 * frevector.com - Frontend Logic
 * v20260322 - Footer Fixed & Type Filter Integration
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

const MODAL_CONTENTS = {
    about: { 
        title: 'About Us', 
        content: `<h2>About Us</h2><p style="margin-top:15px; line-height:1.6;">Frevector.com is a specialized digital archive offering high-quality, original vector assets for designers, illustrators, and creators worldwide. Our mission is to provide a seamless creative workflow by offering free access to professionally crafted SVG and EPS files. Every piece in our collection is meticulously designed to meet modern industry standards, ensuring full scalability and easy customization for both personal and commercial projects.</p>` 
    },
    privacy: { 
        title: 'Privacy Policy', 
        content: `<h2>Privacy Policy</h2><p style="margin-top:15px; line-height:1.6;">At Frevector.com, your privacy is our priority. We only collect minimal data necessary for site performance and user experience improvements. We use industry-standard encryption to protect your information and do not sell or share your data with third-party advertisers. Cookies are utilized only to remember your preferences and provide analytical insights to help us serve you better.</p>` 
    },
    terms: { 
        title: 'Terms of Service', 
        content: `<h2>Terms of Service</h2><p style="margin-top:15px; line-height:1.6;">By using Frevector.com, you agree to our terms. All assets provided are free for use in personal and commercial projects. However, redistribution, sub-licensing, or selling our original files as your own is strictly prohibited. While we strive for the highest quality, Frevector.com is not liable for any damages resulting from the use of our downloaded files.</p>` 
    },
    contact: { 
        title: 'Contact', 
        content: `<h2>Contact</h2><p style="margin-top:15px; line-height:1.6;">Have questions, feedback, or a custom request? We would love to hear from you. Our team is dedicated to supporting the creative community.</p><p style="margin-top:15px;"><strong>Official Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000; font-weight:bold;">hakankacar2014@gmail.com</a></p><p style="margin-top:5px;">Response time is typically within 24-48 hours.</p>` 
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

function setupTypeFilters() {
    const filters = document.querySelectorAll('.type-filter');
    filters.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            filters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            state.selectedType = btn.dataset.type;
            state.currentPage = 1;
            closeDetailPanel();
            fetchVectors().then(() => {
                setTimeout(() => fetchAndRenderOurPicks(), 300);
            });
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
    updateCategoryTitle();
    fetchVectors().then(() => {
        setTimeout(() => fetchAndRenderOurPicks(), 300);
    });
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (el) el.textContent = state.selectedCategory === 'all' ? 'Free Vectors' : `Free ${state.selectedCategory} Vectors`;
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
        grid.innerHTML = '<p style="padding:20px; color:#999;">No items found in this category.</p>';
        return;
    }

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const typeBadge = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        const displayKeywords = (v.keywords || []).slice(0, 3).join(', ');
        
        card.innerHTML = `
            <div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" alt="${v.title}">${typeBadge}</div>
            <div class="vc-info">
                <div class="vc-description">${v.title || "Untitled"}</div>
                <div class="vc-keywords">${displayKeywords}</div>
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;
    
    let picks = [];
    const maxPicks = 15;
    const totalPagesAvailable = state.totalPages || 1;

    try {
        let fetchPromises = [];
        for (let i = 0; i < maxPicks; i++) {
            const randomPage = Math.floor(Math.random() * totalPagesAvailable) + 1;
            const url = new URL('/api/vectors', window.location.origin);
            url.searchParams.set('page', randomPage);
            url.searchParams.set('limit', '5'); 
            if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
            if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
            
            fetchPromises.push(fetch(url).then(r => r.json()));
        }

        const results = await Promise.all(fetchPromises);
        
        results.forEach(data => {
            if (data.vectors && data.vectors.length > 0) {
                const v = data.vectors[Math.floor(Math.random() * data.vectors.length)];
                picks.push(v);
            }
        });

        track.innerHTML = '';
        state.originalPicksCount = picks.length;
        if (picks.length === 0) return;

        const quadPicks = [...picks, ...picks, ...picks, ...picks];
        quadPicks.forEach(v => {
            if(!v) return;
            const card = document.createElement('div');
            card.className = 'vector-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `<div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}"></div>`;
            
            card.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                showDownloadPage(v);
            };
            track.appendChild(card);
        });
        state.ourPicksOffset = picks.length * 90;
        track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
    } catch (err) { console.error("Our Picks Error:", err); }
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
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD</button>
                    <button class="detail-close-btn" id="mainCloseBtn">Close</button>
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
    if(!dp) return;
    
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

function setupOurPicksArrows() {
    document.getElementById('ourPicksPrev').onclick = () => scrollOurPicks(-1);
    document.getElementById('ourPicksNext').onclick = () => scrollOurPicks(1);
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

function setupDownloadPageHandlers() { 
    const dpClose = document.getElementById('dpClose');
    if(dpClose) {
        dpClose.onclick = () => { 
            document.getElementById('downloadPage').style.display = 'none'; 
            if(state.countdownInterval) clearInterval(state.countdownInterval); 
        };
    }
}

function setupModalHandlers() { 
    document.querySelectorAll('.modal-trigger').forEach(b => {
        b.onclick = (e) => {
            e.preventDefault();
            const modalType = b.dataset.modal;
            const content = MODAL_CONTENTS[modalType];
            if (content) {
                document.getElementById('infoModalBody').innerHTML = content.content;
                document.getElementById('infoModal').style.display = 'flex';
            }
        };
    });
    const infoClose = document.getElementById('infoModalClose');
    if(infoClose) {
        infoClose.onclick = () => {
            document.getElementById('infoModal').style.display = 'none';
        };
    }
    window.onclick = (event) => {
        const modal = document.getElementById('infoModal');
        if (event.target == modal) modal.style.display = 'none';
    };
}

function setupEventListeners() { 
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.onclick = () => { 
            state.searchQuery = document.getElementById('searchInput').value; 
            state.currentPage = 1; 
            fetchVectors().then(() => {
                setTimeout(() => fetchAndRenderOurPicks(), 300);
            });
        };
    }
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.onkeypress = (e) => {
            if(e.key === 'Enter') document.getElementById('searchBtn').click();
        };
    }
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } }; 
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } }; 
}

function updatePagination() { 
    document.getElementById('pageNumber').textContent = state.currentPage; 
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`; 
}

function showLoader(s) { 
    const loader = document.getElementById('loader');
    if(loader) loader.style.display = s ? 'flex' : 'none'; 
}

document.addEventListener('DOMContentLoaded', init);
