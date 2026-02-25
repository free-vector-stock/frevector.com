// ===========================
// FREVECTOR - MAIN JAVASCRIPT (FIXED)
// ===========================

// Configuration
const CONFIG = {
    itemsPerPage: 20,
    // Siten artık frevector.com üzerinde olduğu için yolu doğrudan data.json'a veriyoruz
    apiBaseUrl: window.location.origin, 
    animationInterval: 5000, 
};

// State Management
const state = {
    currentPage: 1,
    selectedCategory: null,
    searchQuery: '',
    dateFilter: 'all',
    allVectors: [],
    filteredVectors: [],
    currentCountdown: 3,
    countdownInterval: null,
};

// DOM Elements
const elements = {
    logo: document.querySelector('.logo'),
    categoryLinks: document.querySelectorAll('.category-link'),
    searchInput: document.getElementById('searchInput'),
    dateFilter: document.getElementById('dateFilter'),
    vectorsGrid: document.getElementById('vectorsGrid'),
    categoryTitle: document.getElementById('categoryTitle'),
    pageNumber: document.getElementById('pageNumber'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    downloadModal: document.getElementById('downloadModal'),
    modalClose: document.querySelector('.modal-close'),
    downloadButton: document.getElementById('downloadButton'),
    countdownNumber: document.getElementById('countdownNumber'),
    countdownDisplay: document.getElementById('countdownDisplay'),
    loaderSpinner: document.getElementById('loaderSpinner'),
};

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadVectors();
    startBannerAnimation();
});

// ===========================
// EVENT LISTENERS
// ===========================

function initializeEventListeners() {
    if(elements.logo) {
        elements.logo.addEventListener('click', (e) => {
            e.preventDefault();
            location.reload();
        });
    }

    elements.categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            selectCategory(category);
        });
    });

    if(elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase();
            state.currentPage = 1;
            filterAndDisplayVectors();
        });
    }

    if(elements.dateFilter) {
        elements.dateFilter.addEventListener('change', (e) => {
            state.dateFilter = e.target.value;
            state.currentPage = 1;
            filterAndDisplayVectors();
        });
    }

    elements.prevBtn?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            displayVectors();
            updatePagination();
            window.scrollTo(0, 0);
        }
    });

    elements.nextBtn?.addEventListener('click', () => {
        const maxPage = Math.ceil(state.filteredVectors.length / CONFIG.itemsPerPage);
        if (state.currentPage < maxPage) {
            state.currentPage++;
            displayVectors();
            updatePagination();
            window.scrollTo(0, 0);
        }
    });

    elements.modalClose?.addEventListener('click', closeDownloadModal);
    elements.downloadModal?.addEventListener('click', (e) => {
        if (e.target === elements.downloadModal) {
            closeDownloadModal();
        }
    });

    elements.downloadButton?.addEventListener('click', () => triggerDownload(state.currentVector));
}

// ===========================
// LOAD VECTORS FROM DATA.JSON
// ===========================

