import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// The Open Agentic Web manifest (MVP Profile 0.2, §3.2 and §3.3) is asserted
// against out/ as a peer site's runtime receives it. The point of most of these
// checks is that a manifest is a pointer, so a manifest that exists while the
// network it names does not is still a published 404 — which is the failure
// this file exists to prevent.

const OUT = join(process.cwd(), "out");

const readJson = (relative) => {
  const path = join(OUT, relative);
  assert.ok(existsSync(path), `${relative} is missing from out/. Run \`npm run build\` first.`);
  return JSON.parse(readFileSync(path, "utf8"));
};

const manifest = () => readJson("agent-manifest.json");

test("agent-manifest.json declares at least one network with the required fields", () => {
  const body = manifest();

  assert.equal(typeof body.brand, "string", "manifest has no brand");
  assert.ok(Array.isArray(body.networks) && body.networks.length > 0, "manifest declares no networks");

  for (const network of body.networks) {
    for (const field of ["name", "front_man", "hocon"]) {
      assert.equal(
        typeof network[field],
        "string",
        `network ${network.name ?? "(unnamed)"} has no ${field}`,
      );
      assert.ok(network[field].length > 0, `network ${network.name} has an empty ${field}`);
    }
  }

  const names = body.networks.map((network) => network.name);
  assert.equal(new Set(names).size, names.length, "manifest repeats a network name");
});

test("every declared network resolves to a loadable definition", () => {
  for (const network of manifest().networks) {
    // Relative to the site base, which is where a caller resolves it from.
    const relative = network.hocon.replace(/^\.\//, "");
    const definition = readJson(relative);

    assert.ok(Array.isArray(definition.tools), `${relative} has no tools list`);
    assert.ok(definition.tools.length > 0, `${relative} defines no agents`);

    const agentNames = definition.tools.map((tool) => tool.name);
    assert.equal(new Set(agentNames).size, agentNames.length, `${relative} repeats an agent name`);
    assert.ok(
      agentNames.includes(network.front_man),
      `${relative} does not define its front agent ${network.front_man}`,
    );

    // A dangling reference is what a runtime rejects before any model call, so
    // it should never reach the host in the first place.
    const dangling = definition.tools.flatMap((tool) =>
      (tool.tools ?? [])
        .filter((callee) => typeof callee === "string")
        .filter((callee) => !agentNames.includes(callee))
        .map((callee) => `${tool.name} -> ${callee}`)
    );
    assert.deepEqual(dangling, [], `${relative} calls agents it does not define: ${dangling.join(", ")}`);
  }
});

test("the front agent delegates, and every agent is reachable from it", () => {
  for (const network of manifest().networks) {
    const definition = readJson(network.hocon.replace(/^\.\//, ""));
    const byName = new Map(definition.tools.map((tool) => [tool.name, tool]));

    const reachable = new Set();
    const queue = [network.front_man];
    while (queue.length > 0) {
      const name = queue.shift();
      if (reachable.has(name)) continue;
      reachable.add(name);
      for (const callee of byName.get(name)?.tools ?? []) {
        if (typeof callee === "string") queue.push(callee);
      }
    }

    const orphans = definition.tools.map((tool) => tool.name).filter((name) => !reachable.has(name));
    assert.deepEqual(orphans, [], `agents unreachable from ${network.front_man}: ${orphans.join(", ")}`);
  }
});

test("the published network promises no inference or peer contact it does not have", () => {
  const body = manifest();

  // Static hosting with no publisher-funded router: claiming mock inference or
  // an open peer policy would invite a caller runtime to rely on both.
  assert.equal(body.llm_router?.mock, false, "llm_router.mock must be false; there is no mock router behind it");
  assert.equal(body.deployment?.self_contained_runtime, false, "the site hosts no browser runtime");
  assert.deepEqual(body.allowed_peers, [], "the network contacts no peer origins");
  assert.equal(body.peer_policy?.mode, "closed", "the network contacts no other origin");
});

test("links.json maps the published networks", () => {
  const links = readJson("links.json");
  assert.equal(links.version, 1, "links.json has an unexpected version");

  for (const network of manifest().networks) {
    assert.ok(
      Object.hasOwn(links.networks ?? {}, network.name),
      `links.json has no entry for ${network.name}`,
    );
  }
});
