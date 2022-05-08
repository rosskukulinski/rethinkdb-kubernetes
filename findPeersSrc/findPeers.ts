import { kubeApi } from "./KubeApi.ts";

const POD_IP = Deno.env.get("POD_IP") ?? "127.0.0.1";

let endpointIPs = await kubeApi.getEndpointIPs();
endpointIPs = endpointIPs.filter((ip) => ip !== POD_IP);

console.log(endpointIPs.join(" "));
