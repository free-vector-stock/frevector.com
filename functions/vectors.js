export async function onRequest(context) {
  try {
    // Paneldeki ismin ne olursa olsun (VECTOR_KV veya VECTOR_DB) hepsini deniyoruz
    const kv = context.env.VECTOR_KV || context.env.VECTOR_DB || context.env.VECTOR_KV_;
    
    if (!kv) {
      throw new Error("KV baglantisi kurulamadi. Lutfen Cloudflare panelinden Binding ayarlarini kontrol edin.");
    }

    const data = await kv.get("vectors_data");

    if (!data) {
      return new Response(JSON.stringify({ "vectors": [] }), {
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(data, {
      headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
