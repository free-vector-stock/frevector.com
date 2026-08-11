/**
 * POST /api/watermark-previews?cursor=<R2 cursor>
 * Scans current R2 objects, creates separate 750px watermarked previews from ZIP-external JPEGs,
 * and never rewrites source JPEG, ZIP, JSON, or the all_vectors index during migration.
 */
import { createWatermarkedPreview, previewKeyFor } from '../watermark-preview.js';

const ADMIN_PASSWORD = 'vector2026';
const PAGE_LIMIT = 200;
const COMPLETE_KEY = 'preview_copy_migration_complete';

function authenticate(request) {
  const authHeader = request.headers.get('X-Admin-Key') || request.headers.get('Authorization') || '';
  return authHeader.replace('Bearer ', '').trim() === ADMIN_PASSWORD;
}

function isSourceJpeg(key) {
  return /\.jpe?g$/i.test(key) && !/-preview-wm\.jpe?g$/i.test(key) && key.split('/').length === 3;
}

export async function onRequestPost(context) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

  const url = new URL(context.request.url);
  const cursor = url.searchParams.get('cursor') || undefined;
  const r2 = context.env.VECTOR_ASSETS;
  const kv = context.env.VECTOR_DB;
  const listed = await r2.list({ cursor, limit: PAGE_LIMIT });
  const sourceKeys = listed.objects.map(item => item.key).filter(isSourceJpeg);

  const outcomes = await Promise.all(sourceKeys.map(async sourceKey => {
    const previewKey = previewKeyFor(sourceKey);
    try {
      const existingPreview = await r2.head(previewKey);
      if (!existingPreview) await createWatermarkedPreview({ r2, sourceKey, previewKey, origin: url.origin });
      return { sourceKey, status: existingPreview ? 'already-ready' : 'created' };
    } catch (error) {
      return { sourceKey, status: 'failed', error: error.message || String(error) };
    }
  }));

  const complete = !listed.truncated;
  if (complete && !outcomes.some(item => item.status === 'failed')) {
    await kv.put(COMPLETE_KEY, 'true');
  }

  return new Response(JSON.stringify({
    success: true,
    cursor: cursor || null,
    nextCursor: listed.cursor || null,
    complete,
    scannedObjects: listed.objects.length,
    processedSourceJpegs: sourceKeys.length,
    outcomes
  }), { status: 200, headers });
}
