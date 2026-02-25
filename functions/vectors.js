export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    // Cloudflare panelindeki hem KV hem DB isimlerini kontrol eder
    const kv = context.env.VECTOR_KV || context.env.VECTOR_DB;
    
    if (!kv) {
      return new Response(JSON.stringify({ error: "KV Baglantisi Bulunamadi" }), { status: 500, headers });
    }

    const data = await kv.get("vectors_data");

    // Veri varsa gonder, yoksa bos liste gonder
    return new Response(data || JSON.stringify({ "vectors": [] }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
