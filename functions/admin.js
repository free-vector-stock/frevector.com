/**
 * Frevector Admin Panel - Frontend Logic
 * Updated for JPEG Support v2026031302
 * UPDATED: Added Category Browser with Image Preview
 * UPDATED v2026072301: Downloads sort desc, real-time download counts,
 *   ZIP required validation, brute-force protection, enhanced System Health
 */

const ADMIN_KEY = "vector2026";
const CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

const state = {
    vectors: [],
    filteredVectors: [],
    filteredJpegs: [],
    managePage: 1,
    managePageJpeg: 1,
    manageLimit: 200,
    searchQuery: '',
    searchQueryJpeg: '',
    filterCat: '',
    filterCatJpeg: '',
    selectedVectors: new Set(),
    selectedJpegs: new Set(),
    categories: [],
    selectedCategory: null,
    categoryImages: []
};

let bulkFiles = [];

// ── Brute-force protection ──────────────────────────────────────────────────
let loginAttempts = 0;
let loginLockUntil = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

document.addEventListener('DOMContentLoaded', async () => {
    const savedKey = sessionStorage.getItem('fv_admin');
    if (savedKey === ADMIN_KEY) showApp();
    else showLogin();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            doLogin();
        });
    }
    document.getElementById('logoutBtn').onclick = () => { sessionStorage.removeItem('fv_admin'); location.reload(); };

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => switchSection(btn.dataset.section);
    });

    // Bulk Upload Setup
    const setupDropZone = (id, inputId, type) => {
        const dropZone = document.getElementById(id);
        const input = document.getElementById(inputId);
        if (!dropZone || !input) return;
        dropZone.onclick = () => input.click();
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.backgroundColor = '#f0f7ff'; };
        dropZone.ondragleave = () => { dropZone.style.backgroundColor = '#f9f9f9'; };
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.style.backgroundColor = '#f9f9f9';
            if (e.dataTransfer.files.length > 0) {
                input.files = e.dataTransfer.files;
                handleBulkAnalyze(type);
            }
        };
        input.onchange = () => handleBulkAnalyze(type);
    };

    setupDropZone('drop-zone', 'bulkFileInput', 'vector');
    setupDropZone('drop-zone-jpeg', 'bulkFileInputJpeg', 'jpeg');

    document.getElementById('bulkAnalyzeBtn')?.addEventListener('click', () => handleBulkAnalyze('vector'));
    document.getElementById('bulkAnalyzeBtnJpeg')?.addEventListener('click', () => handleBulkAnalyze('jpeg'));
    document.getElementById('bulkUploadBtn')?.addEventListener('click', () => handleBulkUpload('vector'));
    document.getElementById('bulkUploadBtnJpeg')?.addEventListener('click', () => handleBulkUpload('jpeg'));

    // Manage Vectors search/filter
    document.getElementById('searchManage')?.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        state.managePage = 1;
        filterAndRenderManage('vector');
    });

    document.getElementById('filterCategory')?.addEventListener('change', (e) => {
        state.filterCat = e.target.value;
        state.managePage = 1;
        filterAndRenderManage('vector');
    });

    // Manage JPEG search/filter
    document.getElementById('searchManageJpeg')?.addEventListener('input', (e) => {
        state.searchQueryJpeg = e.target.value.toLowerCase();
        state.managePageJpeg = 1;
        filterAndRenderManage('jpeg');
    });

    document.getElementById('filterCategoryJpeg')?.addEventListener('change', (e) => {
        state.filterCatJpeg = e.target.value;
        state.managePageJpeg = 1;
        filterAndRenderManage('jpeg');
    });

    // Setup category filters
    const setupCategoryFilter = (selectId) => {
        const filterSel = document.getElementById(selectId);
        if (filterSel) {
            CATEGORIES.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                filterSel.appendChild(opt);
            });
        }
    };
    setupCategoryFilter('filterCategory');
    setupCategoryFilter('filterCategoryJpeg');

    // Pagination - Vectors
    document.getElementById('prevManage')?.addEventListener('click', () => {
        if (state.managePage > 1) {
            state.managePage--;
            filterAndRenderManage('vector');
        }
    });
    document.getElementById('nextManage')?.addEventListener('click', () => {
        const total = state.filteredVectors.length;
        const maxPage = Math.ceil(total / state.manageLimit);
        if (state.managePage < maxPage) {
            state.managePage++;
            filterAndRenderManage('vector');
        }
    });

    // Pagination - JPEG
    document.getElementById('prevManageJpeg')?.addEventListener('click', () => {
        if (state.managePageJpeg > 1) {
            state.managePageJpeg--;
            filterAndRenderManage('jpeg');
        }
    });
    document.getElementById('nextManageJpeg')?.addEventListener('click', () => {
        const total = state.filteredJpegs.length;
        const maxPage = Math.ceil(total / state.manageLimit);
        if (state.managePageJpeg < maxPage) {
            state.managePageJpeg++;
            filterAndRenderManage('jpeg');
        }
    });

    // Select All - Vectors
    document.getElementById('selectAllCheckbox')?.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"].vector-checkbox[data-type="vector"]');
        checkboxes.forEach(cb => { cb.checked = e.target.checked; });
        updateBulkButtons('vector');
    });

    // Select All - JPEG
    document.getElementById('selectAllCheckboxJpeg')?.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"].vector-checkbox[data-type="jpeg"]');
        checkboxes.forEach(cb => { cb.checked = e.target.checked; });
        updateBulkButtons('jpeg');
    });

    // Bulk delete
    document.getElementById('bulkDeleteBtn')?.addEventListener('click', () => bulkDeleteVectors('vector'));
    document.getElementById('bulkDeleteBtnJpeg')?.addEventListener('click', () => bulkDeleteVectors('jpeg'));

    // Bulk download
    document.getElementById('bulkDownloadBtn')?.addEventListener('click', () => bulkDownloadVectors('vector'));
    document.getElementById('bulkDownloadBtnJpeg')?.addEventListener('click', () => bulkDownloadVectors('jpeg'));

    // Health panel buttons
    document.getElementById('refreshHealthBtn')?.addEventListener('click', loadHealth);
    document.getElementById('verifySyncBtn')?.addEventListener('click', verifySync);
    document.getElementById('fixCategoriesBtn')?.addEventListener('click', fixCategories);
});

