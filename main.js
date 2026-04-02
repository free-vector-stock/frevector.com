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
    ourPicksVectors: [],
    ourPicksVelocity: 0,
    ourPicksMomentumInterval: null
};

function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    setupOurPicksArrows();

    const initialCategory = new URLSearchParams(window.location.search).get('category') || 'all';
    if (initialCategory !== 'all') {
        document.querySelectorAll('.category-item').forEach(el => {
            if (el.textContent.toLowerCase() === initialCategory.toLowerCase()) {
                el.click();
            }
        });
    } else {
        fetchVectors();
    }
}

function setupCategories() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;

    const allBtn = document.createElement('a');
    allBtn.className = 'category-item active';
    allBtn.textContent = 'All Categories';
    allBtn.onclick = (e) => {
        e.preventDefault();
        selectCategory('all', allBtn);
    };
    categoriesList.appendChild(allBtn);

    CATEGORIES.forEach(cat => {
        const link = document.createElement('a');
        link.className = 'category-item';
        link.textContent = cat;
        link.onclick = (e) => {
            e.preventDefault();
            selectCategory(cat, link);
        };
        categoriesList.appendChild(link);
    });
}

function selectCategory(cat, element) {
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    state.selectedCategory = cat;
    state.currentPage = 1;
    fetchVectors();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const sortFilter = document.getElementById('sortFilter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    searchBtn.onclick = () => {
        state.searchQuery = searchInput.value.trim();
        state.currentPage = 1;
        fetchVectors();
    };

    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            state.searchQuery = searchInput.value.trim();
            state.currentPage = 1;
            fetchVectors();
        }
    };

    sortFilter.onchange = () => {
        state.currentPage = 1;
        fetchVectors();
    };

    prevBtn.onclick = () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            fetchVectors();
        }
    };

    nextBtn.onclick = () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            fetchVectors();
        }
    };
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
    
    let filteredPicks = [...state.ourPicksVectors];
    if (state.selectedType === 'vector') {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
    } else if (state.selectedType === 'jpeg') {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === true || (typeof v.isJpegOnly === 'undefined' && v.name.includes('jpeg')));
    }

    if (!filteredPicks.length) return;

    const displayVectors = [...filteredPicks, ...filteredPicks, ...filteredPicks, ...filteredPicks, ...filteredPicks];
    
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
        card.onclick = () => {
            openDetailPanel(v, card);
            const grid = document.getElementById('vectorsGrid');
            if (grid) {
                const mainCards = grid.querySelectorAll('.vector-card');
                mainCards.forEach(c => c.classList.remove('card-active'));
            }
        };
        track.appendChild(card);
    });

    const cardWidth = window.innerWidth <= 768 ? 70 : 90; 
    state.ourPicksOffset = 2 * filteredPicks.length * cardWidth;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
}

function setupOurPicksArrows() {
    const prevBtn = document.getElementById('ourPicksPrev');
    const nextBtn = document.getElementById('ourPicksNext');
    const track = document.getElementById('ourPicksTrack');
    const wrap = document.querySelector('.our-picks-track-wrap');

    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => scrollOurPicks(-1);
        nextBtn.onclick = () => scrollOurPicks(1);
    }

    if (!track || !wrap) return;

    // Enhanced Swipe/Drag functionality with momentum
    let isDown = false;
    let startX;
    let initialOffset;
    let lastX;
    let lastTime;
    const velocityHistory = [];

    const start = (e) => {
        isDown = true;
        track.style.transition = 'none';
        startX = (e.pageX || e.touches[0].pageX) - wrap.offsetLeft;
        lastX = startX;
        lastTime = Date.now();
        initialOffset = state.ourPicksOffset;
        velocityHistory.length = 0;
        
        if (state.ourPicksMomentumInterval) {
            clearInterval(state.ourPicksMomentumInterval);
        }
    };

    const end = () => {
        if (!isDown) return;
        isDown = false;
        
        // Ortalama hızı momentum için kullan
        if (velocityHistory.length > 0) {
            state.ourPicksVelocity = velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;
        }
        
        // Momentum animasyonu başlat
        applyOurPicksMomentum(track);
    };

    const move = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - wrap.offsetLeft;
        const walk = (x - startX);
        
        // Hızı hesapla (piksel/ms)
        const now = Date.now();
        const timeDelta = Math.max(now - lastTime, 1);
        const distanceDelta = x - lastX;
        const velocity = (distanceDelta / timeDelta) * 16; // 16ms = ~60fps
        
        // Hız geçmişine ekle (son 5 frame)
        velocityHistory.push(velocity);
        if (velocityHistory.length > 5) {
            velocityHistory.shift();
        }
        
        lastX = x;
        lastTime = now;
        
        state.ourPicksOffset = initialOffset - walk;
        track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
    };

    wrap.addEventListener('mousedown', start);
    wrap.addEventListener('touchstart', start, { passive: true });
    
    window.addEventListener('mouseup', end);
    wrap.addEventListener('touchend', end);
    
    wrap.addEventListener('mousemove', move);
    wrap.addEventListener('touchmove', move, { passive: false });
}

