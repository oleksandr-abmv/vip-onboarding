// ─── Map canvas geometry ─────────────────────────────────────────────────────
//
// The coordinate space shared by the drawn map (`src/components/StoreMap.tsx`)
// and the boutiques plotted on it (`src/data/boutiques.ts`). Boutique positions
// are normalised 0..1 of this plate, and their distances are derived from it, so
// a pin and the "3.5 km" next to its name are the same measurement.

export const MAP_W = 360;
export const MAP_H = 780;

/** Where the "you are here" marker sits, normalised 0..1. */
export const USER_POS = { x: 0.5, y: 0.44 };

/** Map units per kilometre - tuned so a city-centre pin reads 1-6 km out. */
export const PX_PER_KM = 26;

export type MapRegion = { x: number; y: number; w: number; h: number };

/**
 * Zoomed band around the user - what the product page preview shows. Framed so
 * the user marker sits off-centre: the "View on map" pill takes the middle of
 * the card, and nothing that matters hides underneath it.
 */
export const PREVIEW_REGION: MapRegion = { x: 20, y: 262, w: 268, h: 131 };

/** The whole plate, for the full-screen view. */
export const FULL_REGION: MapRegion = { x: 0, y: 0, w: MAP_W, h: MAP_H };
