/**
 * POST /api/watermark-previews?cursor=0&limit=50
 * Creates separate 750px watermarked preview JPEG copies from ZIP-external source JPEGs.
 * The endpoint is admin-authenticated, bounded, resumable, and never overwrites source JPEG/ZIP/JSON.
 */
import { createWatermarkedPreview, previewKeyFor } from '../watermark-preview.js';

const ADMIN_PASSWORD = 'vector2026';
const MAX_LIMIT = 50;

function authenticate(request) {
  const authHeader = request.headers.get('X-Admin-Key') || request.headers.get('Authorization') || '';
  return authHeader.replace('Bearer ', '').trim() === ADMIN_PASSWORD;
}

export async function onRequestPost(context) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

  const url = new URL(context.request.url);
  const cursor = Math.max(0, parseInt(url.searchParams.get('cursor') || '0', 10));
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(url.searchParams.get('limit') || '5', 10)));
  const kv = context.env.VECTOR_DB;
  const r2 = context.env.VECTOR_ASSETS;
  const raw = await kv.get('all_vectors');
  let records = raw ? JSON.parse(raw) : [];
  const total = records.length;
  const end = Math.min(total, cursor + limit);
  const outcomes = [];
  let changed = false;

  const jobs = [];
  for (let index = cursor; index < end; index++) {
    jobs.push((async () => {
      const record = records[index];
      const category = record.category || 'Miscellaneous';
      const sourceKey = `${category}/${record.name}/${record.name}.jpg`;
      const previewKey = record.previewKey || previewKeyFor(sourceKey);
      try {
        const existingPreview = await r2.head(previewKey);
        if (!existingPreview) await createWatermarkedPreview({ r2, sourceKey, previewKey, origin: url.origin });
        records[index] = { ...record, previewKey, previewReady: true, previewHeight: 750 };
        return { name: record.name, status: existingPreview ? 'already-ready' : 'created', changed: true };
      } catch (error) {
        return { name: record.name, status: 'failed', error: error.message || String(error), changed: false };
      }
    })());
  }
  const jobOutcomes = await Promise.all(jobs);
  for (const outcome of jobOutcomes) {
    changed = changed || outcome.changed;
    delete outcome.changed;
    outcomes.push(outcome);
  }

  if (changed) {
    const updatedRaw = JSON.stringify(records);
    await Promise.all([
      kv.put('all_vectors', updatedRaw),
      r2.put('all_vectors.json', updatedRaw, { httpMetadata: { contentType: 'application/json' } })
    ]);
  }

  const complete = end >= total;
  return new Response(JSON.stringify({ success: true, cursor, nextCursor: end, complete, total, processed: end - cursor, outcomes }), { status: 200, headers });
}
