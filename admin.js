/**
 * Admin Panel Logic - Geliştirilmiş Versiyon
 */

const state = {
    currentSection: 'dashboard',
    vectors: [],
    stats: {
        totalVectors: 0,
        totalDownloads: 0,
        categories: []
    },
    adminKey: localStorage.getItem('adminKey') || ''
};

// --- BAŞLATMA ---
async function init() {
    if (!state.adminKey) {
        promptLogin();
    } else {
        setupEventListeners();
        await fetchStats();
        await fetchVectors();
    }
}

function promptLogin() {
    const key = prompt("Please enter Admin Access Key:");
    if (key) {
        state.adminKey = key;
        localStorage.setItem('adminKey', key);
        init();
    } else {
        window.location.href = '/';
    }
}

// --- VERİ ÇEKME ---
async function fetchStats() {
    try {
        const response = await fetch('/api/admin?action=stats', {
            headers: { 'X-Admin-Key': state.adminKey }
        });
        if (response.status === 401) {
            localStorage.removeItem('adminKey');
            window.location.reload();
            return;
        }
        const data = await response.json();
        state.stats = data;
        renderStats();
    } catch (e) {
        console.error("Stats fetch error:", e);
    }
}

async function fetchVectors() {
    try {
        const response = await fetch('/api/admin?action=list', {
            headers: { 'X-Admin-Key': state.adminKey }
        });
        const data = await response.json();
        state.vectors = data.vectors || [];
        renderVectorsList();
    } catch (e) {
        console.error("Vectors fetch error:", e);
    }
}

// --- RENDER FONKSİYONLARI ---
function renderStats() {
    const totalVectors = document.getElementById('totalVectors');
    const totalDownloads = document.getElementById('totalDownloads');
    const categoriesList = document.getElementById('categoriesList');

    if (totalVectors) totalVectors.textContent = state.stats.totalVectors;
    if (totalDownloads) totalDownloads.textContent = state.stats.totalDownloads;

    if (categoriesList) {
        categoriesList.innerHTML = '';
        state.stats.categories.forEach(cat => {
            const row = document.createElement('div');
            row.className = 'category-stat-row';
            row.innerHTML = `
                <span>${cat.name}</span>
                <span>${cat.count} vectors</span>
                <span>${cat.downloads} downloads</span>
            `;
            categoriesList.appendChild(row);
        });
    }
}

function renderVectorsList() {
    const list = document.getElementById('vectorsList');
    if (!list) return;

    list.innerHTML = '';
    
    if (state.vectors.length === 0) {
        list.innerHTML = '<p>No vectors uploaded yet.</p>';
        return;
    }

    state.vectors.forEach(v => {
        const item = document.createElement('div');
        item.className = 'vector-list-item';
        item.innerHTML = `
            <div class="vector-list-info">
                <strong>${v.title || v.name}</strong>
                <br>
                <small>${v.category} • ${v.downloads || 0} downloads • ${v.fileSize || '-'}</small>
            </div>
            <div class="vector-list-actions">
                <button onclick="deleteVector('${v.name}')" class="btn-delete">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// --- İŞLEMLER ---
async function deleteVector(slug) {
    if (!confirm(`Are you sure you want to delete ${slug}?`)) return;

    try {
        const response = await fetch(`/api/admin?slug=${slug}`, {
            method: 'DELETE',
            headers: { 'X-Admin-Key': state.adminKey }
        });
        const data = await response.json();
        if (data.success) {
            showStatus("Deleted successfully!", "success");
            await fetchStats();
            await fetchVectors();
        } else {
            showStatus("Error: " + data.error, "error");
        }
    } catch (e) {
        showStatus("Delete failed: " + e.message, "error");
    }
}

async function handleUpload(e) {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('uploadStatus');
    const progress = document.getElementById('uploadProgress');
    
    // Validate files
    const jsonFile = document.getElementById('vectorJson').files[0];
    const jpegFile = document.getElementById('vectorJpeg').files[0];
    const zipFile = document.getElementById('vectorZip').files[0];

    if (!jsonFile || !jpegFile || !zipFile) {
        showStatus("All files are required", "error");
        return;
    }

    // Parse JSON to check validity
    let metadata;
    try {
        metadata = JSON.parse(await jsonFile.text());
    } catch (e) {
        showStatus("Invalid JSON file", "error");
        return;
    }

    const slug = jsonFile.name.replace(/\.json$/, '');
    
    // Check for duplicates
    if (state.vectors.find(v => v.name === slug)) {
        showStatus("THIS FILE HAS ALREADY BEEN UPLOADED", "error");
        return;
    }

    showStatus("Uploading... Please wait.", "info");
    progress.style.display = 'block';

    const formData = new FormData();
    formData.append('json', jsonFile);
    formData.append('jpeg', jpegFile);
    formData.append('zip', zipFile);

    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'X-Admin-Key': state.adminKey },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus("✓ " + data.message, "success");
            form.reset();
            progress.style.display = 'none';
            
            // Refresh data anında
            setTimeout(async () => {
                await fetchStats();
                await fetchVectors();
            }, 500);
        } else {
            if (data.error === "DUPLICATE") {
                showStatus("THIS FILE HAS ALREADY BEEN UPLOADED", "error");
            } else {
                showStatus("Error: " + (data.error || "Upload failed"), "error");
            }
            progress.style.display = 'none';
        }
    } catch (e) {
        showStatus("Upload failed: " + e.message, "error");
        progress.style.display = 'none';
    }
}

function showStatus(message, type) {
    const status = document.getElementById('uploadStatus');
    status.textContent = message;
    status.className = `upload-status ${type}`;
}

// --- SEARCH MANAGE ---
function setupSearchManage() {
    const searchInput = document.getElementById('searchManage');
    if (!searchInput) return;

    searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.vector-list-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
        });
    };
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Navigasyon
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            switchSection(section);
        };
    });

    // Form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) uploadForm.onsubmit = handleUpload;

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = () => {
        localStorage.removeItem('adminKey');
        window.location.href = '/';
    };

    // Search
    setupSearchManage();
}

function switchSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(section).classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    state.currentSection = section;
}

document.addEventListener('DOMContentLoaded', init);
