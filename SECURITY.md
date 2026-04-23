# Security

## Reporting a vulnerability

If you believe you have found a security vulnerability in **Autosidian**, the **Autosidia** service, or this repository’s automation:

- **Do not** disclose it in public issues or discussion threads until it has been addressed.
- **Do** report it privately. Until a dedicated security contact or GitHub [Security advisories](https://docs.github.com/en/code-security/security-advisories) workflow is published for this project, use the maintainer’s preferred private channel (email or GitHub private vulnerability reporting, if enabled).

Include: affected component, reproduction steps, impact assessment, and any suggested fix you may have.

## Scope (intended)

- **Autosidian** — Network use is optional (e.g. image search, future Autosidia client). It must not exfiltrate vault contents without explicit user action.
- **Autosidia** — When deployed, should use HTTPS, validate uploads, and rate-limit and authenticate as appropriate for a public registry.

## Safe defaults

- Users should be able to **disable** all network-backed and retroactive features independently.
- API keys, if any, should be stored using Obsidian’s or the platform’s secure storage patterns, not in plain note files.

Updates to this policy will be recorded when contact methods are finalized.
