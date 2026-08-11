/**
 * GET/POST /api/watermark-settings
 * Controls only the public preview watermark. It never modifies original R2 files.
 */

const ADMIN_PASSWORD = 'vector2026';
const SETTING_KEY = 'preview_watermark_enabled';
const HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

function authenticate(request) {
  const authHeader = request.headers.get('X-Admin-Key') || request.headers.get('Authorization') || '';
  return authHeader.replace('Bearer ', '').trim() === ADMIN_PASSWORD;
}

export async function onRequestGet(context) {
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: HEADERS });
  const enabled = (await context.env.VECTOR_DB.get(SETTING_KEY)) !== 'false';
  return new Response(JSON.stringify({ enabled, watermarkText: 'frevector.com' }), { status: 200, headers: HEADERS });
}

export async function onRequestPost(context) {
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: HEADERS });
  try {
    const body = await context.request.json();
    if (typeof body.enabled !== 'boolean') return new Response(JSON.stringify({ error: 'enabled must be boolean' }), { status: 400, headers: HEADERS });
    await context.env.VECTOR_DB.put(SETTING_KEY, body.enabled ? 'true' : 'false');
    return new Response(JSON.stringify({ success: true, enabled: body.enabled, watermarkText: 'frevector.com' }), { status: 200, headers: HEADERS });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Invalid request' }), { status: 400, headers: HEADERS });
  }
}
