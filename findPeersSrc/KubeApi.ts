import { assert } from "./assert.ts";

const KUBERNETES_SERVICE_PROTOCOL =
  Deno.env.get("KUBERNETES_SERVICE_PROTOCOL") ?? "https";
const KUBERNETES_SERVICE_HOST = Deno.env.get("KUBERNETES_SERVICE_HOST");
const KUBERNETES_SERVICE_PORT = (() => {
  const defaultPort = 443;
  const portStr = Deno.env.get("KUBERNETES_SERVICE_PORT");
  if (portStr == null) return defaultPort;
  const portInt = parseInt(portStr, 10);
  if (isNaN(portInt)) return defaultPort;
  return portInt;
})();
const KUBERNETES_SERVICE_TOKEN_PATH =
  Deno.env.get("KUBERNETES_SERVICE_TOKEN_PATH") ??
    "/var/run/secrets/kubernetes.io/serviceaccount/token";
const KUBERNETES_SERVICE_CERT_PATH =
  Deno.env.get("KUBERNETES_SERVICE_CERT_PATH") ??
    "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt";
const POD_NAMESPACE = Deno.env.get("POD_NAMESPACE") ?? "default";
const RETHINK_CLUSTER = Deno.env.get("RETHINK_CLUSTER") ?? "rethinkdb";

class KubeApi {
  host: string;
  port: number;

  constructor(opts: { host: string; port: number }) {
    this.host = opts.host;
    this.port = opts.port;
  }

  async fetch(path: string): Promise<Response> {
    const token = await Deno.readTextFile(KUBERNETES_SERVICE_TOKEN_PATH);
    const caCert = KUBERNETES_SERVICE_PROTOCOL === "https"
      ? await Deno.readTextFile(KUBERNETES_SERVICE_CERT_PATH)
      : null;
    const url = [
      `${KUBERNETES_SERVICE_PROTOCOL}://`,
      `${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}`,
      path,
    ].join("");
    const client = caCert != null
      ? Deno.createHttpClient({ caCerts: [caCert] })
      : undefined;
    const opts: {
      headers: { [key: string]: string };
      client?: Deno.HttpClient;
    } = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    if (client) opts.client = client;
    return fetch(url, opts);
  }

  async getEndpointIPs(): Promise<string[]> {
    const res = await this.fetch(
      `/api/v1/namespaces/${POD_NAMESPACE}/endpoints/${RETHINK_CLUSTER}`,
    );
    if (res.status !== 200) {
      throw new Error("failed to get endpoints status code: " + res.status);
    }
    const body = await res.json();
    const addresses: Array<{ ip: string }> =
      (body?.subsets && body?.subsets[0]?.addresses) ?? [];
    const ips = addresses.map(({ ip }) => ip as string);

    return ips;
  }
}

assert(
  KUBERNETES_SERVICE_HOST != null,
  "KUBERNETES_SERVICE_HOST env is required",
);

export const kubeApi = new KubeApi({
  host: KUBERNETES_SERVICE_HOST,
  port: KUBERNETES_SERVICE_PORT,
});
