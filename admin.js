/**
 * Frevector Admin Panel - Frontend Logic
 * Updated for JPEG Support
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
    jpegFiles: [],
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
    selectedJpegs: new Set()
};

let bulkFiles = [];

document.addEventListener('DOMContentLoaded', async () => {
    const savedKey = sessionStorage.getItem('fv_admin');
    if (savedKey === ADMIN_KEY) showApp();
    else showLogin();

    document.getElementById('loginBtn').onclick = doLogin;
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

    // Manage Vectors
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

    // Manage JPEG
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

    // Pagination
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

    // Bulk delete
    document.getElementById('bulkDeleteBtn')?.addEventListener('click', () => bulkDeleteVectors('vector'));
    document.getElementById('bulkDeleteBtnJpeg')?.addEventListener('click', () => bulkDeleteVectors('jpeg'));
});

async function doLogin() {
    const pw = document.getElementById('loginPassword').value.trim();
    if (pw === ADMIN_KEY) {
        sessionStorage.setItem('fv_admin', pw);
        showApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
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
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        state.vectors = data.vectors || [];
        
        // Separate vectors and jpegs
        const vectors = state.vectors.filter(v => v.contentType !== 'jpeg');
        const jpegs = state.vectors.filter(v => v.contentType === 'jpeg');
        
        document.getElementById('totalVectors').textContent = state.vectors.length;
        document.getElementById('totalDownloads').textContent = state.vectors.reduce((sum, v) => sum + (v.downloads || 0), 0);
        
        // Build category table
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

        document.getElementById('totalCategories').textContent = Object.keys(catMap).length;
    } catch (e) { console.error(e); }
}

async function loadManageVectors() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.filteredVectors = state.vectors.filter(v => v.contentType !== 'jpeg');
        filterAndRenderManage('vector');
    } catch (e) { console.error(e); }
}

async function loadManageJpegs() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.filteredJpegs = state.vectors.filter(v => v.contentType === 'jpeg');
        filterAndRenderManage('jpeg');
    } catch (e) { console.error(e); }
}

function filterAndRenderManage(type = 'vector') {
    if (type === 'vector') {
        let filtered = state.vectors.filter(v => v.contentType !== 'jpeg');
        const matchesSearch = v => v.name.toLowerCase().includes(state.searchQuery) || (v.title || "").toLowerCase().includes(state.searchQuery);
        const matchesCat = v => !state.filterCat || v.category === state.filterCat;
        state.filteredVectors = filtered.filter(v => matchesSearch(v) && matchesCat(v));
        renderManageTable('vector');
    } else {
        let filtered = state.vectors.filter(v => v.contentType === 'jpeg');
        const matchesSearch = v => v.name.toLowerCase().includes(state.searchQueryJpeg) || (v.title || "").toLowerCase().includes(state.searchQueryJpeg);
        const matchesCat = v => !state.filterCatJpeg || v.category === state.filterCatJpeg;
        state.filteredJpegs = filtered.filter(v => matchesSearch(v) && matchesCat(v));
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
    
    pageItems.forEach(v => {
        const tr = document.createElement('tr');
        const typeLabel = v.contentType === 'jpeg' ? '<span class="badge badge-blue">JPEG</span>' : '<span class="badge badge-green">VECTOR</span>';
        tr.innerHTML = `
            <td><input type="checkbox" class="vector-checkbox" data-id="${v.name}" data-type="${type}"></td>
            <td><strong>${escHtml(v.name)}</strong></td>
            <td>${typeLabel}</td>
            <td>${escHtml(v.category)}</td>
            <td>${v.downloads || 0}</td>
            <td><button class="btn-delete" onclick="deleteVector('${v.name}')">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Update pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.manageLimit));
    const paginationEl = document.getElementById(paginationId);
    if (paginationEl) {
        paginationEl.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    // Update prev/next buttons
    const prevBtnId = type === 'vector' ? 'prevManage' : 'prevManageJpeg';
    const nextBtnId = type === 'vector' ? 'nextManage' : 'nextManageJpeg';
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

async function deleteVector(slug) {
    if (!confirm(`Are you sure you want to delete ${slug}?`)) return;
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
        }
    } catch (e) { console.error(e); }
}

async function bulkDeleteVectors(type = 'vector') {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-type="${type}"]`);
    const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);
    
    if (selected.length === 0) {
        alert('No items selected');
        return;
    }

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
    state.vectors = state.vectors.filter(v => !selected.includes(v.name));
    loadManageVectors();
    loadManageJpegs();
    loadDashboard();
}

function handleBulkAnalyze(type = 'vector') {
    const inputId = type === 'vector' ? 'bulkFileInput' : 'bulkFileInputJpeg';
    const input = document.getElementById(inputId);
    if (!input || !input.files.length) return;
    
    const files = Array.from(input.files);
    const groups = {};
    files.forEach(f => {
        const name = f.name;
        const id = name.substring(0, name.lastIndexOf('.'));
        const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
        if (!groups[id]) groups[id] = {};
        if (ext === '.json') groups[id].json = f;
        if (ext === '.jpg' || ext === '.jpeg') groups[id].jpeg = f;
        if (ext === '.zip') groups[id].zip = f;
    });

    bulkFiles = Object.entries(groups).map(([id, g]) => ({ id, ...g }))
        .filter(g => g.json && g.jpeg && (type === 'vector' ? g.zip : true));
    
    const statusId = type === 'vector' ? 'bulkUploadStatus' : 'bulkUploadStatusJpeg';
    const status = document.getElementById(statusId);
    if (status) {
        status.className = 'status-box info';
        status.textContent = `Found ${bulkFiles.length} valid ${type} sets.`;
    }
    const btnId = type === 'vector' ? 'bulkUploadBtn' : 'bulkUploadBtnJpeg';
    document.getElementById(btnId).disabled = bulkFiles.length === 0;
}

async function handleBulkUpload(type = 'vector') {
    const key = sessionStorage.getItem('fv_admin');
    const btnId = type === 'vector' ? 'bulkUploadBtn' : 'bulkUploadBtnJpeg';
    const progressText = document.getElementById(type === 'vector' ? 'bulkProgressText' : 'bulkProgressTextJpeg');
    const progressWrap = document.getElementById(type === 'vector' ? 'bulkProgressWrap' : 'bulkProgressWrapJpeg');

    document.getElementById(btnId).disabled = true;
    if (progressWrap) progressWrap.style.display = 'block';
    
    let success = 0;
    for (let i = 0; i < bulkFiles.length; i++) {
        const group = bulkFiles[i];
        if (progressText) progressText.textContent = `Uploading ${group.id} (${i+1}/${bulkFiles.length})...`;
        const formData = new FormData();
        formData.append('json', group.json);
        formData.append('jpeg', group.jpeg);
        if (group.zip) formData.append('zip', group.zip);

        try {
            const res = await fetch('/api/admin', { method: 'POST', headers: { 'X-Admin-Key': key }, body: formData });
            if (res.ok) success++;
        } catch (e) { console.error(e); }
    }

    if (progressText) progressText.textContent = `Upload complete. Success: ${success}/${bulkFiles.length}`;
    document.getElementById(btnId).disabled = false;
    loadDashboard();
    loadManageVectors();
    loadManageJpegs();
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Cache bust: 1773345262
