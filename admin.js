/**
 * Frevector Admin Panel - Frontend Logic
 * Enhanced: System Health report, upload validation feedback, category auto-detection display
 */

const ADMIN_KEY = "vector2026";
const CATEGORIES = [
    'Abstract', 'Animals/Wildlife', 'The Arts', 'Backgrounds/Textures', 'Beauty/Fashion',
    'Buildings/Landmarks', 'Business/Finance', 'Celebrities', 'Drink', 'Education',
    'Font', 'Food', 'Healthcare/Medical', 'Holidays', 'Icon', 'Industrial',
    'Interiors', 'Logo', 'Miscellaneous', 'Nature', 'Objects', 'Parks/Outdoor',
    'People', 'Religion', 'Science', 'Signs/Symbols', 'Sports/Recreation',
    'Technology', 'Transportation', 'Vintage'
];

const state = {
    vectors: [],
    filteredVectors: [],
    managePage: 1,
    manageLimit: 20,
    searchQuery: '',
    filterCat: ''
};

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('fv_admin') === ADMIN_KEY) {
        showApp();
    }

    document.getElementById('loginBtn').addEventListener('click', doLogin);
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('fv_admin');
        location.reload();
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });

    // --- Bulk Upload Handlers ---
    const dropZone = document.getElementById('drop-zone');
    const bulkInput = document.getElementById('bulkFileInput');

    if (dropZone && bulkInput) {
        dropZone.addEventListener('click', () => bulkInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--black)';
            dropZone.style.backgroundColor = '#f0f0f0';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#ccc';
            dropZone.style.backgroundColor = '#f9f9f9';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#ccc';
            dropZone.style.backgroundColor = '#f9f9f9';
            if (e.dataTransfer.files.length > 0) {
                bulkInput.files = e.dataTransfer.files;
                handleBulkAnalyze();
            }
        });
        bulkInput.addEventListener('change', handleBulkAnalyze);
    }

    document.getElementById('bulkAnalyzeBtn')?.addEventListener('click', handleBulkAnalyze);
    document.getElementById('bulkUploadBtn')?.addEventListener('click', handleBulkUpload);

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

    const filterSel = document.getElementById('filterCategory');
    CATEGORIES.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterSel.appendChild(opt);
    });

    document.getElementById('refreshHealthBtn')?.addEventListener('click', loadHealthReport);
    document.getElementById('runCleanupBtn')?.addEventListener('click', runCleanup);
});

function doLogin() {
    const pw = document.getElementById('loginPassword').value;
    if (pw === ADMIN_KEY) {
        sessionStorage.setItem('fv_admin', pw);
        showApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    loadDashboard();
    loadManageVectors();
}

function switchSection(name) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    document.querySelector(`[data-section="${name}"]`).classList.add('active');
    document.getElementById('sectionTitle').textContent = name.charAt(0).toUpperCase() + name.slice(1);
    if (name === 'health') loadHealthReport();
}

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
            tr.innerHTML = `<td>${escHtml(cat.name)}</td><td>${cat.count}</td><td>${cat.downloads}</td>`;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
}

