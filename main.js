/**
 * frevector.com - Frontend Core Logic
 */

const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

// Footer içerikleri - Tam ve Eksiksiz
const MODAL_CONTENTS = {
    about: { 
        title: 'ABOUT US', 
        content: `<h2>ABOUT US</h2>
        <p>Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
        <p>The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process.</p>
        <p>Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p>
        <p>Frevector.com includes the following content:</p>
        <ul>
            <li>Vector illustrations</li>
            <li>Icon sets</li>
            <li>Logo design elements</li>
            <li>Graphic elements</li>
            <li>Various design resources</li>
        </ul>
        <p>All files can be used in both personal and commercial projects.</p>
        <p><strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package.</p>` 
    },
    privacy: { 
        title: 'PRIVACY POLICY', 
        content: `<h2>PRIVACY POLICY</h2>
        <p>As Frevector.com, we prioritize the privacy and security of our visitors. This policy explains the types of information we collect and how we use it.</p>
        <p><strong>1. Log Files:</strong> Frevector follows a standard procedure of using log files. These files log visitors when they visit websites.</p>
        <p><strong>2. Cookies:</strong> Like any other website, Frevector uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited.</p>
        <p><strong>3. Third Party Privacy Policies:</strong> Frevector's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.</p>` 
    },
    terms: { 
        title: 'TERMS OF SERVICE', 
        content: `<h2>TERMS OF SERVICE</h2>
        <p>By accessing Frevector.com, you agree to comply with these terms of service and all applicable laws and regulations.</p>
        <p><strong>License Usage:</strong> All resources on Frevector are free to use for personal and commercial projects. However, you cannot claim ownership of the files or sell them as your own.</p>
        <p><strong>Prohibited Actions:</strong> You may not redistribute the files on other platforms, sell them, or include them in bulk download packages.</p>` 
    },
    contact: { 
        title: 'CONTACT', 
        content: `<h2>CONTACT</h2>
        <p>If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p>
        <p><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a></p>
        <p>Frevector prioritizes clear and transparent communication with its users. We aim to respond to all inquiries as quickly as possible.</p>` 
    }
};

let state = {
    vectors: [],
    filteredVectors: [],
    currentPage: 1,
    itemsPerPage: 12,
    totalPages: 1,
    currentCategory: null,
    searchQuery: '',
    sortOrder: '',
    countdownInterval: null
};

// Mock Data - Gerçek verileriniz burada yükleniyor varsayılır
function generateMockData() {
    const data = [];
    for(let i=1; i<=48; i++) {
        data.push({
            id: i,
            title: `Creative Design ${i}`,
            category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            keywords: ['vector', 'design', 'art', 'graphic', 'free'],
            image: `https://picsum.photos/seed/${i+100}/600/600`,
            format: i % 2 === 0 ? 'EPS, SVG, JPEG' : 'JPEG',
            size: '2.4 MB',
            date: new Date(2026, 0, i).toISOString()
        });
    }
    return data;
}

function init() {
    state.vectors = generateMockData();
    renderCategories();
    fetchVectors();
    setupEventListeners();
}

function renderCategories() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = `<div class="category-item ${!state.currentCategory ? 'category-active' : ''}" onclick="filterCategory(null)">All Categories</div>`;
    CATEGORIES.forEach(cat => {
        const item = document.createElement('div');
        item.className = `category-item ${state.currentCategory === cat ? 'category-active' : ''}`;
        item.textContent = cat;
        item.onclick = () => filterCategory(cat);
        list.appendChild(item);
    });
}

function filterCategory(cat) {
    state.currentCategory = cat;
    state.currentPage = 1;
    renderCategories();
    fetchVectors();
}

function fetchVectors() {
    showLoader(true);
    
    // Filtreleme mantığı (Budanmadı)
    let result = [...state.vectors];

    if(state.currentCategory) {
        result = result.filter(v => v.category === state.currentCategory);
    }

    if(state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        result = result.filter(v => 
            v.title.toLowerCase().includes(q) || 
            v.keywords.some(k => k.toLowerCase().includes(q))
        );
    }

    if(state.sortOrder === 'newest') {
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if(state.sortOrder === 'oldest') {
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    state.filteredVectors = result;
    state.totalPages = Math.ceil(result.length / state.itemsPerPage);
    
    renderGrid();
    updatePagination();
    showLoader(false);
}

function renderGrid() {
    const grid = document.getElementById('vectorsGrid');
    grid.innerHTML = '';
    
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const pageItems = state.filteredVectors.slice(start, end);

    pageItems.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        card.onclick = () => openDownloadPage(v);
        card.innerHTML = `
            <div class="vc-img-wrap">
                <img src="${v.image}" alt="${v.title}" loading="lazy">
            </div>
            <div class="vc-info">
                <div class="vc-title">${v.title}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = v.image;
    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpCategory').textContent = v.category;
    document.getElementById('dpFileFormat').textContent = v.format;
    document.getElementById('dpFileSize').textContent = v.size || '1.8 MB';
    
    const kwDiv = document.getElementById('dpKeywords');
    kwDiv.innerHTML = v.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('');
    
    // Reset Download Area
    document.getElementById('dpDownloadBtn').style.display = 'block';
    document.getElementById('dpCountdownBox').style.display = 'none';
    
    dp.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    document.getElementById('dpDownloadBtn').onclick = () => startDownload();
}

function startDownload() {
    const btn = document.getElementById('dpDownloadBtn');
    const box = document.getElementById('dpCountdownBox');
    const num = document.getElementById('dpCountdown');
    
    btn.style.display = 'none';
    box.style.display = 'block';
    
    let count = 4;
    num.textContent = count;
    
    state.countdownInterval = setInterval(() => {
        count--;
        num.textContent = count;
        if(count <= 0) {
            clearInterval(state.countdownInterval);
            alert("Your download has started automatically.");
            // window.location.href = "file_url_here";
        }
    }, 1000);
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        state.currentPage = 1;
        fetchVectors();
    });

    document.getElementById('sortFilter').addEventListener('change', (e) => {
        state.sortOrder = e.target.value;
        fetchVectors();
    });

    document.getElementById('prevBtn').onclick = () => {
        if(state.currentPage > 1) {
            state.currentPage--;
            fetchVectors();
        }
    };

    document.getElementById('nextBtn').onclick = () => {
        if(state.currentPage < state.totalPages) {
            state.currentPage++;
            fetchVectors();
        }
    };

    document.getElementById('dpClose').onclick = () => {
        document.getElementById('downloadPage').style.display = 'none';
        document.body.style.overflow = 'auto';
        if(state.countdownInterval) clearInterval(state.countdownInterval);
    };

    document.getElementById('infoModalClose').onclick = () => {
        document.getElementById('infoModal').style.display = 'none';
    };
}

function showInfo(type) {
    const modal = document.getElementById('infoModal');
    const body = document.getElementById('infoModalBody');
    const content = MODAL_CONTENTS[type];
    
    body.innerHTML = content.content;
    modal.style.display = 'flex';
}

function updatePagination() {
    document.getElementById('pageNumber').textContent = state.currentPage;
    document.getElementById('pageTotal').textContent = `/ ${state.totalPages || 1}`;
    document.getElementById('prevBtn').disabled = state.currentPage === 1;
    document.getElementById('nextBtn').disabled = state.currentPage === state.totalPages || state.totalPages === 0;
}

function showLoader(s) {
    document.getElementById('loader').style.display = s ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', init);
