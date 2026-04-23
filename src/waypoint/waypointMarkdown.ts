export const WAYPOINT_TOKEN = "%% Waypoint %%";
export const BEGIN_WAYPOINT = "%% Begin Waypoint %%";

/** True if body already has Waypoint expanded or short token (no duplicate insert). */
export function alreadyHasWaypoint(content: string): boolean {
	return content.includes(BEGIN_WAYPOINT) || content.includes(WAYPOINT_TOKEN);
}

/**
 * Inserts {WAYPOINT_TOKEN} after YAML front matter if present, else at document start.
 * Idempotent if `alreadyHasWaypoint` was checked first.
 */
export function insertWaypointMarker(content: string, marker: string = WAYPOINT_TOKEN + "\n"): string {
	if (alreadyHasWaypoint(content)) {
		return content;
	}
	const fm = /^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/m.exec(content);
	if (fm) {
		const body = fm[2] ?? "";
		return fm[1] + (body.startsWith("\n") ? "" : "\n") + "\n" + marker + (body ? body : "\n");
	}
	return marker + (content && !content.startsWith("\n") ? "\n\n" : "\n") + content;
}
