/**
 * Frevector Admin Panel - Frontend Logic
 */

const ADMIN_KEY = "Frevector@2026!";
// Categories list - MUST match categories-config.js exactly
const CATEGORIES = [
    'Abstract',
    'Animals/Wildlife',
    'The Arts',
    'Backgrounds/Textures',
    'Beauty/Fashion',
    'Buildings/Landmarks',
    'Business/Finance',
    'Celebrities',
    'Drink',
    'Education',
    'Font',
    'Food',
    'Healthcare/Medical',
    'Holidays',
    'Icon',
    'Industrial',
    'Interiors',
    'Logo',
    'Miscellaneous',
    'Nature',
    'Objects',
    'Parks/Outdoor',
    'People',
    'Religion',
    'Science',
    'Signs/Symbols',
    'Sports/Recreation',
    'Technology',
    'Transportation',
    'Vintage'
];
// Total: 30 categories

const state = {
    vectors: [],
    filteredVectors: [],
    managePage: 1,
    manageLimit: 20,
    searchQuery: '',
    filterCat: ''
};

/* ===========================
   INIT
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (sessionStorage.getItem('fv_admin') === ADMIN_KEY) {
        showApp();
    }

    // Login
    document.getElementById('loginBtn').addEventListener('click', doLogin);
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('fv_admin');
        location.reload();
    });

    // Nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });

    // Upload form
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);

    // Manage search/filter
    document.getElementById('searchManage').addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        state.managePage = 1;
        filterAndRenderManage();
    });

    document.getElementById('filterCategory').addEventListener('change', (e) => {
        state.filterCat = e.target.value;
        state.managePage = 1;
        filterAndRenderManage();
    });

    // Populate category filter
    const filterSel = document.getElementById('filterCategory');
    CATEGORIES.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterSel.appendChild(opt);
    });
});

/* ===========================
   LOGIN
   =========================== */
function doLogin() {
    const pw = document.getElementById('loginPassword').value;
    if (pw === ADMIN_KEY) {
        sessionStorage.setItem('fv_admin', pw);
        document.getElementById('loginError').style.display = 'none';
        showApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('loginPassword').value = '';
    }
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    loadDashboard();
    loadManageVectors();
}

/* ===========================
   NAVIGATION
   =========================== */
function switchSection(name) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    document.querySelector(`[data-section="${name}"]`).classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        upload: 'Upload Vector',
        manage: 'Manage Vectors'
    };
    document.getElementById('sectionTitle').textContent = titles[name] || name;
}

/* ===========================
   DASHBOARD
   =========================== */
