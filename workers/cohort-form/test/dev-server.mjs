// Local endpoint for trying the /cohort form without deploying the Worker.
//
//   node test/dev-server.mjs          # http://127.0.0.1:8787
//
// Point the site at it:
//   NEXT_PUBLIC_COHORT_FORM_ENDPOINT=http://127.0.0.1:8787 npm run dev
//
// Submissions are printed to this terminal instead of being emailed.

import { createServer } from "node:http";
import { createHandler } from "../src/index.js";

const PORT = Number(process.env.PORT ?? 8787);
const ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

const handler = createHandler({
  sendEmail: async (message) => {
    console.log("\n--- cohort interest (local, not emailed) ---");
    console.log(message.text);
    console.log("--- end ---\n");
    return { messageId: "local" };
  },
  sendTelegram: null,
  store: null,
  config: {
    allowedOrigins: ORIGINS,
    notifyTo: "cohort@yablokolabs.com",
    from: "cohort@yablokolabs.com",
    rateLimit: 50,
  },
});

const server = createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);

  const url = `http://127.0.0.1:${PORT}${request.url ?? "/"}`;
  const requestOrigin = request.headers.origin;
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }

  // This harness is local-only. Rewrite the Origin to one the worker allows so
  // a preview host, a LAN IP, and localhost all work, then echo the caller's
  // real origin back below. Deleting it is not enough: Request re-adds it.
  if (requestOrigin) headers.set("origin", ORIGINS[0]);

  const method = request.method ?? "GET";
  const init = { method, headers };
  if (method !== "GET" && method !== "HEAD") init.body = Buffer.concat(chunks);

  const result = await handler(new Request(url, init));
  const responseHeaders = Object.fromEntries(result.headers);
  if (requestOrigin) {
    responseHeaders["access-control-allow-origin"] = requestOrigin;
    responseHeaders["access-control-allow-methods"] = "POST, OPTIONS";
    responseHeaders["access-control-allow-headers"] = "Content-Type, Accept";
    responseHeaders.vary = "Origin";
  }

  response.writeHead(result.status, responseHeaders);
  response.end(Buffer.from(await result.arrayBuffer()));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`cohort-form local endpoint: http://127.0.0.1:${PORT}`);
  console.log(`allowed origins: ${ORIGINS.join(", ")}`);
});
