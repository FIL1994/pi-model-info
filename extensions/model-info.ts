import { Type } from "typebox";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

function getModelInfo(pi: ExtensionAPI, ctx: ExtensionContext) {
  const model = ctx.model;

  return {
    model: model
      ? {
          provider: model.provider,
          id: model.id,
          name: model.name,
        }
      : null,
    thinkingLevel: pi.getThinkingLevel(),
  };
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("model-info", {
    description: "Show the active model and thinking level",
    handler: async (_args, ctx) => {
      ctx.ui.notify(JSON.stringify(getModelInfo(pi, ctx), null, 2), "info");
    },
  });

  pi.registerTool({
    name: "model_info",
    label: "Model Info",
    description: "Return the currently selected Pi model and thinking level.",
    promptSnippet: "Show the active Pi model and thinking level",
    promptGuidelines: [
      "Use model_info when the user asks which Pi model or thinking level is active.",
    ],
    parameters: Type.Object({}),
    async execute(_id, _params, _signal, _update, ctx) {
      const details = getModelInfo(pi, ctx);
      return {
        content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
        details,
      };
    },
  });
}
