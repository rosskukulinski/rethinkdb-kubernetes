const __dirname = new URL(".", import.meta.url).pathname;
const PORT = (() => {
  const defaultPort = 3000;
  const portStr = Deno.env.get("PORT");
  if (portStr == null) return defaultPort;
  const portInt = parseInt(portStr, 10);
  if (isNaN(portInt)) return defaultPort;
  return portInt;
})();
const mockEndpointsBody = Deno.readFileSync(
  __dirname + "mockEndpointsBody.json",
);

// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: PORT });
console.log(`mock kube api running.  Access it at:  http://localhost:${PORT}/`);

// Connections to the server will be yielded up as an async iterable.
for await (const conn of server) {
  // In order to not be blocking, we need to handle each connection individually
  // without awaiting the function
  serveHttp(conn);
}

async function serveHttp(conn: Deno.Conn) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    const request = requestEvent.request;
    const endpointsRegExp = /\/api\/v1\/namespaces\/[^/]+\/endpoints\/.+$/;
    if (endpointsRegExp.test(request.url)) {
      console.log("endpoints request: " + request.url);
      requestEvent.respondWith(
        new Response(mockEndpointsBody, {
          status: 200,
        }),
      );
    } else {
      console.log("request not found: " + request.url);
      requestEvent.respondWith(
        new Response("not found", {
          status: 404,
        }),
      );
    }
  }
}