async function loadDashboard() {
    try {
        const res = await fetch('/api/admin?action=stats', {
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        const data = await res.json();

        document.getElementById('totalVectors').textContent = data.totalVectors || 0;
        document.getElementById('totalDownloads').textContent = data.totalDownloads || 0;
        document.getElementById('totalCategories').textContent = (data.categories || []).length;

        const tbody = document.getElementById('catTableBody');
        tbody.innerHTML = '';
        (data.categories || []).forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escHtml(cat.name)}</td>
                <td>${cat.count}</td>
                <td>${cat.downloads}</td>
            `;
            tbody.appendChild(tr);
        });

        if (!data.categories || data.categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#666;">No data available</td></tr>';
        }
    } catch (e) {
        console.error('Dashboard load error:', e);
    }
}

/* ===========================
   UPLOAD
   =========================== */
async function handleUpload(e) {
    e.preventDefault();

    const jsonFile = document.getElementById('vectorJson').files[0];
    const jpegFile = document.getElementById('vectorJpeg').files[0];
    const zipFile = document.getElementById('vectorZip').files[0];

    if (!jsonFile || !jpegFile || !zipFile) {
        showStatus('error', 'Please select all three files (JSON, JPEG, ZIP).');
        return;
    }

    // Validate JSON
    let metadata;
    try {
        const jsonText = await jsonFile.text();
        metadata = JSON.parse(jsonText);
    } catch (err) {
        showStatus('error', 'Invalid JSON file. Please check the file format.');
        return;
    }

    if (!metadata.category) {
        showStatus('error', 'JSON file must contain a "category" field.');
        return;
    }

    // Validate category against predefined list
    if (!CATEGORIES.includes(metadata.category)) {
        showStatus('error', `Invalid category: "${metadata.category}". Must be one of: ${CATEGORIES.join(', ')}`);
        return;
    }

    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    showStatus('info', 'Uploading to Cloudflare... Please wait.');
    showProgress(true, 10, 'Preparing upload...');

    try {
        const formData = new FormData();
        formData.append('json', jsonFile);
        formData.append('jpeg', jpegFile);
        formData.append('zip', zipFile);

        showProgress(true, 30, 'Uploading files...');

        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'X-Admin-Key': ADMIN_KEY },
            body: formData
        });

        showProgress(true, 80, 'Processing...');

        const data = await res.json();

        if (res.status === 409) {
            showStatus('warning', 'This file has already been uploaded. Duplicate entries are not allowed.');
            showProgress(false);
            uploadBtn.disabled = false;
            return;
        }

        if (!res.ok || data.error) {
            showStatus('error', 'Upload failed: ' + (data.error || 'Unknown error'));
            showProgress(false);
            uploadBtn.disabled = false;
            return;
        }

        showProgress(true, 100, 'Upload complete!');
        showStatus('success', 'Successfully uploaded: ' + jsonFile.name.replace('.json', '') + '. The vector is now live on the site.');

        // Reset form
        document.getElementById('uploadForm').reset();
        uploadBtn.disabled = false;

        // Refresh dashboard and manage
        setTimeout(() => {
            showProgress(false);
            loadDashboard();
            loadManageVectors();
        }, 1500);

    } catch (err) {
        showStatus('error', 'Network error: ' + err.message);
        showProgress(false);
        uploadBtn.disabled = false;
    }
}

function showStatus(type, msg) {
    const box = document.getElementById('uploadStatus');
    box.className = 'status-box ' + type;
    box.textContent = msg;
}

function showProgress(show, pct, text) {
    pct = pct || 0;
    text = text || '';
    const wrap = document.getElementById('progressWrap');
    wrap.style.display = show ? 'block' : 'none';
    if (show) {
        document.getElementById('progressFill').style.width = pct + '%';
        document.getElementById('progressText').textContent = text;
    }
}

/* ===========================
   MANAGE VECTORS
   =========================== */
async function loadManageVectors() {
    try {
        const res = await fetch('/api/admin', {
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.filteredVectors = state.vectors.slice();
        filterAndRenderManage();
    } catch (e) {
        document.getElementById('vectorsTableBody').innerHTML =
            '<tr class="loading-row"><td colspan="6">Failed to load vectors.</td></tr>';
    }
}

function filterAndRenderManage() {
    var filtered = state.vectors.slice();

    if (state.searchQuery) {
        filtered = filtered.filter(function(v) {
            var text = [v.name, v.category].concat(v.keywords || []).join(' ').toLowerCase();
            return text.indexOf(state.searchQuery) !== -1;
        });
    }

    if (state.filterCat) {
        filtered = filtered.filter(function(v) { return v.category === state.filterCat; });
    }

    state.filteredVectors = filtered;
    renderManageTable();
}

function renderManageTable() {
    var tbody = document.getElementById('vectorsTableBody');
    var total = state.filteredVectors.length;
    var totalPages = Math.max(1, Math.ceil(total / state.manageLimit));
    var offset = (state.managePage - 1) * state.manageLimit;
    var page = state.filteredVectors.slice(offset, offset + state.manageLimit);

    tbody.innerHTML = '';

    if (!page.length) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="6">No vectors found.</td></tr>';
        document.getElementById('managePagination').innerHTML = '';
        return;
    }

    page.forEach(function(v) {
        var tr = document.createElement('tr');
        var thumbUrl = '/api/asset?key=assets/' + encodeURIComponent(v.category) + '/' + encodeURIComponent(v.name) + '.jpg';
        tr.innerHTML =
            '<td><img class="vt-thumb" src="' + thumbUrl + '" alt="" onerror="this.src=\'https://placehold.co/48x36/f5f5f5/999?text=?\'"></td>' +
            '<td class="vt-name">' + escHtml(v.title || v.name) + '</td>' +
            '<td class="vt-cat">' + escHtml(v.category || '-') + '</td>' +
            '<td class="vt-date">' + (v.date || '-') + '</td>' +
            '<td class="vt-dl">' + (v.downloads || 0) + '</td>' +
            '<td><button class="btn-delete" data-slug="' + escHtml(v.name) + '">Delete</button></td>';
        tbody.appendChild(tr);
    });

    // Delete handlers
    tbody.querySelectorAll('.btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function() { deleteVector(btn.dataset.slug); });
    });

    renderManagePagination(totalPages);
}

function renderManagePagination(totalPages) {
    var pag = document.getElementById('managePagination');
    pag.innerHTML = '';

    if (totalPages <= 1) return;

    var prevBtn = document.createElement('button');
    prevBtn.className = 'pag-admin-btn';
    prevBtn.textContent = '\u2039';
    prevBtn.disabled = state.managePage === 1;
    prevBtn.addEventListener('click', function() {
        if (state.managePage > 1) { state.managePage--; renderManageTable(); }
    });
    pag.appendChild(prevBtn);

    var info = document.createElement('span');
    info.className = 'pag-admin-info';
    info.textContent = 'Page ' + state.managePage + ' / ' + totalPages + ' (' + state.filteredVectors.length + ' vectors)';
    pag.appendChild(info);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'pag-admin-btn';
    nextBtn.textContent = '\u203a';
    nextBtn.disabled = state.managePage === totalPages;
    nextBtn.addEventListener('click', function() {
        if (state.managePage < totalPages) { state.managePage++; renderManageTable(); }
    });
    pag.appendChild(nextBtn);
}

async function deleteVector(slug) {
    if (!confirm('Are you sure you want to delete "' + slug + '"? This action cannot be undone.')) return;

    try {
        var res = await fetch('/api/admin?slug=' + encodeURIComponent(slug), {
            method: 'DELETE',
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        var data = await res.json();

        if (data.success) {
            state.vectors = state.vectors.filter(function(v) { return v.name !== slug; });
            filterAndRenderManage();
            loadDashboard();
        } else {
            alert('Delete failed: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        alert('Network error: ' + e.message);
    }
}

/* ===========================
   UTILS
   =========================== */
function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