async function loadVectors() {
    try {
        showLoader(true);
        
        // Verileri GitHub deponuzdaki data.json dosyasından çekiyoruz
        const response = await fetch(`${CONFIG.apiBaseUrl}/data.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        state.allVectors = data.vectors || [];
        state.filteredVectors = [...state.allVectors];
        
        // Eğer veri varsa göster
        if (state.allVectors.length > 0) {
            // Varsayılan olarak Food kategorisini veya ilk kategoriyi seç
            const defaultCat = state.allVectors.find(v => v.category === 'Food') ? 'Food' : state.allVectors[0].category;
            selectCategory(defaultCat);
        } else {
            displayErrorMessage('No vectors found in data.json');
        }
        
        showLoader(false);
    } catch (error) {
        console.error('Error loading vectors:', error);
        showLoader(false);
        displayErrorMessage('Failed to load vectors. Check if data.json exists.');
    }
}

// ===========================
// CATEGORY SELECTION & FILTERING
// ===========================

function selectCategory(category) {
    state.selectedCategory = category;
    state.currentPage = 1;
    
    elements.categoryLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === category);
    });

    updateCategoryTitle(category);
    filterAndDisplayVectors();
}

function updateCategoryTitle(category) {
    if(elements.categoryTitle) {
        elements.categoryTitle.textContent = `Free ${category} Vector, SVG, EPS & JPEG Downloads`;
    }
}

function filterAndDisplayVectors() {
    let filtered = state.allVectors;

    if (state.selectedCategory) {
        filtered = filtered.filter(v => v.category === state.selectedCategory);
    }

    if (state.searchQuery) {
        filtered = filtered.filter(v => 
            v.keywords.some(kw => kw.toLowerCase().includes(state.searchQuery)) ||
            v.title.toLowerCase().includes(state.searchQuery)
        );
    }

    state.filteredVectors = filtered;
    displayVectors();
    updatePagination();
}

function displayVectors() {
    const startIndex = (state.currentPage - 1) * CONFIG.itemsPerPage;
    const paginated = state.filteredVectors.slice(startIndex, startIndex + CONFIG.itemsPerPage);

    elements.vectorsGrid.innerHTML = '';

    if (paginated.length === 0) {
        elements.vectorsGrid.innerHTML = '<div class="no-results">No vectors found.</div>';
        return;
    }

    paginated.forEach(vector => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <img src="${vector.thumbnail}" alt="${vector.title}" class="vector-image" loading="lazy">
            <div class="vector-info">
                <div class="vector-title">${vector.title}</div>
            </div>
        `;
        card.addEventListener('click', () => openDownloadModal(vector));
        elements.vectorsGrid.appendChild(card);
    });
}

// ===========================
// DOWNLOAD MODAL
// ===========================

function openDownloadModal(vector) {
    state.currentVector = vector;
    document.getElementById('modalImage').src = vector.thumbnail;
    document.getElementById('modalTitle').textContent = vector.title;
    document.getElementById('modalCategory').textContent = vector.category;
    
    // Modal Keywords
    const keywordsContainer = document.getElementById('modalKeywords');
    keywordsContainer.innerHTML = vector.keywords.map(kw => `<span class="keyword-badge">${kw}</span>`).join('');

    // Reset countdown
    state.currentCountdown = 3;
    elements.countdownNumber.textContent = state.currentCountdown;
    elements.downloadButton.style.display = 'none';
    elements.countdownDisplay.style.display = 'block';

    if (state.countdownInterval) clearInterval(state.countdownInterval);
    
    state.countdownInterval = setInterval(() => {
        state.currentCountdown--;
        elements.countdownNumber.textContent = state.currentCountdown;
        if (state.currentCountdown <= 0) {
            clearInterval(state.countdownInterval);
            elements.downloadButton.style.display = 'block';
            elements.countdownDisplay.style.display = 'none';
        }
    }, 1000);

    elements.downloadModal.style.display = 'flex';
}

function closeDownloadModal() {
    elements.downloadModal.style.display = 'none';
    if (state.countdownInterval) clearInterval(state.countdownInterval);
}

function triggerDownload(vector) {
    const link = document.createElement('a');
    link.href = vector.zipFile;
    link.download = `${vector.title.replace(/\s+/g, '-').toLowerCase()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===========================
// HELPERS
// ===========================

function updatePagination() {
    const maxPage = Math.ceil(state.filteredVectors.length / CONFIG.itemsPerPage);
    if(elements.pageNumber) elements.pageNumber.textContent = state.currentPage;
    if(elements.prevBtn) elements.prevBtn.disabled = state.currentPage === 1;
    if(elements.nextBtn) elements.nextBtn.disabled = state.currentPage >= maxPage;
}

function startBannerAnimation() {
    const texts = document.querySelectorAll('.animated-text');
    if(texts.length === 0) return;
    let idx = 0;
    setInterval(() => {
        texts.forEach(t => t.classList.remove('active'));
        texts[idx].classList.add('active');
        idx = (idx + 1) % texts.length;
    }, CONFIG.animationInterval);
}

function showLoader(show) {
    if(elements.loaderSpinner) elements.loaderSpinner.style.display = show ? 'flex' : 'none';
}

function displayErrorMessage(msg) {
    elements.vectorsGrid.innerHTML = `<div class="error-msg">${msg}</div>`;
}
