import assert from "node:assert/strict";
import { join } from "node:path";
import { discoverAndLoadExtensions } from "@earendil-works/pi-coding-agent";

const extensionPath = process.env.PI_SMOKE_EXTENSION_PATH;
assert.ok(extensionPath, "PI_SMOKE_EXTENSION_PATH is required");
const cwd = process.cwd();
const result = await discoverAndLoadExtensions([extensionPath], cwd, join(cwd, "agent"));
assert.deepEqual(result.errors, [], "Installed extension must load without errors");
assert.equal(result.extensions.length, 1);
const [extension] = result.extensions;
assert.ok(extension.tools.has("model_info"));
assert.ok(extension.commands.has("model-info"));
assert.equal(extension.handlers.size, 0, "No footer event handlers should be registered");
console.log("Git-installed extension smoke test passed (Pi loader, command, and tool).");
