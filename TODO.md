# TODO

[PLANS.md](PLANS.md) = strategy. This file tracks **actionable** follow-ups. There are **no** unsolved checklist items in-repo right now; recent work is in the changelog, shipped, or [PLANS.md](PLANS.md) *Longer horizon*.

- **Done (see [CHANGELOG](CHANGELOG.md) Unreleased + PR history):** in-app **icon rules table**; **waypoint** queue hint + **stop all retro queues** (command + settings); **tests** for `migrateSettings` + preset merge; **E2E** `apply-pixel-banner-to-folder-notes` + default iCloud vault; **docs** (UI, API, AGENTS).
- **Not in this repo (track elsewhere):** **Autosidia** app — [SPEC.md](SPEC.md#autosidia-community-registry) / [PLANS](PLANS.md#phase-6--autosidia-stub-v10); keep [AutosidiaClient](src/autosidia/AutosidiaClient.ts) aligned when an API exists.
- **When you cut a public release** — [CONTRIBUTING.md](CONTRIBUTING.md#publishing-to-the-community-plugin-list) checklist (README screenshot, [submission](https://github.com/obsidianmd/obsidian-releases/blob/master/PLUGIN_SUBMISSION.md), tag).

**CI** — [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm test` = **vitest** + `tsc` + **esbuild** bundle + integration sync/verify.
