import { describe, it, expect } from "vitest";
import { picsumUrlsForTitle } from "./picsum";

describe("picsumUrlsForTitle", () => {
	it("returns n distinct urls", () => {
		const u = picsumUrlsForTitle("Hello", 3);
		expect(u).toHaveLength(3);
		expect(u[0]).toContain("picsum.photos");
		expect(new Set(u).size).toBe(3);
	});
});
