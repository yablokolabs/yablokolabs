import { execFile } from "node:child_process";
import { config } from "./config.js";

/**
 * Run one headless turn through Hermes.
 *
 * The adapter shells out to `hermes chat -q` so the durable pipeline uses the
 * exact same providers and fallback chain configured in ~/.hermes — nothing
 * about model routing changes. Prompt and reply must both stay text.
 */
export function hermesExecute(prompt: string): Promise<string> {
  const bin = config.hermesBin();
  const timeout = config.hermesTimeoutMs();

  return new Promise((resolve, reject) => {
    execFile(
      bin,
      ["chat", "-q", prompt],
      { timeout, maxBuffer: 8 * 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          reject(new Error(`hermes chat failed after ${timeout}ms: ${String(error)}`));
          return;
        }
        const text = stdout.trim();
        if (!text) {
          reject(new Error("hermes chat returned an empty response"));
          return;
        }
        resolve(text);
      },
    );
  });
}