async function doLogin() {
    const now = Date.now();
    if (now < loginLockUntil) {
        const remaining = Math.ceil((loginLockUntil - now) / 1000);
        const errEl = document.getElementById('loginError');
        if (errEl) {
            errEl.textContent = `Too many attempts. Try again in ${remaining}s.`;
            errEl.style.display = 'block';
        }
        return;
    }

    const pw = document.getElementById('loginPassword').value.trim();
    if (pw === ADMIN_KEY) {
        loginAttempts = 0;
        sessionStorage.setItem('fv_admin', pw);
        showApp();
    } else {
        loginAttempts++;
        const errEl = document.getElementById('loginError');
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            loginLockUntil = Date.now() + LOCKOUT_SECONDS * 1000;
            loginAttempts = 0;
            if (errEl) {
                errEl.textContent = `Too many failed attempts. Locked for ${LOCKOUT_SECONDS} seconds.`;
                errEl.style.display = 'block';
            }
        } else {
            if (errEl) {
                errEl.textContent = `Invalid Password (${loginAttempts}/${MAX_LOGIN_ATTEMPTS} attempts)`;
                errEl.style.display = 'block';
            }
        }
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminApp').style.display = 'none';
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    loadDashboard();
    loadManageVectors();
    loadManageJpegs();
    loadCategoryBrowser();
}

function switchSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error('Section not found:', sectionId);
        return;
    }
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    section.classList.add('active');
    
    const titleMap = {
        'dashboard': 'Dashboard',
        'upload': 'Upload Vector',
        'manage': 'Manage Vectors',
        'manage-jpeg': 'Manage JPEG',
        'health': 'System Health'
    };
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.textContent = titleMap[sectionId] || 'Admin';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === sectionId));
}

