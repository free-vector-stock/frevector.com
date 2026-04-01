/**
 * frevector.com - Frontend Logic
 * v2026031401 - Revisions: mobile layout, our-picks arrows, category spacing
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
        content: `
            <h2 style="margin-bottom:16px;">About Us</h2>
            <p style="margin-bottom:12px;">Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
            <p style="margin-bottom:12px;">The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process.</p>
            <p style="margin-bottom:12px;">Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p>
            <p style="margin-bottom:12px;">Frevector.com includes the following content:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Vector illustrations</li>
                <li>Icon sets</li>
                <li>Logo design elements</li>
                <li>Graphic elements</li>
                <li>Various design resources</li>
            </ul>
            <p style="margin-bottom:12px;">All files can be used in both personal and commercial projects.</p>
            <p style="margin-bottom:12px;"><strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package.</p>
            <p>Frevector is a platform that values labor, original production, and an ethical approach to design.</p>
        `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `
            <h2 style="margin-bottom:16px;">Privacy Policy</h2>
            <p style="margin-bottom:12px;">As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Data Collected</h3>
            <p style="margin-bottom:8px;">When you visit the site, certain anonymous data may be collected automatically. This data does not directly identify you.</p>
            <p style="margin-bottom:8px;">Collected data may include:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Cookies</li>
                <li>Browser and device information</li>
                <li>IP address (for anonymous analytical purposes)</li>
                <li>Page visit and interaction data</li>
                <li>Analytical usage information</li>
            </ul>
            <h3 style="margin-bottom:8px;margin-top:16px;">2. Purposes of Data Use</h3>
            <p style="margin-bottom:8px;">The collected data may be used for the following purposes:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Improving site performance</li>
                <li>Enhancing user experience</li>
                <li>Detecting technical issues</li>
                <li>Ensuring security</li>
                <li>Supporting the content development process</li>
            </ul>
            <h3 style="margin-bottom:8px;margin-top:16px;">3. Personal Data</h3>
            <p style="margin-bottom:12px;">Personal data (name, email, etc.) is only processed when voluntarily shared by the user—for example, via emails sent for communication purposes. Frevector does not sell user data to third parties or share it for commercial purposes.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">4. Cookie Policy</h3>
            <p style="margin-bottom:12px;">Cookies may be used on the site to support site functions, remember user preferences, and measure performance. Users can limit or disable the use of cookies through their browser settings.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">5. Data Security</h3>
            <p>Necessary technical and administrative measures are taken to protect data. However, it cannot be guaranteed that data transmission over the internet is completely secure.</p>
        `
    },
    terms: {
        title: 'Terms of Service',
        content: `
            <h2 style="margin-bottom:16px;">Terms of Service</h2>
            <p style="margin-bottom:12px;">Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Content Ownership</h3>
            <p style="margin-bottom:12px;">All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">2. Right of Use</h3>
            <p style="margin-bottom:12px;">Downloaded files can be used in personal and commercial projects. The user may edit the files for their own projects and incorporate them into their work.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">3. Prohibited Uses</h3>
            <p style="margin-bottom:8px;">The following actions are prohibited:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Redistributing files</li>
                <li>Uploading to other sites</li>
                <li>Selling files digitally or physically</li>
                <li>Sharing as an archive, package, or collection</li>
                <li>Presenting Frevector content as a resource on other platforms</li>
            </ul>
            <h3 style="margin-bottom:8px;margin-top:16px;">4. Liability</h3>
            <p style="margin-bottom:12px;">Frevector cannot be held responsible for any direct or indirect damages arising from the use of the content. Technical malfunctions or temporary access issues may occur on the platform from time to time.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">5. Right to Change</h3>
            <p style="margin-bottom:16px;">Frevector reserves the right to update the terms of service and site content as necessary.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <h3 style="margin-bottom:8px;">License Description</h3>
            <p style="margin-bottom:8px;">All designs on Frevector are original works prepared by Frevector artists.</p>
            <p style="margin-bottom:8px;"><strong>Usage Permission:</strong></p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Can be used in personal projects</li>
                <li>Can be used in commercial projects</li>
                <li>Can be edited and integrated into projects</li>
            </ul>
            <p style="margin-bottom:8px;"><strong>Prohibitions:</strong></p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Sharing files as-is</li>
                <li>Redistribution</li>
                <li>Selling</li>
                <li>Presenting as a resource on other sites</li>
                <li>Sharing within bulk content archives</li>
            </ul>
            <p>The Frevector license allows designs to be used in end-user projects. It does not allow the sharing of the file itself.</p>
        `
    },
    contact: {
        title: 'Contact',
        content: `
            <h2 style="margin-bottom:16px;">Contact</h2>
            <p style="margin-bottom:12px;">If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p>
            <p style="margin-bottom:16px;"><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000;text-decoration:underline;">hakankacar2014@gmail.com</a></p>
            <p style="margin-bottom:16px;">Frevector prioritizes clear and transparent communication with its users.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <h3 style="margin-bottom:8px;">Copyright Notice</h3>
            <p style="margin-bottom:12px;">Frevector values original production and respects copyrights. The content on the site has been prepared by Frevector artists. Nevertheless, if you believe that any content infringes your copyright, please contact us.</p>
            <p style="margin-bottom:8px;">The notification must include the following:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Information proving you are the copyright owner</li>
                <li>A link to the content you believe is infringing</li>
                <li>Your contact information</li>
                <li>A statement regarding the accuracy of your claim</li>
            </ul>
            <p style="margin-bottom:12px;">Upon review, if deemed appropriate, the relevant content will be removed.</p>
            <p><strong>Contact:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000;text-decoration:underline;">hakankacar2014@gmail.com</a></p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <h3 style="margin-bottom:8px;">Frequently Asked Questions</h3>
            <p style="margin-bottom:6px;"><strong>1. Are the files free?</strong><br>Yes. Files can be used for free in personal and commercial projects.</p>
            <p style="margin-bottom:6px;"><strong>2. Can I sell the files?</strong><br>No. Selling or redistributing the files is prohibited.</p>
            <p style="margin-bottom:6px;"><strong>3. Can I use the files for my clients?</strong><br>Yes. They can be used in commercial projects. However, the file itself cannot be provided as a separate product.</p>
            <p><strong>4. Can I upload the files to another site?</strong><br>No. Redistribution is not permitted.</p>
        `
    }
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedCategory: 'all',
    selectedType: 'all',
    searchQuery: '',
    isLoading: false,
    openedVector: null,
    openedCardEl: null,
    countdownInterval: null,
    detailPanelOpen: false,
    downloadInProgress: false,
    // REVİZYON 3: Our Picks kaydırma durumu
    ourPicksOffset: 0,
    ourPicksVectors: []
};

function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    setupOurPicksArrows();

    // Geri/İleri butonlarını dinle
    window.onpopstate = (event) => {
        if (location.pathname.startsWith("/details/")) {
            const slug = location.pathname.split("/details/")[1].split("?")[0];
            const match = state.vectors.find(v => v.name === slug);
            if (match) openDetailPanel(match);
        } else {
            closeDetailPanel();
        }
    };

    fetchVectors().then(() => {
        if (location.pathname.startsWith("/details/")) {
            const slug = location.pathname.split("/details/")[1].split("?")[0];
            const match = state.vectors.find(v =>
                v.name === slug || (v.name && v.name.toLowerCase().replace(/\s+/g, "-") === slug)
            );
            if (match) {
                // DOM'un render edilmesi için kısa bir süre bekle
                setTimeout(() => {
                    const grid = document.getElementById("vectorsGrid");
                    if (!grid) return;
                    
                    // Önce mevcut kartlar arasında ara
                    let cardEl = Array.from(grid.children)
                        .find(el => el.querySelector(".vc-img")?.alt === match.title);
                    
                    // Eğer kart bulunamazsa (farklı sayfada olabilir), ilk kartı referans al veya sanal bir kart oluşturma mantığı yerine direkt aç
                    if (cardEl) {
                        openDetailPanel(match, cardEl);
                        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        // Kart bulunamadıysa bile paneli açmak için ilk kartı kullan (grid boş değilse)
                        if (grid.children.length > 0) {
                            openDetailPanel(match, grid.children[0]);
                        }
                    }
                }, 200);
            }
        }
    });
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        // Desktop: Keep the TYPE container
        const typeContainer = document.createElement('div');
        typeContainer.style.padding = '0 16px 8px';
        typeContainer.style.marginBottom = '8px';
        typeContainer.style.paddingBottom = '8px';
        typeContainer.style.borderBottom = '1px solid #ddd';
        
        const typeLabel = document.createElement('div');
        typeLabel.style.fontSize = '10px';
        typeLabel.style.fontWeight = '600';
        typeLabel.style.color = '#666';
        typeLabel.style.marginBottom = '4px';
        typeLabel.textContent = 'TYPE';
        typeContainer.appendChild(typeLabel);
        
        const typeAll = document.createElement('a');
        typeAll.href = '#';
        typeAll.className = 'category-item' + (state.selectedType === 'all' ? ' active' : '');
        typeAll.textContent = 'All';
        typeAll.onclick = (e) => { e.preventDefault(); selectType('all'); };
        typeContainer.appendChild(typeAll);
        
        const typeVector = document.createElement('a');
        typeVector.href = '#';
        typeVector.className = 'category-item' + (state.selectedType === 'vector' ? ' active' : '');
        typeVector.textContent = 'Vector';
        typeVector.onclick = (e) => { e.preventDefault(); selectType('vector'); };
        typeContainer.appendChild(typeVector);
        
        const typeJpeg = document.createElement('a');
        typeJpeg.href = '#';
        typeJpeg.className = 'category-item' + (state.selectedType === 'jpeg' ? ' active' : '');
        typeJpeg.textContent = 'JPEG';
        typeJpeg.onclick = (e) => { e.preventDefault(); selectType('jpeg'); };
        typeContainer.appendChild(typeJpeg);
        
        list.appendChild(typeContainer);
    } else {
        // Mobile: Add TYPE items directly to the list as tags
        const typeAll = document.createElement('a');
        typeAll.href = '#';
        typeAll.className = 'category-item' + (state.selectedType === 'all' ? ' active' : '');
        typeAll.textContent = 'All Types';
        typeAll.onclick = (e) => { e.preventDefault(); selectType('all'); };
        list.appendChild(typeAll);
        
        const typeVector = document.createElement('a');
        typeVector.href = '#';
        typeVector.className = 'category-item' + (state.selectedType === 'vector' ? ' active' : '');
        typeVector.textContent = 'Vector';
        typeVector.onclick = (e) => { e.preventDefault(); selectType('vector'); };
        list.appendChild(typeVector);
        
        const typeJpeg = document.createElement('a');
        typeJpeg.href = '#';
        typeJpeg.className = 'category-item' + (state.selectedType === 'jpeg' ? ' active' : '');
        typeJpeg.textContent = 'JPEG';
        typeJpeg.onclick = (e) => { e.preventDefault(); selectType('jpeg'); };
        list.appendChild(typeJpeg);
    }

    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = 'category-item' + (state.selectedCategory === 'all' ? ' active' : '');
    allLink.dataset.cat = 'all';
    allLink.textContent = 'All Categories';
    allLink.onclick = (e) => { e.preventDefault(); selectCategory('all'); };
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.dataset.cat = cat;
        a.textContent = cat;
        a.onclick = (e) => { e.preventDefault(); selectCategory(cat); };
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
    setupCategories();
    updateCategoryTitle();
    fetchVectors();
}

function selectType(type) {
    state.selectedType = type;
    state.currentPage = 1;
    state.searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    closeDetailPanel();
    setupCategories();
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    
    // Generate H1 title based on selected category
    let h1Text = '';
    if (state.selectedCategory === 'all') {
        h1Text = 'Free Vectors, SVGs, Icons and Clipart';
    } else {
        h1Text = `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
    }
    
    el.textContent = h1Text;
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);

    try {
        const url = new URL('/api/vectors', window.location.origin);
        
        if (location.pathname.startsWith("/details/")) {
            const slug = location.pathname.split("/details/")[1].split("?")[0];
            url.searchParams.set('fetchAllForSlug', slug);
        }

        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        if (state.selectedType === 'vector') url.searchParams.set('type', 'vector');
        if (state.selectedType === 'jpeg') url.searchParams.set('type', 'jpeg');
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('API request failed');
        
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        renderVectors();
        fetchOurPicksRandomly();
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

async function fetchOurPicksRandomly() {
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('limit', '100');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        
        if (state.totalPages > 1) {
            const randomPage = Math.floor(Math.random() * state.totalPages) + 1;
            url.searchParams.set('page', randomPage);
        }

        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            let picks = data.vectors || [];
            picks.sort(() => Math.random() - 0.5);
            state.ourPicksVectors = picks;
            renderOurPicks();
        }
    } catch (err) {
        console.error('Our Picks fetch error:', err);
    }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No results found.</div>';
        return;
    }

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        if (state.openedVector && state.openedVector.name === v.name) card.classList.add('card-active');
        
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
                ${typeLabel}
            </div>
            <div class="vc-info">
                <div class="vc-description">${escHtml(v.description || "")}</div>
                <div class="vc-keywords">${escHtml([...new Set([...(v.keywords || [])])].join(', '))}</div>
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

// REVİZYON 3: Our Picks - Sonsuz Döngü ve Rastgele Görseller
function renderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track || !state.ourPicksVectors.length) return;
    track.innerHTML = '';
    
    const displayVectors = [...state.ourPicksVectors, ...state.ourPicksVectors, ...state.ourPicksVectors];
    
    displayVectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="lazy">
                ${typeLabel}
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        track.appendChild(card);
    });

    const cardWidth = 90; 
    state.ourPicksOffset = state.ourPicksVectors.length * cardWidth;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
}

function setupOurPicksArrows() {
    const prevBtn = document.getElementById('ourPicksPrev');
    const nextBtn = document.getElementById('ourPicksNext');
    if (!prevBtn || !nextBtn) return;

    prevBtn.onclick = () => scrollOurPicks(-1);
    nextBtn.onclick = () => scrollOurPicks(1);
}

function scrollOurPicks(direction) {
    const track = document.getElementById('ourPicksTrack');
    if (!track || !state.ourPicksVectors.length) return;

    const cardWidth = 90; 
    const step = 3 * cardWidth; 
    
    state.ourPicksOffset += direction * step;
    track.style.transition = 'transform 0.4s ease-out';
    track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;

    const singleSetWidth = state.ourPicksVectors.length * cardWidth;
    
    track.addEventListener('transitionend', function handleTransitionEnd() {
        track.removeEventListener('transitionend', handleTransitionEnd);
        
        if (state.ourPicksOffset >= 2 * singleSetWidth) {
            state.ourPicksOffset -= singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        } else if (state.ourPicksOffset <= 0) {
            state.ourPicksOffset += singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        }
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
    if (cardEl) cardEl.classList.add('card-active');

    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel';
    
    const keywords = [...new Set([...(v.keywords || [])])];
    const fileFormat = v.isJpegOnly ? 'JPEG' : 'EPS, SVG, JPEG';

    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left">
                <img class="detail-img" src="${v.thumbnail}" alt="${escHtml(v.title)}">
                <table class="detail-table">
                    <tr><td class="dt-label">FILE FORMAT</td><td class="dt-value">${fileFormat}</td></tr>
                    <tr><td class="dt-label">CATEGORY</td><td class="dt-value">${escHtml(v.category)}</td></tr>
                    <tr><td class="dt-label">RESOLUTION</td><td class="dt-value">High Quality / Fully Scalable</td></tr>
                    <tr><td class="dt-label">LICENSE</td><td class="dt-value">Free for Personal &amp; Commercial Use</td></tr>
                    <tr><td class="dt-label">FILE SIZE</td><td class="dt-value">${v.fileSize || 'N/A'}</td></tr>
                </table>
            </div>
            <div class="detail-right">
                <h2 class="detail-title">${escHtml(v.title)}</h2>
                <p class="detail-desc">${escHtml(v.description || "")}</p>
                <div class="detail-keywords">
                    ${keywords.map(kw => `<span class="kw-tag">${escHtml(kw)}</span>`).join('')}
                </div>
                <div style="margin-top: 20px; display: flex; gap: 12px;">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD</button>
                    <button class="detail-close-btn" id="mainCloseBtn">Close</button>
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById('vectorsGrid');
    const cards = Array.from(grid.children);
    const index = cardEl ? cards.indexOf(cardEl) : 0;
    const columns = window.innerWidth >= 1200 ? 6 : (window.innerWidth >= 768 ? 4 : 1);
    const insertAfterIndex = Math.min(cards.length - 1, Math.floor(index / columns) * columns + (columns - 1));
    
    if (cards.length > 0) {
        grid.insertBefore(panel, cards[insertAfterIndex].nextSibling);
    } else {
        grid.appendChild(panel);
    }

    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
    
    // URL'yi güncelle (objects-jpeg-000000000131 takılı kalma sorununu çözer)
    const newPath = `/details/${v.name}`;
    if (window.location.pathname !== newPath) {
        window.history.pushState({ slug: v.name }, v.title, newPath);
    }
    
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.remove();
    if (state.openedCardEl) state.openedCardEl.classList.remove('card-active');
    
    // URL'yi ana sayfaya döndür
    if (window.location.pathname.startsWith('/details/')) {
        window.history.pushState({}, 'Frevector', '/');
    }
    
    state.openedVector = null;
    state.openedCardEl = null;
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    if (!dp) return;

    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpDescription').textContent = v.description;
    document.getElementById('dpImage').src = v.thumbnail;
    document.getElementById('dpCategory').textContent = v.category;
    document.getElementById('dpFileSize').textContent = v.fileSize || 'N/A';
    
    // Update file format in download page
    const dpFormatCell = document.getElementById('dpFileFormat');
    if (dpFormatCell) dpFormatCell.textContent = v.isJpegOnly ? 'JPEG' : 'EPS, SVG, JPEG';

    const kwBox = document.getElementById('dpKeywords');
    const keywords = [...new Set([...EXTRA_KEYWORDS, ...(v.keywords || [])])];
    kwBox.innerHTML = keywords.map(kw => `<span class="kw-tag">${escHtml(kw)}</span>`).join('');

    const btn = document.getElementById('dpDownloadBtn');
    const countBox = document.getElementById('dpCountdownBox');
    const countNum = document.getElementById('dpCountdown');

    btn.style.display = 'block';
    countBox.style.display = 'none';

    btn.onclick = () => {
        btn.style.display = 'none';
        countBox.style.display = 'block';
        let count = 4;
        countNum.textContent = count;
        state.countdownInterval = setInterval(() => {
            count--;
            countNum.textContent = count;
            if (count <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
                setTimeout(() => { dp.style.display = 'none'; document.body.style.overflow = ''; }, 1000);
            }
        }, 1000);
    };

    dp.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function setupDownloadPageHandlers() {
    const dpClose = document.getElementById('dpClose');
    if (dpClose) {
        dpClose.onclick = () => {
            document.getElementById('downloadPage').style.display = 'none';
            document.body.style.overflow = '';
            clearInterval(state.countdownInterval);
        };
    }
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const content = MODAL_CONTENTS[btn.dataset.modal];
            if (!content) return;
            document.getElementById('infoModalBody').innerHTML = content.content;
            document.getElementById('infoModal').style.display = 'flex';
        };
    });
    const infoModalClose = document.getElementById('infoModalClose');
    if (infoModalClose) {
        infoModalClose.onclick = () => {
            document.getElementById('infoModal').style.display = 'none';
        };
    }
    // Close modal on backdrop click
    const infoModal = document.getElementById('infoModal');
    if (infoModal) {
        infoModal.onclick = (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
            }
        };
    }
}

function setupEventListeners() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.onkeydown = (e) => { if (e.key === 'Enter') { state.searchQuery = input.value; state.currentPage = 1; fetchVectors(); } };
    }
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.onclick = () => { state.searchQuery = input.value; state.currentPage = 1; fetchVectors(); };
    }
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.onchange = () => { state.currentPage = 1; fetchVectors(); };
    }
    
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    }
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
    }
}

function updatePagination() {
    const pageNumber = document.getElementById('pageNumber');
    if (pageNumber) pageNumber.textContent = state.currentPage;
    const pageTotal = document.getElementById('pageTotal');
    if (pageTotal) pageTotal.textContent = `/ ${state.totalPages}`;
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

/* =========================
ULTRA PERFORMANCE PATCH v1
(append-only)
========================= */

