const EXTRA_KEYWORDS = ["frevector", "free vector", "vector stock", "free download", "graphic design", "illustration", "vector art", "design resources", "free icons", "logo design"];
const MODAL_CONTENTS = {
    about: {
        title: 'About Us',
        content: `
            <h2 style="margin-bottom:16px;">About Us</h2>
            <p style="margin-bottom:12px;">Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
            <p style="margin-bottom:12px;">The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process.</p>
            <p style="margin-bottom:12px;">Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p>
            <p style="margin-bottom:12px;">Frevector.com includes the following content:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Vector illustrations</li>
                <li>Icon sets</li>
                <li>Logo design elements</li>
                <li>Graphic elements</li>
                <li>Various design resources</li>
            </ul>
            <p style="margin-bottom:12px;">All files can be used in both personal and commercial projects.</p>
            <p style="margin-bottom:12px;"><strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package.</p>
            <p>Frevector is a platform that values labor, original production, and an ethical approach to design.</p>
        `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `
            <h2 style="margin-bottom:16px;">Privacy Policy</h2>
            <p style="margin-bottom:12px;">As Frevector.com, we prioritize user privacy. This policy explains what data may be collected and how it may be used when you visit the site.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Data Collected</h3>
            <p style="margin-bottom:8px;">When you visit the site, certain anonymous data may be collected automatically. This data does not directly identify you.</p>
            <p style="margin-bottom:8px;">Collected data may include:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Cookies</li>
                <li>Browser and device information</li>
                <li>IP address (for anonymous analytical purposes)</li>
                <li>Page visit and interaction data</li>
                <li>Analytical usage information</li>
            </ul>
            <h3 style="margin-bottom:8px;margin-top:16px;">2. Purposes of Data Use</h3>
            <p style="margin-bottom:8px;">The collected data may be used for the following purposes:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Improving site performance</li>
                <li>Enhancing user experience</li>
                <li>Detecting technical issues</li>
                <li>Ensuring security</li>
                <li>Supporting the content development process</li>
            </ul>
            <h3 style="margin-bottom:8px;margin-top:16px;">3. Personal Data</h3>
            <p style="margin-bottom:12px;">Personal data (name, email, etc.) is only processed when voluntarily shared by the user—for example, via emails sent for communication purposes. Frevector does not sell user data to third parties or share it for commercial purposes.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">4. Cookie Policy</h3>
            <p style="margin-bottom:12px;">Cookies may be used on the site to support site functions, remember user preferences, and measure performance. Users can limit or disable the use of cookies through their browser settings.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">5. Data Security</h3>
            <p>Necessary technical and administrative measures are taken to protect data. However, it cannot be guaranteed that data transmission over the internet is completely secure.</p>
        `
    },
    terms: {
        title: 'Terms of Service',
        content: `
            <h2 style="margin-bottom:16px;">Terms of Service</h2>
            <p style="margin-bottom:12px;">Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Content Ownership</h3>
            <p style="margin-bottom:12px;">All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">2. Right of Use</h3>
            <p style="margin-bottom:12px;">Downloaded files can be used in personal and commercial projects. The user may edit the files for their own projects and incorporate them into their work.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">3. Prohibited Uses</h3>
            <p style="margin-bottom:8px;">The following actions are prohibited:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Redistributing files</li>
                <li>Uploading to other sites</li>
                <li>Selling files digitally or physically</li>
                <li>Sharing as an archive, package, or collection</li>
                <li>Presenting Frevector content as a resource on other platforms</li>
            </ul>
            <h3 style="margin-bottom:8px;margin-top:16px;">4. Liability</h3>
            <p style="margin-bottom:12px;">Frevector cannot be held responsible for any direct or indirect damages arising from the use of the content. Technical malfunctions or temporary access issues may occur on the platform from time to time.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">5. Right to Change</h3>
            <p style="margin-bottom:16px;">Frevector reserves the right to update the terms of service and site content as necessary.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <h3 style="margin-bottom:8px;">License Description</h3>
            <p style="margin-bottom:8px;">All designs on Frevector are original works prepared by Frevector artists.</p>
            <p style="margin-bottom:8px;"><strong>Usage Permission:</strong></p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Can be used in personal projects</li>
                <li>Can be used in commercial projects</li>
                <li>Can be edited and integrated into projects</li>
            </ul>
            <p style="margin-bottom:8px;"><strong>Prohibitions:</strong></p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Redistributing files</li>
                <li>Uploading to other platforms</li>
                <li>Selling files</li>
                <li>Presenting as a resource on other sites</li>
            </ul>
        `
    },
    contact: {
        title: 'Contact',
        content: `
            <h2 style="margin-bottom:16px;">Contact</h2>
            <p style="margin-bottom:12px;">If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p>
            <p style="margin-bottom:16px;"><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000;text-decoration:underline;">hakankacar2014@gmail.com</a></p>
            <p style="margin-bottom:16px;">Frevector prioritizes clear and transparent communication with its users.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <h3 style="margin-bottom:8px;">Copyright Notice</h3>
            <p style="margin-bottom:12px;">Frevector values original production and respects copyrights. The content on the site has been prepared by Frevector artists. Nevertheless, if you believe that any content infringes your copyright, please contact us.</p>
            <p style="margin-bottom:8px;">The notification must include the following:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Identification of the copyrighted work</li>
                <li>Information to contact you (email, address)</li>
                <li>A statement that the use is unauthorized</li>
            </ul>
        `
    }
};

let state = {
    vectors: [],
    allVectors: [],
    searchQuery: '',
    currentPage: 1,
    totalPages: 1,
    pageSize: 18,
    countdownInterval: null
};

