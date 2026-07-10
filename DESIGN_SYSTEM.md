# VIP.AI - Design System

The single source of truth for how the prototype looks. When you build or change
UI, match these tokens and component specs so the app reads as one system. Values
are the ones actually used in the codebase (mostly inline styles today; the token
mirror lives in `src/theme.ts`).

This complements `CLAUDE.md` (which covers flow logic, gender/lifestyle branching,
copy tone, and the VIP-logo placeholder rule). Styling questions → this file.

---

## 0. The golden rules

1. **Rounded corners, always - never sharp.** No interactive button is a sharp
   rectangle (`borderRadius: 0`).
   - **In-content icon buttons** (card favorite, sheet/deck controls) → rounded
     square **12px**.
   - **Primary CTA buttons** (Continue, Explore, Ask VIP.ai) → **pill 100px**.
   - **Floating / nav controls and the primary nav action** (bottom-bar concierge,
     product-page back / share / heart) → **circle** (`50%`).
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
Top-level tab: **centered "Discover" title** (no back button, search, or subtitle),
the onboarding banner (while incomplete), then a **Pinterest-style masonry** - two
columns of product cards (no chips, no badges). Products are dealt alternately into
the two columns (so categories mix); the right column is offset down `28px` and card
image heights vary (`FEED_RATIOS`) so the layout reads uneven/staggered. (The Saved
view keeps its chips + badges + even 2-column grid.)

### Saved Products view
A **top-level tab** (heart in the bottom bar), so **no back button**. Header
"Saved Products". Horizontal **category filter chips** at the top (`All` + each saved
category; active = white pill), resetting to `All` each time it opens. Below: a
**2-column grid** (Pinterest-like) of product cards, each with a **category badge**
(pill, `rgba(255,255,255,0.06)` + `#2a2a2a` border) below the brand. The feed itself
no longer carries a saved section - saved lives only in this tab. Category "See all"
pages keep a back button + single-column large cards.

### Product card
`background #0c0c0c`, `border 1px solid #282828`, `borderRadius 16`, `overflow hidden`.
- Image area: `aspect-ratio 4/3`, `background #ececec` (both modes), image `objectFit contain`.
- Placeholder (no asset): VIP logo, `filter brightness(0)`, `opacity 0.3` on the gray.
- Meta: title 15/600, then brand (left, `#999`) + price (right, `#dedfe1`).
- Favorite icon button top-right (see above).

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
- **Nav**: three circular icon buttons - back (left), share + heart (right,
  heart fills `#ef4d63` when saved), "Details" centered. Circles (`50%`), bg
  `rgba(255,255,255,0.08)`, border `#282828`.
- **Hero**: 250px, `background #ececec`, image `objectFit contain`.
- **Title** 24/600 (`brand + name`), **price** 16/500 `#bdbdbd` (hidden if empty).
- **CTAs**: pinned to a **fixed bottom action bar** (not in the scroll flow),
  `borderTop 1px #1c1c1c`, safe-area padding. Two stacked pills - primary = filled
  `#f6f6f6`/`#121212`; secondary = **outlined** (transparent, `1px solid #3a3a3a`).
  The favorite snackbar raises to `bottom: calc(145px + safe)` here so it clears
  the action bar.
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
