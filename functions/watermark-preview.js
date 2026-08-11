/**
 * Produces a separate, low-bandwidth public preview from an existing external JPEG source.
 * It never overwrites the source JPEG, ZIP, or metadata JSON.
 */

export const WATERMARK_PREVIEW_SUFFIX = '-preview-wm.jpg';

export function previewKeyFor(sourceJpegKey) {
  return sourceJpegKey.replace(/\.jpe?g$/i, WATERMARK_PREVIEW_SUFFIX);
}

export async function createWatermarkedPreview({ r2, sourceKey, previewKey, origin }) {
  const assetUrl = new URL('/api/asset', origin);
  assetUrl.searchParams.set('key', sourceKey);
  const watermarkUrl = new URL('/admin/watermark-frevector.png', origin).toString();

  const transformed = await fetch(assetUrl.toString(), {
    cf: {
      image: {
        height: 750,
        fit: 'scale-down',
        quality: 75,
        format: 'jpeg',
        draw: [{ url: watermarkUrl, repeat: true, opacity: 1 }]
      }
    }
  });

  if (!transformed.ok || !transformed.body) {
    throw new Error(`Preview transformation failed with HTTP ${transformed.status}`);
  }

  const previewBytes = await transformed.arrayBuffer();
  if (!previewBytes.byteLength) throw new Error('Preview transformation returned an empty JPEG');

  await r2.put(previewKey, previewBytes, {
    httpMetadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' }
  });

  return { previewKey, bytes: previewBytes.byteLength };
}