function scrollOurPicks(direction) {
    const track = document.getElementById('ourPicksTrack');
    if (!track || !state.ourPicksVectors.length) return;

    // Momentum için hızı ayarla
    state.ourPicksVelocity = direction * 15; // Başlangıç hızı
    
    // Devam eden momentum interval'i temizle
    if (state.ourPicksMomentumInterval) {
        clearInterval(state.ourPicksMomentumInterval);
    }
    
    // Momentum animasyonu başlat
    applyOurPicksMomentum(track);
}

function applyOurPicksMomentum(track) {
    const cardWidth = window.innerWidth <= 768 ? 70 : 90;
    
    let filteredPicks = [...state.ourPicksVectors];
    if (state.selectedType === 'vector') {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
    } else if (state.selectedType === 'jpeg') {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === true || (typeof v.isJpegOnly === 'undefined' && v.name.includes('jpeg')));
    }
    
    const singleSetWidth = filteredPicks.length * cardWidth;
    const friction = 0.94; // Sürtünme katsayısı (daha düşük = daha uzun sürer)
    const minVelocity = 0.3; // Minimum hız eşiği
    
    state.ourPicksMomentumInterval = setInterval(() => {
        // Hızı azalt (sürtünme uygula)
        state.ourPicksVelocity *= friction;
        
        // Hız çok küçük olursa dur
        if (Math.abs(state.ourPicksVelocity) < minVelocity) {
            clearInterval(state.ourPicksMomentumInterval);
            state.ourPicksMomentumInterval = null;
            state.ourPicksVelocity = 0;
            
            // Snap to nearest card
            state.ourPicksOffset = Math.round(state.ourPicksOffset / cardWidth) * cardWidth;
            track.style.transition = 'transform 0.3s ease-out';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
            
            // Sonsuz döngü kontrolü
            setTimeout(() => {
                if (state.ourPicksOffset >= 3 * singleSetWidth) {
                    state.ourPicksOffset -= singleSetWidth;
                    track.style.transition = 'none';
                    track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
                } else if (state.ourPicksOffset <= singleSetWidth) {
                    state.ourPicksOffset += singleSetWidth;
                    track.style.transition = 'none';
                    track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
                }
            }, 300);
            return;
        }
        
        // Konumu güncelle
        state.ourPicksOffset += state.ourPicksVelocity;
        track.style.transition = 'none';
        track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        
        // Hareket halindeyken de sonsuz döngü kontrolü
        if (state.ourPicksOffset >= 3 * singleSetWidth) {
            state.ourPicksOffset -= singleSetWidth;
        } else if (state.ourPicksOffset <= singleSetWidth) {
            state.ourPicksOffset += singleSetWidth;
        }
    }, 16);
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
    
    const displayType = v.isJpegOnly ? 'JPEG' : 'Vector';
    const displayCategory = v.category || 'Belirtilmemiş';
    const fileFormat = v.isJpegOnly ? 'JPEG' : 'EPS, SVG, JPEG';

    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left">
                <img class="detail-img" src="${v.thumbnail}" alt="${escHtml(v.title)}">
                <table class="detail-table">
                    <tr><td class="dt-label">TIP</td><td class="dt-value">${displayType}</td></tr>
                    <tr><td class="dt-label">KATEGORI</td><td class="dt-value">${escHtml(displayCategory)}</td></tr>
                    <tr><td class="dt-label">FILE FORMAT</td><td class="dt-value">${fileFormat}</td></tr>
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
    grid.appendChild(panel);

    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
    
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
    
    const displayType = v.isJpegOnly ? 'JPEG' : 'Vector';
    const displayCategory = v.category || 'Belirtilmemiş';
    
    document.getElementById('dpCategory').textContent = displayCategory;
    document.getElementById('dpFileSize').textContent = v.fileSize || 'N/A';
    
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
}

function updatePagination() {
    const pageNum = document.getElementById('pageNumber');
    const pageTotal = document.getElementById('pageTotal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    pageNum.textContent = state.currentPage;
    pageTotal.textContent = `/ ${state.totalPages}`;
    prevBtn.disabled = state.currentPage <= 1;
    nextBtn.disabled = state.currentPage >= state.totalPages;
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

window.addEventListener('DOMContentLoaded', init);