(function () {
  if (window.__ULTRA_PERF_PATCH__) return;
  window.__ULTRA_PERF_PATCH__ = true;

  const BATCH_SIZE = 20;
  const IDLE_TIMEOUT = 50;

  let observer;
  let queue = [];
  let rendering = false;

  function createObserver() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            img.decode?.().catch(() => {});
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: "300px"
    });
  }

  function processQueue(deadline) {
    if (rendering) return;
    rendering = true;

    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && queue.length > 0) {
      const item = queue.shift();
      item();
    }

    rendering = false;

    if (queue.length > 0) {
      requestIdleCallback(processQueue, { timeout: IDLE_TIMEOUT });
    }
  }

  function schedule(task) {
    queue.push(task);
    requestIdleCallback(processQueue, { timeout: IDLE_TIMEOUT });
  }

  function optimizeImages() {
    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      if (img.dataset.optimized) return;

      img.dataset.optimized = "1";

      if (img.src && !img.dataset.src) {
        img.dataset.src = img.src;
        img.src = "";
      }

      img.loading = "lazy";
      img.decoding = "async";

      observer.observe(img);
    });
  }

  function preloadNextPage() {
    const nextBtn = document.querySelector(".pagination .next");
    if (!nextBtn) return;

    const href = nextBtn.getAttribute("href");
    if (!href) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  }

  function init() {
    createObserver();

    schedule(() => optimizeImages());
    schedule(() => preloadNextPage());

    const mutation = new MutationObserver(() => {
      schedule(() => optimizeImages());
    });

    mutation.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
