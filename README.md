# @philvr/pi-model-info

[![npm version](https://img.shields.io/npm/v/%40philvr%2Fpi-model-info.svg)](https://www.npmjs.com/package/@philvr/pi-model-info)

A [Pi](https://github.com/earendil-works/pi) package that exposes the active
model and thinking level to Pi users and agents.

## Install

Install globally:

```bash
pi install npm:@philvr/pi-model-info
```

Or install it for just the current project:

```bash
pi install -l npm:@philvr/pi-model-info
```

For an unreleased checkout or development version, install directly from Git:

```bash
pi install git:github.com/FIL1994/pi-model-info
```

Run `/reload` in an existing Pi session after installing or updating the
extension.

## What it adds

- `/model-info` — shows the selected provider, model ID/name, and
  thinking level.
- `model_info` — lets the agent retrieve that same information.

Information is retrieved on demand. Pi already shows the selected model in its
footer, so this extension does not add another status item.

## Output

Both interfaces return the same JSON shape:

```json
{
  "model": {
    "provider": "openai",
    "id": "gpt-5",
    "name": "GPT-5"
  },
  "thinkingLevel": "high"
}
```

When no model is selected, `model` is `null`. The `model_info` tool includes
the parsed object in `details` as well as the formatted JSON text, so agents
can either inspect the structured result or read the displayed output.

## Development

```bash
npm install
npm run setup
npm run format
npm run lint
npm test
pi -e ./extensions/model-info.ts
```

Pi loads TypeScript extensions directly, so this package does not need a build
step. `npm run setup` installs the local Lefthook hooks; hook setup is separate
from package installation so Pi can install the Git source without development
dependencies. `npm test` also verifies formatting and linting.

Run `npm run test:package` for the fresh-install smoke test used in CI. It packs
the package, installs it with production dependencies into a temporary directory,
and verifies that Pi discovers and loads its command and tool.
This requires npm registry access but no API credentials or LLM requests. The
temporary directory is removed afterward.

Run `npm run test:git` to exercise Pi's Git-style production install as well.

## Troubleshooting

- If `/model-info` or `model_info` is missing after installation, run `/reload`.
- If the output contains `"model": null`, Pi has not selected a model yet.
- The extension reads the current session on demand; it does not make network
  requests, expose credentials, or add a footer status item.

## Publishing

Releases are managed by [Release Please](https://github.com/googleapis/release-please).
Pushes to `main` create or update a release pull request based on
[Conventional Commits](https://www.conventionalcommits.org/). Merging that pull
request creates a GitHub release, then invokes the npm publishing workflow.

For publishing, add an `NPM_TOKEN` repository secret for the npm account that
owns the `@philvr` scope. The package is configured as public.
