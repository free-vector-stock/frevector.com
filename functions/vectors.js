export async function onRequest(context) {
  try {
    // Paneldeki her iki olası ismi de kontrol ediyoruz
    const kv = context.env.VECTOR_DB || context.env.VECTOR_KV;
    
    if (!kv) {
      return new Response(JSON.stringify({ error: "KV baglantisi bulunamadi. Lutfen Cloudflare Bindings ayarlarini kontrol edin." }), { 
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Veriyi cekiyoruz
    const data = await kv.get("vectors_data");

    // Veri varsa gonder, yoksa bos liste gonder
    return new Response(data || JSON.stringify({ "vectors": [] }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
