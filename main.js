const CATEGORIES = ['Abstract','Animals','Food','Drink','Medical','Nature','Technology','Sports'];

const state = {
  vectors: [],
  currentPage: 1,
  totalPages: 1,
  selectedCategory: 'all',
  searchQuery: '',
  ourPicksOffset: 0
};

async function init() {
  setupCategories();
  setupPagination();
  setupOurPicksArrows();
  setupDownloadPageHandlers();
  await fetchVectors();
}

function setupCategories() {
  const list = document.getElementById('categoriesList');
  list.innerHTML = '';
  ['all',...CATEGORIES].forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.toUpperCase();
    btn.onclick = () => { state.selectedCategory = cat; state.currentPage=1; fetchVectors(); };
    list.appendChild(btn);
  });
}

async function fetchVectors() {
  const url = new URL('/api/vectors', window.location.origin);
  url.searchParams.set('page', state.currentPage);
  url.searchParams.set('limit','24');
  if (state.selectedCategory!=='all') url.searchParams.set('category',state.selectedCategory);
  if (state.searchQuery) url.searchParams.set('search',state.searchQuery);

  const res = await fetch(url);
  const data = await res.json();

  state.vectors = data.vectors || [];
  state.totalPages = data.totalPages || 1;

  renderVectors();
  renderOurPicks();
  updatePagination();
}

function renderVectors() {
  const grid = document.getElementById('vectorsGrid');
  grid.innerHTML = '';
  state.vectors.forEach(v => {
    const card = document.createElement('div');
    card.className = 'vector-card';
    card.innerHTML = `
      <div class="vc-img-wrap">
        <img class="vc-img" src="${v.thumbnail}" alt="${v.title}" loading="lazy">
        <span class="vc-type-badge ${v.isJpegOnly?'jpeg':'vector'}">${v.isJpegOnly?'JPEG':'VECTOR'}</span>
      </div>`;
    card.onclick = () => showDownloadPage(v);
    grid.appendChild(card);
  });
}

function renderOurPicks() {
  const track = document.getElementById('ourPicksTrack');
  track.innerHTML = '';
  const shuffled = [...state.vectors].sort(()=>Math.random()-0.5);
  shuffled.forEach(v=>{
    const card=document.createElement('div');
    card.className='vector-card';
    card.innerHTML=`<div class="vc-img-wrap"><img class="vc-img" src="${v.thumbnail}" alt="${v.title}" loading="lazy"></div>`;
    card.onclick=()=>showDownloadPage(v);
    track.appendChild(card);
  });
}

function scrollOurPicks(dir) {
  const track=document.getElementById('ourPicksTrack');
  const cardWidth=160;
  state.ourPicksOffset+=dir*cardWidth;
  const totalWidth=track.scrollWidth;
  const visibleWidth=track.parentElement.offsetWidth;
  if(state.ourPicksOffset<0) state.ourPicksOffset=totalWidth-visibleWidth;
  if(state.ourPicksOffset>totalWidth-visibleWidth) state.ourPicksOffset=0;
  track.style.transform=`translateX(-${state.ourPicksOffset}px)`;
}

function setupOurPicksArrows() {
  document.getElementById('ourPicksPrev').onclick=()=>scrollOurPicks(-1);
  document.getElementById('ourPicksNext').onclick=()=>scrollOurPicks(1);
}

function showDownloadPage(v) {
  document.getElementById('dpImage').src=v.thumbnail;
  document.getElementById('dpTitle').textContent=v.title;
  document.getElementById('dpDescription').textContent=v.description||'';
  document.getElementById('dpCategory').textContent=v.category||'-';
  document.getElementBy
