export async function onRequest(context) {
 const url = new URL(context.request.url);

 // WWW to Non-WWW 301 Redirect
 if (url.hostname.startsWith('www.')) {
 url.hostname = url.hostname.replace(/^www\./, '');
 return Response.redirect(url.toString(), 301);
 }

 // GÖREV 2: /details/{slug}/ trailing slash 301 redirect duplicate URL önleme
 if (url.pathname.startsWith('/details/') && url.pathname.endsWith('/') && url.pathname.length > '/details/'.length) {
 const newPath = url.pathname.replace(/\/$/, '');
 const newUrl = new URL(url.toString());
 newUrl.pathname = newPath;
 return Response.redirect(newUrl.toString(), 301);
 }

 return await context.next();
}
