export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (!url.pathname.startsWith("/details/")) {
    return context.next();
  }

  const assetRequest = new Request(new URL("/index.html", url.origin).toString(), context.request);
  const assetResponse = await context.env.ASSETS.fetch(assetRequest);
  const headers = new Headers(assetResponse.headers);
  headers.set("x-frevector-spa-fallback", "details-route");

  return new Response(assetResponse.body, {
    status: 200,
    statusText: "OK",
    headers
  });
}
