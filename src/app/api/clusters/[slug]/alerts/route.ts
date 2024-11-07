import { getConfig } from "@/config";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cluster = (await params).slug
  const config = await getConfig()

  const endpoint = config.clusters.find((c) => c.name === cluster)?.endpoint
  if (!endpoint) {
    return new Response("Cluster not found", { status: 404 })
  }

  const url = new URL(endpoint);
  const auth = url.username && url.password ? `${url.username}:${url.password}` : null;
  url.username = '';
  url.password = '';
  const sanitizedEndpoint = url.toString();

  const headers = new Headers();
  if (auth) {
    headers.set('Authorization', `Basic ${btoa(auth)}`);
  }

  try {
    const response = await fetch(`${sanitizedEndpoint}/api/v2/alerts`, {headers});
    if (!response.ok) {
      return new Response("Failed to fetch alerts", { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("error fetching alerts", error);
    return new Response("Error fetching alerts", { status: 500 });
  }
}
