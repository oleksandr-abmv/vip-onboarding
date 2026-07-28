// ─── Memory ─────────────────────────────────────────────────────────────
//
// Figma: "Memory" section (node 5381-8698). The concierge keeps a short list of
// facts the user has told it, editable from Menu > Memory > Manage Memory
// and written to from the Chat tab.
//
// Prototype: everything lives in React state (FeedScreen owns it). There is no
// persistence layer yet, so a reload starts from SEED_MEMORY_FACTS.

/**
 * Manage Memory groups facts under four headings (Figma node 5381-11518), so
 * every fact carries the group it belongs to. Order here is the render order.
 */
export const MEMORY_GROUPS = [
  { id: 'style', label: 'Style & sizes' },
  { id: 'brands', label: 'Maisons & brands' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'places', label: 'Places' },
] as const;

export type MemoryGroup = (typeof MEMORY_GROUPS)[number]['id'];

export interface MemoryFact {
  id: string;
  /** First-person sentence, e.g. "I like Van Cleef & Arpels as a brand." */
  text: string;
  group: MemoryGroup;
  /** ms epoch - the newest one drives the "Updated X ago" subtitle. */
  createdAt: number;
}

// Which heading a new fact lands under. Checked in order, so the more specific
// patterns (sizes, brands, places) get first refusal and everything else falls
// through to Preferences.
const GROUP_RULES: { group: MemoryGroup; re: RegExp }[] = [
  { group: 'style', re: /\b(size|sizes|fit|fits|tailor\w*|wear|wears|cut|cuts|shirt|suit|shoe|shoes|waist|collar|inseam|measurement\w*)\b/i },
  { group: 'brands', re: /\b(brand|brands|maison|maisons|house|houses|label|labels|designer|by [A-Z])\b/ },
  { group: 'places', re: /\b(city|cities|store|stores|boutique|boutiques|travel\w*|visit\w*|hotel|hotels|restaurant|restaurants|paris|london|milan|tokyo|new york|geneva|dubai)\b/i },
];

export function groupFor(text: string): MemoryGroup {
  for (const { group, re } of GROUP_RULES) if (re.test(text)) return group;
  return 'preferences';
}

let seq = 0;
export function makeFact(text: string, createdAt = Date.now(), group?: MemoryGroup): MemoryFact {
  seq += 1;
  return { id: `mem-${createdAt}-${seq}`, text, group: group ?? groupFor(text), createdAt };
}

// A few facts so Manage Memory has something to show on first open. Dated a few
// days back so "Updated ..." does not read as "just now" before the user types.
const DAY = 24 * 60 * 60 * 1000;
export const SEED_MEMORY_FACTS: MemoryFact[] = [
  makeFact('I wear a 42 in Italian tailoring and a 43 in shoes.', Date.now() - 6 * DAY, 'style'),
  makeFact('I like Van Cleef & Arpels as a brand.', Date.now() - 5 * DAY, 'brands'),
  makeFact('Patek Philippe and Cartier are the two houses I collect.', Date.now() - 5 * DAY, 'brands'),
  makeFact('I prefer white gold over yellow gold.', Date.now() - 4 * DAY, 'preferences'),
  makeFact('Nothing with visible logos.', Date.now() - 3 * DAY, 'preferences'),
  makeFact('I am in Geneva most of the year and in London every spring.', Date.now() - 2 * DAY, 'places'),
];

// ── Remember-intent detection ────────────────────────────────────────────────
//
// Phrases that mean "store this". Anything matching gets kept as a fact; the
// chat replies with the "Memory updated" chip. Deliberately simple string
// matching - a real build would do this server side.

const EXPLICIT = /^\s*(please\s+)?(remember|note|keep in mind|don'?t forget)\b/i;
const IMPLICIT = [
  /\bi (really |absolutely |generally |usually )?(like|love|prefer|favour|favor|collect|wear|own)\b/i,
  /\bi'?m (a |an )?(size|fan of)\b/i,
  /\bmy (size|budget|style|taste|birthday|anniversary|wife|husband|partner|kids?)\b/i,
  /\b(don'?t|do not|never|stop) (recommend|show|send|suggest)\b/i,
  /\bnot interested in\b/i,
];

/** Strip the "remember that ..." wrapper so the stored fact reads on its own. */
const LEAD = /^\s*(please\s+)?(remember|note|keep in mind|don'?t forget)\s*(that|to)?[,:\s]*/i;

function tidy(sentence: string): string {
  const trimmed = sentence.trim().replace(/[.!?]+$/, '');
  if (!trimmed) return '';
  return `${trimmed[0].toUpperCase()}${trimmed.slice(1)}.`;
}

/**
 * Pull the fact worth storing out of a chat message, or null when the message
 * is not asking the concierge to remember anything.
 *
 * "Remember that I like Van Cleef & Arpels. Recommend me it more."
 *   -> "I like Van Cleef & Arpels."
 */
export function extractMemory(message: string): string | null {
  const sentences = message.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return null;

  for (const sentence of sentences) {
    if (EXPLICIT.test(sentence)) {
      const stripped = tidy(sentence.replace(LEAD, ''));
      // "Remember this" on its own carries no fact - fall through to the rest.
      if (stripped.length > 3) return stripped;
    }
  }
  for (const sentence of sentences) {
    if (IMPLICIT.some((re) => re.test(sentence))) return tidy(sentence);
  }
  return null;
}

// ── Manage Memory commands ───────────────────────────────────────────────────
//
// Everything typed into the Manage Memory field is a memory instruction, so the
// only question is add or remove. Chat goes through extractMemory() instead,
// because most chat messages are not about memory at all.

const FORGET = /^\s*(forget|remove|delete|drop)\s*(that|the|about|my)?[,:\s]*/i;

export type MemoryCommand =
  | { kind: 'add'; text: string }
  | { kind: 'forget'; query: string };

export function parseMemoryCommand(input: string): MemoryCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (FORGET.test(trimmed)) {
    const query = trimmed.replace(FORGET, '').replace(/[.!?]+$/, '').trim();
    if (query) return { kind: 'forget', query };
  }
  return { kind: 'add', text: tidy(trimmed.replace(LEAD, '')) || tidy(trimmed) };
}

/** Facts a "forget ..." command should drop: any that share a word with the query. */
export function matchesForget(fact: MemoryFact, query: string): boolean {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9&']+/)
    .filter((w) => w.length > 2);
  if (words.length === 0) return false;
  const haystack = fact.text.toLowerCase();
  return words.some((w) => haystack.includes(w));
}

/** "Updated 4 minutes ago" / "Updated 2 days ago" for the Manage Memory header. */
export function relativeTime(ts: number, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - ts) / 60000));
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
