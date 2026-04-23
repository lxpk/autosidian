# AGENTS

Rules and procedures for AI coding tools including Claude, Codex, Gemini, Cursor, and others when working in this repository.

## POST-CHANGE CHECKLIST

After making substantive changes, do the following as appropriate:

* **Behavior or UX** — Update [UI.md](UI.md) and [SPEC.md](SPEC.md) so the spec matches the product.
* **Code layout or boundaries** — Update [ARCHITECTURE.md](ARCHITECTURE.md) and [API.md](API.md).
* **User-facing change** — Add an entry to [CHANGELOG.md](CHANGELOG.md) (keep newest first, link version when releasing).
* **New dependency or build step** — Update [README.md](README.md), [SPEC.md](SPEC.md#installation), and [CONTRIBUTING.md](CONTRIBUTING.md).
* **Security or data handling** — Update [SECURITY.md](SECURITY.md) and review [API.md](API.md#network-optional-features).
* **Community / process** — Update [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [SUPPORT.md](SUPPORT.md), or [CONTRIBUTING.md](CONTRIBUTING.md) if participation expectations change.
* **Phases / roadmap** — If scope or order of work changes, update [PLANS.md](PLANS.md) and, for immediate tasks, [TODO.md](TODO.md).

Prefer **small, focused** edits; match existing tone in each document.

## Planning Cycle
1. Plan Mode: with the AI first. Think through the approach together before writing any code. Discuss the strategy and get alignment on what you're building.
2. Execute Mode: Execute by asking the AI to write the code that matches the plan. You're not asking it to figure out what to build—you've already done that together.
3. Test Mode: Follow the **standard test checklist** below. Validate that the implementation matches what you planned.
4. Commit Mode: Commit the code and start the cycle again for the next piece.

## Standard test checklist

Run these after substantive changes (and before pushing / opening a PR):

1. **`npm test`** — Runs **vitest**, then **integration** (`npm run build`, sync plugin into the E2E vault, verify manifest). Fix failures. On **push to `main`/`master`**, GitHub Actions also runs a **release** job that creates a GitHub Release when you bump `manifest.json` / `package.json` / `versions.json` (see [CONTRIBUTING.md](CONTRIBUTING.md#automated-github-releases-brat--manual-install--updater)).
2. **E2E vault** — On **macOS**, if `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/autosidian` exists, **`npm test` syncs the built plugin there automatically** ([e2e/helpers/paths.mjs](e2e/helpers/paths.mjs)). On Linux (e.g. CI) or when that folder is missing, the repo’s [e2e/fixture-vault/](e2e/fixture-vault/) is used. To **force** the bundled fixture on a Mac: `AUTOSIDIAN_E2E_USE_FIXTURE=1 npm test`. To use another vault: set **`AUTOSIDIAN_E2E_VAULT`** ([e2e/README.md](e2e/README.md#which-vault-to-use-when-testing-in-the-app)).
3. **Obsidian** — Open the **iCloud `autosidian`** vault (or whichever vault integration targeted), **reload** Autosidian (Community plugins → reload, or restart Obsidian), and **smoke-test** the behavior you changed.
4. Optional — **`npm run test:e2e`** for automated desktop UI (local; see [e2e/README.md](e2e/README.md)).
5. Optional — **Pixel Banner + folder notes** — `npm run test:integration:pixel-folder-notes` (dry-run: add `banner: <title>` to folder notes that lack it) or `npm run test:integration:pixel-folder-notes:write` to apply. See [e2e/README.md](e2e/README.md#1a-autopixel-banner--folder-notes-files-on-disk-optional).


## Plan Mode
- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## PR instructions
- Title format: `[<project_name>] <Title>` (e.g. `[Autosidian] Add folder-note listener`).
- Before opening a PR, complete the **standard test checklist** above (`npm test` + reload and smoke-test in Obsidian when behavior or UX changed).