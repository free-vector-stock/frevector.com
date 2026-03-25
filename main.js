const state={vectors:[],currentPage:1,totalPages:1,selectedCategory:'all',searchQuery:'',ourPicksOffset:0};
const MODAL_CONTENTS={
  about:`Frevector.com is an independent design platform...`,
  privacy:`As Frevector.com, we prioritize user privacy...`,
  terms:`Every visitor using Frevector.com is deemed...`,
  contact:`Email: hakankacar2014@gmail.com`
};

async function init(){
  setupCategories();
  setupPagination();
  setupOurPicksArrows();
  setupDownloadPageHandlers();
  setupSearch();
  setupFooterModals();
  await fetchVectors();
}

function setupCategories(){
  const list=document.getElementById('categoriesList');
  const cats=['all','vector','jpeg','Abstract','Animals','The Arts','Backgrounds','Fashion','Buildings','Business','Celebrities','Education','Food','Drink','Medical','Holidays','Industrial','Interiors','Miscellaneous','Nature','Objects','Outdoor','People','Religion','Science','Symbols','Sports','Technology','Transportation','Vintage','Logo','Font','Icon'];
  list.innerHTML='';
  cats.forEach(cat=>{
    const btn=document.createElement('button');
    btn.textContent=cat.toUpperCase();
    btn.onclick=()=>{state.selectedCategory=cat;state.currentPage=1;fetchVectors();};
    list.appendChild(btn);
  });
}

async function fetchVectors(){
  const url=new URL('/api/vectors',window.location.origin);
  url.searchParams.set('page',state.currentPage);
  url.searchParams.set('limit','24');
  if(state.selectedCategory!=='all') url.searchParams.set('category',state.selectedCategory);
  if(state.searchQuery) url.searchParams.set('search',state.searchQuery);
  const res=await fetch(url);
  const data=await res.json();
  state.vectors=data.vectors||[];
  state.totalPages=data.totalPages||1;
  renderVectors();
  renderOurPicks();
  updatePagination();
}

function renderVectors(){
  const grid=document.getElementById('vectorsGrid');
  grid.innerHTML='';
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const img=entry.target;
        img.src=img.dataset.src;
        img.decode().catch(()=>{}); // async decode
        observer.unobserve(img);
      }
    });
  });
  state.vectors.forEach(v=>{
    const card=document.createElement('div');
    card.className='vector-card';
    card.innerHTML=`
      <div class="vc-img-wrap">
        <img class="vc-img" data-src="${v.thumbnail}" alt="${v.title}">
        <span class="vc-type-badge ${v.isJpegOnly?'jpeg':'vector'}">${v.isJpegOnly?'JPEG':'VECTOR'}</span>
      </div>`;
    card.onclick=()=>showDownloadPage(v);
    grid.appendChild(card);
    observer.observe(card.querySelector('img'));
  });
}

function renderOurPicks(){
  const track=document.getElementById('ourPicksTrack');
  track.innerHTML='';
  const shuffled=[...state.vectors].sort(()=>Math.random()-0.5);
  shuffled.forEach(v=>{
    const card=document.createElement('div');
    card.className='vector-card';
    card.innerHTML=`<div class="vc-img-wrap"><img class="vc-img" data-src="${v.thumbnail}" alt="${v.title}"></div>`;
    card.onclick=()=>showDownloadPage(v);
    track.appendChild(card);
  });
}

function scrollOurPicks(dir){
  const track=document.getElementById('ourPicksTrack');
  const cardWidth=160;
  state.ourPicksOffset+=dir*cardWidth;
  const totalWidth=track.scrollWidth;
  const visibleWidth=track.parentElement.offsetWidth;
  if(state.ourPicksOffset<0) state.ourPicksOffset=totalWidth-visibleWidth;
  if(state.ourPicksOffset>totalWidth-visibleWidth) state.ourPicksOffset=0;
  track.style.transform=`translateX(-${state.ourPicksOffset}px)`;
}

function setupOurPicksArrows(){
  document.getElementById('ourPicksPrev').onclick=()=>scrollOurPicks(-1);
  document.getElementById('ourPicksNext').onclick=()=>scrollOurPicks(1);
}

function showDownloadPage(v){
  document.getElementById('dpImage').src=v.thumbnail;
  document.getElementById('dpTitle').textContent=v.title;
  document.getElementById('dpDescription').textContent=v.description||'';
  document.getElementById('dpCategory').textContent=v.category||'-';
  document.getElementById('dpFileSize').textContent=v.fileSize||'-';
  const box=document.getElementById('dpCountdownBox');
  const num=document.getElementById('dpCountdown');
  document.getElementById('downloadPage').style.display='flex';
  document.getElementById('dpDownloadBtn').onclick=()=>{
    let count=4;
    box.style.display='block';
    num.textContent=count;
    const interval=setInterval(()=>{
      count--;
      num.textContent=count;
      if(count===0){
        clearInterval(interval);
        window.open(v.downloadUrl||(`/download/${v.id}`),'_blank');
      }
    },1000);
  };
}

function setupDownloadPageHandlers(){
  document.getElementById('dpClose').onclick=()=>{document.getElementById('downloadPage').style.display='none';};
}

function setupPagination(){
  document.getElementById('prevBtn').onclick=()=>{if(state.currentPage>1){state.currentPage--;fetchVectors();}};
  document.getElementById('nextBtn').onclick=()=>{if(state.currentPage<state.totalPages){state.currentPage++;fetchVectors();}};
}

function updatePagination(){
  document.getElementById('pageNumber').textContent=state.currentPage;
  document.getElementById('pageTotal').textContent=`/ ${state.totalPages}`;
}

function setupSearch(){
  const input=document.getElementById('searchInput');
  input.addEventListener('input',()=>{
    state.searchQuery=input.value.toLowerCase();
    fetchVectors();
  });
}

function setupFooterModals(){
  document.querySelectorAll('.modal-trigger').forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      const key=link.dataset.modal;
      document.getElementById('infoModalBody').textContent=MODAL_CONTENTS[key];
      document.getElementById('infoModal').style.display='flex';
    });
  });
  document.getElementById('infoModalClose').onclick=()=>{document.getElementById('infoModal').style.display='none';};
}

document.addEventListener('DOMContentLoaded',init);
