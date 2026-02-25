export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  try {
    const { password, data } = await context.request.json();
    if (password !== "ALPEREN123") { // Şifreni buradan değiştir
      return new Response(JSON.stringify({ error: "Yetkisiz" }), { status: 401, headers });
    }
    const kv = context.env.VECTOR_KV || context.env.VECTOR_DB;
    await kv.put("vectors_data", JSON.stringify(data));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
