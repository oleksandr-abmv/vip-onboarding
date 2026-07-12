# VIP.AI - Design System

The single source of truth for how the prototype looks. When you build or change
UI, match these tokens and component specs so the app reads as one system. Values
are the ones actually used in the codebase (mostly inline styles today; the token
mirror lives in `src/theme.ts`).

This complements `CLAUDE.md` (which covers flow logic, gender/lifestyle branching,
copy tone, and the VIP-logo placeholder rule). Styling questions → this file.

---

## 0. The golden rules

1. **Fully rounded, always.** Every button and icon button uses **`borderRadius: 100`**
   - a pill for wide buttons, a circle for square icon buttons (card favorite,
   store favorite, product-page nav, bottom-bar concierge). Never sharp, never a
   rounded square.
2. **Dark, monochrome, luxury.** Near-black backgrounds, white/off-white text,
   one warm accent (`#ef4d63`) reserved for the saved/favorite heart. No blues,
   purples, or brand colors from the light-mode Figma - the app is monochrome dark.
3. **One product-image backdrop.** Product imagery always sits on light gray
   `#ececec`, in both light and dark modes (gallery look).
4. **No long dashes anywhere** (see `CLAUDE.md`). Hyphen, comma, or two sentences.

---

## 1. Color

### Surfaces & backgrounds
| Token | Value | Use |
|---|---|---|
| Background | `#0A0A0A` | App background (near-black) |
| Card surface | `#0c0c0c` | Product cards, deck cards |
| Elevated surface | `#141414` / `#1C1C1C` | Sheets, raised panels |
| Saved-section surface | `rgba(255,255,255,0.035)` | "Your Saved Products" block |
| Banner surface | `rgba(255,255,255,0.04)` | Onboarding banner card |
| Product image backdrop | `#ececec` | Behind every product photo (both modes) |
| Hover/overlay tile | `rgba(255,255,255,0.06)` | Subtle interactive fills |

### Borders
| Token | Value | Use |
|---|---|---|
| Card border | `1px solid #282828` | Cards, sections |
| Hairline / divider | `1px solid #212121` / `#313131` | Section dividers |
| Selected | `1.5px solid #fff` | Selected onboarding cards |
| Icon-button border | `1px solid rgba(255,255,255,0.12)` | Icon buttons on imagery |

### Text
| Token | Value | Use |
|---|---|---|
| Primary | `#FFFFFF` / `#f6f6f6` / `#f7f7f7` | Headings, card titles |
| Secondary | `#999999` | Subtitles, brand line, "See all" is `#cfcfcf` |
| Tertiary / muted | `#666` / `#888` | Disabled, faint meta |
| On-light (CTA/snackbar) | `#121212` | Text on light buttons/toasts |

### Accent & state
| Token | Value | Use |
|---|---|---|
| Saved heart (filled) | `#ef4d63` | Only for the saved/favorite heart |
| Heart outline | `#e7e7e7` | Unsaved heart icon |
| CTA primary bg / text | `#f6f6f6` / `#121212` | Enabled primary button |
| CTA disabled bg / text | `#252525` / `#666` | Disabled primary button |
| Progress track / fill | `#333` / `#f0f0f0` | Onboarding progress bar |

---

## 2. Radius scale  ← the important one

| Token | Value | Applies to |
|---|---|---|
| `button` | **12px** | Buttons AND icon buttons with a background |
| `card` | **16px** | Product / content cards, banner |
| `cardSm` | **12px** | Compact cards, inner tiles |
| `pill` | **100px** | Primary CTA pills, segmented toggles, chips |
| `sheet` | **20px 20px 0 0** | Bottom-sheet top corners |
| `phone` | 32px | PhoneFrame shell |

