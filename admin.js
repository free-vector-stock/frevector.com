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

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Admin Panel Initialized");
    
    // Check if already logged in
    const savedKey = sessionStorage.getItem('fv_admin');
    if (savedKey === ADMIN_KEY) {
        const isValid = await verifyLogin(savedKey);
        if (isValid) {
            showApp();
        } else {
            sessionStorage.removeItem('fv_admin');
            showLogin();
        }
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
            dropZone.style.borderColor = 'var(--black)';
            dropZone.style.backgroundColor = '#f0f0f0';
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
                handleBulkAnalyze();
            }
        };
        bulkInput.onchange = handleBulkAnalyze;
    }

    document.getElementById('bulkAnalyzeBtn')?.addEventListener('click', handleBulkAnalyze);
    document.getElementById('bulkUploadBtn')?.addEventListener('click', handleBulkUpload);

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
        const matchesSearch = !state.searchQuery ||
            (v.name || '').toLowerCase().includes(state.searchQuery) ||
            (v.title || '').toLowerCase().includes(state.searchQuery) ||
            (v.keywords && v.keywords.some(k => k.toLowerCase().includes(state.searchQuery)));
        const matchesCat = !state.filterCat || v.category === state.filterCat;
        return matchesSearch && matchesCat;
    });
    renderManageTable();
}

function renderManageTable() {
    const tbody = document.getElementById('vectorsTableBody');
    const pag = document.getElementById('managePagination');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    const start = (state.managePage - 1) * state.manageLimit;
    const end = start + state.manageLimit;
    const pageItems = state.filteredVectors.slice(start, end);

    if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">No vectors found</td></tr>';
        if (pag) pag.innerHTML = '';
        return;
    }

    pageItems.forEach(v => {
        const tr = document.createElement('tr');
        const previewUrl = `/api/asset?key=${encodeURIComponent(v.name)}.jpg`;
        const isSelected = state.selectedVectors.has(v.name);
        tr.innerHTML = `
            <td><input type="checkbox" class="vector-checkbox" data-slug="${escHtml(v.name)}" ${isSelected ? 'checked' : ''}></td>
            <td><img src="${previewUrl}" class="preview-img" onerror="this.src='https://placehold.co/400x300/f5f5f5/999999?text=Preview'"></td>
            <td><div style="font-weight:600;">${escHtml(v.title)}</div><div style="font-size:11px;color:#888;">${escHtml(v.name)}</div></td>
            <td><span class="badge badge-orange">${escHtml(v.category)}</span></td>
            <td>${v.date}</td>
            <td>${v.downloads}</td>
            <td><button class="btn-delete" onclick="deleteVector('${escHtml(v.name)}')">Delete</button></td>
        `;
        const checkbox = tr.querySelector('.vector-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                state.selectedVectors.add(v.name);
            } else {
                state.selectedVectors.delete(v.name);
            }
            updateBulkDeleteUI();
        });
        tbody.appendChild(tr);
    });

    renderPagination();
    updateBulkDeleteUI();
}

function renderPagination() {
    const pag = document.getElementById('managePagination');
    if (!pag) return;
    
    const totalPages = Math.ceil(state.filteredVectors.length / state.manageLimit);
    pag.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pag-admin-btn';
    prevBtn.textContent = '‹';
    prevBtn.disabled = state.managePage === 1;
    prevBtn.onclick = () => { state.managePage--; renderManageTable(); };
    pag.appendChild(prevBtn);

    const info = document.createElement('span');
    info.className = 'pag-admin-info';
    info.textContent = `Page ${state.managePage} / ${totalPages}`;
    pag.appendChild(info);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pag-admin-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = state.managePage === totalPages;
    nextBtn.onclick = () => { state.managePage++; renderManageTable(); };
    pag.appendChild(nextBtn);
}

