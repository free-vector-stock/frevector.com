/**
 * GET /api/categories
 * Returns list of all categories with vector counts, sorted A-Z
 * Shows all predefined categories even if count is 0
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300"
};

// All predefined categories (A-Z)
const ALL_CATEGORIES = [
    "Abstract",
    "Animals/Wildlife",
    "The Arts",
    "Backgrounds/Textures",
    "Beauty/Fashion",
    "Buildings/Landmarks",
    "Business/Finance",
    "Celebrities",
    "Drink",
    "Education",
    "Font",
    "Food",
    "Healthcare/Medical",
    "Holidays",
    "Icon",
    "Industrial",
    "Interiors",
    "Logo",
    "Miscellaneous",
    "Nature",
    "Objects",
    "Parks/Outdoor",
    "People",
    "Religion",
    "Science",
    "Signs/Symbols",
    "Sports/Recreation",
    "Technology",
    "Transportation",
    "Vintage"
];

export async function onRequestGet(context) {
    try {
        const kv = context.env.VECTOR_DB;
        if (!kv) {
            // Return predefined categories with 0 counts if KV not available
            const categories = ALL_CATEGORIES.map(name => ({ name, count: 0 }));
            return new Response(JSON.stringify({ categories, total: 0 }), {
                status: 200,
                headers: CORS_HEADERS
            });
        }

        const allVectorsRaw = await kv.get("all_vectors");
        const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

        // Count by category from KV data
        const categoryCounts = {};
        for (const v of allVectors) {
            const cat = v.category || "Miscellaneous";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }

        // Merge with predefined categories, sort A-Z
        const categories = ALL_CATEGORIES.map(name => ({
            name,
            count: categoryCounts[name] || 0
        }));

        // Also add any categories from KV that aren't in predefined list
        for (const [name, count] of Object.entries(categoryCounts)) {
            if (!ALL_CATEGORIES.includes(name)) {
                categories.push({ name, count });
            }
        }

        // Sort A-Z
        categories.sort((a, b) => a.name.localeCompare(b.name));

        return new Response(JSON.stringify({ categories, total: allVectors.length }), {
            status: 200,
            headers: CORS_HEADERS
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
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
