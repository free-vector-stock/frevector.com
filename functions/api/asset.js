/**
 * GET /api/asset?key=filename.jpg
 * Serves files from R2 bucket.
 * Supports both Flat structure and Legacy Category-nested structure.
 * 
 * R2 folder mapping:
 * Animals/Wildlife → Animals
 * Beauty/Fashion → Beauty-Fashion
 * Business/Finance → Business
 * Healthcare/Medical → Healthcare
 * Parks/Outdoor → Parks
 * Signs/Symbols → Signs
 * Sports/Recreation → Sports
 * The Arts → The Arts (with space)
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
        const r2 = context.env.VECTOR_ASSETS;
        if (!r2) return new Response("R2 not configured", { status: 500 });

        const url = new URL(context.request.url);
        const key = url.searchParams.get("key");
        const category = url.searchParams.get("cat"); // Optional category hint
        const r2cat = url.searchParams.get("r2cat"); // Direct R2 folder name

        if (!key) return new Response("Missing key parameter", { status: 400 });

        // Decode URL-encoded key
        const decodedKey = decodeURIComponent(key);
        let object = null;

        // 1. Try with direct R2 folder name if provided
        if (r2cat && !decodedKey.startsWith("assets/")) {
            const r2FolderKey = `assets/${r2cat}/${decodedKey}`;
            object = await r2.get(r2FolderKey);
        }

        // 2. Try with KV category → R2 folder mapping
        if (!object && category && !decodedKey.startsWith("assets/")) {
            const r2Folder = CATEGORY_TO_R2_FOLDER[category];
            if (r2Folder) {
                const mappedKey = `assets/${r2Folder}/${decodedKey}`;
                object = await r2.get(mappedKey);
            }
        }

        // 3. Try flat structure (root level)
        if (!object && !decodedKey.startsWith("assets/")) {
            object = await r2.get(decodedKey);
        }

        // 4. Try legacy structure with category as-is
        if (!object && category && !decodedKey.startsWith("assets/")) {
            const legacyKey = `assets/${category}/${decodedKey}`;
            object = await r2.get(legacyKey);
        }

        // 5. Try all known R2 folders as fallback
        if (!object && !decodedKey.startsWith("assets/")) {
            const r2Folders = Object.values(CATEGORY_TO_R2_FOLDER);
            const uniqueFolders = [...new Set(r2Folders)];
            for (const folder of uniqueFolders) {
                const tryKey = `assets/${folder}/${decodedKey}`;
                object = await r2.get(tryKey);
                if (object) break;
            }
        }

        // 6. If key already has assets/ prefix, use as-is
        if (!object && decodedKey.startsWith("assets/")) {
            object = await r2.get(decodedKey);
        }

        if (!object) {
            // Placeholder for missing images
            if (decodedKey.endsWith(".jpg") || decodedKey.endsWith(".jpeg") || decodedKey.endsWith(".png")) {
                return Response.redirect("https://placehold.co/400x300/f5f5f5/999?text=Preview", 302);
            }
            return new Response("File not found", { status: 404 });
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
            try {
                headers["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
            } catch (e) {
                headers["Content-Disposition"] = `attachment; filename="${downloadName}"`;
            }
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
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
