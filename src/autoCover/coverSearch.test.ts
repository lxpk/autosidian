import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AutoCoverSettings } from "../settings";
import { DEFAULT_SETTINGS } from "../settings";
import { searchCoverCandidates, searchFirstCover, type CoverHttp } from "./coverSearch";

const makeHttp = () => {
	const get = vi.fn<CoverHttp["get"]>();
	const http: CoverHttp = { get };
	return { http, get };
};

const cover = (over: Partial<AutoCoverSettings> = {}): AutoCoverSettings => ({
	...DEFAULT_SETTINGS.autoCover,
	...over,
});

beforeEach(() => {
	// fresh per test via makeHttp()
});

describe("coverSearch", () => {
	it("auto provider returns wikipedia originalimage when present", async () => {
		const { http, get } = makeHttp();
		get.mockResolvedValueOnce({
			status: 200,
			text: JSON.stringify({
				title: "Eiffel Tower",
				originalimage: { source: "https://upload.wikimedia.org/eiffel.jpg" },
			}),
		});
		const r = await searchFirstCover("Eiffel Tower", cover({ provider: "auto" }), http);
		expect(r?.url).toBe("https://upload.wikimedia.org/eiffel.jpg");
		expect(r?.source).toBe("wikipedia");
		expect(get).toHaveBeenCalledOnce();
	});

	it("auto provider falls back to openverse when wikipedia returns no image", async () => {
		const { http, get } = makeHttp();
		get
			.mockResolvedValueOnce({ status: 404, text: "" })
			.mockResolvedValueOnce({
				status: 200,
				text: JSON.stringify({
					results: [
						{ url: "https://openverse.example/a.jpg", title: "a" },
						{ url: "https://openverse.example/b.jpg", title: "b" },
					],
				}),
			});
		const r = await searchCoverCandidates("xyz", cover({ provider: "auto" }), 2, http);
		expect(r).toHaveLength(2);
		expect(r[0]?.source).toBe("openverse");
		expect(r[0]?.url).toBe("https://openverse.example/a.jpg");
	});

	it("returns empty when all providers fail (no key for pexels in auto)", async () => {
		const { http, get } = makeHttp();
		get
			.mockResolvedValueOnce({ status: 404, text: "" })
			.mockResolvedValueOnce({ status: 200, text: JSON.stringify({ results: [] }) });
		const r = await searchFirstCover("nothing matches", cover({ provider: "auto" }), http);
		expect(r).toBeNull();
	});

	it("pexels provider sends Authorization header and parses src.large", async () => {
		const { http, get } = makeHttp();
		get.mockResolvedValueOnce({
			status: 200,
			text: JSON.stringify({
				photos: [
					{ src: { large: "https://pexels.example/big.jpg" }, alt: "ocean" },
				],
			}),
		});
		const s = cover({ provider: "pexels", pexelsApiKey: "key123" });
		const r = await searchFirstCover("ocean", s, http);
		expect(r?.source).toBe("pexels");
		expect(r?.url).toBe("https://pexels.example/big.jpg");
		const call = get.mock.calls[0]?.[0];
		expect(call?.headers?.Authorization).toBe("key123");
	});

	it("pexels provider returns no hit when no key set", async () => {
		const { http, get } = makeHttp();
		const r = await searchFirstCover("ocean", cover({ provider: "pexels", pexelsApiKey: "" }), http);
		expect(r).toBeNull();
		expect(get).not.toHaveBeenCalled();
	});

	it("rejects empty / whitespace queries before hitting the network", async () => {
		const { http, get } = makeHttp();
		const r = await searchCoverCandidates("   ", cover(), 3, http);
		expect(r).toEqual([]);
		expect(get).not.toHaveBeenCalled();
	});
});
