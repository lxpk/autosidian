import { Notice } from "obsidian";
import { requestUrl } from "obsidian";
import type { AutosidianSettings } from "../settings";

/**
 * When Autosidia is deployed, point `settings.autosidia.registryBaseUrl` at it.
 * Stubs: GET {base}/health (optional) — 200 = online.
 */
export class AutosidiaClient {
	/** Non-throwing. */
	static async checkHealth(baseUrl: string | undefined | null): Promise<{ ok: boolean; status: number; message: string }> {
		const base = (baseUrl ?? "").trim().replace(/\/$/, "");
		if (!base) {
			return { ok: false, status: 0, message: "No registry Base URL" };
		}
		const url = `${base}/health`;
		try {
			const r = await requestUrl({ url, method: "GET" });
			return {
				ok: r.status === 200,
				status: r.status,
				message: r.status === 200 ? "OK" : `HTTP ${r.status}`,
			};
		} catch (e) {
			const m = e instanceof Error ? e.message : String(e);
			return { ok: false, status: 0, message: m };
		}
	}

	static async pingAndNotify(baseUrl: string | undefined, _settings: AutosidianSettings): Promise<void> {
		const r = await AutosidiaClient.checkHealth(baseUrl);
		if (r.ok) {
			new Notice(`Autosidia registry: ${r.message}`);
		} else {
			new Notice(`Autosidia registry: offline or error — ${r.message}`);
		}
	}
}
