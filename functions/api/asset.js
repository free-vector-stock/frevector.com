/**
 * GET /api/asset?key=filename.jpg
 * Serves files from R2 bucket.
 * Fixed: Search in category-specific folders.
 */

export async function onRequestGet(context) {
    try {
        const r2 = context.env.VECTOR_ASSETS;
        if (!r2) return new Response("R2 not configured", { status: 500 });

        const url = new URL(context.request.url);
        const key = url.searchParams.get("key");

        if (!key) return new Response("Missing key parameter", { status: 400 });

        // Decode URL-encoded key
        const decodedKey = decodeURIComponent(key);
        let object = null;

        // Try to find file in any category folder
        let r2Key = decodedKey;
        if (!decodedKey.includes('/')) {
            // If no folder specified, search in all category folders
            const categories = ['Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities', 'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous', 'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports', 'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'];
            
            // Extract ID from filename (e.g., abstract-00000003.jpg -> abstract-00000003)
            const id = decodedKey.split('.')[0];
            
            // 1. Try the new structure: Category/vector/ID.ext or Category/jpeg/ID.ext
            for (const cat of categories) {
                // Try vector folder first
                let testKey = `${cat}/vector/${decodedKey}`;
                let testObj = await r2.get(testKey);
                if (testObj) {
                    object = testObj;
                    break;
                }
                
                // Try jpeg folder
                testKey = `${cat}/jpeg/${decodedKey}`;
                testObj = await r2.get(testKey);
                if (testObj) {
                    object = testObj;
                    break;
                }
            }
            
            // 2. Try the previous structure: category-folder/ID.ext
            if (!object) {
                for (const cat of categories) {
                    const catFolder = cat.replace(/\s+/g, '-').toLowerCase();
                    const testKey = `${catFolder}/${decodedKey}`;
                    const testObj = await r2.get(testKey);
                    if (testObj) {
                        object = testObj;
                        break;
                    }
                }
            }
            
            // 3. Fallback to old "icon/" folder
            if (!object) {
                const iconKey = `icon/${decodedKey}`;
                const iconObj = await r2.get(iconKey);
                if (iconObj) object = iconObj;
            }
            
            // 4. Last resort: try root
            if (!object) {
                object = await r2.get(decodedKey);
            }
        } else {
            object = await r2.get(r2Key);
        }

        if (!object) {
            // Try fallback key if provided (e.g., original jpg when thumb not found)
            const fallbackKey = url.searchParams.get("fallback");
            if (fallbackKey) {
                const decodedFallback = decodeURIComponent(fallbackKey);
                object = await r2.get(decodedFallback);
            }
        }

        if (!object) {
            // Placeholder for missing images
            if (decodedKey.endsWith(".jpg") || decodedKey.endsWith(".jpeg") || decodedKey.endsWith(".png")) {
                return Response.redirect("https://placehold.co/400x300/f5f5f5/999?text=Preview", 302);
            }
            return new Response(JSON.stringify({ error: "File not found" }), { status: 404, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        const isZip = decodedKey.endsWith(".zip");
        const isJpeg = decodedKey.endsWith(".jpg") || decodedKey.endsWith(".jpeg");

        const headers = {
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*"
        };

        if (isZip) {
            headers["Content-Type"] = "application/zip";
            const downloadName = decodedKey.split('/').pop();
            headers["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
        } else if (isJpeg) {
            headers["Content-Type"] = "image/jpeg";
        } else {
            headers["Content-Type"] = object.httpMetadata?.contentType || "application/octet-stream";
        }

        if (object.size) headers["Content-Length"] = String(object.size);

        return new Response(object.body, { status: 200, headers });

    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Range",
            "Access-Control-Max-Age": "86400"
        }
    });
}
