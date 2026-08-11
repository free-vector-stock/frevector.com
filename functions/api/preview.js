/**
 * GET /api/preview?key=Category%2Fid%2Fid.jpg
 * Serves a reversible SVG preview wrapper. Original R2 objects and ZIP downloads are never altered.
 */

const SETTING_KEY = 'preview_watermark_enabled';
const PREVIEW_ASSET_ENDPOINT = 'https://frevector.com/api/asset?key=';
const DEFAULT_DIMENSIONS = { width: 1200, height: 800 };

function isAllowedPreviewKey(key) {
  return /^[A-Za-z0-9 _.-]+\/[A-Za-z0-9 _.-]+\/[A-Za-z0-9_.-]+\.jpe?g$/i.test(key) && !key.includes('..');
}

function publicAssetUrl(key) {
  return `${PREVIEW_ASSET_ENDPOINT}${encodeURIComponent(key)}`;
}

function readJpegDimensions(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    while (offset < bytes.length && bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= bytes.length) break;
    const size = (bytes[offset] << 8) + bytes[offset + 1];
    if (size < 2 || offset + size > bytes.length) break;
    const isSof = (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
    if (isSof && size >= 7) {
      return { height: (bytes[offset + 3] << 8) + bytes[offset + 4], width: (bytes[offset + 5] << 8) + bytes[offset + 6] };
    }
    offset += size;
  }
  return null;
}

function renderPreviewSvg(assetUrl, width, height) {
  const fontSize = Math.max(18, Math.round(width * 0.028));
  const patternWidth = Math.round(fontSize * 8.0);
  const patternHeight = Math.round(fontSize * 3.5);
  const safeUrl = assetUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${safeUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/><defs><pattern id="frevector-watermark" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><text x="${Math.round(patternWidth / 2)}" y="${Math.round(patternHeight * 0.62)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" fill-opacity="0.22" stroke="#555555" stroke-opacity="0.28" stroke-width="1">frevector.com</text></pattern></defs><rect x="0" y="0" width="${width}" height="${height}" fill="url(#frevector-watermark)"/></svg>`;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') || '';
  if (!isAllowedPreviewKey(key)) return new Response('Invalid preview key', { status: 400 });

  const assetUrl = publicAssetUrl(key);
  const enabled = (await context.env.VECTOR_DB.get(SETTING_KEY)) !== 'false';
  if (!enabled) return Response.redirect(assetUrl, 302);

  let dimensions = DEFAULT_DIMENSIONS;
  try {
    const sourceHead = await context.env.VECTOR_ASSETS.get(key, { range: { offset: 0, length: 65536 } });
    const parsed = sourceHead ? readJpegDimensions(await sourceHead.arrayBuffer()) : null;
    if (parsed?.width > 0 && parsed?.height > 0) dimensions = parsed;
  } catch (error) {
    console.warn('Preview dimension lookup failed; using safe fallback dimensions.', error?.message || error);
  }

  return new Response(renderPreviewSvg(assetUrl, dimensions.width, dimensions.height), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
