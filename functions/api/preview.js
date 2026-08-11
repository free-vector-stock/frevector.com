/**
 * GET /api/preview?key=Category%2Fid%2Fid.jpg
 * Builds a reversible raster preview with a repeated frevector.com watermark.
 * Original R2 JPEG/ZIP objects are read-only and are never overwritten or deleted.
 */

const SETTING_KEY = 'preview_watermark_enabled';
const MAX_SOURCE_BYTES = 18 * 1024 * 1024;

function isAllowedPreviewKey(key) {
  return /^[A-Za-z0-9 _.-]+\/[A-Za-z0-9 _.-]+\/[A-Za-z0-9_.-]+\.jpe?g$/i.test(key) && !key.includes('..');
}

function bytesToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
  }
  return btoa(binary);
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
    if (isSof && size >= 7) return { height: (bytes[offset + 3] << 8) + bytes[offset + 4], width: (bytes[offset + 5] << 8) + bytes[offset + 6] };
    offset += size;
  }
  return null;
}

function renderPreviewSvg(dataUrl, width, height) {
  const fontSize = Math.max(18, Math.round(width * 0.028));
  const patternWidth = Math.round(fontSize * 8.0);
  const patternHeight = Math.round(fontSize * 3.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${dataUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/><defs><pattern id="frevector-watermark" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><text x="${Math.round(patternWidth / 2)}" y="${Math.round(patternHeight * 0.62)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" fill-opacity="0.22" stroke="#555555" stroke-opacity="0.28" stroke-width="1">frevector.com</text></pattern></defs><rect x="0" y="0" width="${width}" height="${height}" fill="url(#frevector-watermark)"/></svg>`;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') || '';
  if (!isAllowedPreviewKey(key)) return new Response('Invalid preview key', { status: 400 });

  const enabled = (await context.env.VECTOR_DB.get(SETTING_KEY)) !== 'false';
  if (!enabled) return Response.redirect(`https://frevector.com/api/asset?key=${encodeURIComponent(key)}`, 302);

  const source = await context.env.VECTOR_ASSETS.get(key);
  if (!source) return new Response('Preview source not found', { status: 404 });
  if (source.size > MAX_SOURCE_BYTES) return new Response('Preview source is too large', { status: 413 });

  const bytes = await source.arrayBuffer();
  const dimensions = readJpegDimensions(bytes);
  if (!dimensions?.width || !dimensions?.height) return new Response('Invalid JPEG preview source', { status: 415 });

  const dataUrl = `data:image/jpeg;base64,${bytesToBase64(bytes)}`;
  return new Response(renderPreviewSvg(dataUrl, dimensions.width, dimensions.height), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
