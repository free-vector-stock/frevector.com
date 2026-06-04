/**
 * frevector.com - Frontend Logic
 * v2026031401 - Revisions: mobile layout, our-picks arrows, category spacing
 */

const EXTRA_KEYWORDS = ['free jpeg', 'free', 'jpeg', 'fre'];
const VECTOR_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'vector eps', 'svg'];

const CATEGORIES = [
    'Icon', 'Logo', 'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Business', 'Buildings', 'Celebrities',
    'Drink', 'Education', 'Fashion', 'Food', 'Font', 'Holidays', 'Industrial', 'Interiors', 'Medical',
    'Miscellaneous', 'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Sports',
    'Symbols', 'Technology', 'Transportation', 'Vintage'
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

    // TYPE section removed as per requirement June 2026

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
        // JPEG visibility: JPEG files are stored in Cloudflare bucket but hidden from site display.
        // To re-enable JPEG listings, set HIDE_JPEG = false (or remove the filter).
        // Last updated: June 2026
        const HIDE_JPEG = true;
        if (HIDE_JPEG) {
            url.searchParams.set('type', 'vector');
        } else {
            if (state.selectedType === 'vector') url.searchParams.set('type', 'vector');
            if (state.selectedType === 'jpeg') url.searchParams.set('type', 'jpeg');
        }
        
        // Sıralama filtresini ekle
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter && sortFilter.value) {
            url.searchParams.set('sort', sortFilter.value);
        }

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
        
        // ÖNEMLİ: API'ye hem kategori hem de tip parametrelerini gönderiyoruz
        if (state.selectedCategory && state.selectedCategory !== 'all') {
            url.searchParams.set('category', state.selectedCategory);
        }
        
        if (state.selectedType === 'vector') {
            url.searchParams.set('type', 'vector');
        } else if (state.selectedType === 'jpeg') {
            url.searchParams.set('type', 'jpeg');
        }
        
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            let picks = data.vectors || [];
            
            // JPEG visibility
            const HIDE_JPEG = true;
            if (HIDE_JPEG) {
                picks = picks.filter(v => !v.isJpegOnly);
            } else {
                if (state.selectedType === 'vector') {
                    picks = picks.filter(v => !v.isJpegOnly);
                } else if (state.selectedType === 'jpeg') {
                    picks = picks.filter(v => v.isJpegOnly);
                }
            }

            // GÖREV 1: Fallback Mekanizması
            // Eğer seçili kategoride yeterli görsel yoksa (örneğin 20'den az), diğer kategorilerden popüler görselleri ekle
            if (picks.length < 20) {
                const fallbackUrl = new URL('/api/vectors', window.location.origin);
                fallbackUrl.searchParams.set('limit', '50'); // Genelden 50 tane çekelim
                if (HIDE_JPEG) fallbackUrl.searchParams.set('type', 'vector');
                
                const fallbackRes = await fetch(fallbackUrl);
                if (fallbackRes.ok) {
                    const fallbackData = await fallbackRes.json();
                    const fallbackVectors = (fallbackData.vectors || []).filter(fv => 
                        !picks.find(pv => pv.name === fv.name) // Mevcutları tekrar ekleme
                    );
                    // Eksik olanı genelden tamamla (toplam 40'a kadar veya bulabildiğin kadar)
                    picks = [...picks, ...fallbackVectors].slice(0, 40);
                }
            }
            
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

    state.vectors.forEach((v, index) => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        if (state.openedVector && state.openedVector.name === v.name) card.classList.add('card-active');
        
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';

        // İlk 12 görseli eager (hemen), diğerlerini lazy yükle
        const loadingAttr = index < 12 ? 'eager' : 'lazy';
        const fetchPriority = index < 12 ? 'high' : 'low';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="${loadingAttr}" fetchpriority="${fetchPriority}" decoding="async" width="300" height="300">
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
    if (!track) return;
    track.innerHTML = '';
    
    // JPEG visibility: JPEG files are stored in Cloudflare bucket but hidden from site display.
    const HIDE_JPEG = true;
    let filteredPicks = [...state.ourPicksVectors];
    if (HIDE_JPEG) {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
    } else {
        if (state.selectedType === 'vector') {
            filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
        } else if (state.selectedType === 'jpeg') {
            filteredPicks = filteredPicks.filter(v => v.isJpegOnly === true || (typeof v.isJpegOnly === 'undefined' && v.name.includes('jpeg')));
        }
    }
    
    if (filteredPicks.length === 0) return;
    
    const displayVectors = [...filteredPicks, ...filteredPicks, ...filteredPicks, ...filteredPicks, ...filteredPicks];
    
    displayVectors.forEach((v, index) => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        
        // Our Picks için ilk birkaç görseli hızlı yükle, diğerlerini lazy load
        const loadingAttr = index < 15 ? 'eager' : 'lazy';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="${loadingAttr}" decoding="async" fetchpriority="${index < 5 ? 'high' : 'auto'}" width="300" height="300">
                ${typeLabel}
            </div>
        `;
        card.onclick = () => {
            // "Our Picks" görselleri için özel davranış: Önce ana ekranda (detay paneli) açılacak
            // scrollIntoView'ı burada engelliyoruz çünkü sayfa kaymasını istemiyoruz
            openDetailPanel(v, null); 
            
            // Detay paneli açıldığında ana ızgaradaki ilgili kartı bulup aktif yapalım (eğer varsa)
            const mainGrid = document.getElementById('vectorsGrid');
            if (mainGrid) {
                const mainCards = mainGrid.querySelectorAll('.vector-card');
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

    // Swipe/Drag functionality with momentum
    let isDown = false;
    let startX;
    let scrollLeft;
    let initialOffset;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let momentumAnimationId = null;

    const start = (e) => {
        isDown = true;
        track.style.transition = 'none';
        startX = (e.pageX || e.touches[0].pageX) - wrap.offsetLeft;
        initialOffset = state.ourPicksOffset;
        lastX = startX;
        lastTime = Date.now();
        velocity = 0;
        if (momentumAnimationId) cancelAnimationFrame(momentumAnimationId);
    };

    const end = () => {
        if (!isDown) return;
        isDown = false;
        
        // Calculate velocity for momentum
        const now = Date.now();
        const timeDiff = now - lastTime;
        if (timeDiff > 0) {
            velocity = (lastX - startX) / timeDiff;
        }
        
        // Apply momentum with easing
        applyMomentum(velocity);
        
        // Sonsuz döngü kontrolü
        setTimeout(checkInfiniteScroll, 500);
    };

    const move = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - wrap.offsetLeft;
        const walk = (x - startX);
        state.ourPicksOffset = initialOffset - walk;
        track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        lastX = x;
        lastTime = Date.now();
    };
    
    const applyMomentum = (vel) => {
        const cardWidth = window.innerWidth <= 768 ? 70 : 90;
        const friction = 0.95;
        const minVelocity = 0.1;
        let currentVel = vel;
        
        const animate = () => {
            if (Math.abs(currentVel) > minVelocity) {
                state.ourPicksOffset -= currentVel * 16; // 16ms per frame
                currentVel *= friction;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
                momentumAnimationId = requestAnimationFrame(animate);
            } else {
                // Snap to nearest card after momentum ends
                track.style.transition = 'transform 0.3s ease-out';
                state.ourPicksOffset = Math.round(state.ourPicksOffset / cardWidth) * cardWidth;
                track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
            }
        };
        animate();
    };

    function checkInfiniteScroll() {
        let filteredPicks = [...state.ourPicksVectors];
        if (state.selectedType === 'vector') {
            filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
        } else if (state.selectedType === 'jpeg') {
            filteredPicks = filteredPicks.filter(v => v.isJpegOnly === true || (typeof v.isJpegOnly === 'undefined' && v.name.includes('jpeg')));
        }
        const cardWidth = window.innerWidth <= 768 ? 70 : 90;
        const singleSetWidth = filteredPicks.length * cardWidth;

        if (state.ourPicksOffset >= 3 * singleSetWidth) {
            state.ourPicksOffset -= singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        } else if (state.ourPicksOffset <= singleSetWidth) {
            state.ourPicksOffset += singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        }
    }

    wrap.addEventListener('mousedown', start);
    wrap.addEventListener('touchstart', start, { passive: true });
    
    window.addEventListener('mouseup', end);
    wrap.addEventListener('touchend', end);
    wrap.addEventListener('mouseleave', end);
    
    wrap.addEventListener('mousemove', move);
    wrap.addEventListener('touchmove', move, { passive: false });
}

function scrollOurPicks(direction) {
    const track = document.getElementById('ourPicksTrack');
    if (!track || !state.ourPicksVectors.length) return;

    const isMobile = window.innerWidth <= 768;
    const cardWidth = isMobile ? 70 : 90; 
    const step = (isMobile ? 2 : 3) * cardWidth; 
    
    state.ourPicksOffset += direction * step;
    track.style.transition = 'transform 0.4s ease-out';
    track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;

    let filteredPicks = [...state.ourPicksVectors];
    if (state.selectedType === 'vector') {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
    } else if (state.selectedType === 'jpeg') {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === true || (typeof v.isJpegOnly === 'undefined' && v.name.includes('jpeg')));
    }
    const singleSetWidth = filteredPicks.length * cardWidth;
    
    track.addEventListener('transitionend', function handleTransitionEnd() {
        track.removeEventListener('transitionend', handleTransitionEnd);
        
        if (state.ourPicksOffset >= 3 * singleSetWidth) {
            state.ourPicksOffset -= singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        } else if (state.ourPicksOffset <= singleSetWidth) {
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
    
    // REVİZYON: Tip ve Kategori Fallback Mekanizması
    const displayType = v.isJpegOnly ? 'JPEG' : 'Vector';
    const displayCategory = v.category || 'Unspecified';
    const fileFormat = v.isJpegOnly ? 'JPEG' : 'EPS, SVG, JPEG';

    panel.innerHTML = `
        <div class="detail-inner">
            <div class="detail-left">
                <img class="detail-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" width="600" height="600" loading="eager">
                <table class="detail-table">
                    <tr><td class="dt-label">TYPE</td><td class="dt-value">${displayType}</td></tr>
                    <tr><td class="dt-label">CATEGORY</td><td class="dt-value">${escHtml(displayCategory)}</td></tr>
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
                ${buildVectorSeoText(v)}
                <div style="margin-top: 20px; display: flex; gap: 12px;">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD</button>

                    <button class="detail-close-btn" id="mainCloseBtn">Close</button>
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById('vectorsGrid');
    
    // MOBİL REVİZYON: Mobilde detay panelini tıklanan görselin hemen altına ekle
    if (window.innerWidth <= 768 && cardEl) {
        cardEl.after(panel);
    } else {
        // Masaüstünde eski mantık: en sona ekle
        grid.appendChild(panel);
    }

    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
    
    // URL'yi güncelle (objects-jpeg-000000000131 takılı kalma sorununu çözer)
    const newPath = `/details/${v.name}`;
    if (window.location.pathname !== newPath) {
        window.history.pushState({ slug: v.name }, v.title, newPath);
    }
    
    // Detay panelini görünür kılmak için her zaman scroll yapalım
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

function buildVectorSeoText(v) {
    const title = escHtml(v.title || 'Free Vector Graphic');
    const category = escHtml(v.category || 'vector graphics');
    const style = (v.keywords && v.keywords.length) ? escHtml(v.keywords.slice(0, 3).join(', ')) : 'clean and editable';
    const useCases = (v.keywords && v.keywords.length) ? escHtml(v.keywords.slice(0, 8).join(', ')) : 'websites, social media posts, presentations, print advertisements, packaging, flyers, app icons, and infographics';
    return `<section class="detail-seo-text" style="margin-top:24px;font-size:14px;line-height:1.75;color:#333">
        <h3>${title} — Free SVG & EPS Download</h3>
        <p>${title} is a high-quality free vector graphic available for download in SVG and EPS formats. This file is part of our ${category} collection and is suitable for a wide range of design projects, from digital media to print materials.</p>
        <h3>About This File</h3>
        <p>This vector has been prepared in a ${style} style, making it versatile and easy to customize in vector editing applications such as Adobe Illustrator, Inkscape, CorelDRAW, or Affinity Designer. The scalable format ensures that the graphic looks sharp and professional at any size, whether you need a small icon for a mobile app or a large illustration for a poster or banner.</p>
        <p>The file is fully editable. You can change colors, resize elements, add text, or combine it with other graphics to create a unique composition. No quality loss occurs at any resolution because the artwork is delivered in a true vector format.</p>
        <h3>How to Use This Vector</h3>
        <p>This graphic is ideal for ${useCases}. Simply click the download button to get the file in your preferred format. SVG files can be opened directly in web browsers and most design tools. EPS files are compatible with professional design software and print workflows.</p>
        <h3>License Information</h3>
        <p>This file is free for both personal and commercial use. You may use it in client projects, commercial products, and publications without paying any fee or providing attribution. Redistribution or reselling of the file as a standalone asset is not permitted.</p>
        <h3>Related Vectors</h3>
        <p>Browse more files in our ${category} category to find additional graphics that complement this design. frevector.com offers thousands of free vectors across dozens of categories, all available for instant download. If you enjoy using frevector.com, consider bookmarking our site and checking back regularly because we add new vectors every week.</p>
    </section>`;
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    if (!dp) return;

    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpDescription').textContent = v.description;
    document.getElementById('dpImage').src = v.thumbnail;
    
    // REVİZYON: Download sayfasında da Tip ve Kategori gösterimi
    const displayType = v.isJpegOnly ? 'JPEG' : 'Vector';
    const displayCategory = v.category || 'Unspecified';
    
    document.getElementById('dpCategory').textContent = displayCategory;
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
                // Sayfanın kapanması (dp.style.display = 'none') kaldırıldı, artık açık kalacak.
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
            // e.preventDefault() removed to allow hash to appear in URL
            const modalType = btn.dataset.modal;
            const content = MODAL_CONTENTS[modalType];
            if (!content) return;
            document.getElementById('infoModalBody').innerHTML = content.content;
            document.getElementById('infoModal').style.display = 'flex';
        };
    });

    // Handle initial hash on load or hash change
    const handleHash = () => {
        const hash = window.location.hash.substring(1);
        if (MODAL_CONTENTS[hash]) {
            document.getElementById('infoModalBody').innerHTML = MODAL_CONTENTS[hash].content;
            document.getElementById('infoModal').style.display = 'flex';
        }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    const closeModal = () => {
        document.getElementById('infoModal').style.display = 'none';
        if (window.location.hash) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    };

    const infoModalClose = document.getElementById('infoModalClose');
    if (infoModalClose) {
        infoModalClose.onclick = closeModal;
    }
    // Close modal on backdrop click
    const infoModal = document.getElementById('infoModal');
    if (infoModal) {
        infoModal.onclick = (e) => {
            if (e.target === infoModal) {
                closeModal();
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
        const triggerSearch = () => { 
            state.searchQuery = input.value; 
            state.currentPage = 1; 
            fetchVectors(); 
        };
        searchBtn.onclick = triggerSearch;
        searchBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerSearch();
        }, { passive: false });
    }
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.onchange = () => { 
            state.currentPage = 1; 
            // Sıralama değerini state'e eklemiyoruz ama fetchVectors içinde select'ten okuyacağız
            fetchVectors(); 
        };
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
    
    // GÖREV 2: Toplam vektör sayısını güncelle
    const totalCountEl = document.getElementById('totalVectorCount');
    if (totalCountEl && state.total > 0) {
        totalCountEl.textContent = `(${state.total.toLocaleString()} free vectors available)`;
    }
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

/* ULTRA PERFORMANCE PATCH v1 REMOVED - Native browser optimizations used instead */