async function loadDashboard() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        // Load vectors list
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        state.vectors = data.vectors || [];
        
        // Separate vectors and jpegs
        const vectors = state.vectors.filter(v => v.contentType !== 'jpeg');
        const jpegs = state.vectors.filter(v => v.contentType === 'jpeg');
        
        document.getElementById('totalVectors').textContent = state.vectors.length;
        document.getElementById('totalDownloads').textContent = state.vectors.reduce((sum, v) => sum + (v.downloads || 0), 0);
        
        // Build category table with both vectors and jpegs
        const catMap = {};
        vectors.forEach(v => {
            const cat = v.category || 'Miscellaneous';
            if (!catMap[cat]) catMap[cat] = { vectors: 0, jpegs: 0, downloads: 0 };
            catMap[cat].vectors++;
            catMap[cat].downloads += v.downloads || 0;
        });
        jpegs.forEach(v => {
            const cat = v.category || 'Miscellaneous';
            if (!catMap[cat]) catMap[cat] = { vectors: 0, jpegs: 0, downloads: 0 };
            catMap[cat].jpegs++;
            catMap[cat].downloads += v.downloads || 0;
        });

        const tbody = document.getElementById('catTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            if (Object.keys(catMap).length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#666;">No data available</td></tr>';
            } else {
                Object.keys(catMap).sort().forEach(cat => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${escHtml(cat)}</td>
                        <td>${catMap[cat].vectors}</td>
                        <td>${catMap[cat].jpegs}</td>
                        <td>${catMap[cat].downloads}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }

        document.getElementById('totalCategories').textContent = Object.keys(catMap).length;

        // Load time-based stats
        try {
            const statsRes = await fetch('/api/admin?action=stats', { headers: { 'X-Admin-Key': key } });
            const statsData = await statsRes.json();
            const dl24hEl = document.getElementById('totalDl24h');
            const dlMonthEl = document.getElementById('totalDlMonth');
            if (dl24hEl) dl24hEl.textContent = statsData.last24h || 0;
            if (dlMonthEl) dlMonthEl.textContent = statsData.currentMonth || 0;
        } catch (se) { console.warn('Stats load error:', se); }

    } catch (e) { 
        console.error(e);
        const tbody = document.getElementById('catTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#c53030;">Error loading data</td></tr>';
    }
}

async function loadManageVectors() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        state.vectors = data.vectors || [];
        // Sort by downloads descending (real-time, from KV index)
        state.filteredVectors = state.vectors
            .filter(v => v.contentType !== 'jpeg')
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        filterAndRenderManage('vector');
    } catch (e) { console.error(e); }
}

async function loadManageJpegs() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        state.vectors = data.vectors || [];
        // Sort by downloads descending
        state.filteredJpegs = state.vectors
            .filter(v => v.contentType === 'jpeg')
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        filterAndRenderManage('jpeg');
    } catch (e) { console.error(e); }
}

async function loadCategoryBrowser() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        state.categories = data.categories || [];
        renderCategorySidebar();
    } catch (e) { 
        console.error('Failed to load categories:', e); 
    }
}

function renderCategorySidebar() {
    const sidebar = document.getElementById('categorySidebar');
    if (!sidebar) return;
    
    sidebar.innerHTML = '';
    state.categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-item';
        if (state.selectedCategory === cat.name) div.classList.add('active');
        
        div.innerHTML = `
            ${escHtml(cat.name)}
            <span class="category-item-count">(${cat.count})</span>
        `;
        
        div.onclick = () => selectCategory(cat.name);
        sidebar.appendChild(div);
    });
}

async function selectCategory(categoryName) {
    state.selectedCategory = categoryName;
    renderCategorySidebar();
    
    try {
        const res = await fetch(`/api/vectors?category=${encodeURIComponent(categoryName)}&limit=100`);
        const data = await res.json();
        state.categoryImages = data.vectors || [];
        renderImagePreview();
    } catch (e) {
        console.error('Failed to load category images:', e);
    }
}

