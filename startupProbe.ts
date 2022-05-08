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

const [serverInfo, statuses] = await Promise.all([
  r
    .server()
    .run(session),
  r
    .db("rethinkdb")
    .table("server_status")
    .pluck("id", "name", "network")
    .run(session),
]);

const serverName: string = serverInfo[0].name;
const serverStatus = statuses.find((status) => status.name === serverName);

let connectedToPeers = false;
for (const peerName in serverStatus.network.connected_to) {
  if (/^proxy/.test(peerName)) continue;
  // found non-proxy peer
  connectedToPeers = true;
  break;
}

if (!connectedToPeers) {
  throw new Error("not connected to any peers");
}
console.log("connected to peers");
