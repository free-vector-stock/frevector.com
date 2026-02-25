export async function onRequest(context) {
  try {
    // Hem VECTOR_KV hem de VECTOR_DB isimlerini deniyoruz ki hata payı kalmasın
    const data = await context.env.VECTOR_DB.get("vectors_data") || await context.env.VECTOR_KV.get("vectors_data");

    if (!data) {
      // Eğer veri yoksa boş liste döndür
      return new Response(JSON.stringify({ "vectors": [] }), {
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Veri varsa saf haliyle gönder
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
