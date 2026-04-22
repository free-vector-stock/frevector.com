export async function onRequest(context) {
  const url = new URL(context.request.url);
  const privacyRequest = new Request(new URL("/privacy.html", url.origin).toString(), {
    method: "GET",
    headers: context.request.headers
  });
  return context.env.ASSETS.fetch(privacyRequest);
}