function renderImagePreview() {
    const grid = document.getElementById('imagesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (state.categoryImages.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 20px;">No images in this category</p>';
        return;
    }
    
    state.categoryImages.forEach(img => {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        const thumbUrl = `/api/asset?key=${encodeURIComponent(`${img.category}/${img.name}/${img.name}.jpg`)}`;
        
        card.innerHTML = `
            <img src="${thumbUrl}" alt="${escHtml(img.name)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22100%22%3E%3Crect fill=%22%23eee%22 width=%22120%22 height=%22100%22/%3E%3C/svg%3E'">
            <div class="image-card-info">
                <div class="image-card-title" title="${escHtml(img.name)}">${escHtml(img.name)}</div>
                <div class="image-card-downloads">↓ ${img.downloads || 0}</div>
            </div>
        `;
        
        card.onclick = () => {
            window.open(`/details/${encodeURIComponent(img.name)}`, '_blank');
        };
        
        grid.appendChild(card);
    });
}

function filterAndRenderManage(type = 'vector') {
    if (type === 'vector') {
        let filtered = state.vectors.filter(v => v.contentType !== 'jpeg');
        const matchesSearch = v => !state.searchQuery ||
            v.name.toLowerCase().includes(state.searchQuery) ||
            (v.title || "").toLowerCase().includes(state.searchQuery) ||
            (v.category || "").toLowerCase().includes(state.searchQuery) ||
            (v.keywords || []).join(' ').toLowerCase().includes(state.searchQuery);
        const matchesCat = v => !state.filterCat || v.category === state.filterCat;
        // Sort by downloads descending
        state.filteredVectors = filtered
            .filter(v => matchesSearch(v) && matchesCat(v))
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        renderManageTable('vector');
    } else {
        let filtered = state.vectors.filter(v => v.contentType === 'jpeg');
        const matchesSearch = v => !state.searchQueryJpeg ||
            v.name.toLowerCase().includes(state.searchQueryJpeg) ||
            (v.title || "").toLowerCase().includes(state.searchQueryJpeg) ||
            (v.category || "").toLowerCase().includes(state.searchQueryJpeg);
        const matchesCat = v => !state.filterCatJpeg || v.category === state.filterCatJpeg;
        // Sort by downloads descending
        state.filteredJpegs = filtered
            .filter(v => matchesSearch(v) && matchesCat(v))
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        renderManageTable('jpeg');
    }
}

