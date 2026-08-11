/**
 * Temporary isolated validation endpoint for 750px JPEG resize plus repeated frevector.com watermark.
 * It is not referenced by the public site or admin UI.
 */
const WATERMARK_URL = 'https://frevector.com/admin/watermark-frevector.png';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') || '';
  if (!/^[A-Za-z0-9 _.-]+\/[A-Za-z0-9 _.-]+\/[A-Za-z0-9_.-]+\.jpe?g$/i.test(key) || key.includes('..')) {
    return new Response('Invalid preview key', { status: 400 });
  }
  const source = new URL('https://frevector.com/api/asset');
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
  return new Response(transformed.body, {
    status: transformed.status,
    headers: {
      'Content-Type': transformed.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'no-store',
      'X-Preview-Resize-Test': 'height-750-watermarked'
    }
  });
}
