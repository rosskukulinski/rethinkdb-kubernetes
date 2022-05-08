import {
  connect,
  r,
} from "https://raw.githubusercontent.com/tjmehta/rethinkdb-deno/fixes/mod.ts";

const RETHINK_HOST = Deno.env.get("RETHINK_HOST");
const RETHINK_PORT = (() => {
  const portStr = Deno.env.get("RETHINK_PORT");
  if (portStr == null) return undefined;
  const portInt = parseInt(portStr, 10);
  if (isNaN(portInt)) return undefined;
  return portInt;
})();
const RETHINK_USER = Deno.env.get("RETHINK_USER");
const RETHINK_PASSWORD = Deno.env.get("RETHINK_PASSWORD");

const session = await connect({
  hostname: RETHINK_HOST ?? "localhost",
  port: RETHINK_PORT ?? 28015,
  username: RETHINK_USER,
  password: RETHINK_PASSWORD,
});

const result = await r
  .add(0, 0)
  .run(session);

console.log(result);