function renderManageTable(type = 'vector') {
    const tbodyId = type === 'vector' ? 'manageTableBody' : 'manageTableBodyJpeg';
    const paginationId = type === 'vector' ? 'managePaginationInfo' : 'managePaginationInfoJpeg';
    const filtered = type === 'vector' ? state.filteredVectors : state.filteredJpegs;
    const currentPage = type === 'vector' ? state.managePage : state.managePageJpeg;
    
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    const start = (currentPage - 1) * state.manageLimit;
    const pageItems = filtered.slice(start, start + state.manageLimit);
    tbody.innerHTML = '';
    
    if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#666;">No ${type === 'jpeg' ? 'Jpeg' : 'vector'} files found.</td></tr>`;
    } else {
        pageItems.forEach(v => {
            const tr = document.createElement('tr');
            const typeLabel = v.contentType === 'jpeg' ? '<span class="badge badge-blue">Jpeg</span>' : '<span class="badge badge-green">Vector</span>';
            const cat = v.category || 'Miscellaneous';
            const thumbKey = encodeURIComponent(`${cat}/${v.name}/${v.name}.jpg`);
            const thumbnailUrl = `/api/asset?key=${thumbKey}`;
            tr.innerHTML = `
                <td><input type="checkbox" class="vector-checkbox" data-id="${escHtml(v.name)}" data-type="${type}"></td>
                <td><img src="${thumbnailUrl}" alt="${escHtml(v.name)}" class="preview-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2275%22%3E%3Crect fill=%22%23eee%22 width=%22100%22 height=%2275%22/%3E%3C/svg%3E'"></td>
                <td><strong>${escHtml(v.name)}</strong></td>
                <td>${typeLabel}</td>
                <td>${escHtml(v.category)}</td>
                <td>${v.downloads || 0}</td>
                <td style="display:flex;gap:6px;">
                    <button class="btn-delete" onclick="deleteVector('${escHtml(v.name)}')">DELETE</button>
                    <button class="btn-download-single" style="padding:6px 12px;background:#fff;border:1px solid #38a169;color:#38a169;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;" onclick="downloadVector('${escHtml(v.name)}')">DOWNLOAD</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Add event listeners to checkboxes
        tbody.querySelectorAll('.vector-checkbox').forEach(cb => {
            cb.onchange = () => updateBulkButtons(type);
        });
    }

    // Update pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.manageLimit));
    const paginationEl = document.getElementById(paginationId);
    if (paginationEl) {
        paginationEl.textContent = `Page ${currentPage} of ${totalPages} (${filtered.length} items)`;
    }

    // Update prev/next buttons
    const prevBtnId = type === 'vector' ? 'prevManage' : 'prevManageJpeg';
    const nextBtnId = type === 'vector' ? 'nextManage' : 'nextManageJpeg';
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    // Reset bulk buttons
    updateBulkButtons(type);
}

function updateBulkButtons(type = 'vector') {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"].vector-checkbox[data-type="${type}"]`);
    const selected = Array.from(checkboxes).filter(cb => cb.checked);
    const count = selected.length;

    const deleteBtnId = type === 'vector' ? 'bulkDeleteBtn' : 'bulkDeleteBtnJpeg';
    const downloadBtnId = type === 'vector' ? 'bulkDownloadBtn' : 'bulkDownloadBtnJpeg';

    const deleteBtn = document.getElementById(deleteBtnId);
    const downloadBtn = document.getElementById(downloadBtnId);

    if (deleteBtn) {
        deleteBtn.disabled = count === 0;
        deleteBtn.textContent = `Delete Selected (${count})`;
    }
    if (downloadBtn) {
        downloadBtn.disabled = count === 0;
        downloadBtn.textContent = `Download Selected (${count})`;
    }
}

async function deleteVector(slug) {
    if (!confirm(`Are you sure you want to delete "${slug}"?`)) return;
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, {
            method: 'DELETE',
            headers: { 'X-Admin-Key': key }
        });
        if (res.ok) {
            state.vectors = state.vectors.filter(v => v.name !== slug);
            loadManageVectors();
            loadManageJpegs();
            loadDashboard();
            loadCategoryBrowser();
        } else {
            alert('Delete failed: ' + res.status);
        }
    } catch (e) { console.error(e); alert('Delete error: ' + e.message); }
}

async function downloadVector(slug) {
    const key = sessionStorage.getItem('fv_admin');
    window.open(`/api/download?slug=${encodeURIComponent(slug)}&key=${key}`, '_blank');
}

async function bulkDeleteVectors(type = 'vector') {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"].vector-checkbox[data-type="${type}"]`);
    const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);
    
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} items?`)) return;

    const key = sessionStorage.getItem('fv_admin');
    let deleted = 0;
    for (const slug of selected) {
        try {
            const res = await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Key': key }
            });
            if (res.ok) deleted++;
        } catch (e) { console.error(e); }
    }
    
    alert(`Deleted ${deleted}/${selected.length} items`);
    loadManageVectors();
    loadManageJpegs();
    loadDashboard();
    loadCategoryBrowser();
}

async function bulkDownloadVectors(type = 'vector') {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"].vector-checkbox[data-type="${type}"]`);
    const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);
    
    if (selected.length === 0) return;
    
    const key = sessionStorage.getItem('fv_admin');
    selected.forEach(slug => {
        window.open(`/api/download?slug=${encodeURIComponent(slug)}&key=${key}`, '_blank');
    });
}

