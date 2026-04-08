/**
 * Frevector Admin Panel - Frontend Logic (FIXED v3 - Finalize Mechanism)
 * - Sequential file uploads with 503 retry
 * - Finalize step to update KV index once at the end
 * - 100% stable upload process
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
let bulkAnalysisReport = [];

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
    document.getElementById('prevManage')?.addEventListener('click', () => { 
        if (state.managePage > 1) { 
            state.managePage--; 
            filterAndRenderManage('vector'); 
            window.scrollTo(0, 0);
        } 
    });
    document.getElementById('nextManage')?.addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredVectors.length / state.manageLimit);
        if (state.managePage < totalPages) { 
            state.managePage++; 
            filterAndRenderManage('vector'); 
            window.scrollTo(0, 0);
        }
    });
    document.getElementById('prevManageJpeg')?.addEventListener('click', () => { 
        if (state.managePageJpeg > 1) { 
            state.managePageJpeg--; 
            filterAndRenderManage('jpeg'); 
            window.scrollTo(0, 0);
        } 
    });
    document.getElementById('nextManageJpeg')?.addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredJpegs.length / state.manageLimit);
        if (state.managePageJpeg < totalPages) { 
            state.managePageJpeg++; 
            filterAndRenderManage('jpeg'); 
            window.scrollTo(0, 0);
        }
    });

    // Select All
    const setupSelectAll = (checkId, type) => {
        document.getElementById(checkId)?.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const filtered = type === 'vector' ? state.filteredVectors : state.filteredJpegs;
            const selectedSet = type === 'vector' ? state.selectedVectors : state.selectedJpegs;
            
            filtered.forEach(v => {
                if (isChecked) selectedSet.add(v.name);
                else selectedSet.delete(v.name);
            });
            
            renderManageTable(type);
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

    filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));

    if (isJpeg) state.filteredJpegs = filtered;
    else state.filteredVectors = filtered;

    renderManageTable(type);
}

function renderManageTable(type = 'vector') {
    const isJpeg = type === 'jpeg';
    const filtered = isJpeg ? state.filteredJpegs : state.filteredVectors;
    const page = isJpeg ? state.managePageJpeg : state.managePage;
    const selectedSet = isJpeg ? state.selectedJpegs : state.selectedVectors;

    const start = (page - 1) * state.manageLimit;
    const end = start + state.manageLimit;
    const paginated = filtered.slice(start, end);

    const tbody = document.getElementById(isJpeg ? 'manageTableBodyJpeg' : 'manageTableBody');
    if (!tbody) return;

    tbody.innerHTML = paginated.map(v => {
        const isSelected = selectedSet.has(v.name);
        return `
            <tr>
                <td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelect('${escHtml(v.name)}', '${type}')"></td>
                <td><img src="/api/asset?key=${encodeURIComponent((v.category || 'Miscellaneous') + '/' + v.name + '/' + v.name + '.jpg')}" class="preview-img" alt="preview" onerror="this.style.opacity='0.3'"></td>
                <td>${escHtml(v.name)}</td>
                <td>${escHtml(v.contentType || 'vector')}</td>
                <td>${escHtml(v.category || 'Miscellaneous')}</td>
                <td>${v.downloads || 0}</td>
                <td><button class="btn-delete" onclick="deleteVector('${escHtml(v.name)}')">Delete</button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#666;">No items</td></tr>';

    const totalPages = Math.ceil(filtered.length / state.manageLimit);
    const infoId = isJpeg ? 'managePaginationInfoJpeg' : 'managePaginationInfo';
    const infoEl = document.getElementById(infoId);
    if (infoEl) infoEl.textContent = `Page ${page} of ${totalPages} (${filtered.length} items)`;

    const prevBtn = document.getElementById(isJpeg ? 'prevManageJpeg' : 'prevManage');
    const nextBtn = document.getElementById(isJpeg ? 'nextManageJpeg' : 'nextManage');
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;

    updateBulkButtons(type);
}

function toggleSelect(name, type) {
    const selectedSet = type === 'vector' ? state.selectedVectors : state.selectedJpegs;
    if (selectedSet.has(name)) selectedSet.delete(name);
    else selectedSet.add(name);
    updateBulkButtons(type);
}

function updateBulkButtons(type = 'vector') {
    const isJpeg = type === 'jpeg';
    const selectedSet = isJpeg ? state.selectedJpegs : state.selectedVectors;
    const count = selectedSet.size;

    const deleteBtn = document.getElementById(isJpeg ? 'bulkDeleteBtnJpeg' : 'bulkDeleteBtn');
    const downloadBtn = document.getElementById(isJpeg ? 'bulkDownloadBtnJpeg' : 'bulkDownloadBtn');

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
            state.selectedVectors.delete(slug);
            state.selectedJpegs.delete(slug);
            loadDashboard();
            filterAndRenderManage('vector');
            filterAndRenderManage('jpeg');
        } else alert('Delete failed');
    } catch (e) { console.error(e); }
}

function downloadVector(slug) {
    const key = sessionStorage.getItem('fv_admin');
    window.open(`/api/download?slug=${encodeURIComponent(slug)}&key=${key}`, '_blank');
}

async function bulkDeleteVectors(type = 'vector') {
    const isJpeg = type === 'jpeg';
    const selectedSet = isJpeg ? state.selectedJpegs : state.selectedVectors;
    const selected = Array.from(selectedSet);
    if (!selected.length || !confirm(`Delete ${selected.length} items?`)) return;

    const key = sessionStorage.getItem('fv_admin');
    for (const slug of selected) {
        try {
            const res = await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Key': key }
            });
            if (res.ok) {
                state.vectors = state.vectors.filter(v => v.name !== slug);
                selectedSet.delete(slug);
            }
        } catch (e) { console.error(e); }
    }
    loadDashboard();
    filterAndRenderManage(type);
}

async function bulkDownloadVectors(type = 'vector') {
    const isJpeg = type === 'jpeg';
    const selectedSet = isJpeg ? state.selectedJpegs : state.selectedVectors;
    const selected = Array.from(selectedSet);
    if (!selected.length) return;

    const key = sessionStorage.getItem('fv_admin');
    for (const slug of selected) {
        window.open(`/api/download?slug=${encodeURIComponent(slug)}&key=${key}`, '_blank');
        await new Promise(r => setTimeout(r, 500));
    }
}

/**
 * IMPROVED BULK ANALYZE
 */
