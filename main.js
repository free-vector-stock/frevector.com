// ===========================
// FREVECTOR - SMART DATA LOADER
// ===========================

const CONFIG = {
    itemsPerPage: 20,
    animationInterval: 5000, 
};

const state = {
    currentPage: 1,
    selectedCategory: null,
    allVectors: [],
    filteredVectors: [],
};

const elements = {
    categoryLinks: document.querySelectorAll('.category-link'),
    vectorsGrid: document.getElementById('vectorsGrid'),
    categoryTitle: document.getElementById('categoryTitle'),
    loaderSpinner: document.getElementById('loaderSpinner'),
};

document.addEventListener('DOMContentLoaded', () => {
    loadVectors();
    initializeBasicEvents();
});

async function loadVectors() {
    // Denenecek yollar: Önce kök dizin, sonra göreceli dizin
    const paths = ['./data.json', '/data.json', 'data.json'];
    let success = false;

    if(elements.loaderSpinner) elements.loaderSpinner.style.display = 'flex';

    for (let path of paths) {
        try {
            console.log(`Trying to load: ${path}`);
            const response = await fetch(`${path}?v=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                state.allVectors = data.vectors || [];
                state.filteredVectors = [...state.allVectors];
                success = true;
                console.log("Data loaded successfully from:", path);
                break;
            }
        } catch (e) {
            console.error(`Path ${path} failed:`, e);
        }
    }

    if (success && state.allVectors.length > 0) {
        selectCategory('Food');
    } else {
        displayError("Data file (data.json) could not be found or is empty.");
    }

    if(elements.loaderSpinner) elements.loaderSpinner.style.display = 'none';
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
    
    filterAndRender();
}

function filterAndRender() {
    let filtered = state.allVectors;
    if (state.selectedCategory) {
        filtered = filtered.filter(v => v.category === state.selectedCategory);
    }
    state.filteredVectors = filtered;
    
    if(!elements.vectorsGrid) return;
    elements.vectorsGrid.innerHTML = '';
    
    state.filteredVectors.forEach(vector => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <img src="${vector.thumbnail}" alt="${vector.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'">
            <div class="vector-info"><div class="vector-title">${vector.title}</div></div>
        `;
        elements.vectorsGrid.appendChild(card);
    });
}

function displayError(msg) {
    if(elements.vectorsGrid) {
        elements.vectorsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:red; padding:50px;">${msg}</div>`;
    }
}

function initializeBasicEvents() {
    elements.categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            selectCategory(link.dataset.category);
        });
    });
}
