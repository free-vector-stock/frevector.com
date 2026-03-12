/**
 * Frevector Admin Panel - Frontend Logic
 * Fixed: Robust admin login, session management, and R2 structure.
 * Requirement: Category list updated, R2 sync.
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
    managePage: 1,
    manageLimit: 200,
    searchQuery: '',
    filterCat: '',
    selectedVectors: new Set()
};

let bulkFiles = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Admin Panel Initialized");
    
    // Check if already logged in
    const savedKey = sessionStorage.getItem('fv_admin');
    if (savedKey === ADMIN_KEY) {
        showApp();
    } else {
        showLogin();
    }

    // Login Event Listeners
    const loginBtn = document.getElementById('loginBtn');
    const loginPassword = document.getElementById('loginPassword');

    if (loginBtn) {
        loginBtn.onclick = (e) => {
            e.preventDefault();
            doLogin();
        };
    }

    if (loginPassword) {
        loginPassword.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                doLogin();
            }
        };
    }

    // Logout Event Listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            sessionStorage.removeItem('fv_admin');
            location.reload();
        };
    }

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => switchSection(btn.dataset.section);
    });

    // Bulk Upload Setup
    const dropZone = document.getElementById('drop-zone');
     const bulkInput = document.getElementById('bulkFileInput');
    if (dropZone && bulkInput) {
        dropZone.onclick = () => bulkInput.click();
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--blue)';
            dropZone.style.backgroundColor = '#f0f7ff';
        };
        dropZone.ondragleave = () => {
            dropZone.style.borderColor = '#ccc';
            dropZone.style.backgroundColor = '#f9f9f9';
        };
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#ccc';
            dropZone.style.backgroundColor = '#f9f9f9';
            if (e.dataTransfer.files.length > 0) {
                bulkInput.files = e.dataTransfer.files;
                handleBulkAnalyze('vector');
            }
        };
        bulkInput.onchange = () => handleBulkAnalyze('vector');
    }

    const dropZoneJpeg = document.getElementById('drop-zone-jpeg');
    const bulkInputJpeg = document.getElementById('bulkFileInputJpeg');
    if (dropZoneJpeg && bulkInputJpeg) {
        dropZoneJpeg.onclick = () => bulkInputJpeg.click();
        dropZoneJpeg.ondragover = (e) => {
            e.preventDefault();
            dropZoneJpeg.style.borderColor = 'var(--blue)';
            dropZoneJpeg.style.backgroundColor = '#f0f7ff';
        };
        dropZoneJpeg.ondragleave = () => {
            dropZoneJpeg.style.borderColor = '#ccc';
            dropZoneJpeg.style.backgroundColor = '#f9f9f9';
        };
        dropZoneJpeg.ondrop = (e) => {
            e.preventDefault();
            dropZoneJpeg.style.borderColor = '#ccc';
            dropZoneJpeg.style.backgroundColor = '#f9f9f9';
            if (e.dataTransfer.files.length > 0) {
                bulkInputJpeg.files = e.dataTransfer.files;
                handleBulkAnalyze('jpeg');
            }
        };
        bulkInputJpeg.onchange = () => handleBulkAnalyze('jpeg');
    }

    document.getElementById('bulkAnalyzeBtn')?.addEventListener('click', () => handleBulkAnalyze('vector'));
    document.getElementById('bulkUploadBtn')?.addEventListener('click', () => handleBulkUpload('vector'));
    document.getElementById('bulkAnalyzeBtnJpeg')?.addEventListener('click', () => handleBulkAnalyze('jpeg'));
    document.getElementById('bulkUploadBtnJpeg')?.addEventListener('click', () => handleBulkUpload('jpeg'));;

    // Manage Vectors Filters
    document.getElementById('searchManage')?.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        state.managePage = 1;
        filterAndRenderManage();
    });

    document.getElementById('filterCategory')?.addEventListener('change', (e) => {
        state.filterCat = e.target.value;
        state.managePage = 1;
        filterAndRenderManage();
    });

    document.getElementById('selectAllCheckbox')?.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const start = (state.managePage - 1) * state.manageLimit;
        const end = start + state.manageLimit;
        const pageItems = state.filteredVectors.slice(start, end);
        if (checked) {
            pageItems.forEach(v => state.selectedVectors.add(v.name));
        } else {
            pageItems.forEach(v => state.selectedVectors.delete(v.name));
        }
        renderManageTable();
        updateBulkDeleteUI();
    });

    document.getElementById('bulkDeleteBtn')?.addEventListener('click', bulkDeleteVectors);
    document.getElementById('bulkDownloadBtn')?.addEventListener('click', bulkDownloadVectors);

    // Populate Categories in Filter
    const filterSel = document.getElementById('filterCategory');
    if (filterSel) {
        CATEGORIES.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            filterSel.appendChild(opt);
        });
    }

    // Health Check Buttons
    document.getElementById('refreshHealthBtn')?.addEventListener('click', loadHealthReport);
    document.getElementById('verifySyncBtn')?.addEventListener('click', verifySync);
    document.getElementById('fixCategoriesBtn')?.addEventListener('click', fixCategories);
    document.getElementById('runCleanupBtn')?.addEventListener('click', runCleanup);
});

async function verifyLogin(key) {
    try {
        const res = await fetch('/api/admin?action=stats', {
            headers: { 'X-Admin-Key': key }
        });
        return res.status === 200;
    } catch (e) {
        return false;
    }
}

async function doLogin() {
    const pwInput = document.getElementById('loginPassword');
    const errorEl = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    
    if (!pwInput) return;
    
    const pw = pwInput.value.trim();
    if (!pw) return;

    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = "Verifying...";
    }

    const isValid = await verifyLogin(pw);
    
    if (isValid) {
        sessionStorage.setItem('fv_admin', pw);
        if (errorEl) errorEl.style.display = 'none';
        showApp();
    } else {
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.textContent = "Invalid password. Please try again.";
        }
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
        }
    }
}

function showLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminApp) adminApp.style.display = 'none';
}

function showApp() {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminApp) adminApp.style.display = 'block';
    
    loadDashboard();
    loadManageVectors();
}

function switchSection(name) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const section = document.getElementById(name);
    const btn = document.querySelector(`[data-section="${name}"]`);
    const title = document.getElementById('sectionTitle');
    
    if (section) section.classList.add('active');
    if (btn) btn.classList.add('active');
    if (title) title.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    
    if (name === 'health') loadHealthReport();
}

async function loadDashboard() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch('/api/admin?action=stats', {
            headers: { 'X-Admin-Key': key }
        });
        const data = await res.json();
        
        const totalVectors = document.getElementById('totalVectors');
        const totalDownloads = document.getElementById('totalDownloads');
        const totalCategories = document.getElementById('totalCategories');
        const tbody = document.getElementById('catTableBody');
        
        if (totalVectors) totalVectors.textContent = data.totalVectors || 0;
        if (totalDownloads) totalDownloads.textContent = data.totalDownloads || 0;
        if (totalCategories) totalCategories.textContent = (data.categories || []).length;
        
        if (tbody) {
            tbody.innerHTML = '';
            (data.categories || []).forEach(cat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${escHtml(cat.name)}</td><td>${cat.count}</td><td>${cat.downloads}</td>`;
                tbody.appendChild(tr);
            });
        }
    } catch (e) { console.error(e); }
}

async function loadManageVectors() {
    const key = sessionStorage.getItem('fv_admin');
    try {
        const res = await fetch('/api/admin', {
            headers: { 'X-Admin-Key': key }
        });
        const data = await res.json();
        state.vectors = data.vectors || [];
        filterAndRenderManage();
    } catch (e) { console.error(e); }
}

function filterAndRenderManage() {
    state.filteredVectors = state.vectors.filter(v => {
        const matchSearch = v.name.toLowerCase().includes(state.searchQuery) || v.title.toLowerCase().includes(state.searchQuery);
        const matchCat = !state.filterCat || v.category === state.filterCat;
        return matchSearch && matchCat;
    });
    renderManageTable();
}

function renderManageTable() {
    const tbody = document.getElementById('manageTableBody');
    if (!tbody) return;
    
    const start = (state.managePage - 1) * state.manageLimit;
    const end = start + state.manageLimit;
    const pageItems = state.filteredVectors.slice(start, end);
    
    tbody.innerHTML = '';
    pageItems.forEach(v => {
        const tr = document.createElement('tr');
        const isSelected = state.selectedVectors.has(v.name);
        const typeLabel = v.contentType === 'jpeg' ? '<span class="badge badge-blue">JPEG</span>' : '<span class="badge badge-green">VECTOR</span>';
        
        tr.innerHTML = `
            <td><input type="checkbox" class="vector-checkbox" data-id="${v.name}" ${isSelected ? 'checked' : ''}></td>
            <td><strong>${escHtml(v.name)}</strong></td>
            <td>${typeLabel}</td>
            <td>${escHtml(v.category)}</td>
            <td>${v.downloads || 0}</td>
            <td>
                <button class="btn-delete" onclick="deleteVector('${v.name}')">Delete</button>
            </td>
        `;
        
        tr.querySelector('.vector-checkbox').onchange = (e) => {
            if (e.target.checked) state.selectedVectors.add(v.name);
            else state.selectedVectors.delete(v.name);
            updateBulkDeleteUI();
        };
        
        tbody.appendChild(tr);
    });
    
    updatePaginationUI();
    updateBulkDeleteUI();
}

function updatePaginationUI() {
    const info = document.getElementById('managePaginationInfo');
    const totalPages = Math.ceil(state.filteredVectors.length / state.manageLimit) || 1;
    if (info) info.textContent = `Page ${state.managePage} of ${totalPages} (${state.filteredVectors.length} total)`;
    
    const prev = document.getElementById('prevManage');
    const next = document.getElementById('nextManage');
    if (prev) prev.disabled = state.managePage <= 1;
    if (next) next.disabled = state.managePage >= totalPages;
    
    if (prev) prev.onclick = () => { state.managePage--; renderManageTable(); };
    if (next) next.onclick = () => { state.managePage++; renderManageTable(); };
}

function updateBulkDeleteUI() {
    const btn = document.getElementById('bulkDeleteBtn');
    const downBtn = document.getElementById('bulkDownloadBtn');
    const count = state.selectedVectors.size;
    if (btn) {
        btn.disabled = count === 0;
        btn.textContent = `Delete Selected (${count})`;
    }
    if (downBtn) {
        downBtn.disabled = count === 0;
    }
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
            state.selectedVectors.delete(slug);
            filterAndRenderManage();
            loadDashboard();
        }
    } catch (e) { console.error(e); }
}

async function bulkDeleteVectors() {
    const count = state.selectedVectors.size;
    if (!confirm(`Are you sure you want to delete ${count} selected vectors?`)) return;
    
    const key = sessionStorage.getItem('fv_admin');
    const slugs = Array.from(state.selectedVectors);
    
    const btn = document.getElementById('bulkDeleteBtn');
    btn.disabled = true;
    btn.textContent = "Deleting...";
    
    for (const slug of slugs) {
        try {
            await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Key': key }
            });
        } catch (e) { console.error(e); }
    }
    
    state.selectedVectors.clear();
    await loadManageVectors();
    loadDashboard();
}

async function bulkDownloadVectors() {
    const slugs = Array.from(state.selectedVectors);
    alert(`Bulk download for ${slugs.length} items started. (Simulation)`);
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

    let currentBulkFiles = [];
    if (type === 'vector') {
        currentBulkFiles = Object.entries(groups).map(([id, g]) => ({ id, ...g })).filter(g => g.json && g.jpeg && g.zip);
    } else {
        currentBulkFiles = Object.entries(groups).map(([id, g]) => ({ id, ...g })).filter(g => g.json && g.jpeg);
    }
    
    bulkFiles = currentBulkFiles;
    
    const statusId = type === 'vector' ? 'bulkUploadStatus' : 'bulkUploadStatusJpeg';
    const status = document.getElementById(statusId);
    const uploadBtnId = type === 'vector' ? 'bulkUploadBtn' : 'bulkUploadBtnJpeg';
    const uploadBtn = document.getElementById(uploadBtnId);
    
    if (status) {
        status.className = 'status-box info';
        status.textContent = `Found ${bulkFiles.length} valid ${type} sets. Ready to upload.`;
    }
    if (uploadBtn) uploadBtn.disabled = bulkFiles.length === 0;
}

async function handleBulkUpload(type = 'vector') {
    const key = sessionStorage.getItem('fv_admin');
    if (bulkFiles.length === 0) return;
    
    const btnId = type === 'vector' ? 'bulkUploadBtn' : 'bulkUploadBtnJpeg';
    const btn = document.getElementById(btnId);
    const progressWrapId = type === 'vector' ? 'bulkProgressWrap' : 'bulkProgressWrapJpeg';
    const progressWrap = document.getElementById(progressWrapId);
    const progressFillId = type === 'vector' ? 'bulkProgressFill' : 'bulkProgressFillJpeg';
    const progressFill = document.getElementById(progressFillId);
    const progressTextId = type === 'vector' ? 'bulkProgressText' : 'bulkProgressTextJpeg';
    const progressText = document.getElementById(progressTextId);
    const statusId = type === 'vector' ? 'bulkUploadStatus' : 'bulkUploadStatusJpeg';
    const status = document.getElementById(statusId);

    if (btn) btn.disabled = true;
    if (progressWrap) progressWrap.style.display = 'block';
    
    let success = 0;
    let failed = 0;

    for (let i = 0; i < bulkFiles.length; i++) {
        const group = bulkFiles[i];
        const percent = Math.round((i / bulkFiles.length) * 100);
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = `Uploading ${group.id} (${i+1}/${bulkFiles.length})...`;

        const formData = new FormData();
        formData.append('json', group.json);
        formData.append('jpeg', group.jpeg);
        if (group.zip) formData.append('zip', group.zip);

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'X-Admin-Key': key },
                body: formData
            });
            const data = await res.json();
            if (data.success) success++;
            else {
                console.error('Upload error:', data.error);
                failed++;
            }
        } catch (e) {
            console.error(e);
            failed++;
        }
    }

    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = 'Upload complete.';
    if (status) {
        status.className = success > 0 ? 'status-box success' : 'status-box error';
        status.textContent = `Upload finished. Success: ${success}, Failed: ${failed}.`;
    }
    
    loadDashboard();
    loadManageVectors();
    if (btn) btn.disabled = false;
}

async function loadHealthReport() {
    const key = sessionStorage.getItem('fv_admin');
    const body = document.getElementById('healthIssuesBody');
    if (body) body.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;">Checking R2 synchronization...</td></tr>';
    
    try {
        const res = await fetch('/api/admin?action=health&sample=100', {
            headers: { 'X-Admin-Key': key }
        });
        const data = await res.json();
        if (body) body.innerHTML = '';
        
        // Update Health Cards
        const grid = document.getElementById('healthGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="health-card ${data.issueCount === 0 ? 'ok' : 'error'}">
                    <div class="health-icon">${data.issueCount === 0 ? '✓' : '⚠'}</div>
                    <div class="health-label">Issues Found</div>
                    <div class="health-value">${data.issueCount}</div>
                </div>
                <div class="health-card ok">
                    <div class="health-icon">📁</div>
                    <div class="health-label">Sample Size</div>
                    <div class="health-value">${data.r2SampleSize}</div>
                </div>
                <div class="health-card ok">
                    <div class="health-icon">📊</div>
                    <div class="health-label">Total Vectors</div>
                    <div class="health-value">${data.totalVectors}</div>
                </div>
            `;
        }

        if (body) {
            if (data.issueCount === 0) {
                body.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--green);font-weight:600;">✓ All sampled vectors are correctly synced with R2.</td></tr>';
            } else {
                data.issues.forEach(iss => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${escHtml(iss.slug)}</strong></td>
                        <td><span class="badge badge-red">${escHtml(iss.type)}</span></td>
                        <td>${escHtml(iss.fix)}</td>
                        <td><button class="btn-delete" onclick="deleteVector('${escHtml(iss.slug)}')">Delete Record</button></td>
                    `;
                    body.appendChild(tr);
                });
            }
        }
    } catch (e) { 
        if (body) body.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--red);">Error: ${e.message}</td></tr>`;
    }
}

async function runCleanup() {
    const key = sessionStorage.getItem('fv_admin');
    if (!confirm('This will remove all KV entries that do not have corresponding files in R2. Continue?')) return;
    const btn = document.getElementById('runCleanupBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Cleaning... (Please wait)';
    }
    try {
        const res = await fetch('/api/admin?action=cleanup', {
            method: 'PATCH',
            headers: { 'X-Admin-Key': key }
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        alert(`Cleanup finished.\nChecked: ${data.totalChecked || 0}\nOrphans removed: ${data.orphansRemoved || 0}\nRemaining: ${data.count}`);
        loadDashboard();
        loadManageVectors();
        loadHealthReport();
    } catch (e) { 
        console.error(e);
        alert('Cleanup failed: ' + e.message + '. If this persists, the database might be too large for a single run.'); 
    }
    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Run Cleanup (Remove Orphans)';
    }
}

async function verifySync() {
    loadHealthReport();
}

async function fixCategories() {
    if (!confirm("This will scan all vectors and fix those in 'Miscellaneous' if their ID matches a category name. Continue?")) return;
    
    const key = sessionStorage.getItem('fv_admin');
    const btn = document.getElementById('fixCategoriesBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Fixing...";
    }

    try {
        const res = await fetch('/api/fix-categories', {
            method: 'POST',
            headers: { 'X-Admin-Key': key }
        });
        const data = await res.json();
        if (data.success) {
            alert(`Success! Fixed ${data.fixedCount} vectors.`);
            loadManageVectors();
            loadDashboard();
        } else {
            alert("Error: " + (data.error || "Unknown error"));
        }
    } catch (e) {
        alert("Request failed: " + e.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Fix Categories (ID-based)";
        }
    }
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
