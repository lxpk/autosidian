import { requestUrl } from "obsidian";
import type { CoverHttp } from "./coverSearch";

/** Default HTTP fetcher used in production: thin wrapper over Obsidian's `requestUrl`. */
export const obsidianCoverHttp: CoverHttp = {
	async get({ url, headers }) {
		const r = await requestUrl({ url, method: "GET", headers, throw: false });
		return { status: r.status, text: r.text };
	},
};
