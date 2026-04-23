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

Prefer **small, focused** edits; match existing tone in each document.

## Planning Cycle
1. Plan Mode: with the AI first. Think through the approach together before writing any code. Discuss the strategy and get alignment on what you're building.
2. Execute Mode: Execute by asking the AI to write the code that matches the plan. You're not asking it to figure out what to build—you've already done that together.
3. Test Mode: Test the code together. Run unit tests, check type safety, or perform manual QA. Validate that the implementation matches what you planned.
4. Commit Mode: Commit the code and start the cycle again for the next piece.


## Plan Mode
- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run tests before committing.
EOF