# TODO

[PLANS.md](PLANS.md) = strategy; this list = next concrete steps.

- [ ] In-app **icon rule table** (optional) so users need not use JSON.
- [ ] **Waypoint** — optional progress bar; cancel for long retro.
- [ ] **Pixel** — Unsplash/Cloudinary with keys in Obsidian [Secret](https://docs.obsidian.md) when you want more than Picsum.
- [ ] **Tests** — `migrateSettings` + preset merge; optional E2E in a sample vault.
- [ ] **Community release** — README screenshot, [submission checklist](https://github.com/obsidianmd/obsidian-releases/blob/master/PLUGIN_SUBMISSION.md), tag **1.0.0** on [GitHub](https://github.com) when published.
- [ ] **Autosidia** app — out of this repo until scaffolded; keep [client](src/autosidia/AutosidiaClient.ts) in sync with API.

**CI** — [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm test` = **vitest** + `tsc` + **esbuild** bundle.
