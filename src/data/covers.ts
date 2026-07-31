// ─── Generated collection covers ─────────────────────────────────────────────
//
// A collection's cover is **generated, never uploaded**. That is the whole point
// of the feature: the app owns the picture, so every cover is the same shape and
// the same 4:3 safe fit, and no collection ends up with someone's sideways phone
// photo stretched across the top of the page.
//
// The prototype has no live image model behind it, so "generate" walks a library
// of pre-generated covers. Regenerating always moves to a different one, which is
// what the user is asking for when they press it.
//
// They are **cut-out pieces on white, exactly the flat-lay language the outfit
// and decor art uses** - not abstract texture and not styled-on-a-surface
// photography. A cover stands for a collection of things, so a swatch of silk
// said nothing about it, and a shot on stone belonged to a different app. Every
// cover is landscape 4:3 with its own ~6% safe margin baked in, so it lands
// flush in a 4:3 box and needs no cropping anywhere.

export const GENERATED_COVERS: string[] = [
  '/covers/watch-desk.webp',
  '/covers/bag-scarf.webp',
  '/covers/shoes-belt.webp',
  '/covers/jewellery.webp',
  '/covers/holdall.webp',
  '/covers/knitwear.webp',
];

/** The next cover in the rotation, never the one already showing. */
export function nextCover(current?: string): string {
  const i = current ? GENERATED_COVERS.indexOf(current) : -1;
  return GENERATED_COVERS[(i + 1) % GENERATED_COVERS.length];
}