async function init() {
    await fetchVectors();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    
    // URL Hash change listener
    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();
}

function handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (MODAL_CONTENTS[hash]) {
        showModal(hash);
    } else if (!hash) {
        closeModal();
    }
}

async function fetchVectors() {
    showLoader(true);
    try {
        const response = await fetch('https://vector-assets.frevector.com/vectors.json');
        const data = await response.json();
        state.allVectors = data;
        applyFilters();
    } catch (error) {
        console.error('Error fetching vectors:', error);
    } finally {
        showLoader(false);
    }
}

function applyFilters() {
    let filtered = state.allVectors;
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(v => 
            v.name.toLowerCase().includes(q) || 
            (v.keywords && v.keywords.some(k => k.toLowerCase().includes(q)))
        );
    }
    
    const sortVal = document.getElementById('sortFilter')?.value || 'newest';
    if (sortVal === 'newest') {
        filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortVal === 'oldest') {
        filtered.sort((a, b) => (a.id || 0) - (b.id || 0));
    }

    state.totalPages = Math.ceil(filtered.length / state.pageSize);
    const start = (state.currentPage - 1) * state.pageSize;
    state.vectors = filtered.slice(start, start + state.pageSize);
    
    renderVectors();
    updatePagination();
}

function renderVectors() {
    const grid = document.getElementById('vectorGrid');
    if (!grid) return;
    grid.innerHTML = state.vectors.map(v => `
        <div class="vector-card" onclick="openDownloadPage('${v.name}')">
            <div class="vector-img-container">
                <img src="https://vector-assets.frevector.com/previews/${v.name}.jpg" alt="${v.name}" loading="lazy">
            </div>
            <div class="vector-info">
                <h3 class="vector-title">${v.name.replace(/-/g, ' ')}</h3>
            </div>
        </div>
    `).join('');
}

function openDownloadPage(slug) {
    const v = state.allVectors.find(item => item.name === slug);
    if (!v) return;

    const dp = document.getElementById('downloadPage');
    document.getElementById('dpImage').src = `https://vector-assets.frevector.com/previews/${v.name}.jpg`;
    document.getElementById('dpTitle').textContent = v.name.replace(/-/g, ' ');
    document.getElementById('dpDescription').textContent = v.description || 'Vector';
    const displayCategory = v.category || 'Belirtilmemiş';
    
    document.getElementById('dpCategory').textContent = displayCategory;
    document.getElementById('dpFileSize').textContent = v.fileSize || 'N/A';
    
    // Update file format in download page
    const dpFormatCell = document.getElementById('dpFileFormat');
    if (dpFormatCell) dpFormatCell.textContent = v.isJpegOnly ? 'JPEG' : 'EPS, SVG, JPEG';

    const kwBox = document.getElementById('dpKeywords');
    const keywords = [...new Set([...EXTRA_KEYWORDS, ...(v.keywords || [])])];
    kwBox.innerHTML = keywords.map(kw => `<span class="kw-tag">${escHtml(kw)}</span>`).join('');

    const btn = document.getElementById('dpDownloadBtn');
    const countBox = document.getElementById('dpCountdownBox');
    const countNum = document.getElementById('dpCountdown');
    
    btn.style.display = 'block';
    countBox.style.display = 'none';
    
    btn.onclick = () => {
        btn.style.display = 'none';
        countBox.style.display = 'block';
        let count = 4;
        countNum.textContent = count;
        state.countdownInterval = setInterval(() => {
            count--;
            countNum.textContent = count;
            if (count <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
            }
        }, 1000);
    };

    dp.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function setupDownloadPageHandlers() {
    const dpClose = document.getElementById('dpClose');
    if (dpClose) {
        dpClose.onclick = () => {
            document.getElementById('downloadPage').style.display = 'none';
            document.body.style.overflow = '';
            clearInterval(state.countdownInterval);
        };
    }
}

function showModal(modalId) {
    const content = MODAL_CONTENTS[modalId];
    if (!content) return;
    document.getElementById('infoModalBody').innerHTML = content.content;
    document.getElementById('infoModal').style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('infoModal');
    if (modal) {
        modal.style.display = 'none';
        if (window.location.hash) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const modalId = btn.dataset.modal;
            window.location.hash = modalId;
        };
    });

    const infoModalClose = document.getElementById('infoModalClose');
    if (infoModalClose) {
        infoModalClose.onclick = () => {
            closeModal();
        };
    }

    const infoModal = document.getElementById('infoModal');
    if (infoModal) {
        infoModal.onclick = (e) => {
            if (e.target === infoModal) {
                closeModal();
            }
        };
    }
}

function setupEventListeners() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.onkeydown = (e) => { if (e.key === 'Enter') { state.searchQuery = input.value; state.currentPage = 1; fetchVectors(); } };
    }
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        const triggerSearch = () => { 
            state.searchQuery = input.value; 
            state.currentPage = 1; 
            fetchVectors(); 
        };
        searchBtn.onclick = triggerSearch;
        searchBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerSearch();
        }, { passive: false });
    }
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.onchange = () => { 
            state.currentPage = 1; 
            fetchVectors(); 
        };
    }
    
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    }
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
    }
}

function updatePagination() {
    const pageNumber = document.getElementById('pageNumber');
    if (pageNumber) pageNumber.textContent = state.currentPage;
    const pageTotal = document.getElementById('pageTotal');
    if (pageTotal) pageTotal.textContent = `/ ${state.totalPages}`;
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
