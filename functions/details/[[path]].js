export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (!url.pathname.startsWith("/details/")) {
    return context.next();
  }

  // Cloudflare Pages redirects /index.html to / with 308.
  // We must fetch the root path "/" directly to get the actual HTML content.
  const rootRequest = new Request(new URL("/", url.origin).toString(), {
    method: "GET",
    headers: context.request.headers
  });
  const rootResponse = await context.env.ASSETS.fetch(rootRequest);
  const headers = new Headers(rootResponse.headers);
  headers.set("x-frevector-spa-fallback", "details-route");

  return new Response(rootResponse.body, {
    status: 200,
    statusText: "OK",
    headers
  });
}