**Never** use `borderRadius: 0` on an interactive button. Circles (`50%`) are only
for floating / nav controls and the primary nav action (see golden rule #1) - not
for in-content icon buttons, which are rounded squares. Decorative non-interactive
circles (radio dots, avatar chips, spinners, progress dots, confetti) may stay
circular - they are not buttons.

---

## 3. Typography

Inter (body) + the heading face. Sizes/weights in use:

| Role | Size / weight / line-height |
|---|---|
| Screen title (H1) | 20 / 600 / 26 |
| Section heading (H2) | 16 / 600 / 24 |
| Card title | 15-18 / 600 / 20-22 |
| Body | 16 / 400 / 22 |
| Secondary / eyebrow | 13-14 / 400-500 / 18-20 (color `#999`) |
| Button label | 15-16 / 500 |
| Snackbar / caption | 14 / 500 / 20 |

---

## 4. Spacing & layout

| Token | Value |
|---|---|
| Page margin (horizontal) | **16px** (`PAGE` in FeedScreen) |
| Card gap | 12px |
| Section vertical padding | 12px (16px for surfaced sections) |
| Safe area top | `safeTop(px)` from `theme.ts` |
| Safe area bottom | `calc(Xpx + env(safe-area-inset-bottom, 0px))` |

Horizontal scrollers must set `scroll-padding: 0 16px` so snap respects the page
margin (otherwise the first card scrolls flush to x=0).

---

## 5. Components

### Primary CTA (pill)
`height 44-52`, `background #f6f6f6`, `color #121212`, `borderRadius 100`,
`fontSize 15-16 / 500`. Disabled → `#252525` bg / `#666` text.

### Secondary / ghost button
`background rgba(246,246,246,0.1)`, `color #f6f6f6`, pill or `borderRadius 12`.

### Icon button (with background)  ← rounded square
`borderRadius 12`, square footprint (32 / 40 / 48px), centered icon.
Examples: card favorite, sheet close, deck info, thumb up/down, bottom-bar center.
Favorite: bg `rgba(20,20,20,0.72)`, saved icon `#ef4d63` filled, unsaved `#e7e7e7`.

### Discover feed
Top-level tab. The header is a **gradient-fade bar** (ChatGPT-style): a centered
"Discover" title on a `linear-gradient(#0A0A0A -> transparent)` that is
absolutely positioned over the scroll area (`pointer-events: none` so scrolling
passes through), so content **dissolves as it scrolls beneath it** rather than
hitting a hard edge. The body carries `padding-top` to clear it. Below: the
onboarding banner (while incomplete), then three groups:
- **Top picks for you** and **Trending** - identical treatment: a horizontal
  **carousel** of 230px `ProductCard`s (heart + "..." menu) + "View all".
- **Collections** - a horizontal carousel of `CollectionCard`s (+ "View all"),
  each a **coordinated look**: one piece from each of up to four distinct wearable
  categories (a top, shoes, a bag, an accessory) with a themed name + "N pieces".
  Cards carry a "..." menu (no favorite).
- **Categories** - a **2-row horizontally-scrolling list** of compact `CategoryRow`s
  (thumbnail + name + count); when there are **only two**, they render **full-width
  stacked** instead of scrolling.
  (`grid-auto-flow: column`, two rows). Each row is a list item: a 54px rounded
  thumbnail + category name + "N items". Tapping opens the category as a list.

`CollectionCard` (used by **Collections**) matches the **regular product card**
(230px wide, 4:3 image, same height): its image is a **2x2 grid of the first four
items** (1px even gutters, no "+N" overflow) + name + "N pieces", plus a "..." menu
(self-contained `OverflowMenu`, portaled like the product-card menu). The
Categories/carousel scrollers keep their horizontal padding on the **inner track**
so the right inset survives at scroll end.

The Discover bottom is just the **tab bar** (the search `ChatBar` was removed here
as redundant; it stays on the Product Page). Products are stably shuffled
(deterministic) so every group mixes categories. Products **without real imagery**
(the VIP-logo placeholder) are hidden from the feed, as is anything marked "Do not
recommend". "View all" / a collection opens a titled full-screen list.

### Saved Products view
A **top-level tab** (heart in the bottom bar), so **no back button**. Header
"Saved Products", then a **full-width 2-segment switcher** (`Products` / `Stores`,
pill track `#141414`, active segment filled `#f6f6f6`/`#121212`). **Products**
shows a plain **2-column grid** of saved cards - no filter chips, no category
badges. **Stores** is its own tab: boutiques saved via the heart on a product
page's store card persist here as full-width `SavedStoreCard`s (storefront photo +
name + tagline + address, filled heart to remove). Each empty tab has a **centered
empty state** (no button): one shared **skeleton illustration** (`SkeletonCards` -
three static fanned ghost cards mimicking the real content, no animation), title,
and subtitle. Category "See all" pages keep a back button
+ single-column large cards. The shared `CenteredEmptyState` renders these.

### Product card
`background #0c0c0c`, `border 1px solid #282828`, `borderRadius 16`, `overflow hidden`.
- Image area: `aspect-ratio 4/3`, `background #ececec` (both modes), image `objectFit contain`.
- Placeholder (no asset): VIP logo, `filter brightness(0)`, `opacity 0.3` on the gray.
- Meta: title 15/600, then brand (left, `#999`) + price (right, `#dedfe1`).
- Top-right controls: the **overflow "..." button** (`more_vert`) takes the
  corner, with the **favorite** button directly to its left (both same pill
  treatment). On menu-less cards (detail / saved grids) the heart keeps the
  corner. Tapping "..." opens an in-card dropdown (`#1f1f1f`, `borderRadius 14`,
  top-right anchored, `menuPop` scale-in) with **"More like this"** (`thumb_up`)
  and **"Do not recommend"** (`block`, destructive pink `#ef8a99`). The open menu
  is **controlled by a single lifted `openMenuId`** so only one card's menu shows
  at a time, and any **scroll closes it immediately** (capture listener on the
  scroll body). It is **portaled to `<body>`** with fixed positioning anchored to
  the "..." button, so it escapes the card + carousel `overflow` clipping (never
  hidden behind the edge). It renders on the Top-picks and Trending carousel cards.

