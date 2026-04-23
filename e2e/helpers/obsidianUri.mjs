import { execFile, execSync } from "node:child_process";

/**
 * Official Obsidian action: find the vault that contains this absolute file path, then open it.
 * @see https://obsidian.md/help/uri
 */
export function buildOpenByAbsolutePath(absoluteFilePath) {
	const u = new URL("obsidian://open");
	u.searchParams.set("path", absoluteFilePath);
	return u.toString();
}

/**
 * On Windows, the path in the URI can use the `file` URL form per docs (`obsidian:///...` shorthand);
 * the `path` query param is the one we use.
 */
export function openObsidianUri(osHandle, uri) {
	if (osHandle === "win32") {
		execFile("cmd", ["/c", "start", "", uri], { windowsHide: true });
	} else if (osHandle === "darwin") {
		execFile("open", [uri], { stdio: "ignore" });
	} else {
		execFile("xdg-open", [uri], { stdio: "ignore" });
	}
}

/**
 * Tells the running (or about-to-launch) Obsidian to focus the vault that contains this file.
 * Call after the app has started, so the E2E fixture is active instead of a previously opened vault.
 */
export function openFixtureFileInObsidian(absolutePathToFileInVault) {
	const uri = buildOpenByAbsolutePath(absolutePathToFileInVault);
	openObsidianUri(process.platform, uri);
}

/** Best-effort: kill the process listening on a TCP port (e.g. Obsidian with CDP). (Used after `open -n` on macOS.) */
export function killProcessOnTcpPort(port) {
	if (process.platform === "win32") {
		return;
	}
	try {
		const pids = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" })
			.trim()
			.split(/\s+/)
			.filter(Boolean);
		for (const p of pids) {
			process.kill(parseInt(p, 10), "SIGTERM");
		}
	} catch {
		/* no listener or lsof missing */
	}
}