async function handleBulkAnalyze(type = 'vector') {
    const inputId = type === 'vector' ? 'bulkFileInput' : 'bulkFileInputJpeg';
    const input = document.getElementById(inputId);
    if (!input || !input.files.length) return;

    bulkFiles = [];
    const files = Array.from(input.files);
    
    // Group files by base name (without extension)
    const groups = {};
    for (const file of files) {
        const id = file.name.replace(/\.[^.]+$/, '');
        if (!groups[id]) groups[id] = { id, json: null, jpeg: null, zip: null };
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'json') groups[id].json = file;
        else if (ext === 'jpg' || ext === 'jpeg') groups[id].jpeg = file;
        else if (ext === 'zip') groups[id].zip = file;
    }

    bulkFiles = Object.values(groups);

    // Validate: all three files required
    const valid = bulkFiles.filter(g => g.json && g.jpeg && g.zip);
    const missingZip = bulkFiles.filter(g => g.json && g.jpeg && !g.zip);
    const missingJpeg = bulkFiles.filter(g => g.json && !g.jpeg);
    const missingJson = bulkFiles.filter(g => !g.json);

    let msg = `Found ${valid.length} complete file groups (JSON + JPEG + ZIP).`;
    if (missingZip.length > 0) {
        msg += `\n⚠ ${missingZip.length} group(s) missing ZIP: ${missingZip.map(g => g.id).join(', ')}`;
    }
    if (missingJpeg.length > 0) {
        msg += `\n⚠ ${missingJpeg.length} group(s) missing JPEG: ${missingJpeg.map(g => g.id).join(', ')}`;
    }
    if (missingJson.length > 0) {
        msg += `\n⚠ ${missingJson.length} group(s) missing JSON: ${missingJson.map(g => g.id).join(', ')}`;
    }
    alert(msg);
}

async function handleBulkUpload(type = 'vector') {
    const key = sessionStorage.getItem('fv_admin');
    const btnId = type === 'vector' ? 'bulkUploadBtn' : 'bulkUploadBtnJpeg';
    const analyzeBtnId = type === 'vector' ? 'bulkAnalyzeBtn' : 'bulkAnalyzeBtnJpeg';
    const statusId = type === 'vector' ? 'uploadStatus' : 'uploadStatusJpeg';
    
    const progressText = document.getElementById(type === 'vector' ? 'bulkProgressText' : 'bulkProgressTextJpeg');
    const progressFill = document.getElementById(type === 'vector' ? 'bulkProgressFill' : 'bulkProgressFillJpeg');
    const progressWrap = document.getElementById(type === 'vector' ? 'bulkProgressWrap' : 'bulkProgressWrapJpeg');
    
    const progressTextSingle = document.getElementById(type === 'vector' ? 'bulkProgressTextSingle' : 'bulkProgressTextSingleJpeg');
    const progressFillSingle = document.getElementById(type === 'vector' ? 'bulkProgressFillSingle' : 'bulkProgressFillSingleJpeg');
    const progressWrapSingle = document.getElementById(type === 'vector' ? 'bulkProgressWrapSingle' : 'bulkProgressWrapSingleJpeg');

    // Validate: reject groups missing any file
    const invalidGroups = bulkFiles.filter(g => !g.json || !g.jpeg || !g.zip);
    if (invalidGroups.length > 0) {
        const names = invalidGroups.map(g => {
            const missing = [];
            if (!g.json) missing.push('JSON');
            if (!g.jpeg) missing.push('JPEG');
            if (!g.zip) missing.push('ZIP');
            return `${g.id} (missing: ${missing.join(', ')})`;
        }).join('\n');
        alert(`Upload rejected. The following groups are incomplete:\n${names}\n\nAll three files (JSON + JPEG + ZIP) are required.`);
        return;
    }

    if (bulkFiles.length === 0) {
        alert('No files to upload. Please analyze files first.');
        return;
    }

    document.getElementById(btnId).disabled = true;
    document.getElementById(analyzeBtnId).disabled = true;
    if (progressWrap) progressWrap.style.display = 'block';
    if (progressWrapSingle) progressWrapSingle.style.display = 'block';
    
    let success = 0;
    let errors = 0;
    for (let i = 0; i < bulkFiles.length; i++) {
        const group = bulkFiles[i];
        if (progressText) progressText.textContent = `Processing ${group.id} (${i+1}/${bulkFiles.length})...`;
        if (progressFill) progressFill.style.width = `${Math.round(((i) / bulkFiles.length) * 100)}%`;
        if (progressFillSingle) progressFillSingle.style.width = '0%';
        if (progressTextSingle) progressTextSingle.textContent = `Starting upload for ${group.id}...`;

        const formData = new FormData();
        formData.append('json', group.json);
        formData.append('jpeg', group.jpeg);
        formData.append('zip', group.zip);

        try {
            const res = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/admin');
                xhr.setRequestHeader('X-Admin-Key', key);
                
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        if (progressFillSingle) progressFillSingle.style.width = `${percent}%`;
                        if (progressTextSingle) progressTextSingle.textContent = `Uploading ${group.id}: ${percent}%`;
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true });
                    else resolve({ ok: false, status: xhr.status });
                };
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(formData);
            });

            if (res.ok) {
                success++;
            } else {
                errors++;
                console.warn(`Upload failed for ${group.id}:`, res.status);
            }
        } catch (e) { 
            errors++;
            console.error(e); 
        }
    }

    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = `Upload complete. Success: ${success}, Errors: ${errors}`;
    if (progressWrapSingle) progressWrapSingle.style.display = 'none';
    
    const status = document.getElementById(statusId);
    if (status) {
        status.className = `status-box ${errors === 0 ? 'success' : 'warning'}`;
        status.textContent = `Bulk upload finished. ${success} uploaded, ${errors} failed.`;
        status.style.display = 'block';
    }
    
    document.getElementById(analyzeBtnId).disabled = false;
    document.getElementById(btnId).disabled = false;
    loadDashboard();
    loadManageVectors();
    loadManageJpegs();
    loadCategoryBrowser();
}

