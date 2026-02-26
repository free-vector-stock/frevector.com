/**
 * frevector.com - Frontend Logic
 * Tüm eksik özellikler entegre edildi
 */

const state = {
    allVectors: [],
    categories: [],
    selectedCategory: 'all',
    currentPage: 1,
    totalPages: 1,
    searchQuery: '',
    isLoading: false,
    featured: null,
    bannerTexts: [
        "We operate our own in-house studio to produce graphic designs and offer them free of charge for both personal and commercial projects.",
        "Our goal is to provide a comprehensive and ideal platform for those seeking graphic resources.",
        "We aim to offer a wide archive of graphics, including vector illustrations, stock photos, icons, logos, and various design elements.",
        "Our only and absolute rule is that our files may not be redistributed in any way.",
        "The advertisements on our website generate revenue to enable us to continue our work. Therefore, we ask for your understanding."
    ],
    currentBannerIndex: 0,
    modalContents: {
        about: `<h2>About Us</h2><p>Frevector.com, grafik tasarım alanında kaliteli, güvenilir ve tamamen özgün kaynaklara ücretsiz erişim sağlamak amacıyla kurulmuş bağımsız bir tasarım platformudur.</p><p>Platformumuz kendi iç stüdyosunda üretim yapan bir ekip tarafından yönetilmektedir. Sitemizde yer alan tüm tasarımlar yalnızca Frevector sanatçıları tarafından üretilmektedir.</p>`,
        privacy: `<h2>Privacy Policy</h2><p>Frevector.com olarak kullanıcı gizliliğine önem veriyoruz. Bu politika, sitemizi ziyaret ettiğinizde hangi verilerin toplanabileceğini ve nasıl kullanıldığını açıklar.</p><p>Sitemizi ziyaret ettiğinizde otomatik olarak bazı anonim veriler toplanabilir. Bu veriler kimliğinizi doğrudan belirlemez.</p>`,
        terms: `<h2>Terms of Service</h2><p>Frevector.com'u kullanan her ziyaretçi aşağıdaki şartları kabul etmiş sayılır.</p><p>Sitede yer alan tüm grafik tasarımlar Frevector sanatçıları tarafından üretilmiş özgün çalışmalardır. Tüm telif hakları Frevector'a aittir.</p>`,
        contact: `<h2>Contact</h2><p>Frevector.com ile ilgili her türlü soru, öneri, iş birliği talebi veya telif bildirimi için bizimle iletişime geçebilirsiniz.</p><p>E-posta: <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>`
    }
};

// --- BAŞLATMA ---
async function init() {
    setupEventListeners();
    startBannerAnimation();
    await fetchCategories();
    await fetchVectors();
}

// --- BANNER ANIMASYONU (5 saniyede bir değişen metin) ---
function startBannerAnimation() {
    const bannerText = document.getElementById('bannerText');
    if (!bannerText) return;

    setInterval(() => {
        state.currentBannerIndex = (state.currentBannerIndex + 1) % state.bannerTexts.length;
        bannerText.style.opacity = '0';
        setTimeout(() => {
            bannerText.textContent = state.bannerTexts[state.currentBannerIndex];
            bannerText.style.opacity = '1';
        }, 300);
    }, 5000);

    bannerText.style.transition = 'opacity 0.3s ease-in-out';
}

// --- VERİ ÇEKME ---
async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        state.categories = data.categories || [];
        renderCategories();
    } catch (e) {
        console.error("Kategori çekme hatası:", e);
    }
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('category', state.selectedCategory);
        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);

        const response = await fetch(url);
        const data = await response.json();

        state.allVectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        
        // Set featured item (first item on page 1)
        if (state.currentPage === 1 && state.allVectors.length > 0) {
            state.featured = state.allVectors[0];
            renderFeatured();
            renderSelectedForYou();
            renderKeywords();
        }
        
        renderVectors();
        updatePagination();
        updateCategoryTitle();
    } catch (e) {
        console.error("Vektör çekme hatası:", e);
    } finally {
        state.isLoading = false;
        showLoader(false);
    }
}

// --- RENDER FONKSİYONLARI ---
function renderCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;

    list.innerHTML = '';
    
    // "All" kategorisi
    const allItem = createCategoryItem('All', 'all');
    list.appendChild(allItem);

    state.categories.forEach(cat => {
        const item = createCategoryItem(cat.name, cat.name);
        list.appendChild(item);
    });
}

function createCategoryItem(name, value) {
    const a = document.createElement('a');
    a.href = '#';
    a.className = `category-item ${state.selectedCategory === value ? 'active' : ''}`;
    a.textContent = name;
    a.onclick = (e) => {
        e.preventDefault();
        state.selectedCategory = value;
        state.currentPage = 1;
        state.searchQuery = '';
        document.getElementById('searchInput').value = '';
        fetchVectors();
        renderCategories();
    };
    return a;
}

