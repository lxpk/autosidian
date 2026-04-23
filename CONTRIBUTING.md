# Contributing

Thanks for helping improve **Autosidian** and related docs. The **Autosidia** web app, when added to the repo, will follow the same general practices unless noted.

## How to help

- **Issues** — Open an issue to report bugs, suggest features, or ask for clarity on the spec. Use the template if one is added to the repository.
- **Pull requests** — Keep changes focused; update [CHANGELOG.md](CHANGELOG.md) and relevant docs ([UI.md](UI.md), [SPEC.md](SPEC.md), [ARCHITECTURE.md](ARCHITECTURE.md)) when behavior changes.
- **Docs** — Fixes to typos and unclear sections in the document tree are welcome.

## Development

1. [Build a plugin](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin) — Official Obsidian plugin development guide.
2. Clone the repository and install Node dependencies (when `package.json` is present, typically `npm install`).
3. Build and test in a **dedicated test vault** with the required community plugins ([SPEC.md](SPEC.md#prerequisites-and-dependencies)) installed.

[AGENTS.md](AGENTS.md) has extra notes for AI-assisted contributors.

## Code and review expectations

- Match existing project style (formatting, naming) once the codebase exists.
- Prefer small, reviewable diffs. Do not bundle unrelated refactors with bug fixes.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
