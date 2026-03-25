/**
 * GET /api/vectors
 * Returns paginated vector list with Global Memory Cache for high performance.
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60"
};

// --- GLOBAL MEMORY CACHE ---
// Bu değişkenler her istekte sıfırlanmaz, Worker hayatta kaldığı sürece veriyi hafızada tutar.
let cachedVectors = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 Dakika (Milisaniye cinsinden)

export async function onRequestGet(context) {
    const cache = caches.default;
    const url = new URL(context.request.url);
    
    // 1. Edge Cache Kontrolü (Cloudflare'ın kendi ağındaki önbellek)
    const cacheResponse = await cache.match(context.request);
    if (cacheResponse) {
        return cacheResponse;
    }

    try {
        const r2 = context.env.VECTOR_ASSETS;
        const now = Date.now();

        // 2. HAFIZA KONTROLÜ (Performance Boost)
        // Eğer veri henüz çekilmemişse veya 10 dakikadan eski ise R2'den taze veriyi çek.
        if (!cachedVectors || (now - lastFetchTime > CACHE_DURATION)) {
            const r2Object = await r2.get("all_vectors.json");
            if (r2Object) {
                const allVectorsRaw = await r2Object.text();
                cachedVectors = JSON.parse(allVectorsRaw);
                lastFetchTime = now;
            } else {
                // R2'de dosya yoksa KV fallback (Senin orijinal mantığın)
                const kv = context.env.VECTOR_DB;
                const kvRaw = await kv.get("all_vectors");
                if (kvRaw) {
                    cachedVectors = JSON.parse(kvRaw);
                    lastFetchTime = now;
                }
            }
        }

        // Eğer hala veri yoksa boş dön
        if (!cachedVectors) {
            return new Response(JSON.stringify({ vectors: [], total: 0, page: 1, totalPages: 0 }), { status: 200, headers: CORS_HEADERS });
        }

        // 3. FİLTRELEME İŞLEMLERİ (Artık doğrudan hafızadaki 'cachedVectors' üzerinden yapılıyor)
        const slug = url.searchParams.get("slug");
        const category = url.searchParams.get("category") || "";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "24")));
        const search = (url.searchParams.get("search") || "").toLowerCase().trim();
        const sort = url.searchParams.get("sort") || "";
        const type = url.searchParams.get("type") || ""; 

        let allVectors = [...cachedVectors]; // Orijinal veriyi bozmamak için kopyasını alıyoruz.

        // Tekli Görünüm (Slug)
        if (slug) {
            const vector = allVectors.find(v => v.name === slug);
            if (!vector) return new Response(JSON.stringify({ error: "Vector not found" }), { status: 404, headers: CORS_HEADERS });
            const response = new Response(JSON.stringify(enrichVector(vector)), { status: 200, headers: CORS_HEADERS });
            context.waitUntil(cache.put(context.request, response.clone()));
            return response;
        }

        // Kategori Filtresi
        if (category && category !== "all") {
            const catLower = category.toLowerCase().trim();
            allVectors = allVectors.filter(v => (v.category || "").toLowerCase().trim() === catLower);
        }

        // Tip Filtresi (Vector / JPEG)
        if (type === "vector") {
            allVectors = allVectors.filter(v => v.contentType !== "jpeg");
        } else if (type === "jpeg") {
            allVectors = allVectors.filter(v => v.contentType === "jpeg");
        }

        // Arama Filtresi
        if (search) {
            const terms = search.split(/\s+/).filter(Boolean);
            allVectors = allVectors.filter(v => {
                const title = (v.title || "").toLowerCase();
                const keywords = (v.keywords || []).map(k => k.toLowerCase());
                const description = (v.description || "").toLowerCase();
                return terms.some(t => title.includes(t) || keywords.some(k => k.includes(t)) || description.includes(t));
            });
        }

        // Sıralama (Sort)
        if (sort === "oldest") {
            allVectors.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        } else {
            allVectors.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        }

        // 4. SAYFALAMA (Pagination)
        const total = allVectors.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const validPage = Math.min(page, totalPages);
        const offset = (validPage - 1) * limit;
        const pageVectors = allVectors.slice(offset, offset + limit);

        const result = {
            vectors: pageVectors.map(enrichVector),
            total,
            page: validPage,
            totalPages,
            category: category || "all"
        };

        const response = new Response(JSON.stringify(result), { status: 200, headers: CORS_HEADERS });
        
        // Yanıtı tarayıcı ve kenar sunucu için önbelleğe al
        context.waitUntil(cache.put(context.request, response.clone()));

        return response;

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

/**
 * Görsel yollarını ve meta verileri zenginleştirir.
 */
function enrichVector(v) {
    const id = v.name;
    const category = v.category || "Miscellaneous";
    const thumbKey = `${category}/${id}/${id}.jpg`;
    const isJpegOnly = v.contentType === 'jpeg';

    return {
        ...v,
        title: v.title || v.name || "",
        thumbnail: `/api/asset?key=${encodeURIComponent(thumbKey)}`,
        isJpegOnly: isJpegOnly
    };
}
