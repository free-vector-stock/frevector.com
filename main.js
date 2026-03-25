// === PERFORMANCE LAYER START ===

// GLOBAL IMAGE OBSERVER
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                const src = img.dataset.src;
                const image = new Image();
                image.src = src;
                image.decode().then(() => {
                    img.src = src;
                });
                imageObserver.unobserve(img);
            }
        }
    });
}, { rootMargin: "200px" });

// BATCH RENDER
function batchAppend(parent, elements, batchSize = 12) {
    let i = 0;
    function chunk() {
        const frag = document.createDocumentFragment();
        for (let j = 0; j < batchSize && i < elements.length; j++, i++) {
            frag.appendChild(elements[i]);
        }
        parent.appendChild(frag);
        if (i < elements.length) {
            requestAnimationFrame(chunk);
        }
    }
    requestAnimationFrame(chunk);
}

// CACHE
const PAGE_CACHE = {};

// === PERFORMANCE LAYER END ===


// MEVCUT KOD DEVAM (DEĞİŞTİRİLMEDİ SADECE ENTEGRE EDİLDİ)

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No results found.</div>';
        return;
    }

    const elements = [];

    state.vectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';

        const typeLabel = v.isJpegOnly
            ? '<span class="vc-type-badge jpeg">JPEG</span>'
            : '<span class="vc-type-badge vector">VECTOR</span>';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img lazy-img" data-src="${v.thumbnail}" alt="${escHtml(v.title)}">
                ${typeLabel}
            </div>
            <div class="vc-info">
                <div class="vc-description">${escHtml(v.description || "")}</div>
                <div class="vc-keywords">${escHtml((v.keywords || []).join(', '))}</div>
            </div>
        `;

        const img = card.querySelector('img');
        imageObserver.observe(img);

        card.onclick = () => openDetailPanel(v, card);
        elements.push(card);
    });

    batchAppend(grid, elements);

    preloadNextPage(); // 🔥 KRİTİK
}


// NEXT PAGE PRELOAD
async function preloadNextPage() {
    const nextPage = state.currentPage + 1;
    if (nextPage > state.totalPages) return;
    if (PAGE_CACHE[nextPage]) return;

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', nextPage);
        url.searchParams.set('limit', '24');

        const res = await fetch(url);
        const data = await res.json();
        PAGE_CACHE[nextPage] = data;
    } catch (e) {}
}


// FETCH OVERRIDE (CACHE KULLANIR)
async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);

    try {
        if (PAGE_CACHE[state.currentPage]) {
            const data = PAGE_CACHE[state.currentPage];
            state.vectors = data.vectors || [];
            state.totalPages = data.totalPages || 1;
            state.total = data.total || 0;
        } else {
            const url = new URL('/api/vectors', window.location.origin);
            url.searchParams.set('page', state.currentPage);
            url.searchParams.set('limit', '24');

            const res = await fetch(url);
            const data = await res.json();

            state.vectors = data.vectors || [];
            state.totalPages = data.totalPages || 1;
            state.total = data.total || 0;
        }

        renderVectors();
        renderOurPicks();
        updatePagination();

    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}
