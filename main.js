/**
 * frevector.com - Frontend Logic
 */

const EXTRA_KEYWORDS = ['free jpeg', 'free', 'jpeg', 'fre'];
const VECTOR_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free eps', 'vector eps', 'svg'];

const CATEGORIES = [
    'Abstract','Animals','The Arts','Backgrounds','Fashion','Buildings','Business','Celebrities',
    'Education','Food','Drink','Medical','Holidays','Industrial','Interiors','Miscellaneous',
    'Nature','Objects','Outdoor','People','Religion','Science','Symbols','Sports',
    'Technology','Transportation','Vintage','Logo','Font','Icon'
];

let observer;
const preloadCache = new Map();

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedCategory: 'all',
    selectedType: 'all',
    searchQuery: '',
    isLoading: false
};

function createObserver(){
    observer = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                const img = entry.target;
                const src = img.dataset.src;
                if(src){
                    const i = new Image();
                    i.src = src;
                    i.decode().then(()=>{
                        img.src = src;
                    });
                }
                observer.unobserve(img);
            }
        });
    },{ rootMargin:'200px' });
}

async function init(){
    createObserver();
    setupEventListeners();
    await fetchVectors();
}

async function fetchVectors(){
    if(state.isLoading) return;
    state.isLoading = true;

    const url = new URL('/api/vectors', location.origin);
    url.searchParams.set('page', state.currentPage);
    url.searchParams.set('limit', '24');

    const res = await fetch(url);
    const data = await res.json();

    state.vectors = data.vectors || [];
    state.totalPages = data.totalPages || 1;

    renderVectors();
    preloadNextPage();

    state.isLoading = false;
}

function renderVectors(){
    const grid = document.getElementById('vectorsGrid');
    grid.innerHTML = '';

    const fragment = document.createDocumentFragment();

    let i = 0;
    function batch(){
        const chunk = 8;
        for(let c=0;c<chunk && i<state.vectors.length;c++,i++){
            const v = state.vectors[i];

            const card = document.createElement('div');
            card.className='vector-card';

            card.innerHTML = `
                <div class="vc-img-wrap">
                    <img class="vc-img" data-src="${v.thumbnail}" alt="${v.title}">
                </div>
                <div class="vc-info">
                    <div class="vc-description">${v.title}</div>
                </div>
            `;

            const img = card.querySelector('img');
            observer.observe(img);

            fragment.appendChild(card);
        }

        grid.appendChild(fragment);

        if(i < state.vectors.length){
            requestIdleCallback(batch);
        }
    }

    batch();
}

function preloadNextPage(){
    if(state.currentPage >= state.totalPages) return;

    const next = state.currentPage + 1;

    if(preloadCache.has(next)) return;

    const url = new URL('/api/vectors', location.origin);
    url.searchParams.set('page', next);
    url.searchParams.set('limit', '24');

    fetch(url)
        .then(r=>r.json())
        .then(d=>{
            preloadCache.set(next,d);
        });
}

function setupEventListeners(){
    document.getElementById('nextBtn').onclick=()=>{
        if(state.currentPage < state.totalPages){
            state.currentPage++;
            fetchVectors();
        }
    };
    document.getElementById('prevBtn').onclick=()=>{
        if(state.currentPage>1){
            state.currentPage--;
            fetchVectors();
        }
    };
}

document.addEventListener('DOMContentLoaded',init);
