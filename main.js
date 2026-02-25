// ==========================================
// FREVECTOR - ZERO-FAILURE EMBEDDED ENGINE
// ==========================================

// VERİ TABANINI DOĞRUDAN KODA GÖMÜYORUZ (Kesin Çözüm)
const VECTOR_DATABASE = {
    "vectors": [
        {
            "id": "food-1",
            "title": "Delicious Burger Vector",
            "category": "Food",
            "thumbnail": "https://raw.githubusercontent.com/free-vector-stock/frevector.com/main/thumbnails/food/burger.jpg",
            "downloadUrl": "https://example.com/download/burger",
            "keywords": ["burger", "fast food", "meat"]
        },
        {
            "id": "abstract-1",
            "title": "Modern Abstract Shapes",
            "category": "Abstract",
            "thumbnail": "https://raw.githubusercontent.com/free-vector-stock/frevector.com/main/thumbnails/abstract/shapes.jpg",
            "downloadUrl": "https://example.com/download/shapes",
            "keywords": ["abstract", "modern", "shapes"]
        }
        // NOT: Buraya data.json dosandaki tüm listeyi [{}, {}] şeklinde yapıştırabilirsin.
    ]
};

const state = {
    allVectors: VECTOR_DATABASE.vectors,
    selectedCategory: 'Food', // Varsayılan açılış kategorisi
    currentPage: 1,
    itemsPerPage: 20
};

const elements = {
    grid: document.getElementById('vectorsGrid'),
    title: document.getElementById('categoryTitle'),
    links: document.querySelectorAll('.category-link'),
    loader: document.getElementById('loaderSpinner')
};

// Sayfa yüklendiğinde çalışacak ana fonksiyon
function initSite() {
    console.log("System Initialized with " + state.allVectors.length + " items.");
    if(elements.loader) elements.loader.style.display = 'none';
    
    setupCategoryMenu();
    renderGallery();
}

function renderGallery() {
    if (!elements.grid) return;
    elements.grid.innerHTML = '';
    
    // Filtreleme: Sadece seçili kategoriyi göster
    const filtered = state.allVectors.filter(v => v.category === state.selectedCategory);
    
    if (filtered.length === 0) {
        elements.grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">No items found in ${state.selectedCategory}</div>`;
        return;
    }

    filtered.forEach(vector => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.innerHTML = `
            <div class="vector-card-inner">
                <img src="${vector.thumbnail}" alt="${vector.title}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
                <div class="vector-info">
                    <div class="vector-title">${vector.title}</div>
                </div>
            </div>
        `;
        card.onclick = () => alert('Download Modal will open for: ' + vector.title);
        elements.grid.appendChild(card);
    });

    if (elements.title) elements.title.textContent = `Free ${state.selectedCategory} Vectors`;
}

function setupCategoryMenu() {
    elements.links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.selectedCategory = link.dataset.category;
            
            // UI Güncelleme
            elements.links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            renderGallery();
        });
    });
}

// Start
document.addEventListener('DOMContentLoaded', initSite);
