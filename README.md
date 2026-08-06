# VIP.AI - Onboarding & Concierge Prototype

A mobile prototype for a luxury-goods concierge app: personalized onboarding, a
tailored Discover feed, an AI concierge chat with Data Memory, saved pieces with
user-curated Collections, and a camera Scan flow that matches any piece against
the catalog. React + Vite + TypeScript, rendered inside a phone frame. Dark
theme, Inter, Material Symbols Rounded.

Live: https://vip-ai-onboardingv51.vercel.app

## Features

- **Onboarding** - gender → status → (kids) → lifestyle → interests →
  subcategories → swipe deck → notifications → tailoring. Skippable at the gate;
  resumable from the feed banner.
- **Discover** - top picks, trending, coordinated looks, styled outfits, decor
  sets and category groups built from the interests picked during onboarding.
  **There is no catalog search**: matching a typed string against tags only finds
  what is already labelled, so the concierge does that job instead.
- **Saved** - collections are the only kind of saving: hearts everywhere (cards,
  product page, scan matches) file a piece into one. **A piece lives in exactly
  one collection**, so the picker is a radio list and filing moves rather than
  copies. A collection is a name and the pieces in it - no description, notes,
  cover, pinning or try-on - and its card is the 2x2 mosaic of what is
  inside. The one search field left is the Saved tab's, filtering that list by
  name. Per-collection: rename, delete, and the concierge as a prompt field;
  a look you have not filed yet floats "Save to my collections" instead.
- **Scan** - the dock's fourth item, also reachable from the Menu tab's "Scan
  product" row: viewfinder (flash, camera flip, upload), a processing pass over
  the taken photo, then matching pieces and a "None of these? Ask AI Concierge"
  hand-off carrying the photo.
- **Chat** - the VIP.ai concierge with **Data Memory**: facts the user shares are
  remembered (with a "Memory updated" chip), manageable from Menu > Data Memory.
  Hand it a collection and ask it to update it and it **files new pieces for
  real**, answering with the collection in its new state.

## Run it

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
```

```bash
npm run build      # typecheck + production build
npm run lint       # eslint
npm run preview    # serve the production build
```

Deploy: `vercel --prod --yes`.

## Where things live

```
src/
  App.tsx                   onboarding flow, navigation, progress
  screens/                  one file per screen; FeedScreen owns the post-
                            onboarding tabs and all shared state (memory,
                            chat thread, collections)
  components/               dock, sheets, dialogs, icons, collections sheets
  data/                     products (auto-discovered from /public/products),
                            categories, price history, memory, collections
  theme.ts                  color / radius / spacing / motion tokens
```

- [CLAUDE.md](CLAUDE.md) - conventions, flow invariants, and the
  "apply everywhere" rules that keep the prototype consistent.
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - tokens and component specs (the
  source of truth for any UI work).

## Notes

- The catalog is auto-generated from image filenames in `public/products/`
  (`src/data/productImages.ts`); prices come from a deterministic mock price
  history so the same piece always shows the same value.
- The scan camera is simulated for the prototype: the shutter "captures" a
  catalog piece, and Upload accepts a real image file.
- All state is in-memory; reloading resets the session.