function handleBulkAnalyze(type = 'vector') {
    const input = document.getElementById(type === 'vector' ? 'bulkFileInput' : 'bulkFileInputJpeg');
    if (!input || !input.files.length) return;
    
    const files = Array.from(input.files);
    const statusId = type === 'vector' ? 'bulkUploadStatus' : 'bulkUploadStatusJpeg';
    const status = document.getElementById(statusId);
    
    const filesByBase = {};
    const report = [];
    
    files.forEach(f => {
        const name = f.name.trim();
        const lastDot = name.lastIndexOf('.');
        if (lastDot === -1) {
            report.push({ file: name, status: 'error', reason: 'No file extension' });
            return;
        }
        
        const baseName = name.substring(0, lastDot);
        const ext = name.substring(lastDot + 1).toLowerCase();
        
        if (!filesByBase[baseName]) {
            filesByBase[baseName] = { json: null, jpeg: null, jpg: null, zip: null };
        }
        
        if (ext === 'json') filesByBase[baseName].json = f;
        else if (ext === 'jpeg' || ext === 'jpg') {
            filesByBase[baseName][ext] = f;
        }
        else if (ext === 'zip') filesByBase[baseName].zip = f;
        else {
            report.push({ file: name, status: 'error', reason: `Unsupported file type: .${ext}` });
        }
    });
    
    bulkFiles = [];
    Object.entries(filesByBase).forEach(([baseName, group]) => {
        const hasJson = !!group.json;
        const hasJpeg = group.jpeg || group.jpg;
        const hasZip = !!group.zip;
        
        if (!hasJson) {
            report.push({ file: baseName, status: 'error', reason: 'Missing JSON metadata file' });
            return;
        }
        
        if (!hasJpeg) {
            report.push({ file: baseName, status: 'error', reason: 'Missing JPEG/JPG preview image' });
            return;
        }
        
        bulkFiles.push({
            id: baseName,
            json: group.json,
            jpeg: hasJpeg,
            jpegFile: group.jpeg || group.jpg,
            zip: group.zip,
            hasZip: hasZip
        });
        
        report.push({
            file: baseName,
            status: 'success',
            reason: `Valid set (JSON + JPEG${hasZip ? ' + ZIP' : ''})`
        });
    });
    
    bulkAnalysisReport = report;
    
    if (status) {
        status.className = 'status-box info';
        const validCount = bulkFiles.length;
        const errorCount = report.filter(r => r.status === 'error').length;
        
        let html = `<strong>Analysis Report:</strong><br>`;
        html += `✓ Valid sets: ${validCount}<br>`;
        html += `✗ Errors: ${errorCount}<br><br>`;
        
        if (errorCount > 0) {
            html += `<strong style="color:#c53030;">Errors:</strong><br>`;
            report.filter(r => r.status === 'error').forEach(r => {
                html += `• <code>${escHtml(r.file)}</code>: ${escHtml(r.reason)}<br>`;
            });
        }
        
        status.innerHTML = html;
    }
    
    const btn = document.getElementById(type === 'vector' ? 'bulkUploadBtn' : 'bulkUploadBtnJpeg');
    if (btn) btn.disabled = bulkFiles.length === 0;
}

