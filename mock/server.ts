import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const alerts = readFileSync(join(__dirname, "fixtures", "alerts.json"), "utf-8");
const silences = readFileSync(join(__dirname, "fixtures", "silences.json"), "utf-8");

const PORT = parseInt(process.env.PORT || "9093", 10);

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  const url = req.url?.split("?")[0];

  if (url === "/api/v2/alerts") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(alerts);
    return;
  }

  if (url === "/api/v2/silences") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(silences);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Mock Alertmanager server listening on http://localhost:${PORT}`);
  console.log(`  GET /api/v2/alerts   → ${JSON.parse(alerts).length} alerts`);
  console.log(`  GET /api/v2/silences → ${JSON.parse(silences).length} silences`);
});
