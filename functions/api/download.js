/**
 * GET /api/download?slug=xxx
 * Increments download counter and serves ZIP (vector) or JPEG (jpeg-only) file from R2
 * UPDATED: Added time-based download tracking (Last 24h and Monthly)
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

        // Find vector in KV
        const allVectorsRaw = await kv.get("all_vectors");
        const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
        const vector = allVectors.find(v => v.name === slug);
        
        let object = null;
        let filename = slug;
        let contentType = "application/zip";
        let isJpeg = false;

        const categories = ['Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities', 'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous', 'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports', 'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'];

        if (vector) {
            const category = vector.category || "Miscellaneous";
            // Try ZIP first (vector content)
            object = await r2.get(`${category}/${slug}/${slug}.zip`);
            
            // If no ZIP, try JPEG (jpeg-only content)
            if (!object) {
                object = await r2.get(`${category}/${slug}/${slug}.jpg`);
                if (object) {
                    isJpeg = true;
                    contentType = "image/jpeg";
                    filename = slug + ".jpg";
                }
            }
            
            // Fallback: old folder structure
            if (!object) {
                const categoryFolder = category.replace(/\s+/g, '-').toLowerCase();
                object = await r2.get(`${categoryFolder}/${slug}.zip`);
                if (!object) {
                    object = await r2.get(`${categoryFolder}/${slug}.jpg`);
                    if (object) {
                        isJpeg = true;
                        contentType = "image/jpeg";
                        filename = slug + ".jpg";
                    }
                }
            }
        }
        
        // Fallback: search all categories
        if (!object) {
            for (const cat of categories) {
                const zipObj = await r2.get(`${cat}/${slug}/${slug}.zip`);
                if (zipObj) { object = zipObj; break; }
                const jpgObj = await r2.get(`${cat}/${slug}/${slug}.jpg`);
                if (jpgObj) { 
                    object = jpgObj; 
                    isJpeg = true;
                    contentType = "image/jpeg";
                    filename = slug + ".jpg";
                    break; 
                }
            }
            
            if (!object) {
                for (const cat of categories) {
                    const catFolder = cat.replace(/\s+/g, '-').toLowerCase();
                    const zipObj = await r2.get(`${catFolder}/${slug}.zip`);
                    if (zipObj) { object = zipObj; break; }
                }
            }

            if (!object) {
                object = await r2.get(`${slug}.zip`);
            }
        }
        
        if (!object) {
            return new Response("File not found in storage", { status: 404 });
        }

        // Increment download counter
        context.waitUntil((async () => {
            try {
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const monthStr = dateStr.substring(0, 7); // YYYY-MM
                const hourStr = now.toISOString().substring(0, 13); // YYYY-MM-DDTHH

                // 1. Update individual file counter in downloads_count table
                const countKey = `downloads_count:${slug}`;
                const currentCount = await kv.get(countKey);
                const newCount = (parseInt(currentCount) || 0) + 1;
                await kv.put(countKey, newCount.toString());

                // 2. Update time-based counters
                // Hourly counter (for last 24h calculation)
                const hourKey = `dl_stats:hour:${hourStr}`;
                const currentHourCount = await kv.get(hourKey);
                await kv.put(hourKey, ((parseInt(currentHourCount) || 0) + 1).toString(), { expirationTtl: 172800 }); // Keep for 48h

                // Monthly counter
                const monthKey = `dl_stats:month:${monthStr}`;
                const currentMonthCount = await kv.get(monthKey);
                await kv.put(monthKey, ((parseInt(currentMonthCount) || 0) + 1).toString());

                // 3. Also update the main index for backward compatibility and dashboard
                const freshRaw = await kv.get("all_vectors");
                if (freshRaw) {
                    const freshVectors = JSON.parse(freshRaw);
                    const idx = freshVectors.findIndex(v => v.name === slug);
                    if (idx !== -1) {
                        freshVectors[idx].downloads = newCount;
                        await kv.put("all_vectors", JSON.stringify(freshVectors));
                    }
                }
            } catch (e) {
                console.error("Counter update failed:", e);
            }
        })());

        const disposition = isJpeg 
            ? `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
            : `attachment; filename*=UTF-8''${encodeURIComponent(slug)}.zip`;

        const headers = {
            "Content-Type": contentType,
            "Content-Disposition": disposition,
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
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
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400"
        }
    });
}
