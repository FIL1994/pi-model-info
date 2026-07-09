import assert from "node:assert/strict";
import test from "node:test";
import modelInfoExtension from "../extensions/model-info.ts";

const model = {
  provider: "openai",
  id: "gpt-5",
  name: "GPT-5",
  api: "openai-responses",
  reasoning: true,
};

function createExtensionHarness() {
  const handlers = new Map();
  const statuses = [];
  const notifications = [];
  let command;
  let tool;

  const pi = {
    getThinkingLevel: () => "high",
    on: (event, handler) => handlers.set(event, handler),
    registerCommand: (name, definition) => {
      command = { name, definition };
    },
    registerTool: (definition) => {
      tool = definition;
    },
  };

  const context = (activeModel = model) => ({
    model: activeModel,
    ui: {
      setStatus: (key, text) => statuses.push({ key, text }),
      notify: (text, level) => notifications.push({ text, level }),
    },
  });

  modelInfoExtension(pi);

  return { command, context, handlers, notifications, statuses, tool };
}

test("registers Pi events, command, and tool", () => {
  const { command, handlers, tool } = createExtensionHarness();

  assert.deepEqual(
    [...handlers.keys()],
    ["session_start", "model_select", "thinking_level_select"],
  );
  assert.equal(command.name, "model-info");
  assert.equal(tool.name, "model_info");
  assert.equal(tool.promptSnippet, "Show the active Pi model and thinking level");
});

test("reports model information and updates the status", async () => {
  const { command, context, handlers, notifications, statuses, tool } = createExtensionHarness();
  const activeContext = context();

  handlers.get("session_start")({}, activeContext);
  assert.deepEqual(statuses, [{ key: "model-info", text: "openai/gpt-5 · high" }]);

  const result = await tool.execute("call-1", {}, undefined, undefined, activeContext);
  assert.deepEqual(result.details, { model, thinkingLevel: "high" });
  assert.equal(result.content[0].text, JSON.stringify(result.details, null, 2));

  await command.definition.handler("", activeContext);
  assert.deepEqual(notifications, [
    { text: JSON.stringify(result.details, null, 2), level: "info" },
  ]);
});

test("handles the absence of a selected model", () => {
  const { context, handlers, statuses } = createExtensionHarness();

  handlers.get("model_select")({}, context(null));
  assert.deepEqual(statuses, [{ key: "model-info", text: "No model selected" }]);
});
