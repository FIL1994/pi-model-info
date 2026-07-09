# @philvr/pi-model-info

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

## What it adds

- `/model-info` — shows the selected provider, model ID, model metadata, and
  thinking level.
- `model_info` — lets the agent retrieve that same information.
- A footer status item showing the active model and thinking level.

## Development

```bash
npm install
npm run format
npm run lint
npm test
pi -e ./extensions/model-info.ts
```

Pi loads TypeScript extensions directly, so this package does not need a build
step. `npm test` also verifies formatting and linting.

## Publishing

The package is configured as a public package. After logging in to the npm
account that owns the `@philvr` scope, publish it with:

```bash
npm publish
```

If that is not your npm scope, update the `name`, installation commands, and
the publish instructions before publishing.
