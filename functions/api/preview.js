/**
 * GET /api/preview?key=Category%2Fid%2Fid.jpg
 * Transitional public preview for records whose separate 750px preview copy is not ready yet.
 * It reads only the ZIP-external JPEG and never modifies source JPEG, ZIP, or metadata JSON.
 */

const SETTING_KEY = 'preview_watermark_enabled';
const WATERMARK_URL = 'https://frevector.com/admin/watermark-frevector.png';

function isAllowedPreviewKey(key) {
  return /^[A-Za-z0-9 _.-]+\/[A-Za-z0-9 _.-]+\/[A-Za-z0-9_.-]+\.jpe?g$/i.test(key) && !key.includes('..');
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') || '';
  if (!isAllowedPreviewKey(key)) return new Response('Invalid preview key', { status: 400 });

  const enabled = (await context.env.VECTOR_DB.get(SETTING_KEY)) !== 'false';
  if (!enabled) return Response.redirect(`https://frevector.com/api/asset?key=${encodeURIComponent(key)}`, 302);

  const source = new URL('/api/asset', url.origin);
  source.searchParams.set('key', key);
  const transformed = await fetch(source.toString(), {
    cf: {
      image: {
        height: 750,
        fit: 'scale-down',
        quality: 75,
        format: 'jpeg',
        draw: [{ url: WATERMARK_URL, repeat: true, opacity: 1 }]
      }
    }
  });

  if (!transformed.ok || !transformed.body) {
    return new Response('Preview transformation failed', { status: transformed.status || 502 });
  }
  return new Response(transformed.body, {
    status: transformed.status,
    headers: {
      'Content-Type': transformed.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
