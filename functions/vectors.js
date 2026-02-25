export async function onRequest(context) {
  try {
    // Bu satır, Cloudflare panelinde bağladığın KV'den verileri çeker
    const data = await context.env.VECTOR_KV.get("vectors_data");
    
    return new Response(data || '{"vectors": []}', {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