function renderFeatured() {
    if (!state.featured) return;

    const v = state.featured;
    document.getElementById('featuredImage').src = v.thumbnail;
    document.getElementById('featuredTitle').textContent = v.title;
    document.getElementById('featuredDescription').textContent = v.description;
    document.getElementById('featuredCategory').textContent = v.category;
    document.getElementById('featuredFileSize').textContent = v.fileSize || '-';

    const kwList = document.getElementById('featuredKeywords');
    kwList.innerHTML = '';
    (v.keywords || []).slice(0, 8).forEach(kw => {
        const span = document.createElement('span');
        span.className = 'keyword-badge';
        span.textContent = kw;
        kwList.appendChild(span);
    });
}

function renderSelectedForYou() {
    const section = document.getElementById('selectedSection');
    if (!section) return;

    // Only show on page 1
    if (state.currentPage !== 1) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    const grid = document.getElementById('selectedGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    // Show 10 random items from all vectors
    const randomItems = state.allVectors.sort(() => Math.random() - 0.5).slice(0, 10);
    
    randomItems.forEach(v => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        item.innerHTML = `<img src="${v.thumbnail}" alt="${v.title}" onerror="this.src='https://placehold.co/150x120/1a1a1a/666666?text=Preview'">`;
        item.onclick = () => selectFeatured(v);
        grid.appendChild(item);
    });
}

function renderKeywords() {
    const list = document.getElementById('keywordsList');
    if (!list) return;

    list.innerHTML = '';
    
    // Get all unique keywords from all vectors
    const allKeywords = new Set();
    state.allVectors.forEach(v => {
        (v.keywords || []).forEach(kw => allKeywords.add(kw));
    });

    // Show first 20 keywords
    Array.from(allKeywords).slice(0, 20).forEach(kw => {
        const btn = document.createElement('button');
        btn.className = 'keyword-btn';
        btn.textContent = kw;
        btn.onclick = (e) => {
            e.preventDefault();
            document.getElementById('searchInput').value = kw;
            state.searchQuery = kw;
            state.currentPage = 1;
            fetchVectors();
        };
        list.appendChild(btn);
    });
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (state.allVectors.length === 0) {
        grid.innerHTML = '<div class="no-results">No vectors found matching your criteria.</div>';
        return;
    }

    state.allVectors.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="vector-image-container">
                <img src="${v.thumbnail}" alt="${v.title}" class="vector-image" onerror="this.src='https://placehold.co/150x120/1a1a1a/666666?text=Preview'">
            </div>
            <div class="vector-info">
                <div class="vector-title">${v.title}</div>
                <div class="vector-keywords">${(v.keywords || []).slice(0, 2).join(', ')}</div>
            </div>
        `;
        card.onclick = () => openDownloadModal(v);
        grid.appendChild(card);
    });
}

function selectFeatured(vector) {
    state.featured = vector;
    renderFeatured();
    // Scroll to featured section
    document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
}

function updatePagination() {
    const pageNumber = document.getElementById('pageNumber');
    if (pageNumber) pageNumber.textContent = state.currentPage;
}

function updateCategoryTitle() {
    const title = document.getElementById('categoryTitle');
    if (!title) return;
    
    const catName = state.selectedCategory === 'all' ? 'All' : state.selectedCategory;
    title.textContent = `Free ${catName} Vector, SVG, EPS & JPEG Downloads`;
}

// --- DOWNLOAD MODAL ---
function openDownloadModal(vector) {
    const modal = document.getElementById('downloadModal');
    document.getElementById('downloadModalImage').src = vector.thumbnail;
    document.getElementById('downloadModalTitle').textContent = vector.title;
    document.getElementById('downloadModalCategory').textContent = vector.category;
    document.getElementById('downloadModalFileSize').textContent = vector.fileSize || '-';
    
    modal.style.display = 'flex';
    
    // Start countdown
    let countdown = 4;
    const countdownEl = document.getElementById('countdownNumber');
    countdownEl.textContent = countdown;
    
    const interval = setInterval(() => {
        countdown--;
        countdownEl.textContent = countdown;
        
        if (countdown < 0) {
            clearInterval(interval);
            modal.style.display = 'none';
            // Start download
            window.location.href = `/api/download?slug=${vector.name}`;
        }
    }, 1000);
}

// --- INFO MODALS ---
function openInfoModal(modalType) {
    const modal = document.getElementById('infoModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = state.modalContents[modalType] || '';
    modal.style.display = 'flex';
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Arama
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.oninput = (e) => {
            state.searchQuery = e.target.value;
            state.currentPage = 1;
            clearTimeout(window.searchTimer);
            window.searchTimer = setTimeout(fetchVectors, 300);
        };
    }

    // Sayfalama
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.onclick = () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            fetchVectors();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (nextBtn) nextBtn.onclick = () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            fetchVectors();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Download button (featured section)
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            if (state.featured) openDownloadModal(state.featured);
        };
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.onclick = (e) => {
            e.target.closest('.modal').style.display = 'none';
        };
    });

    // Modal background click to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    });

    // Footer modal links
    document.querySelectorAll('.modal-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const modalType = link.dataset.modal;
            openInfoModal(modalType);
        };
    });

    // Logo yenileme
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.onclick = (e) => {
            e.preventDefault();
            window.location.reload();
        };
    }
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', init);
