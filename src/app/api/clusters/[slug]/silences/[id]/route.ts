import { getConfig } from "@/config";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug: cluster, id } = await params;

  // Validate cluster slug
  if (!cluster.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
    return new Response("Invalid cluster name", { status: 400 });
  }

  // Validate id
  if (!id || typeof id !== "string") {
    return new Response("Invalid silence ID", { status: 400 });
  }

  const config = await getConfig();

  const endpoint = config.clusters.find((c) => c.name === cluster)?.endpoint;
  if (!endpoint) {
    return new Response("Cluster not found", { status: 404 });
  }

  const url = new URL(endpoint);
  const auth =
    url.username && url.password
      ? `${url.username}:${url.password}`
      : null;
  url.username = "";
  url.password = "";
  const sanitizedEndpoint = url.toString();

  const headers = new Headers();
  if (auth) {
    headers.set("Authorization", `Basic ${btoa(auth)}`);
  }

  try {
    // IMPORTANT: Alertmanager uses /api/v2/silence/{id} (singular!)
    const response = await fetch(
      `${sanitizedEndpoint}/api/v2/silence/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("error deleting silence", error);
    return new Response("Error deleting silence", { status: 500 });
  }
}
