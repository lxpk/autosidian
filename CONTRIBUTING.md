# Contributing

Thanks for helping improve **Autosidian** and related docs. The **Autosidia** web app, when added to the repo, will follow the same general practices unless noted.

## How to help

- **Issues** — Open an issue to report bugs, suggest features, or ask for clarity on the spec. Use the template if one is added to the repository.
- **Pull requests** — Keep changes focused; update [CHANGELOG.md](CHANGELOG.md) and relevant docs ([UI.md](UI.md), [SPEC.md](SPEC.md), [ARCHITECTURE.md](ARCHITECTURE.md)) when behavior changes.
- **Docs** — Fixes to typos and unclear sections in the document tree are welcome.

## Development

1. [Build a plugin](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin) — Official Obsidian plugin development guide.
2. In the repo root: `npm install` → `npm test` (required before commits per [AGENTS.md](AGENTS.md#pr-instructions)). For iteration, `npm run dev` and reload the plugin in your test vault.
3. **Test vault (manual / E2E):** on **macOS**, if the iCloud **`autosidian`** folder exists, `npm test` **syncs the build there by default** ([e2e/helpers/paths.mjs](e2e/helpers/paths.mjs)). Open that vault in Obsidian, reload the plugin, and smoke-test. Use **`AUTOSIDIAN_E2E_USE_FIXTURE=1 npm test`** to match CI’s [e2e/fixture-vault](e2e/fixture-vault/) only. See [e2e/README.md](e2e/README.md#which-vault-to-use-when-testing-in-the-app) and the **standard test checklist** in [AGENTS.md](AGENTS.md#standard-test-checklist).
4. Use a **dedicated test vault** with the required community plugins from [SPEC.md](SPEC.md#prerequisites-and-dependencies) installed and **enabled** if you need the settings screen to show all-green dependency checks.

**CI:** Pushes and PRs to `main` / `master` run `npm test` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)) — **unit tests (vitest)** + **integration** (build, sync to the E2E vault, verify manifest; on **Linux** that vault is [e2e/fixture-vault](e2e/fixture-vault/)). **Locally on Mac** with iCloud, integration usually targets your `autosidian` folder instead. Match the pipeline before opening a PR (or use `AUTOSIDIAN_E2E_USE_FIXTURE=1` to mirror CI).

### Automated GitHub Releases (BRAT / manual install / updater)

On every **push** to `main` or `master`, after tests pass, the **release** job in [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. Verifies **`manifest.json` `version`** equals **`package.json` `version`**, and that **`versions.json`** contains the same version key with a value equal to **`manifest.json` `minAppVersion`** (Obsidian’s per-version compatibility map).
2. Builds production `main.js` / `manifest.json` / `styles.css`.
3. If a **git tag** named exactly like the manifest version (e.g. `1.0.1`) **does not** exist yet, it creates a **GitHub Release** with those three files attached and creates the tag on the pushed commit.

So: **bump all three version fields** when you want a new downloadable release; **pushes that only change docs** reuse the existing tag and **skip** creating another release (no duplicate tag error).

You can re-run the workflow manually from the **Actions** tab (**workflow_dispatch**).

### Publishing to the community plugin list

1. Screenshot the Autosidian settings tab for [README](README.md) (or a short demo GIF) — not automated.
2. Follow [plugin submission](https://github.com/obsidianmd/obsidian-releases/blob/master/PLUGIN_SUBMISSION.md): bump [manifest](manifest.json), [package.json](package.json), and [versions.json](versions.json), update [CHANGELOG](CHANGELOG.md), open a release PR to `obsidianmd/obsidian-releases`. The **CI release job** will create the matching GitHub tag/release when you push to `main` (no separate manual tagging needed if the workflow runs successfully).

**Releasing in general** — same manifest/changelog/versions for private or beta builds; community listing is the extra review step.

[AGENTS.md](AGENTS.md) has extra notes for AI-assisted contributors.

## Code and review expectations

- Match existing project style (formatting, naming) once the codebase exists.
- Prefer small, reviewable diffs. Do not bundle unrelated refactors with bug fixes.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
