/**
 * frevector.com - TAM BİRLEŞMİŞ KOD (KAYIPSIZ)
 */

const MODAL_DATA = {
    about: { content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design. The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process. Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time. Frevector.com includes the following content: <ul><li>Vector illustrations</li><li>Icon sets</li><li>Logo design elements</li><li>Graphic elements</li><li>Various design resources</li></ul> All files can be used in both personal and commercial projects. <b>Our only rule is this:</b> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package. Frevector is a platform that values labor, original production, and an ethical approach to design.</p>` },
    privacy: { content: `<h2>PRIVACY POLICY</h2><p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site. <h3>1. Data Collected</h3>When you visit the site, certain anonymous data may be collected automatically. Collected data may include: Cookies, Browser and device information, IP address, Page visit data. <h3>2. Purposes of Data Use</h3>Improving site performance, enhancing user experience, ensuring security. <h3>3. Personal Data</h3>Personal data is only processed when voluntarily shared via emails. Frevector does not sell user data to third parties. <h3>4. Cookie Policy</h3>Cookies may be used to support site functions. Users can disable cookies through browser settings. <h3>5. Data Security</h3>Necessary technical measures are taken to protect data.</p>` },
    terms: { content: `<h2>TERMS OF SERVICE</h2><p>Every visitor using Frevector.com is deemed to have accepted the following terms. <h3>1. Content Ownership</h3>All graphic designs are original works prepared by Frevector artists. All rights belong to Frevector. <h3>2. Right of Use</h3>Downloaded files can be used in personal and commercial projects. <h3>3. Prohibited Uses</h3>Redistributing files, uploading to other sites, selling files digitally or physically, sharing as an archive or collection. <h3>4. Liability</h3>Frevector cannot be held responsible for any damages arising from use. <h3>5. Right to Change</h3>Frevector reserves the right to update terms.</p><h2>LICENSE DESCRIPTION</h2><p>Can be used in personal and commercial projects. Prohibitions: Sharing files as-is, redistribution, selling, presenting as resource on other sites.</p>` },
    contact: { content: `<h2>CONTACT</h2><p>If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p><p><b>Email:</b> <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p><h2>COPYRIGHT NOTICE</h2><p>Frevector values original production. If you believe content infringes your copyright, contact us with: proof of ownership, link to content, and contact info.</p><h2>FREQUENTLY ASKED QUESTIONS</h2><p><b>1. Are the files free?</b> Yes. <b>2. Can I sell the files?</b> No. <b>3. Can I use for clients?</b> Yes.</p>` }
};

const CATEGORIES = ["Abstract", "Animals", "The Arts", "Backgrounds", "Fashion", "Buildings", "Business", "Celebrities", "Education", "Food", "Drink", "Medical", "Holidays", "Industrial", "Interiors", "Miscellaneous", "Nature", "Objects", "Outdoor", "People", "Religion", "Science", "Symbols", "Sports", "Technology", "Transportation", "Vintage", "Logo", "Font", "Icon"];

const state = {
    vectors: [], currentPage: 1, totalPages: 1, 
    selectedCategory: 'All', selectedType: 'all', searchQuery: '', sortOrder: '',
    picksScrollPos: 0, dlCountdownActive: false
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupTypeFilters();
    setupFooterModals();
    await fetchVectors();
    fetchOurPicks();
}

// "Our selections for you" Kaydırma Sistemi
function setupPicksNavigation() {
    const track = document.getElementById('ourPicksTrack');
    const next = document.getElementById('ourPicksNext');
    const prev = document.getElementById('ourPicksPrev');
    const scrollAmount = 300;

    next.onclick = () => {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        // Sonsuz döngü kontrolü
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };
    prev.onclick = () => {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        if (track.scrollLeft <= 0) {
            track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
        }
    };
}

async function fetchVectors() {
    showLoader(true);
    const url = new URL('/api/vectors', window.location.origin);
    url.searchParams.set('page', state.currentPage);
    if (state.selectedCategory !== 'All') url.searchParams.set('category', state.selectedCategory);
    if (state.selectedType !== 'all') url.searchParams.set('type', state.selectedType);
    if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        state.vectors = data.vectors;
        state.totalPages = data.totalPages;
        renderVectors();
        updatePagination();
        updateH1();
    } catch (e) { console.error(e); }
    showLoader(false);
}

function updateH1() {
    const h1 = document.getElementById('categoryTitle');
    h1.textContent = state.selectedCategory === 'All' ? "Free Vectors, SVGs, Icons and Clipart" : `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    grid.innerHTML = '';
    state.vectors.forEach(v => {
        const card = createCard(v);
        card.onclick = () => openDetail(v, card);
        grid.appendChild(card);
    });
}

function createCard(v) {
    const isJpeg = v.name.toLowerCase().includes('-jpeg-');
    const badge = isJpeg ? 'JPEG' : 'VECTOR';
    const div = document.createElement('div');
    div.className = 'vector-card';
    div.innerHTML = `<div class="vc-img-wrap"><div class="vc-type-badge">${badge}</div><img class="vc-img" src="${v.thumbnail}"></div><div class="vc-info"><div class="vc-description">${v.title}</div></div>`;
    return div;
}

function openDetail(v, card) {
    document.querySelectorAll('.detail-panel').forEach(p => p.remove());
    const panel = document.createElement('div');
    panel.className = 'detail-panel';
    panel.innerHTML = `<div class="dp-left"><img src="${v.thumbnail}"></div><div class="dp-info"><h2>${v.title}</h2><div class="dp-kw">${v.keywords.map(k => `<span class="kw-tag">${k}</span>`).join('')}</div><button class="download-btn-short" onclick="showDLPage('${v.name}', '${v.thumbnail}', '${v.title}')">DOWNLOAD PAGE</button></div>`;
    card.after(panel);
}

function showDLPage(name, thumb, title) {
    const overlay = document.getElementById('downloadPageOverlay');
    overlay.style.display = 'block';
    document.getElementById('dlPreviewImg').src = thumb;
    document.getElementById('dlPageTitle').textContent = title;
    
    const dlBtn = document.getElementById('finalDownloadBtn');
    const timerBox = document.getElementById('dlTimerBox');
    const count = document.getElementById('countdownNum');
    
    dlBtn.style.display = 'block';
    timerBox.style.display = 'none';
    state.dlCountdownActive = false;

    dlBtn.onclick = () => {
        state.dlCountdownActive = true;
        dlBtn.style.display = 'none';
        timerBox.style.display = 'block';
        let time = 4;
        count.textContent = time;
        const itv = setInterval(() => {
            if (!state.dlCountdownActive) { clearInterval(itv); return; }
            time--;
            count.textContent = time;
            if (time <= 0) {
                clearInterval(itv);
                window.location.href = `/api/download?slug=${name}`;
            }
        }, 1000);
    };

    document.getElementById('closeDLPage').onclick = () => {
        state.dlCountdownActive = false;
        overlay.style.display = 'none';
    };
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = '';
    ['All', ...CATEGORIES].forEach(cat => {
        const a = document.createElement('a');
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = (e) => { 
            e.preventDefault(); 
            state.selectedCategory = cat; 
            state.currentPage = 1; 
            setupCategories(); 
            fetchVectors(); 
            fetchOurPicks(); // Kategoriye göre picks yenile
        };
        list.appendChild(a);
    });
}

async function fetchOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    const catParam = state.selectedCategory !== 'All' ? `&category=${state.selectedCategory}` : '';
    const res = await fetch(`/api/vectors?limit=15${catParam}`);
    const data = await res.json();
    track.innerHTML = '';
    // Sonsuz döngü için veriyi çoğaltarak ekle
    const items = [...data.vectors, ...data.vectors]; 
    items.forEach(v => {
        const img = document.createElement('img');
        img.src = v.thumbnail;
        img.onclick = () => window.location.href = `/?search=${v.name}`;
        track.appendChild(img);
    });
    setupPicksNavigation();
}

function setupEventListeners() {
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value;
        state.currentPage = 1;
        fetchVectors();
    };
    document.getElementById('prevBtn').onclick = () => { if(state.currentPage > 1) { state.currentPage--; fetchVectors(); }};
    document.getElementById('nextBtn').onclick = () => { if(state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); }};
}

function setupTypeFilters() {
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-filter').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            state.selectedType = btn.dataset.type;
            state.currentPage = 1;
            fetchVectors();
        };
    });
}

function setupFooterModals() {
    const modal = document.getElementById('infoModal');
    const body = document.getElementById('infoModalBody');
    document.querySelectorAll('.modal-trigger').forEach(link => {
        link.onclick = () => {
            body.innerHTML = MODAL_DATA[link.dataset.modal].content;
            modal.style.display = 'flex';
        };
    });
    document.getElementById('infoModalClose').onclick = () => modal.style.display = 'none';
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { /* Loader logic */ }
document.addEventListener('DOMContentLoaded', init);