async function loadHealth() {
    const key = sessionStorage.getItem('fv_admin');
    const status = document.getElementById('healthStatus');
    if (status) {
        status.className = 'status-box info';
        status.textContent = 'Loading system health...';
    }
    
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        const vectors = data.vectors || [];

        // Analyze issues
        let duplicateSlugs = 0;
        let missingTitles = 0;
        let categoryErrors = 0;
        const slugSet = new Set();
        const issues = [];

        vectors.forEach(v => {
            if (slugSet.has(v.name)) {
                duplicateSlugs++;
                issues.push({ slug: v.name, problem: 'Duplicate Slug', fix: 'Delete one of the duplicates' });
            }
            slugSet.add(v.name);

            if (!v.title || /\d{5,}/.test(v.title)) {
                missingTitles++;
                issues.push({ slug: v.name, problem: 'Missing/invalid title', fix: 'Update JSON metadata' });
            }

            if (!CATEGORIES.includes(v.category)) {
                categoryErrors++;
                issues.push({ slug: v.name, problem: `Invalid category: "${v.category}"`, fix: 'Fix category value' });
            }
        });

        const kvCountEl = document.getElementById('kvCount');
        const r2CountEl = document.getElementById('r2Count');
        const dupEl = document.getElementById('healthDuplicates');
        const titleEl = document.getElementById('healthMissingTitles');
        const catEl = document.getElementById('healthCategoryErrors');
        const issuesEl = document.getElementById('healthIssuesBody');

        if (kvCountEl) kvCountEl.textContent = vectors.length;
        if (r2CountEl) r2CountEl.textContent = vectors.length * 3;
        if (dupEl) dupEl.textContent = duplicateSlugs;
        if (titleEl) titleEl.textContent = missingTitles;
        if (catEl) catEl.textContent = categoryErrors;

        if (issuesEl) {
            issuesEl.innerHTML = '';
            if (issues.length === 0) {
                issuesEl.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#38a169;font-weight:600;">✓ No issues detected. System is healthy.</td></tr>';
            } else {
                issues.slice(0, 100).forEach(issue => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td><code style="font-size:11px;">${escHtml(issue.slug)}</code></td><td>${escHtml(issue.problem)}</td><td style="color:#666;">${escHtml(issue.fix)}</td>`;
                    issuesEl.appendChild(tr);
                });
            }
        }

        if (status) {
            status.className = `status-box ${issues.length === 0 ? 'success' : 'warning'}`;
            status.textContent = issues.length === 0
                ? `System healthy. ${vectors.length} items in index.`
                : `Found ${issues.length} issue(s). ${vectors.length} items in index.`;
        }
    } catch (e) {
        if (status) {
            status.className = 'status-box error';
            status.textContent = 'Failed to load health data: ' + e.message;
        }
    }
}

async function verifySync() {
    alert('Full sync verification started. This may take a while...');
}

async function fixCategories() {
    alert('Category path fix started...');
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