async function loadManageVectors() {
    try {
        const res = await fetch('/api/admin', {
            headers: { 'X-Admin-Key': ADMIN_KEY }
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
    tbody.innerHTML = '';

    const start = (state.managePage - 1) * state.manageLimit;
    const end = start + state.manageLimit;
    const pageItems = state.filteredVectors.slice(start, end);

    if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999;">No vectors found</td></tr>';
        pag.innerHTML = '';
        return;
    }

    pageItems.forEach(v => {
        const tr = document.createElement('tr');
        const previewUrl = `/api/asset?key=assets/${encodeURIComponent(v.category)}/${encodeURIComponent(v.name)}.jpg`;
        tr.innerHTML = `
            <td><img src="${previewUrl}" class="preview-img" onerror="this.src='https://placehold.co/400x300/f5f5f5/999999?text=Preview'"></td>
            <td><div style="font-weight:600;">${escHtml(v.title)}</div><div style="font-size:11px;color:#888;">${escHtml(v.name)}</div></td>
            <td><span class="badge badge-orange">${escHtml(v.category)}</span></td>
            <td>${v.date}</td>
            <td>${v.downloads}</td>
            <td><button class="btn-delete" onclick="deleteVector('${escHtml(v.name)}')">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    renderPagination();
}

function renderPagination() {
    const pag = document.getElementById('managePagination');
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
    if (!confirm(`Are you sure you want to delete "${slug}"?`)) return;
    try {
        const res = await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, {
            method: 'DELETE',
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        const data = await res.json();
        if (data.success) {
            state.vectors = state.vectors.filter(v => v.name !== slug);
            filterAndRenderManage();
            loadDashboard();
        } else { alert('Delete failed: ' + data.error); }
    } catch (e) { alert(e.message); }
}

// ─── BULK ANALYZE ───────────────────────────────────────────────────────────

/**
 * Fuzzy category matching (mirrors backend logic for preview purposes)
 */
function normalizeCategoryClient(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    const exact = CATEGORIES.find(c => c.toLowerCase() === s.toLowerCase());
    if (exact) return exact;
    const firstWord = s.split(/[/\s]/)[0].toLowerCase();
    const startsWith = CATEGORIES.find(c => c.toLowerCase().startsWith(firstWord) && firstWord.length >= 4);
    if (startsWith) return startsWith;
    // Levenshtein
    const threshold = s.length <= 6 ? 2 : 3;
    let best = null, bestDist = Infinity;
    for (const cat of CATEGORIES) {
        const d = levenshteinClient(s.toLowerCase(), cat.toLowerCase());
        if (d < bestDist) { bestDist = d; best = cat; }
        const catFirst = cat.split(/[/\s]/)[0].toLowerCase();
        const d2 = levenshteinClient(s.toLowerCase(), catFirst);
        if (d2 < bestDist) { bestDist = d2; best = cat; }
    }
    return (best && bestDist <= threshold) ? best : null;
}

function categoryFromFilenameClient(filename) {
    if (!filename) return null;
    const base = filename.replace(/\.[^/.]+$/, '');
    const prefix = base.split(/[-_\s]/)[0];
    return normalizeCategoryClient(prefix);
}

function levenshteinClient(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

async function handleBulkAnalyze() {
    const fileInput = document.getElementById('bulkFileInput');
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        showBulkStatus('error', 'Please select at least one file.');
        return;
    }

    const groups = {};
    for (const file of files) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        if (!groups[baseName]) groups[baseName] = { json: null, jpeg: null, zip: null };
        const ext = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase();
        if (ext === '.json') groups[baseName].json = file;
        else if (['.jpg', '.jpeg'].includes(ext)) groups[baseName].jpeg = file;
        else if (ext === '.zip') groups[baseName].zip = file;
    }

    const results = [];
    for (const [baseName, group] of Object.entries(groups)) {
        const result = {
            baseName,
            hasJson: !!group.json,
            hasJpeg: !!group.jpeg,
            hasZip: !!group.zip,
            issues: [],
            warnings: [],
            resolvedCategory: null,
            categorySource: ''
        };

        if (!group.json)  result.issues.push('JSON missing');
        if (!group.jpeg)  result.issues.push('JPEG missing');
        if (!group.zip)   result.issues.push('ZIP missing');

        if (group.json) {
            try {
                const text = await group.json.text();
                const meta = JSON.parse(text);

                const getField = (obj, field) => {
                    const key = Object.keys(obj).find(k => k.toLowerCase() === field.toLowerCase());
                    return key ? obj[key] : null;
                };

                const metaTitle    = getField(meta, 'title');
                const metaKeywords = getField(meta, 'keywords');
                let   metaCategory = getField(meta, 'category');

                // Required fields
                if (!metaTitle || String(metaTitle).trim() === '') {
                    result.issues.push('Metadata error: title is required');
                }
                if (!metaKeywords || (Array.isArray(metaKeywords) && metaKeywords.length === 0)) {
                    result.issues.push('Metadata error: keywords is required');
                }

                // Category resolution
                let resolved = null;
                let source = '';

                if (metaCategory) {
                    resolved = normalizeCategoryClient(String(metaCategory));
                    if (resolved) {
                        source = resolved === metaCategory ? 'json' : `json (auto-corrected from "${metaCategory}")`;
                    }
                }
                if (!resolved) {
                    const fromFile = categoryFromFilenameClient(baseName);
                    if (fromFile) {
                        resolved = fromFile;
                        source = `filename prefix (auto-detected: "${baseName.split(/[-_]/)[0]}" → "${fromFile}")`;
                        result.warnings.push(`Category auto-detected from filename: "${fromFile}"`);
                    }
                }
                if (!resolved) {
                    resolved = 'Miscellaneous';
                    source = 'default fallback';
                    result.warnings.push('Category not found — will be set to "Miscellaneous"');
                }

                result.resolvedCategory = resolved;
                result.categorySource = source;
                meta.category = resolved;
                group.metadata = meta;

            } catch (e) {
                result.issues.push('JSON parse error: ' + e.message);
            }
        }

        result.status = (result.hasJson && result.hasJpeg && result.hasZip && result.issues.length === 0) ? 'ready' : (result.issues.length > 0 ? 'error' : 'warning');
        results.push(result);
    }

    displayBulkAnalysisResults(results);
}

function displayBulkAnalysisResults(results) {
    const list = document.getElementById('bulkPackagesList');
    const summary = document.getElementById('bulkSummary');
    list.innerHTML = '';

    results.forEach(r => {
        const div = document.createElement('div');
        div.style.cssText = `padding: 12px; border-bottom: 1px solid var(--border); background: var(--white);`;

        const isReady = r.status === 'ready';
        const hasErrors = r.issues.length > 0;
        const statusColor = isReady ? 'var(--green)' : (hasErrors ? 'var(--red)' : 'var(--orange)');
        const statusText = isReady ? '✓ Ready' : (hasErrors ? '✗ Error' : '⚠ Warning');

        let catHtml = '';
        if (r.resolvedCategory) {
            catHtml = `<div style="font-size:11px;color:#555;margin-top:3px;">Category: <strong>${escHtml(r.resolvedCategory)}</strong> <span style="color:#999;">(${escHtml(r.categorySource)})</span></div>`;
        }

        let issuesHtml = '';
        if (r.issues.length > 0) {
            issuesHtml = `<div style="font-size:11px;color:var(--red);margin-top:4px;">${r.issues.map(i => '✗ ' + escHtml(i)).join('<br>')}</div>`;
        }
        let warningsHtml = '';
        if (r.warnings.length > 0) {
            warningsHtml = `<div style="font-size:11px;color:var(--orange);margin-top:4px;">${r.warnings.map(w => '⚠ ' + escHtml(w)).join('<br>')}</div>`;
        }

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <strong style="font-size:13px;">${escHtml(r.baseName)}</strong>
                <span style="color:${statusColor};font-weight:600;font-size:12px;">${statusText}</span>
            </div>
            <div style="font-size:11px;color:#666;">
                ${r.hasJson ? '✓' : '✗'} JSON &nbsp;|&nbsp; ${r.hasJpeg ? '✓' : '✗'} JPEG &nbsp;|&nbsp; ${r.hasZip ? '✓' : '✗'} ZIP
            </div>
            ${catHtml}${issuesHtml}${warningsHtml}
        `;
        list.appendChild(div);
    });

    const ready = results.filter(r => r.status === 'ready').length;
    const errors = results.filter(r => r.status === 'error').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    summary.innerHTML = `<strong>Summary:</strong> ${results.length} packages &nbsp;|&nbsp; <span style="color:var(--green);">✓ ${ready} ready</span> &nbsp;|&nbsp; <span style="color:var(--red);">✗ ${errors} errors</span> &nbsp;|&nbsp; <span style="color:var(--orange);">⚠ ${warnings} warnings</span>`;
    document.getElementById('bulkAnalysisResults').style.display = 'block';
    document.getElementById('bulkUploadBtn').disabled = ready === 0;
}

// ─── BULK UPLOAD ─────────────────────────────────────────────────────────────

async function handleBulkUpload() {
    const fileInput = document.getElementById('bulkFileInput');
    const files = Array.from(fileInput.files);
    const groups = {};

    for (const file of files) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        if (!groups[baseName]) groups[baseName] = { json: null, jpeg: null, zip: null, metadata: null };
        const ext = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase();
        if (ext === '.json') groups[baseName].json = file;
        else if (['.jpg', '.jpeg'].includes(ext)) groups[baseName].jpeg = file;
        else if (ext === '.zip') groups[baseName].zip = file;
    }

    // Re-run analysis to get resolved metadata
    for (const [baseName, group] of Object.entries(groups)) {
        if (group.json) {
            try {
                const text = await group.json.text();
                const meta = JSON.parse(text);
                const getField = (obj, field) => {
                    const key = Object.keys(obj).find(k => k.toLowerCase() === field.toLowerCase());
                    return key ? obj[key] : null;
                };
                let metaCategory = getField(meta, 'category');
                let resolved = metaCategory ? normalizeCategoryClient(String(metaCategory)) : null;
                if (!resolved) resolved = categoryFromFilenameClient(baseName);
                if (!resolved) resolved = 'Miscellaneous';
                meta.category = resolved;
                group.metadata = meta;
            } catch (_) {}
        }
    }

    const readyGroups = Object.entries(groups).filter(([_, g]) => g.json && g.jpeg && g.zip);
    if (readyGroups.length === 0) return;

    document.getElementById('bulkUploadBtn').disabled = true;
    showBulkProgress(true, 0, 'Starting...');
    const report = [];
    let done = 0;

    for (const [name, group] of readyGroups) {
        try {
            const formData = new FormData();

            if (group.metadata) {
                const metaBlob = new Blob([JSON.stringify(group.metadata)], { type: 'application/json' });
                formData.append('json', metaBlob, `${name}.json`);
            } else {
                formData.append('json', group.json);
            }

            formData.append('jpeg', group.jpeg);
            formData.append('zip', group.zip);

            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'X-Admin-Key': ADMIN_KEY },
                body: formData
            });
            const data = await res.json();

            if (res.status === 409) {
                report.push({ name, status: 'duplicate', msg: data.message || 'Already uploaded' });
            } else if (res.ok) {
                const catInfo = data.categorySource ? ` [${data.category} via ${data.categorySource}]` : '';
                report.push({ name, status: 'success', msg: `Success${catInfo}` });
            } else {
                report.push({ name, status: 'error', msg: data.error || 'Unknown error' });
            }
        } catch (e) {
            report.push({ name, status: 'error', msg: e.message });
        }
        done++;
        showBulkProgress(true, Math.round((done / readyGroups.length) * 100), `${done}/${readyGroups.length} uploaded...`);
    }

    displayBulkUploadReport(report);
    document.getElementById('bulkUploadBtn').disabled = false;
    loadDashboard();
    loadManageVectors();
}

