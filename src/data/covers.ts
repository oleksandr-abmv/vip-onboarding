// ─── Generated collection covers ─────────────────────────────────────────────
//
// A collection's cover is **generated, never uploaded**. That is the whole point
// of the feature: the app owns the picture, so every cover is the same shape and
// the same 4:3 safe fit, and no collection ends up with someone's sideways phone
// photo stretched across the top of the page.
//
// The prototype has no live image model behind it, so "generate" walks a library
// of pre-generated editorial textures. Regenerating always moves to a different
// one, which is what the user is asking for when they press it.

export const GENERATED_COVERS: string[] = [
  '/covers/silk.webp',
  '/covers/marble.webp',
  '/covers/leather.webp',
  '/covers/wool.webp',
];

/** The next cover in the rotation, never the one already showing. */
export function nextCover(current?: string): string {
  const i = current ? GENERATED_COVERS.indexOf(current) : -1;
  return GENERATED_COVERS[(i + 1) % GENERATED_COVERS.length];
}

/**
 * Whether a cover can be cropped to fill a box that is not its own ratio.
 *
 * Generated covers are edge-to-edge texture, so cropping them is free. An
 * **outfit's flat-lay** is a composed picture with its pieces near the edges, so
 * it has to be contained instead - crop it and the look loses a shoe.
 */
export const coverFillsBox = (src: string): boolean => src.startsWith('/covers/');
