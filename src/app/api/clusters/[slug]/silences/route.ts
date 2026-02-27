import { getConfig } from "@/config";
import { SilenceSchema, SilenceCreateSchema } from "@/types/alertmanager";
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
  const sanitizedEndpoint = url.toString().replace(/\/$/, '');

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cluster = (await params).slug

  if (!cluster.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
    return new Response("Invalid cluster name", { status: 400 })
  }

  let body;
  try {
    body = await request.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const validation = SilenceCreateSchema.safeParse(body)
  if (!validation.success) {
    console.error("Validation failed", validation.error.issues)
    return new Response(JSON.stringify(validation.error.issues), { status: 400, headers: { "Content-Type": "application/json" } })
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
  const sanitizedEndpoint = url.toString().replace(/\/$/, '');

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (auth) {
    headers.set('Authorization', `Basic ${btoa(auth)}`);
  }

  try {

    const response = await fetch(`${sanitizedEndpoint}/api/v2/silences`, {
      method: 'POST',
      headers,
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ silenceID: data.silenceID });
  } catch (error) {
    console.error("error creating silence", error);
    return new Response("Error creating silence", { status: 500 });
  }
}