function displayBulkUploadReport(results) {
    const successful  = results.filter(r => r.status === 'success').length;
    const failed      = results.filter(r => r.status === 'error').length;
    const duplicates  = results.filter(r => r.status === 'duplicate').length;
    let html = `<div style="margin-bottom:10px;font-weight:600;">Result: ${successful} success, ${failed} error, ${duplicates} duplicate</div>`;
    results.forEach(r => {
        const color = r.status === 'success' ? 'var(--green)' : (r.status === 'duplicate' ? 'var(--orange)' : 'var(--red)');
        html += `<div style="font-size:12px;color:${color};margin-bottom:3px;"><strong>${escHtml(r.name)}:</strong> ${escHtml(r.msg)}</div>`;
    });
    document.getElementById('reportContent').innerHTML = html;
    document.getElementById('bulkUploadReport').style.display = 'block';
}

function showBulkStatus(type, msg) {
    const box = document.getElementById('bulkUploadStatus');
    box.className = 'status-box ' + type;
    box.textContent = msg;
    box.style.display = 'block';
}

function showBulkProgress(show, pct, text) {
    const wrap = document.getElementById('bulkProgressWrap');
    wrap.style.display = show ? 'block' : 'none';
    if (show) {
        document.getElementById('bulkProgressFill').style.width = pct + '%';
        document.getElementById('bulkProgressText').textContent = text;
    }
}

