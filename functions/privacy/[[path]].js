export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Fetch the static privacy.html file
  const privacyRequest = new Request(new URL("/privacy.html", url.origin).toString(), {
    method: "GET",
    headers: context.request.headers
  });
  
  const response = await context.env.ASSETS.fetch(privacyRequest);
  
  if (response.status === 404) {
    return context.next();
  }
  
  return response;
}
