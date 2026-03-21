/**
 * frevector.com - Frontend Logic
 * v2026031401 - Revisions: active category state, mobile layout, category spacing
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
            <p style="margin-bottom:12px;">The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists.</p>
            <p>Frevector is a platform that values labor, original production, and an ethical approach to design.</p>
        `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `<h2 style="margin-bottom:16px;">Privacy Policy</h2><p>As Frevector.com, we prioritize user privacy...</p>`
    },
    terms: {
        title: 'Terms of Service',
        content: `<h2 style="margin-bottom:16px;">Terms of Service</h2><p>Every visitor using Frevector.com is deemed to have accepted the following terms...</p>`
    },
    contact: {
        title: 'Contact',
        content: `<h2 style="margin-bottom:16px;">Contact</h2><p>Email: <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>`
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
    ourPicksOffset: 0
};

async function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    setupOurPicksArrows();
    await fetchVectors();
}

// --- KATEGORİ VE TİP KURULUMU (.active sınıfı eklendi) ---
function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    const isMobile = window.innerWidth <= 768;

    // TİP BÖLÜMÜ (Desktop)
    if (!isMobile) {
        const typeContainer = document.createElement('div');
        typeContainer.style.padding = '0 16px 8px';
        typeContainer.style.marginBottom = '8px';
        typeContainer.style.borderBottom = '1px solid #ddd';
        
        const typeLabel = document.createElement('div');
        typeLabel.style.fontSize = '10px';
        typeLabel.style.fontWeight = '600';
        typeLabel.style.color = '#666';
        typeLabel.style.marginBottom = '4px';
        typeLabel.textContent = 'TYPE';
        typeContainer.appendChild(typeLabel);
        
        // Tipler için döngü
        ['all', 'vector', 'jpeg'].forEach(t => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'category-item' + (state.selectedType === t ? ' active' : '');
            a.textContent = t.charAt(0).toUpperCase() + t.slice(1);
            a.onclick = (e) => { e.preventDefault(); selectType(t); };
            typeContainer.appendChild(a);
        });
        list.appendChild(typeContainer);
    }

    // ALL CATEGORIES LİNKİ
    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = 'category-item' + (state.selectedCategory === 'all' ? ' active' : '');
    allLink.textContent = 'All Categories';
    allLink.onclick = (e) => { e.preventDefault(); selectCategory('all'); };
    list.appendChild(allLink);

    // ANA KATEGORİ DÖNGÜSÜ
    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        // Seçili olana .active sınıfı ekleniyor
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.textContent = cat;
        a.onclick = (e) => { 
            e.preventDefault(); 
            selectCategory(cat); 
        };
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
    setupCategories(); // Listeyi yenileyip active sınıfını günceller
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
    setupCategories(); // Listeyi yenileyip active sınıfını günceller
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    el.textContent = state.selectedCategory === 'all' 
        ? 'Free Vectors, SVGs, Icons and Clipart' 
        : `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);
    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url
