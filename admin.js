/**
 * Frevector Admin Panel - Frontend Logic
 * Optimized for Large Bulk Uploads (1000+ files)
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
    selectedJpegs: new Set()
};

let bulkFiles = [];

document.addEventListener('DOMContentLoaded', async () => {
    const savedKey = sessionStorage.getItem('fv_admin');
    if (savedKey === ADMIN_KEY) showApp();
    else showLogin();

    document.getElementById('loginBtn').onclick = doLogin;
    document.getElementById('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
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

    // Manage search/filter
    const setupFilter = (inputId, type) => {
        document.getElementById(inputId)?.addEventListener('input', (e) => {
            if (type === 'vector') state.searchQuery = e.target.value.toLowerCase();
            else state.searchQueryJpeg = e.target.value.toLowerCase();
            state[type === 'vector' ? 'managePage' : 'managePageJpeg'] = 1;
            filterAndRenderManage(type);
        });
    };
    setupFilter('searchManage', 'vector');
    setupFilter('searchManageJpeg', 'jpeg');

    const setupCatFilter = (selectId, type) => {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        CATEGORIES.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', (e) => {
            if (type === 'vector') state.filterCat = e.target.value;
            else state.filterCatJpeg = e.target.value;
            state[type === 'vector' ? 'managePage' : 'managePageJpeg'] = 1;
            filterAndRenderManage(type);
        });
    };
    setupCatFilter('filterCategory', 'vector');
    setupCatFilter('filterCategoryJpeg', 'jpeg');

    // Pagination
    document.getElementById('prevManage')?.addEventListener('click', () => { if (state.managePage > 1) { state.managePage--; filterAndRenderManage('vector'); } });
    document.getElementById('nextManage')?.addEventListener('click', () => {
        if (state.managePage < Math.ceil(state.filteredVectors.length / state.manageLimit)) { state.managePage++; filterAndRenderManage('vector'); }
    });
    document.getElementById('prevManageJpeg')?.addEventListener('click', () => { if (state.managePageJpeg > 1) { state.managePageJpeg--; filterAndRenderManage('jpeg'); } });
    document.getElementById('nextManageJpeg')?.addEventListener('click', () => {
        if (state.managePageJpeg < Math.ceil(state.filteredJpegs.length / state.manageLimit)) { state.managePageJpeg++; filterAndRenderManage('jpeg'); }
    });

    // Select All
    const setupSelectAll = (checkId, type) => {
        document.getElementById(checkId)?.addEventListener('change', (e) => {
            document.querySelectorAll(`input[type="checkbox"].vector-checkbox[data-type="${type}"]`).forEach(cb => { cb.checked = e.target.checked; });
            updateBulkButtons(type);
        });
    };
    setupSelectAll('selectAllCheckbox', 'vector');
    setupSelectAll('selectAllCheckboxJpeg', 'jpeg');

    document.getElementById('bulkDeleteBtn')?.addEventListener('click', () => bulkDeleteVectors('vector'));
    document.getElementById('bulkDeleteBtnJpeg')?.addEventListener('click', () => bulkDeleteVectors('jpeg'));
    document.getElementById('bulkDownloadBtn')?.addEventListener('click', () => bulkDownloadVectors('vector'));
    document.getElementById('bulkDownloadBtnJpeg')?.addEventListener('click', () => bulkDownloadVectors('jpeg'));
    document.getElementById('refreshHealthBtn')?.addEventListener('click', loadHealth);
});

async function doLogin() {
    const pw = document.getElementById('loginPassword').value.trim();
    if (pw === ADMIN_KEY) { sessionStorage.setItem('fv_admin', pw); showApp(); }
    else { document.getElementById('loginError').style.display = 'block'; }
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
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
    const titleMap = { 'dashboard': 'Dashboard', 'upload': 'Upload Vector', 'manage': 'Manage Vectors', 'manage-jpeg': 'Manage JPEG', 'health': 'System Health' };
    document.getElementById('sectionTitle').textContent = titleMap[sectionId] || 'Admin';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === sectionId));
}

async function loadDashboard() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        state.vectors = data.vectors || [];
        document.getElementById('totalVectors').textContent = state.vectors.length;
        document.getElementById('totalDownloads').textContent = state.vectors.reduce((sum, v) => sum + (v.downloads || 0), 0);
        
        const catMap = {};
        state.vectors.forEach(v => {
            const cat = v.category || 'Miscellaneous';
            if (!catMap[cat]) catMap[cat] = { vectors: 0, jpegs: 0, downloads: 0 };
            if (v.contentType === 'jpeg') catMap[cat].jpegs++; else catMap[cat].vectors++;
            catMap[cat].downloads += v.downloads || 0;
        });

        const tbody = document.getElementById('catTableBody');
        if (tbody) {
            tbody.innerHTML = Object.keys(catMap).sort().map(cat => `
                <tr><td>${escHtml(cat)}</td><td>${catMap[cat].vectors}</td><td>${catMap[cat].jpegs}</td><td>${catMap[cat].downloads}</td></tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center;padding:20px;">No data</td></tr>';
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
        filterAndRenderManage('vector');
    } catch (e) { console.error(e); }
}

async function loadManageJpegs() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        state.vectors = data.vectors || [];
        filterAndRenderManage('jpeg');
    } catch (e) { console.error(e); }
}

function filterAndRenderManage(type = 'vector') {
    const isJpeg = type === 'jpeg';
    const query = isJpeg ? state.searchQueryJpeg : state.searchQuery;
    const cat = isJpeg ? state.filterCatJpeg : state.filterCat;
    
    const filtered = state.vectors.filter(v => {
        const typeMatch = isJpeg ? v.contentType === 'jpeg' : v.contentType !== 'jpeg';
        const searchMatch = v.name.toLowerCase().includes(query) || (v.title || "").toLowerCase().includes(query);
        const catMatch = !cat || v.category === cat;
        return typeMatch && searchMatch && catMatch;
    });

    if (isJpeg) state.filteredJpegs = filtered; else state.filteredVectors = filtered;
    renderManageTable(type);
}

function renderManageTable(type = 'vector') {
    const isJpeg = type === 'jpeg';
    const tbody = document.getElementById(isJpeg ? 'manageTableBodyJpeg' : 'manageTableBody');
    const filtered = isJpeg ? state.filteredJpegs : state.filteredVectors;
    const page = isJpeg ? state.managePageJpeg : state.managePage;
    
    if (!tbody) return;
    const start = (page - 1) * state.manageLimit;
    const items = filtered.slice(start, start + state.manageLimit);
    
    tbody.innerHTML = items.length ? items.map(v => {
        const thumbKey = encodeURIComponent(`${v.category || 'Miscellaneous'}/${v.name}/${v.name}.jpg`);
        return `
            <tr>
                <td><input type="checkbox" class="vector-checkbox" data-id="${escHtml(v.name)}" data-type="${type}"></td>
                <td><img src="/api/asset?key=${thumbKey}" class="preview-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2275%22%3E%3Crect fill=%22%23eee%22 width=%22100%22 height=%2275%22/%3E%3C/svg%3E'"></td>
                <td><strong>${escHtml(v.name)}</strong></td>
                <td><span class="badge badge-${isJpeg ? 'blue' : 'green'}">${type.toUpperCase()}</span></td>
                <td>${escHtml(v.category)}</td>
                <td>${v.downloads || 0}</td>
                <td><button class="btn-delete" onclick="deleteVector('${escHtml(v.name)}')">DELETE</button></td>
            </tr>
        `;
    }).join('') : `<tr><td colspan="7" style="text-align:center;padding:20px;">No items found.</td></tr>`;
    
    document.getElementById(isJpeg ? 'managePaginationInfoJpeg' : 'managePaginationInfo').textContent = 
        `Page ${page} of ${Math.ceil(filtered.length / state.manageLimit)} (${filtered.length} items)`;
    
    tbody.querySelectorAll('.vector-checkbox').forEach(cb => cb.onchange = () => updateBulkButtons(type));
    updateBulkButtons(type);
}

function updateBulkButtons(type = 'vector') {
    const selected = Array.from(document.querySelectorAll(`input[type="checkbox"].vector-checkbox[data-type="${type}"]`)).filter(cb => cb.checked);
    const delBtn = document.getElementById(type === 'vector' ? 'bulkDeleteBtn' : 'bulkDeleteBtnJpeg');
    if (delBtn) { delBtn.disabled = !selected.length; delBtn.textContent = `Delete Selected (${selected.length})`; }
}

async function deleteVector(slug) {
    if (!confirm(`Delete "${slug}"?`)) return;
    const key = sessionStorage.getItem('fv_admin');
    const res = await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, { method: 'DELETE', headers: { 'X-Admin-Key': key } });
    if (res.ok) { state.vectors = state.vectors.filter(v => v.name !== slug); loadDashboard(); loadManageVectors(); loadManageJpegs(); }
}

function handleBulkAnalyze(type = 'vector') {
    const input = document.getElementById(type === 'vector' ? 'bulkFileInput' : 'bulkFileInputJpeg');
    if (!input?.files.length) return;
    
    const groups = {};
    Array.from(input.files).forEach(f => {
        const id = f.name.substring(0, f.name.lastIndexOf('.'));
        const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
        if (!groups[id]) groups[id] = {};
        if (ext === '.json') groups[id].json = f;
        else if (['.jpg', '.jpeg'].includes(ext)) groups[id].jpeg = f;
        else if (ext === '.zip') groups[id].zip = f;
    });

    bulkFiles = Object.entries(groups).map(([id, g]) => ({ id, ...g })).filter(g => g.json && g.jpeg);
    const status = document.getElementById(type === 'vector' ? 'bulkUploadStatus' : 'bulkUploadStatusJpeg');
    if (status) {
        status.className = 'status-box info';
        status.textContent = `Found ${bulkFiles.length} valid sets. Ready to upload.`;
    }
    const btn = document.getElementById(type === 'vector' ? 'bulkUploadBtn' : 'bulkUploadBtnJpeg');
    if (btn) btn.disabled = !bulkFiles.length;
}

async function handleBulkUpload(type = 'vector') {
    const key = sessionStorage.getItem('fv_admin');
    const isVec = type === 'vector';
    const status = document.getElementById(isVec ? 'bulkUploadStatus' : 'bulkUploadStatusJpeg');
    const progressWrap = document.getElementById(isVec ? 'bulkProgressWrap' : 'bulkProgressWrapJpeg');
    const progressFill = document.getElementById(isVec ? 'bulkProgressFill' : 'bulkProgressFillJpeg');
    const progressText = document.getElementById(isVec ? 'bulkProgressText' : 'bulkProgressTextJpeg');
    
    const progressWrapS = document.getElementById(isVec ? 'bulkProgressWrapSingle' : 'bulkProgressWrapSingleJpeg');
    const progressFillS = document.getElementById(isVec ? 'bulkProgressFillSingle' : 'bulkProgressFillSingleJpeg');
    const progressTextS = document.getElementById(isVec ? 'bulkProgressTextSingle' : 'bulkProgressTextSingleJpeg');

    if (progressWrap) progressWrap.style.display = 'block';
    if (progressWrapS) progressWrapS.style.display = 'block';
    
    let success = 0, errors = 0;
    const uploadedVectors = [];
    const batchSize = 10;

    for (let i = 0; i < bulkFiles.length; i++) {
        const group = bulkFiles[i];
        if (progressText) progressText.textContent = `Processing ${i+1}/${bulkFiles.length}: ${group.id}`;
        if (progressFill) progressFill.style.width = `${Math.round((i / bulkFiles.length) * 100)}%`;

        const formData = new FormData();
        formData.append('action', 'bulk-upload');
        formData.append('json', group.json);
        formData.append('jpeg', group.jpeg);
        if (group.zip) formData.append('zip', group.zip);
        formData.append('skipIndexUpdate', 'true');

        let retries = 3, uploaded = false;
        while (retries > 0 && !uploaded) {
            try {
                const res = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/admin-bulk');
                    xhr.setRequestHeader('X-Admin-Key', key);
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable && progressFillS) {
                            const p = Math.round((e.loaded / e.total) * 100);
                            progressFillS.style.width = `${p}%`;
                            if (progressTextS) progressTextS.textContent = `Uploading ${group.id}: ${p}%`;
                        }
                    };
                    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300 ? { ok: true, data: JSON.parse(xhr.responseText) } : { ok: false });
                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.send(formData);
                });

                if (res.ok) {
                    success++; uploaded = true;
                    uploadedVectors.push(res.data.vector);
                } else {
                    retries--;
                    if (retries > 0) await new Promise(r => setTimeout(r, 1000 * (4 - retries)));
                    else errors++;
                }
            } catch (e) { retries--; if (retries === 0) errors++; await new Promise(r => setTimeout(r, 1000)); }
        }

        // Finalize batch or every 50 items to prevent data loss
        if (uploadedVectors.length >= 50 || (i === bulkFiles.length - 1 && uploadedVectors.length > 0)) {
            if (progressTextS) progressTextS.textContent = `Finalizing index update for batch...`;
            const finalForm = new FormData();
            finalForm.append('action', 'finalize-bulk');
            finalForm.append('vectors', JSON.stringify(uploadedVectors));
            await fetch('/api/admin-bulk', { method: 'POST', headers: { 'X-Admin-Key': key }, body: finalForm });
            uploadedVectors.length = 0; // Clear batch
        }
        
        // Cooldown to avoid rate limits
        if ((i + 1) % batchSize === 0) await new Promise(r => setTimeout(r, 1000));
    }

    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = `Upload complete. Success: ${success}, Errors: ${errors}`;
    if (status) {
        status.className = `status-box ${errors === 0 ? 'success' : 'warning'}`;
        status.textContent = `Bulk upload finished. ${success} uploaded, ${errors} failed.`;
    }
    loadDashboard(); loadManageVectors(); loadManageJpegs();
}

async function loadHealth() {
    const key = sessionStorage.getItem('fv_admin');
    const status = document.getElementById('healthStatus');
    status.textContent = 'Loading...';
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        document.getElementById('kvCount').textContent = data.vectors.length;
        document.getElementById('r2Count').textContent = '~' + (data.vectors.length * 2.5).toFixed(0);
        status.textContent = 'System healthy.';
    } catch (e) { status.textContent = 'Error loading health.'; }
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
