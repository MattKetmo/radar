import { getConfig } from "@/config";
import { AlertSchema } from "@/types/alertmanager";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cluster = (await params).slug
  
  if (!cluster.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
    return new Response("Invalid cluster name", { status: 400 })
  }
  
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
    
    const validationResult = z.array(AlertSchema).safeParse(data);
    if (!validationResult.success) {
      console.error("Validation failed", validationResult.error);
      return new Response("Invalid alerts data", { status: 500 });
    }
    
    return new Response(JSON.stringify(validationResult.data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("error fetching alerts", error);
    return new Response("Error fetching alerts", { status: 500 });
  }
}