### Snackbar / toast (reversed for prominence)
Floats **8px above the bottom bar** (`bottom: calc(71px + safe-bottom)`, where the
bottom bar is `44 icons + 8 + 10 + 1 border = 63px`; left/right 16), animating in with
`fadeInUp`. `background #f6f6f6`, `color #121212`, `borderRadius 10`, strong shadow.
Action button: `background #121212`, `color #f6f6f6`, `borderRadius 12`.
Auto-dismiss ~3.6s. Save → "Saved to your list" / **View**; remove → "Removed from
your list" / **Undo**.

### Bottom bar
`background #0d0d0d`, `borderTop 1px solid #282828`, 5 items. Active icon `#fff`,
inactive `#6f6f6f`. Center action (concierge) = filled `#f6f6f6` **circle** (`50%`).
Tabs: Home, Saved (**heart** icon - matches the app's heart save action), Concierge
(center), History, More.

### Product Page (`src/screens/ProductPage.tsx`)
Full-screen overlay opened by tapping any product card.
- **Nav**: a **gradient-fade overlay** (same pattern as the Discover header) -
  absolutely positioned, `rgba(10,10,10,.92) -> transparent`, `pointer-events:
  none` so the hero scrolls underneath. Three circular icon buttons - back (left),
  share + heart (right, heart fills `#ef4d63` when saved), "Details" centered.
  Buttons use a **translucent dark fill** (`rgba(20,20,20,.55)` + blur,
  `1px solid rgba(255,255,255,.14)`, `borderRadius 100`) so they stay legible as
  the scrim fades over the light hero.
- **Hero**: 300px with `padding-top` clearing the nav, `background #ececec`,
  image `objectFit contain`.
- **Title** 24/600 (`brand + name`), **price** 16/500 `#bdbdbd` (hidden if empty).
- **Primary action**: **"Explore on Official Site"** (filled pill
  `#f6f6f6`/`#121212`) sits **inline right under the description bullets**, not in a
  pinned bar.
- **Floating chat**: an **"Ask about this product"** `ChatBar` floats over the
  bottom with a **fade-up gradient** (`to top, #0A0A0A -> transparent`), like the
  nav bar, so content scrolls underneath it. The scroll body carries bottom padding
  to clear it; the favorite snackbar raises to `bottom: calc(80px + safe)`.
- **Description**: paragraph + derived bullet list (category / type / gender).
- **Spec table**: Brand / For / Category rows, label `#999` medium left, value
  `#f2f2f2` right, hairline dividers.
- **Section divider**: 6px `#141414` band.
- **Available in stores**: horizontal Store Cards.

### Store card
264px wide, `borderRadius 16`. Image area 150px shows a **real storefront photo**
(`object-fit: cover`, pulled from the internet via loremflickr), with an `onError`
fallback to the brand wordmark (uppercase, letter-spaced, `#1a1a1a` on `#ececec`).
A "Nkm from you" pill tag (bottom-right) and a rounded-square favorite (top-right,
toggles + fires the snackbar). Meta: name 16/600, tagline `#999`, then location +
phone rows (Material icon + text).

### Chat bar (`src/components/ChatBar.tsx`)
A pill input reused with a context placeholder: **"Search for products"** on
Discover, **"Ask about this product"** on the Product Page. A `#161616` pill
(`borderRadius 100`, `1px solid #282828`); on the right, a **`+`** (attach) icon
then a round button that shows a **mic** when empty and fills to `#f6f6f6` with an
`arrow_upward` once there's text. On Discover it's part of the **combined dock**
(input directly above the tab bar on one surface); on the Product Page it's pinned
on its own. Prototype: send is a no-op that clears the field.

### Snackbar z-order
The snackbar (`z 90`) sits above the product-page overlay (`z 80`) so favorite
toasts appear **everywhere** a favorite is added - feed, saved view, and product
page (product heart + store card favorites).

### Empty state placeholder
Uniform VIP logotype (`/vip-logo.svg`) - never per-item icons. On dark: white logo
`opacity 0.35`. On the light-gray card: `filter brightness(0)`, `opacity 0.3`.

---

## 6. Motion

| Token | Value |
|---|---|
| Default easing | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Default duration | 400ms |
| Entrance | `fadeInUp` (translateY + fade), staggered ~60-80ms |
| Sheet in | `sheetSlideUp` 300-320ms |

---

## 7. Where things live

- Tokens: `src/theme.ts` (colors, `radii`, spacing, animation, safe-area helpers)
- Feed / cards / snackbar / bottom bar: `src/screens/FeedScreen.tsx`
- Swipe deck, thumb & icon buttons: `src/screens/RefineYourTaste.tsx`
- Flow, nav, progress, onboarding %: `src/App.tsx`
- Flow logic, copy tone, placeholder rule, gender/lifestyle branches: `CLAUDE.md`
