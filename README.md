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
- **Discover** - a search field over top picks, trending, coordinated looks, and
  category groups built from the interests picked during onboarding. Searching
  swaps the groups for a results grid in place.
- **Saved** - collections are the only kind of saving: hearts everywhere (cards,
  product page, scan matches) manage which collections a piece belongs to.
  Collections carry a name, description, price total, and an optional note per
  piece; their covers show placeholders when sparse and a "+N" badge when full.
  Per-collection: Ask AI Concierge (new chat with the collection attached), virtual
  try-on (clothing only), rename, delete, and an add sheet that combines catalog
  search and camera scan.
- **Scan** - the dock's fourth item, also reachable from the Discover search
  field's brackets and the Menu tab's "Scan product" button: viewfinder (flash,
  camera flip, upload), a processing pass over the taken photo, then matching
  pieces with a pinned ask-concierge CTA and a search-manually escape.
- **Chat** - the VIP.ai concierge with **Data Memory**: facts the user shares are
  remembered (with a "Memory updated" chip), manageable from Menu > Data Memory.

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
                            chat thread, collections, Discover search)
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
