import assert from "node:assert/strict";
import { join } from "node:path";
import { discoverAndLoadExtensions } from "@earendil-works/pi-coding-agent";

// Exercise Pi's real manifest discovery and TypeScript loader, without a session,
// credentials, user extensions, or an LLM request.
const cwd = process.cwd();
const result = await discoverAndLoadExtensions(
  [join(cwd, "node_modules/@philvr/pi-model-info")],
  cwd,
  join(cwd, "agent"),
);
assert.deepEqual(result.errors, [], "Installed extension must load without errors");
assert.equal(result.extensions.length, 1);
const [extension] = result.extensions;
assert.ok(extension.tools.has("model_info"));
assert.ok(extension.commands.has("model-info"));
assert.equal(extension.handlers.size, 0, "No footer event handlers should be registered");
console.log("Installed package smoke test passed (Pi loader, command, and tool).");
