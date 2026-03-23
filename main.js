/**
 * frevector.com - Core Script (Tam Birleşmiş & Kayıpsız Versiyon)
 */

const MODAL_DATA = {
    about: { content: `<h2>ABOUT US</h2><p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design. The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process. Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p><p>Frevector.com includes the following content: Vector illustrations, Icon sets, Logo design elements, Graphic elements, Various design resources. All files can be used in both personal and commercial projects. <strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package. Frevector is a platform that values labor, original production, and an ethical approach to design.</p>` },
    privacy: { content: `<h2>PRIVACY POLICY</h2><p>As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p><h3>1. Data Collected</h3><p>When you visit the site, certain anonymous data may be collected automatically. This data does not directly identify you. Collected data may include: Cookies, Browser and device information, IP address, Page visit and interaction data, Analytical usage information.</p><h3>2. Purposes of Data Use</h3><p>The collected data may be used for: Improving site performance, Enhancing user experience, Detecting technical issues, Ensuring security, Supporting the content development process.</p><h3>3. Personal Data</h3><p>Personal data is only processed when voluntarily shared—for example, via emails sent for communication purposes. Frevector does not sell user data to third parties.</p><h3>4. Cookie Policy</h3><p>Cookies may be used to support site functions. Users can limit cookies through browser settings.</p>` },
    terms: { content: `<h2>TERMS OF SERVICE</h2><p>Every visitor using Frevector.com is deemed to have accepted the following terms.</p><h3>1. Content Ownership</h3><p>All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p><h3>2. Right of Use</h3><p>Downloaded files can be used in personal and commercial projects. The user may edit the files for their own projects.</p><h3>3. Prohibited Uses</h3><p>Prohibited: Redistributing files, Uploading to other sites, Selling files digitally or physically, Sharing as an archive or collection.</p><h3>4. Liability</h3><p>Frevector cannot be held responsible for damages arising from use. <h3>5. Right to Change</h3><p>Frevector reserves the right to update terms and content.</p>` },
    contact: { content: `<h2>CONTACT</h2><p>If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p><p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p><p>Frevector prioritizes clear and transparent communication with its users.</p>` }
};

const H1_FORMATS = {
    "All": "Free Vector, SVGs, Icons and Clipart",
    "Abstract": "Free Abstract Vectors, SVGs, Icons and Clipart",
    "Animals": "Free Animal Vectors, SVGs, Icons and Clipart",
    "The Arts": "Free Art Vectors, SVGs, Icons and Clipart",
    "Backgrounds": "Free Background Vectors, SVGs, Icons and Clipart",
    "Fashion": "Free Fashion Vectors, SVGs, Icons and Clipart",
    "Buildings": "Free Building Vectors, SVGs, Icons and Clipart",
    "Business": "Free Business Vectors, SVGs, Icons and Clipart",
    "Celebrities": "Free Celebrity Vectors, SVGs, Icons and Clipart",
    "Education": "Free Education Vectors, SVGs, Icons and Clipart",
    "Food": "Free Food Vectors, SVGs, Icons and Clipart",
    "Drink": "Free Drink Vectors, SVGs, Icons and Clipart",
    "Medical": "Free Medical Vectors, SVGs, Icons and Clipart",
    "Holidays": "Free Holiday Vectors, SVGs, Icons and Clipart",
    "Industrial": "Free Industrial Vectors, SVGs, Icons and Clipart",
    "Interiors": "Free Interior Vectors, SVGs, Icons and Clipart",
    "Miscellaneous": "Free Miscellaneous Vectors, SVGs, Icons and Clipart",
    "Nature": "Free Nature Vectors, SVGs, Icons and Clipart",
    "Objects": "Free Object Vectors, SVGs, Icons and Clipart",
    "Outdoor": "Free Outdoor Vectors, SVGs, Icons and Clipart",
    "People": "Free People Vectors, SVGs, Icons and Clipart",
    "Religion": "Free Religion Vectors, SVGs, Icons and Clipart",
    "Science": "Free Science Vectors, SVGs, Icons and Clipart",
    "Symbols": "Free Symbol Vectors, SVGs, Icons and Clipart",
    "Sports": "Free Sports Vectors, SVGs, Icons and Clipart",
    "Technology": "Free Technology Vectors, SVGs, Icons and Clipart",
    "Transportation": "Free Transportation Vectors, SVGs, Icons and Clipart",
    "Vintage": "Free Vintage Vectors, SVGs, Icons and Clipart",
    "Logo": "Free Logo Vectors, SVGs, Icons and Clipart",
    "Font": "Free Font Vectors, SVGs, Icons and Clipart",
    "Icon": "Free Icon Vectors, SVGs, Icons and Clipart"
};

let state = {
    allVectors: [],
    filteredVectors: [],
    selectedCat: 'all',
    selectedType: 'all',
    currentPage: 1,
    itemsPerPage: 40,
    totalPages: 1,
    activeDetailId: null,
    downloadTimer: null
};

async function init() {
    showLoader(true);
    try {
        const res = await fetch('/api/vectors'); // Gerçek API URL'nize göre güncelleyin
        const data = await res.json();
        state.allVectors = data.vectors || [];
        applyFilters();
        setupEventListeners();
        fetchOurPicks();
    } catch (e) { console.error("Data Load Error:", e); }
    showLoader(false);
}

