import * as restate from "@restatedev/restate-sdk";
import { config } from "./config.js";
import { leadRegistry } from "./lead-registry.js";
import { prospectLoop } from "./prospect-loop.js";
import { outreachWorkflow } from "./outreach.js";

/**
 * Polaris durable backend — one process serving all services to Restate.
 *
 *   restate-server                          # 8080 ingress / 9070 UI
 *   npm start                               # this process on :9080
 *   restate deployments register localhost:9080
 */
restate.serve({
  services: [leadRegistry, prospectLoop, outreachWorkflow],
  port: config.port(),
});
