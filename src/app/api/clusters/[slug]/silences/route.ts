import { getConfig } from "@/config";
import { Silence, SilenceSchema } from "@/types/alertmanager";
import { z } from "zod";

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
    const response = await fetch(`${sanitizedEndpoint}/api/v2/silences`, {headers});
    if (!response.ok) {
      return new Response("Failed to fetch silences", { status: response.status });
    }

    const data = await response.json();

    const validationResult = z.array(SilenceSchema).safeParse(data);
    if (!validationResult.success) {
      console.error("Validation failed", validationResult.error);
      return new Response("Invalid silences data", { status: 500 });
    }

    // Only fetch active silences by default
    const filteredSilences = validationResult.data.filter(silence => silence.status.state === 'active');

    return new Response(JSON.stringify(filteredSilences), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("error fetching silences", error);
    return new Response("Error fetching silences", { status: 500 });
  }
}
