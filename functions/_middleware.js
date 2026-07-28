export async function onRequest(context) {
  const url = new URL(context.request.url);

  // WWW to Non-WWW 301 Redirect
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace(/^www\./, '');
    return Response.redirect(url.toString(), 301);
  }

  return await context.next();
}
