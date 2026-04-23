/**
 * Extra query terms (concepts / synonyms) merged with [emojilib](https://github.com/muan/emojilib)
 * English keywords. Keys and values are lowercased tokens.
 */
export const SYNONYM_ALIASES: Readonly<Record<string, readonly string[]>> = {
	// Tech
	computer: ["pc", "laptop", "desktop", "computing", "cpu", "digital", "machine", "it", "tech"],
	laptop: ["computer", "notebook", "macbook", "netbook"],
	keyboard: ["typing", "input", "keys"],
	mouse: ["cursor", "click", "pointer"],
	code: ["coding", "programmer", "developer", "software", "git", "repo", "debug", "script"],
	web: ["website", "internet", "online", "browser", "http", "html", "css", "frontend", "backend"],
	data: ["database", "sql", "dataset", "analytics", "stats"],
	cloud: ["aws", "azure", "hosting", "server", "saas"],
	phone: ["mobile", "smartphone", "iphone", "android", "cell"],
	email: ["mail", "inbox", "smtp", "newsletter"],
	video: ["youtube", "film", "movie", "clip", "recording", "stream"],
	audio: ["sound", "music", "podcast", "voice", "mic", "speaker"],
	photo: ["picture", "image", "camera", "lens", "snapshot", "jpeg", "png"],
	game: ["gaming", "play", "steam", "esports", "xbox", "playstation", "nintendo"],
	bug: ["issue", "ticket", "defect", "glitch"],
	// Work
	work: ["job", "office", "career", "business", "employer", "remote", "slack", "meeting"],
	project: ["initiative", "plan", "sprint", "roadmap", "milestone", "scope"],
	task: ["todo", "checklist", "chore", "errand", "reminder"],
	meeting: ["call", "zoom", "standup", "sync", "conference", "calendar", "schedule"],
	money: ["finance", "budget", "cash", "payment", "invoice", "salary", "bank", "tax"],
	legal: ["law", "contract", "compliance", "policy", "terms"],
	// Home / life
	home: ["house", "domestic", "family", "living", "apartment"],
	kitchen: ["cook", "cooking", "recipe", "food", "meal", "chef", "oven", "fridge"],
	bed: ["sleep", "bedroom", "rest", "night", "pillow"],
	baby: ["infant", "toddler", "pregnancy", "mom", "dad", "parent", "kids"],
	pet: ["dog", "cat", "puppy", "kitten", "animal", "vet"],
	car: ["auto", "vehicle", "driving", "road", "travel", "suv", "truck", "bike", "bicycle"],
	// Food
	food: ["eat", "meal", "snack", "lunch", "dinner", "breakfast", "cafe", "restaurant"],
	pizza: ["slice", "italian", "cheese"],
	coffee: ["espresso", "latte", "cafe", "caffeine", "brew"],
	beer: ["brew", "pub", "bar", "drink", "ale"],
	wine: ["vineyard", "grape", "cellar", "champagne"],
	fruit: ["apple", "berry", "citrus", "banana", "orange", "grape"],
	veg: ["vegetable", "salad", "tomato", "carrot", "vegan", "vegetarian"],
	// Nature
	nature: ["outdoor", "wild", "forest", "park", "garden", "plant", "leaf", "tree", "flower"],
	water: ["ocean", "sea", "river", "lake", "rain", "wave", "swim", "pool", "drink"],
	sun: ["sunny", "summer", "beach", "heat", "bright", "daylight"],
	snow: ["winter", "cold", "freeze", "ski", "ice", "blizzard"],
	fire: ["flame", "burn", "hot", "campfire", "bbq", "heat"],
	earth: ["planet", "world", "globe", "geo", "map", "climate"],
	// Health / body
	health: ["medical", "doctor", "hospital", "clinic", "wellness", "fitness", "care"],
	heart: ["love", "romance", "valentine", "emotion", "pulse", "cardio"],
	brain: ["mind", "think", "learn", "study", "memory", "psychology"],
	sport: ["gym", "workout", "run", "soccer", "football", "basketball", "tennis", "yoga"],
	// Arts / culture
	art: ["design", "creative", "paint", "draw", "sketch", "gallery", "museum", "artist"],
	book: ["read", "reading", "novel", "literature", "library", "author", "chapter"],
	music: ["song", "album", "band", "concert", "guitar", "piano", "dj", "spotify"],
	film: ["cinema", "tv", "show", "series", "director", "actor"],
	// Time / org
	time: ["clock", "hour", "minute", "deadline", "timer", "schedule", "history", "future"],
	idea: ["concept", "thought", "brainstorm", "lightbulb", "innovation", "pitch"],
	plan: ["strategy", "outline", "goal", "objective", "vision"],
	team: ["group", "crew", "people", "hr", "staff", "org", "company"],
	school: ["education", "class", "student", "teacher", "university", "college", "course", "homework"],
	science: ["lab", "research", "physics", "chemistry", "biology", "stem", "experiment"],
	math: ["algebra", "geometry", "calculus", "number", "equation", "statistics"],
	// Places
	city: ["urban", "downtown", "metro", "town", "street", "building"],
	country: ["nation", "state", "region", "border", "flag", "foreign", "travel"],
	airport: ["flight", "plane", "boarding", "trip", "vacation", "holiday"],
	// Misc concepts
	star: ["favorite", "rating", "review", "celebrity", "space", "night", "sparkle"],
	flag: ["country", "nation", "signal", "milestone", "banner"],
	key: ["password", "secret", "unlock", "access", "security", "auth", "login", "lock"],
	gift: ["present", "birthday", "party", "surprise", "reward", "bonus"],
	news: ["headline", "article", "journalism", "press", "blog", "rss", "feed"],
	shopping: ["cart", "store", "buy", "sale", "retail", "market", "order"],
};

