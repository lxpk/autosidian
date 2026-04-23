import { describe, it, expect } from "vitest";
import {
	alreadyHasWaypoint,
	insertWaypointMarker,
	WAYPOINT_TOKEN,
	BEGIN_WAYPOINT,
	END_WAYPOINT,
} from "./waypointMarkdown";

describe("waypoint markers", () => {
	it("detects begin block", () => {
		expect(alreadyHasWaypoint(`hello\n${BEGIN_WAYPOINT}\n`)).toBe(true);
	});
	it("detects short token", () => {
		expect(alreadyHasWaypoint(`x\n${WAYPOINT_TOKEN}\n`)).toBe(true);
	});
	it("detects end marker (plugin-expanded block without begin in snippet)", () => {
		expect(alreadyHasWaypoint(`-\n${END_WAYPOINT}\n`)).toBe(true);
	});
	it("inserts after front matter", () => {
		const s = `---\ntitle: a\n---\nbody`;
		const out = insertWaypointMarker(s);
		expect(out).toContain("%% Waypoint %%");
		expect(out.indexOf("---")).toBe(0);
	});
});