async function deleteVector(slug) {
    const key = sessionStorage.getItem('fv_admin');
    if (!confirm(`Are you sure you want to delete "${slug}"?`)) return;
    try {
        const res = await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, {
            method: 'DELETE',
            headers: { 'X-Admin-Key': key }
        });
        const data = await res.json();
        if (data.success) {
            state.vectors = state.vectors.filter(v => v.name !== slug);
            state.selectedVectors.delete(slug);
            filterAndRenderManage();
            loadDashboard();
        } else {
            alert('Delete failed: ' + data.error);
        }
    } catch (e) { alert(e.message); }
}

function updateBulkDeleteUI() {
    const btn = document.getElementById('bulkDeleteBtn');
    if (!btn) return;
    const count = state.selectedVectors.size;
    btn.style.display = count > 0 ? 'inline-block' : 'none';
    btn.textContent = `Delete Selected (${count})`;
    
    const countSpan = document.getElementById('selectedCount');
    if (countSpan) {
        countSpan.style.display = count > 0 ? 'inline' : 'none';
        countSpan.textContent = `${count} selected`;
    }
}

async function bulkDeleteVectors() {
    const key = sessionStorage.getItem('fv_admin');
    const count = state.selectedVectors.size;
    if (count === 0) return;
    if (!confirm(`Are you sure you want to delete ${count} selected vectors?`)) return;

    const btn = document.getElementById('bulkDeleteBtn');
    btn.disabled = true;
    btn.textContent = 'Deleting...';

    const slugs = Array.from(state.selectedVectors);
    let successCount = 0;

    for (const slug of slugs) {
        try {
            const res = await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Key': key }
            });
            const data = await res.json();
            if (data.success) {
                successCount++;
                state.vectors = state.vectors.filter(v => v.name !== slug);
                state.selectedVectors.delete(slug);
            }
        } catch (e) { console.error(`Failed to delete ${slug}:`, e); }
    }

    alert(`Successfully deleted ${successCount} of ${slugs.length} vectors.`);
    filterAndRenderManage();
    loadDashboard();
    btn.disabled = false;
    updateBulkDeleteUI();
}

// BULK UPLOAD LOGIC
let bulkFiles = [];

function handleBulkAnalyze() {
    const input = document.getElementById('bulkFileInput');
    if (!input) return;
    
    const files = Array.from(input.files);
    if (files.length === 0) return;

    const groups = {};
    files.forEach(f => {
        const name = f.name.replace(/\.(json|jpg|jpeg|zip)$/i, '');
        if (!groups[name]) groups[name] = {};
        const ext = f.name.split('.').pop().toLowerCase();
        if (ext === 'json') groups[name].json = f;
        else if (ext === 'jpg' || ext === 'jpeg') groups[name].jpeg = f;
        else if (ext === 'zip') groups[name].zip = f;
    });

    bulkFiles = Object.entries(groups).map(([id, g]) => ({ id, ...g })).filter(g => g.json && g.jpeg && g.zip);
    
    const status = document.getElementById('bulkUploadStatus');
    const uploadBtn = document.getElementById('bulkUploadBtn');
    
    if (status) {
        status.className = 'status-box info';
        status.textContent = `Found ${bulkFiles.length} valid vector sets (JSON+JPG+ZIP). Ready to upload.`;
    }
    if (uploadBtn) uploadBtn.disabled = bulkFiles.length === 0;
}

async function handleBulkUpload() {
    const key = sessionStorage.getItem('fv_admin');
    if (bulkFiles.length === 0) return;
    
    const btn = document.getElementById('bulkUploadBtn');
    const progressWrap = document.getElementById('bulkProgressWrap');
    const progressFill = document.getElementById('bulkProgressFill');
    const progressText = document.getElementById('bulkProgressText');
    const status = document.getElementById('bulkUploadStatus');

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
        formData.append('zip', group.zip);

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'X-Admin-Key': key },
                body: formData
            });
            const data = await res.json();
            if (data.success) success++;
            else failed++;
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

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