/** Short words that rarely help match a specific emoji (stoplist). */
export const STOP_TOKENS = new Set([
	"the",
	"and",
	"for",
	"not",
	"with",
	"from",
	"that",
	"this",
	"your",
	"our",
	"are",
	"was",
	"has",
	"have",
	"had",
	"but",
	"its",
	"one",
	"all",
	"any",
	"can",
	"get",
	"use",
	"new",
	"old",
	"top",
	"low",
	"mid",
	"sub",
	"pre",
	"post",
	"a",
	"an",
	"as",
	"at",
	"be",
	"by",
	"do",
	"go",
	"if",
	"in",
	"is",
	"it",
	"me",
	"my",
	"no",
	"of",
	"on",
	"or",
	"so",
	"to",
	"up",
	"us",
	"we",
]);

const MAX_EXPAND = 72;

/** Tokenize folder / note name and expand with aliases (capped). */
export function expandQueryTokens(rawTokens: string[]): string[] {
	const out = new Set<string>();
	for (const t of rawTokens) {
		if (t.length < 2 || STOP_TOKENS.has(t)) {
			continue;
		}
		out.add(t);
		if (t.length > 4 && t.endsWith("s") && !t.endsWith("ss")) {
			out.add(t.slice(0, -1));
		}
		if (t.endsWith("ing") && t.length > 5) {
			out.add(t.slice(0, -3));
		}
		const al = SYNONYM_ALIASES[t];
		if (al) {
			for (const a of al) {
				out.add(a);
			}
		}
		if (out.size >= MAX_EXPAND) {
			break;
		}
	}
	return [...out].slice(0, MAX_EXPAND);
}

export function synonymLexiconEntryCount(): number {
	return Object.keys(SYNONYM_ALIASES).length;
}

export function getSynonymLexiconPreview(limit: number): [string, readonly string[]][] {
	const n = Math.max(0, Math.floor(limit));
	return Object.entries(SYNONYM_ALIASES).slice(0, n);
}
