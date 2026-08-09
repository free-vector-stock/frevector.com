/**
 * GET /api/sync
 * Utility to manually sync KV to R2
 */

const ADMIN_PASSWORD = "vector2026";

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
};

async function authenticate(context) {
    const url = new URL(context.request.url);
    return url.searchParams.get("key") === ADMIN_PASSWORD;
}

function isBadFileSize(value) {
    return value === null || value === undefined || value === "" || value === 0 || (typeof value === "string" && (value.trim().toUpperCase() === "N/A" || value.trim() === "0"));
}

function sizeLabel(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const key = url.searchParams.get("key");

    if (key !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
    }

    try {
        const kv = context.env.VECTOR_DB;
        const r2 = context.env.VECTOR_ASSETS;

        const allVectorsRaw = await kv.get("all_vectors");
        if (!allVectorsRaw) {
            return new Response(JSON.stringify({ error: "No data in KV to sync" }), { status: 404, headers: CORS_HEADERS });
        }

        await r2.put("all_vectors.json", allVectorsRaw, { 
            httpMetadata: { contentType: "application/json" } 
        });

        return new Response(JSON.stringify({ success: true, message: "KV synced to R2 successfully" }), { 
            status: 200, 
            headers: CORS_HEADERS 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}


export async function onRequestPost(context) {
    const headers = { ...CORS_HEADERS };
    if (!authenticate(context)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    }

    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const raw = await kv.get("all_vectors");
    if (!raw) return new Response(JSON.stringify({ error: "No data in KV" }), { status: 404, headers });

    const vectors = JSON.parse(raw);
    const before = JSON.parse(JSON.stringify(vectors));
    const changed = [];
    const missing = [];

    for (const vector of vectors) {
        if (!isBadFileSize(vector.fileSize)) continue;
        const category = vector.category || "Miscellaneous";
        const id = vector.name;
        const base = `${category}/${id}/${id}`;
        const preferred = vector.contentType === "jpeg" ? ["jpg", "zip"] : ["zip", "jpg"];
        let objectSize = null;
        let usedKey = null;
        for (const ext of preferred) {
            const key = `${base}.${ext}`;
            const object = await r2.head(key);
            if (object && typeof object.size === "number" && object.size > 0) {
                objectSize = object.size;
                usedKey = key;
                break;
            }
        }
        if (objectSize === null) {
            missing.push({ name: id, category });
            continue;
        }
        const next = sizeLabel(objectSize);
        changed.push({ name: id, category, before: vector.fileSize, after: next, source: usedKey, bytes: objectSize });
        vector.fileSize = next;
    }

    const updatedRaw = JSON.stringify(vectors);
    await Promise.all([
        kv.put("all_vectors", updatedRaw),
        r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } })
    ]);

    return new Response(JSON.stringify({
        success: true,
        total: vectors.length,
        changedCount: changed.length,
        missingCount: missing.length,
        changed,
        missing,
        fieldsChangedOnly: ["fileSize"],
        beforeAfterEqualExceptFileSize: before.every((oldVector, i) => {
            const nextVector = vectors[i];
            const oldCopy = { ...oldVector }; delete oldCopy.fileSize;
            const nextCopy = { ...nextVector }; delete nextCopy.fileSize;
            return JSON.stringify(oldCopy) === JSON.stringify(nextCopy);
        })
    }), { status: 200, headers });
}
