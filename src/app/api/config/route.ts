import { getConfig } from "@/config";

export async function GET(_: Request) {
  const config = await getConfig()

  // Remove the endpoints from the client config
  const clientConfig = {
    ...config,
    clusters: config.clusters.map((c) => ({
      ...c,
      endpoint: ""
    })),
  }

  return new Response(JSON.stringify(clientConfig), {
    headers: { "Content-Type": "application/json" },
  });
}
