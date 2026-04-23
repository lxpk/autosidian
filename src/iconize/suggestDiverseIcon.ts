/**
 * When no keyword or defaultIcon applies, pick a **stable** emoji from a palette so
 * every folder can still get a distinct-ish icon (Iconize supports emoji in front matter).
 */
const SUGGESTION_EMOJIS = [
	"📝",
	"📂",
	"🗂",
	"📋",
	"🔹",
	"🔸",
	"💠",
	"🟦",
	"🟧",
	"🟨",
	"🟩",
	"🟪",
	"⬛",
	"⬜",
	"🟫",
	"📁",
	"🗃",
	"🗄",
	"🖇",
	"🪪",
] as const;

function hashString(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) {
		h = (h * 31 + s.charCodeAt(i)) >>> 0;
	}
	return h;
}

export function suggestDiverseIconForName(name: string): string {
	if (!name) {
		return SUGGESTION_EMOJIS[0]!;
	}
	return SUGGESTION_EMOJIS[hashString(name) % SUGGESTION_EMOJIS.length]!;
}