/**
 * IMPROVED BULK UPLOAD - Sequential with Finalize Step
 */
async function handleBulkUpload(type = 'vector') {
    const key = sessionStorage.getItem('fv_admin');
    const isJpeg = type === 'jpeg';
    const btnId = isJpeg ? 'bulkUploadBtnJpeg' : 'bulkUploadBtn';
    const analyzeBtnId = isJpeg ? 'bulkAnalyzeBtnJpeg' : 'bulkAnalyzeBtn';
    const statusId = isJpeg ? 'bulkUploadStatusJpeg' : 'bulkUploadStatus';
    
    const progressText = document.getElementById(isJpeg ? 'bulkProgressTextJpeg' : 'bulkProgressText');
    const progressFill = document.getElementById(isJpeg ? 'bulkProgressFillJpeg' : 'bulkProgressFill');
    const progressWrap = document.getElementById(isJpeg ? 'bulkProgressWrapJpeg' : 'bulkProgressWrap');
    
    const progressTextSingle = document.getElementById(isJpeg ? 'bulkProgressTextSingleJpeg' : 'bulkProgressTextSingle');
    const progressFillSingle = document.getElementById(isJpeg ? 'bulkProgressFillSingleJpeg' : 'bulkProgressFillSingle');
    const progressWrapSingle = document.getElementById(isJpeg ? 'bulkProgressWrapSingleJpeg' : 'bulkProgressWrapSingle');

    document.getElementById(btnId).disabled = true;
    document.getElementById(analyzeBtnId).disabled = true;
    if (progressWrap) progressWrap.style.display = 'block';
    if (progressWrapSingle) progressWrapSingle.style.display = 'block';
    
    const uploadResults = [];
    const successfulRecords = [];
    
    for (let i = 0; i < bulkFiles.length; i++) {
        const group = bulkFiles[i];
        if (progressText) progressText.textContent = `Uploading ${group.id} (${i+1}/${bulkFiles.length})...`;
        if (progressFill) progressFill.style.width = `${Math.round((i / bulkFiles.length) * 100)}%`;
        if (progressFillSingle) progressFillSingle.style.width = '0%';

        const formData = new FormData();
        formData.append('json', group.json);
        formData.append('jpeg', group.jpegFile);
        if (group.zip) formData.append('zip', group.zip);
        formData.append('skipIndexUpdate', 'true'); // CRITICAL: Don't update KV yet

        let retries = 5;
        let uploaded = false;
        let lastError = 'Unknown error';
        
        while (retries > 0 && !uploaded) {
            try {
                const res = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/admin-bulk'); // Use specialized bulk endpoint
                    xhr.setRequestHeader('X-Admin-Key', key);
                    xhr.timeout = 180000;
                    
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable && progressFillSingle) {
                            progressFillSingle.style.width = `${Math.round((e.loaded / e.total) * 100)}%`;
                        }
                    };
                    
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const data = JSON.parse(xhr.responseText);
                                resolve({ success: true, vector: data.vector });
                            } catch (e) { resolve({ success: true }); }
                        } else {
                            let errorMsg = `Upload failed (${xhr.status})`;
                            try {
                                if (xhr.responseText) {
                                    const errData = JSON.parse(xhr.responseText);
                                    errorMsg = errData.error || errorMsg;
                                }
                            } catch (e) {}
                            resolve({ success: false, status: xhr.status, error: errorMsg });
                        }
                    };
                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.ontimeout = () => reject(new Error('Timeout'));
                    xhr.send(formData);
                });

                if (res.success) {
                    uploaded = true;
                    if (res.vector) successfulRecords.push(res.vector);
                    uploadResults.push({ id: group.id, status: 'success' });
                } else {
                    lastError = res.error;
                    retries--;
                    if (retries > 0) await new Promise(r => setTimeout(r, 5000 + Math.random() * 5000));
                }
            } catch (e) {
                lastError = e.message;
                retries--;
                if (retries > 0) await new Promise(r => setTimeout(r, 5000));
            }
        }
        
        if (!uploaded) uploadResults.push({ id: group.id, status: 'error', message: lastError });
        await new Promise(r => setTimeout(r, 1500));
    }

    // STEP 2: FINALIZE (Update KV Index once)
    if (successfulRecords.length > 0) {
        if (progressText) progressText.textContent = `Finalizing index for ${successfulRecords.length} items...`;
        try {
            const res = await fetch('/api/admin-bulk', {
                method: 'POST',
                headers: { 'X-Admin-Key': key, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'finalize-bulk', vectors: successfulRecords })
            });
            if (!res.ok) console.error('Finalize failed');
        } catch (e) { console.error('Finalize error:', e); }
    }

    if (progressFill) progressFill.style.width = '100%';
    if (progressWrapSingle) progressWrapSingle.style.display = 'none';
    
    const successCount = uploadResults.filter(r => r.status === 'success').length;
    const errorCount = uploadResults.filter(r => r.status === 'error').length;
    
    const status = document.getElementById(statusId);
    if (status) {
        status.className = `status-box ${errorCount === 0 ? 'success' : errorCount === successCount ? 'error' : 'warning'}`;
        let html = `<strong>Upload Complete</strong><br>✓ Successful: ${successCount}<br>✗ Failed: ${errorCount}<br><br>`;
        if (errorCount > 0) {
            html += `<strong style="color:#c53030;">Failed Items:</strong><br>`;
            uploadResults.filter(r => r.status === 'error').forEach(r => {
                html += `• <code>${escHtml(r.id)}</code>: ${escHtml(r.message)}<br>`;
            });
        }
        status.innerHTML = html;
    }
    
    document.getElementById(analyzeBtnId).disabled = false;
    document.getElementById(btnId).disabled = false;
    loadDashboard();
    loadManageVectors();
    loadManageJpegs();
}

async function loadHealth() {
    const key = sessionStorage.getItem('fv_admin');
    const status = document.getElementById('healthStatus');
    status.className = 'status-box info';
    status.textContent = 'Loading...';
    try {
        const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': key } });
        const data = await res.json();
        document.getElementById('kvCount').textContent = (data.vectors || []).length;
        status.className = 'status-box success';
        status.textContent = 'Health data loaded.';
    } catch (e) { status.className = 'status-box error'; status.textContent = 'Error'; }
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}
