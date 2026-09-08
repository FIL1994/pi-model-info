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
const basicModel = { provider: "openai", id: "gpt-5", name: "GPT-5" };

function createExtensionHarness() {
  const handlers = new Map();
  const notifications = [];
  let command;
  let tool;
  let thinkingLevel = "high";

  const pi = {
    getThinkingLevel: () => thinkingLevel,
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
      notify: (text, level) => notifications.push({ text, level }),
    },
  });

  modelInfoExtension(pi);

  return {
    command,
    context,
    handlers,
    notifications,
    tool,
    setThinkingLevel: (level) => {
      thinkingLevel = level;
    },
  };
}

test("registers only the command and tool, without footer event handlers", () => {
  const { command, handlers, tool } = createExtensionHarness();

  assert.equal(handlers.size, 0);
  assert.equal(command.name, "model-info");
  assert.equal(tool.name, "model_info");
  assert.equal(tool.promptSnippet, "Show the active Pi model and thinking level");
});

test("reports only basic model information", async () => {
  const { command, context, notifications, tool } = createExtensionHarness();
  const activeContext = context();

  const result = await tool.execute("call-1", {}, undefined, undefined, activeContext);
  assert.deepEqual(result.details, { model: basicModel, thinkingLevel: "high" });
  assert.equal(result.content[0].text, JSON.stringify(result.details, null, 2));

  await command.definition.handler("", activeContext);
  assert.deepEqual(notifications, [
    { text: JSON.stringify(result.details, null, 2), level: "info" },
  ]);
});

test("refreshes all outputs after switching models", async () => {
  const { command, context, notifications, tool, setThinkingLevel } = createExtensionHarness();
  const activeContext = context();
  await tool.execute("call-before-switch", {}, undefined, undefined, activeContext);
  await command.definition.handler("", activeContext);

  const nextModel = { ...model, provider: "custom", id: "other", name: "Other", reasoning: false };
  activeContext.model = nextModel;
  setThinkingLevel("off");
  const expected = {
    model: { provider: "custom", id: "other", name: "Other" },
    thinkingLevel: "off",
  };
  const result = await tool.execute("call-2", {}, undefined, undefined, activeContext);
  assert.deepEqual(result.details, expected);
  assert.deepEqual(JSON.parse(result.content[0].text), expected);
  await command.definition.handler("", activeContext);
  assert.deepEqual(JSON.parse(notifications.at(-1).text), expected);
});

test("refreshes all outputs as thinking level changes", async () => {
  const { command, context, notifications, tool, setThinkingLevel } = createExtensionHarness();
  const activeContext = context();

  for (const level of ["off", "minimal", "low", "medium", "high", "xhigh", "max"]) {
    setThinkingLevel(level);
    const expected = { model: basicModel, thinkingLevel: level };
    const result = await tool.execute("call-3", {}, undefined, undefined, activeContext);
    assert.deepEqual(result.details, expected);
    assert.deepEqual(JSON.parse(result.content[0].text), expected);
    await command.definition.handler("", activeContext);
    assert.deepEqual(JSON.parse(notifications.at(-1).text), expected);
  }
});

for (const missingModel of [null, undefined]) {
  test(`handles a missing model (${missingModel}) in the command and tool`, async () => {
    const { command, context, notifications, tool } = createExtensionHarness();
    const activeContext = { ...context(), model: missingModel };

    const expected = { model: null, thinkingLevel: "high" };
    const result = await tool.execute("call-4", {}, undefined, undefined, activeContext);
    assert.deepEqual(result.details, expected);
    assert.deepEqual(JSON.parse(result.content[0].text), expected);
    await command.definition.handler("", activeContext);
    assert.deepEqual(notifications, [{ text: JSON.stringify(expected, null, 2), level: "info" }]);
  });
}