// ─── SYSTEM HEALTH REPORT ────────────────────────────────────────────────────

async function loadHealthReport() {
    const grid = document.getElementById('healthGrid');
    const issuesBody = document.getElementById('healthIssuesBody');

    grid.innerHTML = '<div style="color:#999;padding:20px;">Loading health report...</div>';
    issuesBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">Loading...</td></tr>';

    try {
        // Use the dedicated health endpoint
        const [healthRes, statsRes] = await Promise.all([
            fetch('/api/admin?action=health', { headers: { 'X-Admin-Key': ADMIN_KEY } }),
            fetch('/api/admin?action=stats',  { headers: { 'X-Admin-Key': ADMIN_KEY } })
        ]);

        const healthData = await healthRes.json();
        const statsData  = await statsRes.json();

        const issues = healthData.issues || [];
        const total  = healthData.totalVectors || 0;

        // Count by type
        const countByType = (type) => issues.filter(i => i.type === type).length;
        const dupCount     = countByType('duplicate_slug');
        const titleCount   = countByType('invalid_title');
        const catCount     = countByType('bad_category');
        const missingJpg   = countByType('missing_jpg');
        const missingZip   = countByType('missing_zip');

        // Health score
        const totalIssues = issues.length;
        const healthScore = total === 0 ? 100 : Math.max(0, Math.round(((total - totalIssues) / total) * 100));
        const scoreColor  = healthScore >= 90 ? 'var(--green)' : (healthScore >= 70 ? 'var(--orange)' : 'var(--red)');

        grid.innerHTML = `
            <div class="health-card ok">
                <div class="health-icon">📦</div>
                <div class="health-label">Total Vectors</div>
                <div class="health-value">${total}</div>
            </div>
            <div class="health-card ${totalIssues === 0 ? 'ok' : 'error'}">
                <div class="health-icon">🔍</div>
                <div class="health-label">Health Score</div>
                <div class="health-value" style="color:${scoreColor};">${healthScore}%</div>
            </div>
            <div class="health-card ${dupCount === 0 ? 'ok' : 'error'}">
                <div class="health-icon">🔄</div>
                <div class="health-label">Duplicates</div>
                <div class="health-value">${dupCount}</div>
            </div>
            <div class="health-card ${titleCount === 0 ? 'ok' : 'warn'}">
                <div class="health-icon">📝</div>
                <div class="health-label">Bad Titles</div>
                <div class="health-value">${titleCount}</div>
            </div>
            <div class="health-card ${catCount === 0 ? 'ok' : 'warn'}">
                <div class="health-icon">🏷️</div>
                <div class="health-label">Bad Category</div>
                <div class="health-value">${catCount}</div>
            </div>
            <div class="health-card ${missingJpg === 0 ? 'ok' : 'error'}">
                <div class="health-icon">🖼️</div>
                <div class="health-label">Missing JPEG</div>
                <div class="health-value">${missingJpg}</div>
            </div>
            <div class="health-card ${missingZip === 0 ? 'ok' : 'error'}">
                <div class="health-icon">📦</div>
                <div class="health-label">Missing ZIP</div>
                <div class="health-value">${missingZip}</div>
            </div>
            <div class="health-card ok">
                <div class="health-icon">📂</div>
                <div class="health-label">Categories</div>
                <div class="health-value">${(statsData.categories || []).length}</div>
            </div>
        `;

        if (issues.length === 0) {
            issuesBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--green);padding:20px;">✓ No issues found — system is healthy</td></tr>';
        } else {
            issuesBody.innerHTML = issues.map(i => {
                const typeLabel = {
                    duplicate_slug: 'Duplicate Slug',
                    invalid_title:  'Invalid Title',
                    bad_category:   'Bad Category',
                    missing_jpg:    'Missing JPEG',
                    missing_zip:    'Missing ZIP'
                }[i.type] || i.type;
                const badgeColor = ['missing_jpg','missing_zip','duplicate_slug'].includes(i.type) ? 'badge-red' : 'badge-orange';
                const extra = i.current ? ` (${escHtml(i.current)})` : '';
                return `<tr>
                    <td style="font-size:12px;">${escHtml(i.slug)}</td>
                    <td><span class="badge ${badgeColor}">${escHtml(typeLabel)}${extra}</span></td>
                    <td style="font-size:12px;">${escHtml(i.fix)}</td>
                    <td>
                        ${i.type === 'duplicate_slug' ? `<button class="btn-delete" onclick="deleteVector('${escHtml(i.slug)}')">Delete</button>` : ''}
                    </td>
                </tr>`;
            }).join('');
        }

    } catch (e) {
        grid.innerHTML = `<div style="color:var(--red);padding:20px;">Error loading health report: ${escHtml(e.message)}</div>`;
        console.error(e);
    }
}

// ─── CLEANUP ─────────────────────────────────────────────────────────────────

async function runCleanup() {
    if (!confirm('Run cleanup? This will remove KV entries where R2 files are missing and fix invalid categories.')) return;
    try {
        const res = await fetch('/api/admin?action=cleanup', {
            method: 'PATCH',
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        const data = await res.json();
        if (data.success) {
            const { removed, fixed, total } = data.results;
            alert(`Cleanup complete.\nRemoved: ${removed} orphaned entries\nFixed: ${fixed} category issues\nTotal vectors: ${total - removed}`);
            loadHealthReport();
            loadDashboard();
            loadManageVectors();
        } else {
            alert('Cleanup failed: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        alert('Cleanup error: ' + e.message);
    }
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
