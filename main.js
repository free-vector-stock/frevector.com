// ===========================
// FREVECTOR - ABSOLUTE STABLE JAVASCRIPT
// ===========================

const CONFIG = {
    itemsPerPage: 20,
    // Önbellek sorunlarını aşmak için versiyon ekliyoruz
    cacheVersion: Date.now() 
};

const state = {
    allVectors: [],
    filteredVectors: [],
    currentPage: 1,
    selectedCategory: 'Food'
};

const elements = {
    vectorsGrid: document.getElementById('vectorsGrid'),
    categoryTitle: document.getElementById('categoryTitle'),
    loader: document.getElementById('loaderSpinner'),
    categoryLinks: document.querySelectorAll('.category-link')
};

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    // 1. ADIM: Veriyi birkaç farklı yoldan çekmeyi deniyoruz
    const dataLoaded = await tryLoadData();
    
    if (dataLoaded) {
        setupEventListeners();
        render();
    } else {
        showError("Data file (data.json) not found. Please check your GitHub repository root.");
    }
}

async function tryLoadData() {
    // Denenecek yollar
    const paths = [
        './data.json',
        'data.json',
        window.location.origin + '/data.json'
    ];

    for (let path of paths) {
        try {
            console.log("Checking path:", path);
            const response = await fetch(`${path}?v=${CONFIG.cacheVersion}`);
            if (response.ok) {
                const data = await response.json();
                state.allVectors = data.vectors || [];
                state.filteredVectors = [...state.allVectors];
                return true;
            }
        } catch (e) {
            console.warn("Failed to load from:", path);
        }
    }
    return false;
}

function render() {
    if (!elements.vectorsGrid) return;
    elements.vectorsGrid.innerHTML = '';
    
    // Kategoriye göre filtrele
    const filtered = state.allVectors.filter(v => v.category === state.selectedCategory);
    
    if (filtered.length === 0) {
        elements.vectorsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center;">No items in ${state.selectedCategory}</div>`;
        return;
    }

    filtered.forEach(vector => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <img src="${vector.thumbnail}" alt="${vector.title}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Image+Load+Error'">
            <div class="vector-info">
                <div class="vector-title">${vector.title}</div>
            </div>
        `;
        // Tıklama olayı modalı açar
        card.onclick = () => window.openDownloadModal ? window.openDownloadModal(vector) : null;
        elements.vectorsGrid.appendChild(card);
    });

    if (elements.categoryTitle) {
        elements.categoryTitle.textContent = `Free ${state.selectedCategory} Vector, SVG, EPS & JPEG Downloads`;
    }
}

function setupEventListeners() {
    elements.categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.selectedCategory = link.dataset.category;
            // Aktif sınıfını güncelle
            elements.categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            render();
        });
    });
}

function showError(msg) {
    if (elements.vectorsGrid) {
        elements.vectorsGrid.innerHTML = `<div style="grid-column:1/-1; color:red; text-align:center; padding:50px;">${msg}</div>`;
    }
}
