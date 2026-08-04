const ADMIN_KEY = "vector2026";
let state = {
    vectors: [],
    filtered: [],
    filterCat: '',
    search: '',
    section: 'dashboard'
};

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('fv_admin') === ADMIN_KEY) showApp();
    document.getElementById('loginBtn').onclick = login;
    document.getElementById('logoutBtn').onclick = () => { sessionStorage.removeItem('fv_admin'); location.reload(); };
    
    document.getElementById('searchManage').oninput = (e) => { state.search = e.target.value.toLowerCase(); filter(); };
    document.getElementById('filterCategory').onchange = (e) => { state.filterCat = e.target.value; filter(); };
});

function login() {
    if (document.getElementById('loginPassword').value === ADMIN_KEY) {
        sessionStorage.setItem('fv_admin', ADMIN_KEY);
        showApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

async function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    await loadData();
}

async function loadData() {
    const res = await fetch('/api/admin', { headers: { 'X-Admin-Key': ADMIN_KEY } });
    const data = await res.json();
    state.vectors = data.vectors || [];
    renderDashboard();
    renderSidebar();
    filter();
}

function switchSection(s) {
    state.section = s;
    document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
    document.getElementById(s).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(s));
    });
    document.getElementById('sectionTitle').textContent = s.toUpperCase();
}

function renderDashboard() {
    const catMap = {};
    state.vectors.forEach(v => {
        const c = v.category || 'Misc';
        if (!catMap[c]) catMap[c] = { v: 0, j: 0, d: 0 };
        if (v.contentType === 'jpeg') catMap[c].j++; else catMap[c].v++;
        catMap[c].d += (v.downloads || 0);
    });
    document.getElementById('totalVectors').textContent = state.vectors.length;
    document.getElementById('totalDownloads').textContent = state.vectors.reduce((a, b) => a + (b.downloads || 0), 0);
    document.getElementById('catTableBody').innerHTML = Object.keys(catMap).sort().map(c => `
        <tr><td style="padding:10px; border-bottom:1px solid #eee;">${c}</td><td style="padding:10px; border-bottom:1px solid #eee;">${catMap[c].v}</td><td style="padding:10px; border-bottom:1px solid #eee;">${catMap[c].j}</td><td style="padding:10px; border-bottom:1px solid #eee;">${catMap[c].d}</td></tr>
    `).join('');
}

function renderSidebar() {
    const cats = [...new Set(state.vectors.map(v => v.category))].sort();
    const container = document.getElementById('sidebarCategories');
    if(container) {
        container.innerHTML = cats.map(c => `
            <button class="cat-nav-btn ${state.filterCat === c ? 'active' : ''}" onclick="filterByCat('${c.replace(/'/g, "\\'")}')">${c}</button>
        `).join('');
    }
    
    const select = document.getElementById('filterCategory');
    if(select) {
        select.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

function filterByCat(c) {
    state.filterCat = c;
    switchSection('manage');
    const sel = document.getElementById('filterCategory');
    if(sel) sel.value = c;
    filter();
    renderSidebar();
}

function filter() {
    state.filtered = state.vectors.filter(v => {
        const cMatch = !state.filterCat || v.category === state.filterCat;
        const sMatch = !state.search || v.name.toLowerCase().includes(state.search);
        return cMatch && sMatch;
    });
    renderGrid();
}

function renderGrid() {
    const container = document.getElementById('gridContainer');
    if(!container) return;
    
    const itemsPerCol = Math.ceil(state.filtered.length / 4);
    let html = '';
    
    for (let i = 0; i < 4; i++) {
        const colItems = state.filtered.slice(i * itemsPerCol, (i + 1) * itemsPerCol);
        html += '<div class="grid-column">';
        html += '<div class="header-row"><div></div><div>THUMB</div><div style="flex:1">NAME</div><div>TYPE</div><div>CAT</div><div>ACT</div></div>';
        html += colItems.map(v => `
            <div class="item-row">
                <input type="checkbox">
                <img src="/api/asset?key=${encodeURIComponent(v.category + '/' + v.name + '/' + v.name + '.jpg')}">
                <div class="name" title="${v.name}">${v.name}</div>
                <div>${v.contentType === 'jpeg' ? 'jpg' : 'vec'}</div>
                <div>${v.category.substring(0,3)}</div>
                <div><button style="font-size:8px; padding:2px; cursor:pointer;">DEL</button></div>
            </div>
        `).join('');
        html += '</div>';
    }
    container.innerHTML = html;
}