function setupEventListeners() {
    // Categories
    document.querySelectorAll('.cat-link').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.cat-link').forEach(l => l.classList.remove('active'));
            btn.classList.add('active');
            state.selectedCat = btn.dataset.cat;
            state.currentPage = 1;
            updateH1(btn.dataset.cat);
            applyFilters();
            fetchOurPicks();
        };
    });

    // Types
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.type-filter').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            state.selectedType = btn.dataset.type;
            state.currentPage = 1;
            applyFilters();
        };
    });

    // Search
    document.getElementById('searchInput').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        state.filteredVectors = state.allVectors.filter(v => 
            v.keywords.toLowerCase().includes(term) || v.title.toLowerCase().includes(term)
        );
        state.currentPage = 1;
        renderGrid();
    };

    // Pagination
    document.getElementById('prevPage').onclick = () => { if(state.currentPage > 1) { state.currentPage--; renderGrid(); } };
    document.getElementById('nextPage').onclick = () => { if(state.currentPage < state.totalPages) { state.currentPage++; renderGrid(); } };

    // Modals
    setupFooterModals();
    document.getElementById('closeDLPage').onclick = () => {
        clearTimeout(state.downloadTimer);
        document.getElementById('downloadModal').style.display = 'none';
        document.getElementById('dlTimerBox').style.display = 'none';
        document.getElementById('finalDownloadBtn').style.display = 'block';
    };

    // Slider Arrows
    document.getElementById('pickPrev').onclick = () => scrollPicks(-1);
    document.getElementById('pickNext').onclick = () => scrollPicks(1);
}

function updateH1(catName) {
    const h1 = document.getElementById('pageH1');
    h1.textContent = H1_FORMATS[catName] || H1_FORMATS["All"];
}

function applyFilters() {
    state.filteredVectors = state.allVectors.filter(v => {
        const catMatch = state.selectedCat === 'all' || v.category === state.selectedCat;
        const isJpeg = v.file.toLowerCase().includes('jpeg');
        const typeMatch = state.selectedType === 'all' || 
                         (state.selectedType === 'jpeg' && isJpeg) || 
                         (state.selectedType === 'vector' && !isJpeg);
        return catMatch && typeMatch;
    });
    state.totalPages = Math.ceil(state.filteredVectors.length / state.itemsPerPage) || 1;
    renderGrid();
}

function renderGrid() {
    const grid = document.getElementById('vectorGrid');
    grid.innerHTML = '';
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const items = state.filteredVectors.slice(start, start + state.itemsPerPage);

    items.forEach(v => {
        const card = createVectorCard(v);
        card.onclick = () => toggleDetailPanel(v, card);
        grid.appendChild(card);
    });
    updatePagination();
}

function createVectorCard(v) {
    const div = document.createElement('div');
    div.className = 'vector-card';
    const isJpeg = v.file.toLowerCase().includes('jpeg');
    const badge = isJpeg ? 'JPEG' : 'VECTOR';
    div.innerHTML = `
        <div class="vc-img-container"><img src="${v.file}.jpeg" class="vc-img" loading="lazy"></div>
        <div class="vc-badge">${badge}</div>
    `;
    return div;
}

function toggleDetailPanel(v, card) {
    const existing = document.querySelector('.detail-panel');
    if (state.activeDetailId === v.file && existing) {
        existing.remove();
        state.activeDetailId = null;
        return;
    }
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.className = 'detail-panel';
    panel.innerHTML = `
        <img src="${v.file}.jpeg" class="detail-img">
        <div class="detail-info">
            <h3 class="detail-title">${v.title}</h3>
            <p class="detail-kw">${v.keywords}</p>
            <button class="dl-btn-small" onclick="openDownloadPage('${v.file}')">DOWNLOAD PAGE</button>
        </div>
    `;
    card.after(panel);
    state.activeDetailId = v.file;
}

function openDownloadPage(fileId) {
    const v = state.allVectors.find(x => x.file === fileId);
    if(!v) return;
    const modal = document.getElementById('downloadModal');
    document.getElementById('dlPreviewImg').src = `${v.file}.jpeg`;
    document.getElementById('dlPageTitle').textContent = v.title;
    document.getElementById('dlKeywords').textContent = v.keywords;
    document.getElementById('dlPageFormat').textContent = v.file.includes('jpeg') ? 'JPEG / JPG' : 'EPS / SVG / JPEG';
    
    modal.style.display = 'flex';
    document.getElementById('finalDownloadBtn').onclick = () => startDownloadCountdown(v);
}

function startDownloadCountdown(v) {
    const btn = document.getElementById('finalDownloadBtn');
    const timerBox = document.getElementById('dlTimerBox');
    const countEl = document.getElementById('countdownNum');
    btn.style.display = 'none';
    timerBox.style.display = 'block';
    
    let count = 4;
    countEl.textContent = count;
    
    const interval = setInterval(() => {
        count--;
        countEl.textContent = count;
        if(count <= 0) {
            clearInterval(interval);
            window.location.href = `${v.file}.zip`;
            timerBox.style.display = 'none';
            btn.style.display = 'block';
        }
    }, 1000);

    // Eğer kullanıcı geri sayım bitmeden sayfadan çıkarsa (Back to Gallery), bu interval temizlenmeli.
    document.getElementById('closeDLPage').addEventListener('click', () => clearInterval(interval), {once: true});
}

function fetchOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    // Mevcut kategoriden rastgele görseller seç (veya sabit limit)
    const items = state.filteredVectors.slice(0, 15);
    // Sonsuz döngü için veriyi çoğalt
    const extended = [...items, ...items, ...items];
    track.innerHTML = '';
    extended.forEach(v => {
        const card = createVectorCard(v);
        card.onclick = () => openDownloadPage(v.file);
        track.appendChild(card);
    });
}

let currentScroll = 0;
function scrollPicks(dir) {
    const track = document.getElementById('ourPicksTrack');
    const step = 220; // card width + gap
    currentScroll += dir * step;
    track.style.transform = `translateX(${-currentScroll}px)`;
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
    window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages}`;
}

function showLoader(s) { document.getElementById('loader').style.display = s ? 'flex' : 'none'; }
document.addEventListener('DOMContentLoaded', init);
