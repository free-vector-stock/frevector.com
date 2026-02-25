export async function onRequest(context) {
  try {
    // Hem VECTOR_KV hem de VECTOR_DB isimlerini kontrol ediyoruz
    const kv = context.env.VECTOR_DB || context.env.VECTOR_KV;
    
    if (!kv) {
      return new Response(JSON.stringify({ error: "KV baglantisi bulunamadi" }), { status: 500 });
    }

    const data = await kv.get("vectors_data");

    return new Response(data || JSON.stringify({ "vectors": [] }), {
      headers: { 
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
