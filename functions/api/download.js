/**
 * GET /api/download?slug=xxx
 * Increments download counter and serves ZIP file from R2
 * Optimized for the new "icon/" folder structure.
 */

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
        
        let object = null;

        // 1. Try with the new "icon/" folder structure (Requirement)
        object = await r2.get(`icon/${slug}.zip`);

        // 2. Fallback to legacy structure (for existing files)
        if (!object) {
            const legacyFolders = [
                "Abstract", "Animals", "The Arts", "Backgrounds-Textures", "Beauty-Fashion",
                "Buildings-Landmarks", "Business", "Celebrities", "Drink", "Education",
                "Font", "Food", "Healthcare", "Holidays", "Icon", "Industrial",
                "Interiors", "Logo", "Miscellaneous", "Nature", "Objects", "Parks",
                "People", "Religion", "Science", "Signs", "Sports", "Technology",
                "Transportation", "Vintage"
            ];
            
            for (const folder of legacyFolders) {
                object = await r2.get(`assets/${folder}/${slug}.zip`);
                if (object) break;
            }
            
            if (!object) {
                // Try flat root
                object = await r2.get(`${slug}.zip`);
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
