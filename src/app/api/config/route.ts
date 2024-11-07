import { clientConfig } from "@/config/client";

export async function GET(_: Request) {
  return new Response(JSON.stringify(clientConfig), {
    headers: { "Content-Type": "application/json" },
  });
}
