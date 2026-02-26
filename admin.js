/**
 * Admin Panel Logic
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
    state.vectors.forEach(v => {
        const item = document.createElement('div');
        item.className = 'vector-list-item';
        item.innerHTML = `
            <div class="vector-list-info">
                <strong>${v.name}</strong> - ${v.category} (${v.downloads || 0} downloads)
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
            alert("Deleted successfully!");
            await fetchStats();
            await fetchVectors();
        } else {
            alert("Error: " + data.error);
        }
    } catch (e) {
        alert("Delete failed: " + e.message);
    }
}

async function handleUpload(e) {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('uploadStatus');
    
    status.textContent = "Uploading... Please wait.";
    status.className = "upload-status info";

    const formData = new FormData();
    formData.append('json', document.getElementById('vectorJson').files[0]);
    formData.append('jpeg', document.getElementById('vectorJpeg').files[0]);
    formData.append('zip', document.getElementById('vectorZip').files[0]);

    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'X-Admin-Key': state.adminKey },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            status.textContent = data.message;
            status.className = "upload-status success";
            form.reset();
            await fetchStats();
            await fetchVectors();
        } else {
            if (data.error === "DUPLICATE") {
                status.textContent = "THIS FILE HAS ALREADY BEEN UPLOADED";
                status.className = "upload-status error";
            } else {
                status.textContent = "Error: " + (data.error || "Upload failed");
                status.className = "upload-status error";
            }
        }
    } catch (e) {
        status.textContent = "Upload failed: " + e.message;
        status.className = "upload-status error";
    }
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
}

function switchSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(section).classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    state.currentSection = section;
}

document.addEventListener('DOMContentLoaded', init);
