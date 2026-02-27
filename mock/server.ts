import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const alerts = readFileSync(join(__dirname, "fixtures", "alerts.json"), "utf-8");
const silences = readFileSync(join(__dirname, "fixtures", "silences.json"), "utf-8");

const PORT = parseInt(process.env.PORT || "9093", 10);

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url?.split("?")[0];

  // GET /api/v2/alerts
  if (req.method === "GET" && url === "/api/v2/alerts") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(alerts);
    return;
  }

  // GET /api/v2/silences
  if (req.method === "GET" && url === "/api/v2/silences") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(silences);
    return;
  }

  // POST /api/v2/silences
  if (req.method === "POST" && url === "/api/v2/silences") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        // Validate required fields
        if (
          !parsed.matchers ||
          !parsed.startsAt ||
          !parsed.endsAt ||
          !parsed.createdBy ||
          !parsed.comment
        ) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing required fields: matchers, startsAt, endsAt, createdBy, comment");
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ silenceID: randomUUID() }));
      } catch {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON");
      }
    });
    return;
  }

  // DELETE /api/v2/silence/:id
  if (req.method === "DELETE" && url?.startsWith("/api/v2/silence/")) {
    const id = url.substring("/api/v2/silence/".length);
    if (!id) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end("{}");
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
