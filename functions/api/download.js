/**
 * GET /api/download?slug=xxx
 * Increments download counter and serves ZIP file from R2
 */

// Maps KV category names to R2 folder names
const CATEGORY_TO_R2_FOLDER = {
    "Abstract": "Abstract",
    "Animals/Wildlife": "Animals",
    "The Arts": "The Arts",
    "Backgrounds/Textures": "Backgrounds-Textures",
    "Beauty/Fashion": "Beauty-Fashion",
    "Buildings/Landmarks": "Buildings-Landmarks",
    "Business/Finance": "Business",
    "Celebrities": "Celebrities",
    "Drink": "Drink",
    "Education": "Education",
    "Font": "Font",
    "Food": "Food",
    "Healthcare/Medical": "Healthcare",
    "Holidays": "Holidays",
    "Icon": "Icon",
    "Industrial": "Industrial",
    "Interiors": "Interiors",
    "Logo": "Logo",
    "Miscellaneous": "Miscellaneous",
    "Nature": "Nature",
    "Objects": "Objects",
    "Parks/Outdoor": "Parks",
    "People": "People",
    "Religion": "Religion",
    "Science": "Science",
    "Signs/Symbols": "Signs",
    "Sports/Recreation": "Sports",
    "Technology": "Technology",
    "Transportation": "Transportation",
    "Vintage": "Vintage"
};

export async function onRequestGet(context) {
    try {
        const kv = context.env.VECTOR_DB;
        const r2 = context.env.VECTOR_ASSETS;

        if (!kv || !r2) {
            return new Response("Service not configured", { status: 500 });
        }

        const url = new URL(context.request.url);
        const slug = url.searchParams.get("slug");

        if (!slug) {
            return new Response("Missing slug parameter", { status: 400 });
        }

        // Get all vectors from KV
        const allVectorsRaw = await kv.get("all_vectors");
        if (!allVectorsRaw) {
            return new Response("Vector not found", { status: 404 });
        }

        const allVectors = JSON.parse(allVectorsRaw);
        const vectorIndex = allVectors.findIndex(v => v.name === slug);

        if (vectorIndex === -1) {
            return new Response("Vector not found", { status: 404 });
        }

        const vector = allVectors[vectorIndex];
        const cat = vector.category || "Miscellaneous";
        const r2cat = vector.r2_category || CATEGORY_TO_R2_FOLDER[cat] || cat;
        
        let object = null;

        // 1. Try with R2 category folder (primary)
        if (r2cat) {
            object = await r2.get(`assets/${r2cat}/${slug}.zip`);
        }

        // 2. Try flat structure
        if (!object) {
            object = await r2.get(`${slug}.zip`);
        }

        // 3. Try with KV category as folder name
        if (!object && cat) {
            object = await r2.get(`assets/${cat}/${slug}.zip`);
        }

        // 4. Try all known R2 folders as fallback
        if (!object) {
            const r2Folders = Object.values(CATEGORY_TO_R2_FOLDER);
            const uniqueFolders = [...new Set(r2Folders)];
            for (const folder of uniqueFolders) {
                object = await r2.get(`assets/${folder}/${slug}.zip`);
                if (object) break;
            }
        }
        
        if (!object) {
            return new Response("ZIP file not found in storage", { status: 404 });
        }

        // Increment download counter (fire and forget)
        context.waitUntil((async () => {
            try {
                const freshRaw = await kv.get("all_vectors");
                if (freshRaw) {
                    const freshVectors = JSON.parse(freshRaw);
                    const idx = freshVectors.findIndex(v => v.name === slug);
                    if (idx !== -1) {
                        freshVectors[idx].downloads = (freshVectors[idx].downloads || 0) + 1;
                        await kv.put("all_vectors", JSON.stringify(freshVectors));
                    }
                }
            } catch (e) {
                console.error("Counter update failed:", e);
            }
        })());

        const headers = {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${slug}.zip"`,
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*"
        };

        if (object.size) {
            headers["Content-Length"] = String(object.size);
        }

        return new Response(object.body, { status: 200, headers });

    } catch (e) {
        console.error("Download error:", e);
        return new Response(e.message, { status: 500 });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
