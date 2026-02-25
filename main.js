// FREVECTOR - DYNAMIC WORKER LOADER
const state = {
    allVectors: [],
    selectedCategory: 'Food'
};

async function init() {
    try {
        // BURASI KRİTİK: Veriyi GitHub'dan değil, az önce bağladığın KV'den çeker.
        const response = await fetch('/api/vectors'); 
        const data = await response.json();
        state.allVectors = data.vectors || [];
        render();
    } catch (e) {
        console.error("Yükleme başarısız:", e);
    }
    setupCategories();
}

function render() {
    const grid = document.getElementById('vectorsGrid');
    if(!grid) return;
    grid.innerHTML = '';

    const filtered = state.allVectors.filter(v => v.category === state.selectedCategory);

    filtered.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        // R2'ye bağladığımız görselleri burada ekranda canlandırır.
        card.innerHTML = `
            <img src="${v.thumbnail}" onerror="this.src='https://via.placeholder.com/300x200?text=Gorsel+Yuklenemedi'">
            <div class="vector-info"><div class="vector-title">${v.title}</div></div>
        `;
        grid.appendChild(card);
    });
}

function setupCategories() {
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.selectedCategory = link.dataset.category;
            render();
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
