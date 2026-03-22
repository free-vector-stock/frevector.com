/**
 * frevector.com - Core Script Revized
 */

const MODAL_DATA = {
    about: {
        content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p><p>The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process.</p><p>Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p><p>Frevector.com includes: Vector illustrations, Icon sets, Logo design elements, Graphic elements, Various design resources.</p><p>All files can be used in both personal and commercial projects.</p><p><strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package.</p>`
    },
    privacy: {
        content: `<h2>PRIVACY POLICY</h2><p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p><h3>1. Data Collected</h3><p>When you visit the site, certain anonymous data may be collected automatically: Cookies, Browser and device information, IP address, Page visit and interaction data.</p><h3>2. Purposes of Data Use</h3><p>The collected data may be used for: Improving site performance, Enhancing user experience, Ensuring security.</p><h3>3. Personal Data</h3><p>Personal data is only processed when voluntarily shared via emails. Frevector does not sell user data to third parties.</p>`
    },
    terms: {
        content: `<h2>TERMS OF SERVICE</h2><p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p><h3>1. Content Ownership</h3><p>All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p><h3>2. Right of Use</h3><p>Downloaded files can be used in personal and commercial projects. The user may edit the files for their own projects.</p><h3>3. Prohibited Uses</h3><p>Redistributing files, Selling, Uploading to other sites, Sharing as an archive or collection is strictly prohibited.</p>`
    },
    contact: {
        content: `<h2>CONTACT</h2><p>If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p><p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p><p>Frevector prioritizes clear and transparent communication with its users.</p>`
    }
};

const CATEGORY_H1_MAP = {
    'Abstract': 'Free Abstract Vectors, SVGs, Icons and Clipart',
    'Animals': 'Free Animal Vectors, SVGs, Icons and Clipart',
    'The Arts': 'Free Art Vectors, SVGs, Icons and Clipart',
    'Backgrounds': 'Free Background Vectors, SVGs, Icons and Clipart',
    'Fashion': 'Free Fashion Vectors, SVGs, Icons and Clipart',
    'Buildings': 'Free Building Vectors, SVGs, Icons and Clipart',
    'Business': 'Free Business Vectors, SVGs, Icons and Clipart',
    'Education': 'Free Education Vectors, SVGs, Icons and Clipart',
    'Food': 'Free Food Vectors, SVGs, Icons and Clipart',
    'Drink': 'Free Drink Vectors, SVGs, Icons and Clipart',
    'Medical': 'Free Medical Vectors, SVGs, Icons and Clipart',
    'Holidays': 'Free Holiday Vectors, SVGs, Icons and Clipart',
    'Industrial': 'Free Industrial Vectors, SVGs, Icons and Clipart',
    'Interiors': 'Free Interior Vectors, SVGs, Icons and Clipart',
    'Miscellaneous': 'Free Miscellaneous Vectors, SVGs, Icons and Clipart',
    'Nature': 'Free Nature Vectors, SVGs, Icons and Clipart',
    'Objects': 'Free Object Vectors, SVGs, Icons and Clipart',
    'Outdoor': 'Free Outdoor Vectors, SVGs, Icons and Clipart',
    'People': 'Free People Vectors, SVGs, Icons and Clipart',
    'Religion': 'Free Religion Vectors, SVGs, Icons and Clipart',
    'Science': 'Free Science Vectors, SVGs, Icons and Clipart',
    'Symbols': 'Free Symbol Vectors, SVGs, Icons and Clipart',
    'Sports': 'Free Sports Vectors, SVGs, Icons and Clipart',
    'Technology': 'Free Technology Vectors, SVGs, Icons and Clipart',
    'Transportation': 'Free Transportation Vectors, SVGs, Icons and Clipart',
    'Vintage': 'Free Vintage Vectors, SVGs, Icons and Clipart',
    'Logo': 'Free Logo Vectors, SVGs, Icons and Clipart',
    'Font': 'Free Font Vectors, SVGs, Icons and Clipart',
    'Icon': 'Free Icon Vectors, SVGs, Icons and Clipart'
};

const state = {
    vectors: [], currentPage: 1, totalPages: 1, 
    selectedCategory: 'all', selectedType: 'all', searchQuery: '', sortOrder: '',
    isLoading: false, picksOffset: 0, pickItemWidth: 130 // 120px card + 10px gap
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupTypeFilters();
    setupFooterModals();
    await fetchVectors();
    fetchAndRenderOurPicks();
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true; showLoader(true);
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        if (state.sortOrder) url.searchParams.set('sort', state.sortOrder); // SORT ÇALIŞSIN
        
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
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        const card = createVectorCard(v);
        card.onclick = () => showDetailPanel(v, card, grid);
        grid.appendChild(card);
    });
}

function createVectorCard(v) {
    const isJpeg = v.name.toLowerCase().includes('-jpeg-');
    const badge = isJpeg ? 'JPEG' : 'VECTOR';
    const card = document.createElement('div');
    card.className = 'vector-card';
    card.innerHTML = `
        <div class="vc-img-wrap">
            <div class="vc-type-badge">${badge}</div>
            <img class="vc-img" src="${v.thumbnail}" alt="${v.title}">
        </div>
        <div class="vc-info"><div class="vc-description">${v.title}</div></div>
    `;
    return card;
}

function showDetailPanel(v, cardElement, container) {
    document.querySelectorAll('.vector-card').forEach(c => c.classList.remove('card-active'));
    const existing = document.querySelector('.detail-panel');
    if (existing) existing.remove();

    cardElement.classList.add('card-active');
    const panel = document.createElement('div');
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <div class="dp-left"><img src="${v.thumbnail}"></div>
        <div class="dp-info">
            <h2 class="dp-title">${v.title}</h2>
            <div class="dp-kw">${(v.keywords || []).map(k => `<span class="kw-tag">${k}</span>`).join('')}</div>
            <button class="download-btn-short" id="startDL">DOWNLOAD PAGE</button>
        </div>
    `;
    
    if (container.id === 'ourPicksTrack') {
        window.scrollTo({top: 0, behavior: 'smooth'});
        const mainGrid = document.getElementById('vectorsGrid');
        mainGrid.prepend(panel);
    } else {
        cardElement.after(panel);
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('startDL').onclick = () => runDownloadProcess(v);
}

function runDownloadProcess(v) {
    const overlay = document.getElementById('downloadOverlay');
    const counterEl = document.getElementById('dlCounter');
    document.getElementById('dlPreviewArea').innerHTML = `<img src="${v.thumbnail}" style="max-height:100px;"><h3>${v.title}</h3>`;
    overlay.style.display = 'flex';
    let count = 4;
    counterEl.textContent = count;
    const itv = setInterval(() => {
        count--; counterEl.textContent = count;
        if (count <= 0) {
            clearInterval(itv);
            window.location.href = `/api/download?slug=${v.name}`;
            setTimeout(() => { overlay.style.display = 'none'; }, 2000);
        }
    }, 1000);
    document.getElementById('closeDL').onclick = () => { clearInterval(itv); overlay.style.display = 'none'; };
}

async function fetchAndRenderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const res = await fetch(`/api/vectors?limit=20`);
    const data = await res.json();
    const items = data.vectors || [];
    
    track.innerHTML = '';
    // Sonsuz döngü için listenin başına ve sonuna ekleme yapıyoruz
    const extendedItems = [...items, ...items, ...items];
    extendedItems.forEach(v => {
        const card = createVectorCard(v);
        card.onclick = () => showDetailPanel(v, card, track);
        track.appendChild(card);
    });

    // Başlangıç konumu (orta set)
    state.picksOffset = -(items.length * state.pickItemWidth);
    track.style.transform = `translateX(${state.picksOffset}px)`;

    document.getElementById('ourPicksNext').onclick = () => {
        state.picksOffset -= state.pickItemWidth;
        track.style.transition = "transform 0.4s ease";
        track.style.transform = `translateX(${state.picksOffset}px)`;
        
        if (Math.abs(state.picksOffset) >= (items.length * 2 * state.pickItemWidth)) {
            setTimeout(() => {
                track.style.transition = "none";
                state.picksOffset = -(items.length * state.pickItemWidth);
                track.style.transform = `translateX(${state.picksOffset}px)`;
            }, 400);
        }
    };

    document.getElementById('ourPicksPrev').onclick = () => {
        state.picksOffset += state.pickItemWidth;
        track.style.transition = "transform 0.4s ease";
        track.style.transform = `translateX(${state.picksOffset}px)`;

        if (state.picksOffset >= 0) {
            setTimeout(() => {
                track.style.transition = "none";
                state.picksOffset = -(items.length * state.pickItemWidth);
                track.style.transform = `translateX(${state.picksOffset}px)`;
            }, 400);
        }
    };
}

function setupFooterModals() {
    const modal = document.getElementById('infoModal');
    const body = document.getElementById('infoModalBody');
    const close = document.getElementById('infoModalClose');

    document.querySelectorAll('.modal-trigger').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const type = link.getAttribute('data-modal');
            if (MODAL_DATA[type]) {
                body.innerHTML = MODAL_DATA[type].content;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        };
    });

    close.onclick = () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; };
    modal.onclick = (e) => { if (e.target === modal) close.onclick(); };
}

function setupEventListeners() {
    let timer;
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value; state.currentPage = 1;
        clearTimeout(timer); timer = setTimeout(fetchVectors, 300);
    };
    document.getElementById('sortFilter').onchange = (e) => {
        state.sortOrder = e.target.value; state.currentPage = 1; fetchVectors();
    };
    document.getElementById('prevBtn').onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    document.getElementById('nextBtn').onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = '';
    ['all', ...Object.keys(CATEGORY_H1_MAP)].forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = (e) => {
            e.preventDefault(); state.selectedCategory = cat; state.currentPage = 1;
            document.getElementById('categoryTitle').textContent = cat === 'all' ? "Free Vectors, SVGs, Icons and Clipart" : CATEGORY_H1_MAP[cat];
            setupCategories(); fetchVectors();
        };
        list.appendChild(a);
    });
}

function setupTypeFilters() {
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-filter').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            state.selectedType = btn.dataset.type; state.currentPage = 1; fetchVectors();
        };
    });
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }
document.addEventListener('DOMContentLoaded', init);
