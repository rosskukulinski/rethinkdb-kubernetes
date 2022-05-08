const RETHINK_HOST = Deno.env.get("RETHINK_HOST") ?? "localhost";
const RETHINK_PORT = (() => {
  const portStr = Deno.env.get("RETHINK_PORT");
  if (portStr == null) return undefined;
  const portInt = parseInt(portStr, 10);
  if (isNaN(portInt)) return undefined;
  return portInt;
})() ?? 8080;

const res = await fetch(
  `http://${RETHINK_HOST}:${RETHINK_PORT}/images/book_alt_16x16.png`,
);
console.log(res.status);
