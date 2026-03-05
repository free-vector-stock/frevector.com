/**
 * Frevector Admin Panel - Frontend Logic
 * Revised: Bulk Upload Only, Drag & Drop, Error Fixes
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
    // ---------------------------

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
            v.name.toLowerCase().includes(state.searchQuery) || 
            v.title.toLowerCase().includes(state.searchQuery) ||
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
        const previewUrl = `/api/asset?category=${v.category}&slug=${v.name}&type=jpg`;
        tr.innerHTML = `
            <td><img src="${previewUrl}" class="preview-img" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='"></td>
            <td><div style="font-weight:600;">${escHtml(v.title)}</div><div style="font-size:11px;color:#888;">${escHtml(v.name)}</div></td>
            <td><span class="badge badge-orange">${escHtml(v.category)}</span></td>
            <td>${v.date}</td>
            <td>${v.downloads}</td>
            <td><button class="btn-delete" onclick="deleteVector('${v.name}')">Delete</button></td>
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

async function handleBulkAnalyze() {
    const fileInput = document.getElementById('bulkFileInput');
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        showBulkStatus('error', 'Lütfen en az bir dosya seçin.');
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
        const result = { baseName, hasJson: !!group.json, hasJpeg: !!group.jpeg, hasZip: !!group.zip, issues: [] };
        if (!group.json) result.issues.push('JSON eksik');
        if (!group.jpeg) result.issues.push('JPEG eksik');
        if (!group.zip) result.issues.push('ZIP eksik');
        if (group.json) {
            try {
                const text = await group.json.text();
                const meta = JSON.parse(text);
                
                // Metadata alanlarını bulalım (case-insensitive)
                const getField = (obj, field) => {
                    const key = Object.keys(obj).find(k => k.toLowerCase() === field.toLowerCase());
                    return key ? obj[key] : null;
                };

                const metaCategory = getField(meta, 'category');
                const metaTitle = getField(meta, 'title');
                
                if (!metaTitle) result.issues.push('Metadata eksik: title');
                
                if (!metaCategory) {
                    result.issues.push('Metadata eksik: category');
                } else {
                    // Mevcut kategorilerle eşleşiyor mu? (Case-insensitive kontrol)
                    const matchedCat = CATEGORIES.find(c => c.toLowerCase() === String(metaCategory).toLowerCase());
                    if (!matchedCat) {
                        // Eğer eşleşme yoksa ama bir değer varsa, Miscellaneous olarak kabul edelim veya hatayı yumuşatalım
                        result.issues.push(`Geçersiz kategori: ${metaCategory}`);
                    } else {
                        // Eşleşen kategoriyi orijinal haliyle set edelim
                        meta.category = matchedCat;
                    }
                }
                
                if (!getField(meta, 'description')) result.issues.push('Metadata eksik: description');
                if (!getField(meta, 'keywords')) result.issues.push('Metadata eksik: keywords');
                
                // Metadata'yı paket içine saklayalım ki yükleme sırasında kullanabilelim
                group.metadata = meta;
                
            } catch (e) { 
                result.issues.push('JSON parse hatası: ' + e.message); 
            }
        }
        result.status = result.issues.length === 0 ? 'ready' : 'warning';
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
        const statusColor = r.status === 'ready' ? 'var(--green)' : 'var(--orange)';
        const statusText = r.status === 'ready' ? 'Hazır' : 'Uyarı';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="font-size: 13px;">${escHtml(r.baseName)}</strong>
                <span style="color: ${statusColor}; font-weight: 600; font-size: 12px;">${statusText}</span>
            </div>
            <div style="font-size: 11px; color: #666;">
                ${r.hasJson ? '✓' : '✗'} JSON | ${r.hasJpeg ? '✓' : '✗'} JPEG | ${r.hasZip ? '✓' : '✗'} ZIP
            </div>
            ${r.issues.length > 0 ? `<div style="font-size: 11px; color: var(--red); margin-top: 4px;">${r.issues.map(i => '• ' + escHtml(i)).join('<br>')}</div>` : ''}
        `;
        list.appendChild(div);
    });
    const ready = results.filter(r => r.status === 'ready').length;
    summary.innerHTML = `<strong>Özet:</strong> ${results.length} paket | <span style="color: var(--green);">✓ ${ready} hazır</span>`;
    document.getElementById('bulkAnalysisResults').style.display = 'block';
    document.getElementById('bulkUploadBtn').disabled = ready === 0;
}

async function handleBulkUpload() {
    const fileInput = document.getElementById('bulkFileInput');
    const files = Array.from(fileInput.files);
    const groups = {};
    for (const file of files) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        if (!groups[baseName]) groups[baseName] = { json: null, jpeg: null, zip: null };
        const ext = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase();
        if (ext === '.json') groups[baseName].json = file;
        else if (['.jpg', '.jpeg'].includes(ext)) groups[baseName].jpeg = file;
        else if (ext === '.zip') groups[baseName].zip = file;
    }

    const readyGroups = Object.entries(groups).filter(([_, g]) => g.json && g.jpeg && g.zip);
    if (readyGroups.length === 0) return;

    document.getElementById('bulkUploadBtn').disabled = true;
    showBulkProgress(true, 0, 'Başlatılıyor...');
    const report = [];
    let done = 0;

    for (const [name, group] of readyGroups) {
        try {
            const formData = new FormData();
            
            // Eğer analiz sırasında metadata düzeltilmişse onu kullanalım, yoksa orijinal dosyayı
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
            if (res.status === 409) report.push({ name, status: 'duplicate', msg: 'Zaten yüklü' });
            else if (res.ok) report.push({ name, status: 'success', msg: 'Başarılı' });
            else report.push({ name, status: 'error', msg: data.error || 'Hata' });
        } catch (e) { report.push({ name, status: 'error', msg: e.message }); }
        done++;
        showBulkProgress(true, Math.round((done / readyGroups.length) * 100), `${done}/${readyGroups.length} yüklendi...`);
    }

    displayBulkUploadReport(report);
    document.getElementById('bulkUploadBtn').disabled = false;
    loadDashboard();
    loadManageVectors();
}

function displayBulkUploadReport(results) {
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    const duplicates = results.filter(r => r.status === 'duplicate').length;
    let html = `<div style="margin-bottom: 10px; font-weight: 600;">Sonuç: ${successful} başarılı, ${failed} hata, ${duplicates} duplicate</div>`;
    results.forEach(r => {
        const color = r.status === 'success' ? 'var(--green)' : (r.status === 'duplicate' ? 'var(--orange)' : 'var(--red)');
        html += `<div style="font-size: 12px; color: ${color};"><strong>${escHtml(r.name)}:</strong> ${escHtml(r.msg)}</div>`;
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

async function loadHealthReport() {
    const grid = document.getElementById('healthGrid');
    const issuesBody = document.getElementById('healthIssuesBody');
    try {
        const res = await fetch('/api/admin?action=stats', { headers: { 'X-Admin-Key': ADMIN_KEY } });
        const data = await res.json();
        const vRes = await fetch('/api/admin', { headers: { 'X-Admin-Key': ADMIN_KEY } });
        const vData = await vRes.json();
        const vectors = vData.vectors || [];
        const issues = [];
        let dups = 0, noTitle = 0, badCat = 0;
        const slugs = new Set();
        vectors.forEach(v => {
            if (slugs.has(v.name)) { dups++; issues.push({ slug: v.name, problem: 'Duplicate Slug', fix: 'Delete duplicate' }); }
            slugs.add(v.name);
            if (!v.title || /\d{5,}/.test(v.title)) { noTitle++; issues.push({ slug: v.name, problem: 'Invalid Title', fix: 'Update JSON' }); }
            if (!CATEGORIES.includes(v.category)) { badCat++; issues.push({ slug: v.name, problem: 'Bad Category', fix: 'Update Category' }); }
        });
        grid.innerHTML = `
            <div class="health-card ok"><div class="health-icon">📦</div><div class="health-label">Total</div><div class="health-value">${data.totalVectors}</div></div>
            <div class="health-card ${dups === 0 ? 'ok' : 'error'}"><div class="health-icon">🔄</div><div class="health-label">Dups</div><div class="health-value">${dups}</div></div>
            <div class="health-card ${noTitle === 0 ? 'ok' : 'warn'}"><div class="health-icon">📝</div><div class="health-label">No Title</div><div class="health-value">${noTitle}</div></div>
        `;
        issuesBody.innerHTML = issues.length ? issues.map(i => `<tr><td>${escHtml(i.slug)}</td><td><span class="badge badge-red">${escHtml(i.problem)}</span></td><td>${escHtml(i.fix)}</td></tr>`).join('') : '<tr><td colspan="3" style="text-align:center;color:var(--green);">No issues</td></tr>';
    } catch (e) { console.error(e); }
}

function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
