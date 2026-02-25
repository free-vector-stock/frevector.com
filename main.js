// ===========================
// FREVECTOR - FINAL STABLE JS
// ===========================

const CONFIG = {
    itemsPerPage: 20,
    // ÖNEMLİ: URL'yi dinamik yaparak dosya yolunu garantiye alıyoruz
    apiBaseUrl: window.location.origin, 
    animationInterval: 5000, 
};

const state = {
    currentPage: 1,
    selectedCategory: null,
    searchQuery: '',
    allVectors: [],
    filteredVectors: [],
    currentCountdown: 3,
};

const elements = {
    logo: document.querySelector('.logo'),
    categoryLinks: document.querySelectorAll('.category-link'),
    vectorsGrid: document.getElementById('vectorsGrid'),
    categoryTitle: document.getElementById('categoryTitle'),
    pageNumber: document.getElementById('pageNumber'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    downloadModal: document.getElementById('downloadModal'),
    loaderSpinner: document.getElementById('loaderSpinner'),
};

document.addEventListener('DOMContentLoaded', () => {
    loadVectors();
    initializeEvents();
});

async function loadVectors() {
    try {
        if(elements.loaderSpinner) elements.loaderSpinner.style.display = 'flex';
        
        // Cache temizliği için timestamp ekliyoruz
        const response = await fetch(`${CONFIG.apiBaseUrl}/data.json?v=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Data file not found');
        
        const data = await response.json();
        state.allVectors = data.vectors || [];
        state.filteredVectors = [...state.allVectors];

        if (state.allVectors.length > 0) {
            selectCategory('Food'); // Varsayılan kategori
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        if(elements.vectorsGrid) {
            elements.vectorsGrid.innerHTML = `<div style="color:red; text-align:center; grid-column:1/-1;">Error: Please check data.json file.</div>`;
        }
    } finally {
        if(elements.loaderSpinner) elements.loaderSpinner.style.display = 'none';
    }
}

function selectCategory(category) {
    state.selectedCategory = category;
    state.currentPage = 1;
    
    elements.categoryLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === category);
    });

    if(elements.categoryTitle) {
        elements.categoryTitle.textContent = `Free ${category} Vector, SVG, EPS & JPEG Downloads`;
    }
    
    filterAndDisplay();
}

function filterAndDisplay() {
    let filtered = state.allVectors;
    if (state.selectedCategory) {
        filtered = filtered.filter(v => v.category === state.selectedCategory);
    }

    state.filteredVectors = filtered;
    renderGrid();
}

function renderGrid() {
    if(!elements.vectorsGrid) return;
    elements.vectorsGrid.innerHTML = '';
    
    const start = (state.currentPage - 1) * CONFIG.itemsPerPage;
    const items = state.filteredVectors.slice(start, start + CONFIG.itemsPerPage);

    items.forEach(vector => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <img src="${vector.thumbnail}" alt="${vector.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="vector-info">
                <div class="vector-title">${vector.title}</div>
            </div>
        `;
        card.onclick = () => openModal(vector);
        elements.vectorsGrid.appendChild(card);
    });
    
    updateUI();
}

function updateUI() {
    if(elements.pageNumber) elements.pageNumber.textContent = state.currentPage;
    if(elements.prevBtn) elements.prevBtn.disabled = state.currentPage === 1;
    if(elements.nextBtn) {
        const max = Math.ceil(state.filteredVectors.length / CONFIG.itemsPerPage);
        elements.nextBtn.disabled = state.currentPage >= max;
    }
}

function initializeEvents() {
    elements.prevBtn?.addEventListener('click', () => { state.currentPage--; renderGrid(); window.scrollTo(0,0); });
    elements.nextBtn?.addEventListener('click', () => { state.currentPage++; renderGrid(); window.scrollTo(0,0); });
    
    elements.categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            selectCategory(link.dataset.category);
        });
    });
}

// Modal fonksiyonlarını basitleştirilmiş şekilde buraya ekleyebilirsiniz...
