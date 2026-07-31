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

Tokens live in `src/theme.ts` (`theme.radii`). Use them rather than raw numbers.

| Token | Value | Applies to |
|---|---|---|
| `button` | **100px** | Buttons AND icon buttons - pill when wide, circle when square |
| `chip` | **100px** | Chips, segmented toggles, suggestion rows |
| `pill` | **100px** | Alias kept for existing call sites |
| `input` | **12px** | Prompt field / dropdown - the one control that is **not** rounded |
| `card` | **16px** | Product / content cards, banner, grouped lists |
| `cardSm` | **12px** | Compact cards, inner tiles, popovers |
| `sheet` | **12px 12px 0 0** | Bottom-sheet + dialog top corners |
| `phone` | 32px | PhoneFrame shell |

**Never** use `borderRadius: 0` on an interactive button, and never a rounded
square: buttons, icon buttons and chips are **fully rounded** (golden rule #1).
The prompt field is the deliberate exception - the design gives it `radius 12` so
it reads as a field, not a button.

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
`background rgba(246,246,246,0.1)` or transparent with `1px solid #444547`,
`color #f6f6f6`, `theme.radii.button` (pill).

### Icon button (with background)  ← circle
`theme.radii.button`, square footprint (32 / 36 / 40 / 48px), centered icon.
Examples: card favorite, sheet close, nav bar controls, chat actions, deck info,
thumb up/down. Favorite: bg `rgba(20,20,20,0.72)`, saved icon `#ef4d63` filled,
unsaved `#e7e7e7`. The bordered variant (`iconButtonStyle` / `sheetIconButtonStyle`)
is `#101111` on `1px solid #444547`.

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

`CollectionCard` (used by **Collections**) is the shared `CollectionCover` **2x2
grid** (1px even gutters, "+N" scrim past four) + name + "N pieces", plus a
**favorite heart** (saves the whole look to Saved > Collections) and a "..." menu
(self-contained `OverflowMenu`, portaled like the product-card menu). Discover's
**Collections** group stays a **horizontal carousel** (230px cards) but the cards
read like the Saved tab's: same cover, and the same **"N items · $total"** meta via
`outfitMeta()` rather than a bare "N pieces". **Tapping one opens the collection
page**, not a generic product list - previewed until the look is hearted (see
**Collection page**). The
Categories/carousel scrollers keep their horizontal padding on the **inner track**
so the right inset survives at scroll end.

Discover opens with the **onboarding-progress banner** (while onboarding is under
100%) at the very top, then the **search field**: placeholder "Search for products",
with the scan brackets inside it opening the same camera overlay as the Scan dock
item. The field's top padding is 16 when the banner is absent and 8 when it is
there, so the gap stays even either way. **The field is an affordance, not an
input** - it carries `onActivate`, so tapping it opens the **search modal** (see
below) rather than typing in place. The feed itself never shows results.

The Discover bottom is just the **tab bar**. Products are stably shuffled
(deterministic) so every group mixes categories. Products **without real imagery**
(the VIP-logo placeholder) are hidden from the feed, as is anything marked "Do not
recommend". "View all" / a collection opens a titled full-screen list.

### Saved view
A **top-level tab** (heart in the bottom bar), so **no back button**. The dock
label and the page header are both **"Saved"**. The page is
**collections only** - no segment switcher, no saved-products list, and stores
are not saveable anywhere. The header is the **56px navBar** (like the Chat tab's) so
its action sits centred in the bar: **`add_2`** alone, the shared 40px bordered
circle (`iconButtonStyle`). Search is a **`<SearchField>` on the page** that
filters the list in place. The body is a **single column** (`savedColStyle`) of
full-width `CollectionCard`s whose meta line is **"N items · $total"** (`meta` prop
overrides the default "count unit"); tap opens the **collection page**.
Collections are ordered **newest first** (`createdAt` descending), so the one just
saved leads the list. **`NewCollectionCard` closes the list** as a **horizontal
64px row** - `1px dashed #3a3a3a` on `rgba(255,255,255,0.02)`, `radius 16`, a 22px
`add_2` beside "New Collection" 15/600. Horizontal and last, so it reads as the
action at the end rather than another collection in the column; the dashed outline
reads as an empty slot rather than something that already exists. It is hidden
while the list is filtered, where it would read as a result.

The empty state is the shared `CenteredEmptyState` (skeleton illustration +
title + subtitle, no button). Category "See all" pages keep a back button +
single-column large cards.

**Hearts manage collection membership everywhere.** A heart fills when the piece
sits in any collection; tapping one (product card, product page nav, scan match
row) opens the Add to collection flow with the piece's collections pre-checked -
unchecking and saving removes it. There is no separate bookmark glyph.

### Collections (`src/data/collections.ts`, `src/components/CollectionSheets.tsx`, `src/screens/CollectionPage.tsx`)
User-curated groups of saved pieces: `id`, `name`, `description`, ordered
`items` (product names), and an optional **note per piece**. Owned by
`FeedScreen` (like Data Memory) because Saved, the product page, the scan
results, and Discover's look hearts all write to the same list. Prices come from
the shared deterministic price history (`priceOf`), summed into the "N items ·
$total" meta line (`collectionMeta`).

**The cover** (`CollectionCover`, shared between the 56px row thumb and the full
card at `size="100%" aspect="4/3"`): always a 2x2 grid. 0 items → one full tile on
`#161616` with the VIP logotype at `opacity 0.35`; 1-4 items → images fill in on
the `#ececec` gallery backdrop and **empty cells take the same `#161616` surface**
with the logotype at `opacity 0.22`, no filter. The light backdrop exists to sit a
product on, so a slot with no product does not get it, and a half-filled cover
stops reading as a grid with the lights left on. 5+ items → 3 previews and the 4th
image under a `rgba(10,10,10,0.62)` overlay with a **"+N"** label (N = count - 3).

**Ways in** (all lead to the same sheet flow):
- **Hearts** - product cards, the product page nav, scan match rows.
- Hearting a **look** on Discover files the look as a collection.
- **New collection** on the Saved tab (standalone create sheet).
- The collection page's pinned **Add pieces** sheet (below).

**Add to collection flow** (`AddToCollectionFlow`): select → create → note.
- *Select*: sheet header is **X · "Add to collection" · Create** (the sheet's
  `action` slot). Rows: 56px `CollectionCover` + name + meta + **`CheckCircle`**
  - a 24px multi-select circle, `1.5px solid #444547` empty, filled `#f6f6f6`
  with a dark 16px `check` when selected. Collections already holding the piece
  open **pre-checked**; the CTA reads **Next** when the selection adds
  collections, **Save** when it only removes, and is disabled while unchanged.
  No collections yet → opens on *create*.
- *Create* (`CreateCollectionSheet`): Name input + Description textarea
  (`#161616` on `1px solid #282828`, `radius 12`) + **Create Collection** CTA.
  Reused for **Rename** with `title="Edit collection"`, `cta="Save Changes"`.
- *Note*: the piece as a mini row (56px thumb + name + category · price), a Note
  textarea, **Save**. Additions confirm with **"Added to {name}" / View** (View
  opens the collection); pure removals confirm with **"Removed from your
  collections" / Undo**.

**Add pieces sheet** (`AddItemsSheet`, full-height): search and scan share one
field - the shared **`<SearchField>`** (see below) autofocused, with a
**`photo_camera` trailing action** that closes into the scan overlay. **Idle state** until the
user types (centered "Search the catalog" + hint); results are mini rows where
**one tap adds that piece** (trailing `add_2` → filled `check_circle` once in
the collection; added rows are inert). No multi-select, no footer CTA.
**Both empty states offer the concierge** (`<AskConciergeOffer>`), since the catalog
only holds what is already tagged in it. It closes the sheet into a NEW chat,
carrying the typed query when there was one.

`<AskConciergeOffer>` is the shared block behind every one of these, and it is
deliberately three elements: an "or" hairline rule, a **filled `Ask AI Concierge`
pill** (48px, `<ConciergeMark onLight>` + label), and **one 13/18 `#999` line**
under it - "Describe an occasion, a budget or a mood. It looks past the catalog."
That line is the argument for asking rather than typing, and it earns one line: a
headline plus a panel of worked examples was built here first and made an empty
search screen feel like homework.

**Collection page** (`CollectionPage`, a z-200 push over the Saved tab, kept
while visiting other tabs, entering with `screenSlideInRight` 320ms): the header
bar carries only back + `more_horiz`; the body opens with a **centered title
block** - name **24/600**, "N items · $total", description 15/`#999` - then the
**action stack** (below). Items are the app's `<ProductCard>` in a 2-col grid, with
the note dropped into the card's `footer` slot: a **`#1c1c1c` strip on `1px solid
#2a2a2a`, `radius 10`, `padding 6px 10px`**, holding the text **14/20 `#ededed`,
italic**, clamped to **2 lines** ("Add Note" when empty; tapping opens `NoteSheet`).
No label and no glyph in front of it - the box plus the italic is what says this is
the user's own writing, without spending a line of a narrow card on the word
"Note". Two lines, so a long note cannot stretch its card past the one beside it. There is **no per-item "..." menu** - it only ever duplicated the note
strip and the heart, and **no pinned bottom bar**. The nav bar carries **search**
then **`more_horiz`**.
**`preview` mode** is the same page for a **Discover look the user has not saved
yet** (opened by tapping a Collections card; there is no stored `Collection` behind
it, so FeedScreen stands one up from the look). It stays fully usable: notes and
hearts work, and the hearts carry their app-wide meaning - filled only when the
piece sits in some collection, tapping opens Add to collection - rather than
"remove from this collection". What changes is only what needs a stored collection:
the primary action becomes **"Save Collection"** instead of Add pieces, and Rename /
Delete drop out of the menu. **Writing a note files the look** in the same state
update (`setCollectionNote`'s `fileIfMissing`), so the note always lands somewhere;
saving either way flips the page into the real one.

Under the title block sits the **action stack**: full-width buttons, one filled
`primaryActionStyle` then outlined `outlinedActionStyle` (both from
`screens/screenChrome.tsx`, shared with the product page), `gap 8`. **Virtual try-on
leads** - it is what you came to a collection of clothes to do - and the
collection's own action sits under it, the way Add to collection does elsewhere:

| State | Primary | Outlined |
| --- | --- | --- |
| Has clothing, saved | Virtual try-on (`apparel`) | Add pieces |
| Has clothing, preview | Virtual try-on (`apparel`) | Save Collection |
| No clothing, saved | Add pieces (`add_2`) | - |
| No clothing, preview | Save Collection (`favorite`) | - |

A preview never offers Add pieces: there is no stored collection to add to yet.

The concierge is **not a button here**. A prompt-only `<BottomDock>` is **pinned at
the bottom of the page**, and sending starts a NEW chat with the typed text and the
collection attached. Its **placeholder cycles**: a static `placeholderPrefix`
**"Ask to"** with only the tail moving through "find you a piece", "add pieces" and
"modify this collection". `placeholder` takes an array, the phrases are drawn in a
span over a placeholder-less input (the attribute cannot animate) and swapped every
**2800ms** on `placeholderCycle`, which rises each phrase in, holds it, and lifts
it out as the next arrives. Cycling stops as soon as there is text. Keep the
lead-in short and the tails under ~130px at 16px, or they truncate. The question is
usually specific ("what shoes go with this?"), so asking it takes one step instead
of landing in an empty chat and typing it there. The **product page** ("Ask about
this piece") and the **scan results** ("Ask about this scan") pin the same field for
the same reason; an empty send on the scan falls back to its canned line.

The nav bar carries **search** then **`more_horiz`**; search opens the shared
modal onto every piece in here (`showAllWhenEmpty`), and Cancel closes it.

The "..." menu carries only what the page does not already show: **Virtual try-on**
**disabled** (`opacity 0.38`, inert via `MenuItem.disabled`) when no piece is
Fashion and Apparel, so a collection with nothing wearable still names the feature,
then **Rename** and destructive **Delete** (confirm `Dialog`, then "Collection
deleted" / Undo). That can leave it **empty** - a Discover look you can try on has
every action on screen already - so the header **drops the `more_horiz` button**
rather than opening onto nothing.

An **empty collection** drops the action stack entirely and fills the page below
the title block with a centred empty state (`flex: 1`, `justify-content: center`,
so it sits in the middle of what is left rather than under the title): the shared
**`<GhostCards>`** illustration, "Nothing here yet" 18/24/600, the 14/20 `#999`
hint, then an **Add pieces** pill. The stack goes because that pill is the only
action an empty collection has, and two of them on one screen is one too many.

**`<GhostCards>`** (`src/components/GhostCards.tsx`) is the app's empty-state
illustration: three 152px placeholder cards fanned at -9 / 0 / +9 degrees, the
outer two at `opacity 0.5`, on `#101010` with a `#242424` border. It draws the
*shape of the content that is missing*, which reads better than an icon of
nothing. No shimmer - this is empty, not loading. Reuse it for any empty state
that stands for an absent list.

### Scan (`src/screens/ScanScreen.tsx`, z-220 overlay)
The dock's fourth item; an overlay (Close returns to whatever was underneath),
never an active tab. Three phases:
- **Capture**: simulated viewfinder (radial `#232323 → #060606`, mirrored for the
  front camera, brighter with flash on). Chrome: translucent 40px circles
  (`rgba(20,20,20,0.6)` + `1px rgba(255,255,255,0.14)`, blur) - Close top-left,
  flash (`flash_on`/`flash_off` at 22/wght 400, gold + filled when on) +
  **`flip_camera_ios`** (22/wght 400) top-right; corner brackets (34px L-corners,
  `2.5px rgba(255,255,255,0.65)`, `radius 18`) frame a 3:4 area; caption;
  **Upload** (48px, `imagesmode`, real file picker) bottom-left and the
  **shutter** - 74px ring (`3px rgba(255,255,255,0.85)`) around a 60px `#f6f6f6`
  core. The shutter "captures" a catalog piece; Upload takes a real image.
- **Processing**: Cancel pill top-left, the photo inside the corner brackets
  (`radius 12`; catalog shots sit on `#ececec`, uploads fill), a **sweep line**
  (`scanSweep` 1600ms, white gradient + glow) and "Identifying piece..." for
  ~2.4s.
- **Results**: header **X · Matches · Retake**; 132px photo recap; "Choose the
  piece that matches yours"; match rows (card `radius 16`, 64px thumb, name,
  category · price, a **heart** circle → the Add to collection flow; tapping the
  row opens the product page inside the overlay); a centered **"None of these?
  Search manually"** text button (opens the matched category's list on Home).
  A **pinned bottom CTA** - a light primary pill with the VIP logo, **Ask
  concierge** - starts a NEW chat with the scanned photo attached.

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

### Bottom dock (`src/components/BottomDock.tsx`)
Figma `bottomBarLocal` (node 4483-34633): **the prompt field and the tab bar are
one surface**, not two. `#0d0d0d`, `radius 8px 8px 0 0`, `borderTop 1px solid
#282828`, `paddingTop 8`, `gap 4`, bottom padding `calc(8px + safe-area)`.
- **Prompt field**: `height 48`, **`radius 12`** (Figma radiusInput_Dropdown - a
  rounded rectangle, *not* a pill), `#161616` on `1px solid #282828`, padding
  `4px 4px 4px 12px`, `gap 8`. Placeholder 16/22 `#8b8b8b`.
  Inside it, two **40px circular** buttons: `add_2` (no fill) then a mic that
  fills `#252526` → `#f6f6f6` with `arrow_upward` once there's text.
- **Tab bar**: `padding 0 16`, `justify-content: space-between`, each item `width
  40` / `padding 4px 12px` / `gap 4`, icon 24px + label 12/`16px`. Active icon and
  label `#f6f6f6` (icon `FILL 1`), inactive `#8b8b8b`. Tabs, **in this order**
  (Figma node 5410-6902): **Home** (`home`), **Saved** (`favorite`), **Chat**
  (`chat_bubble`), **Scan** (the design's own vector - `ScanIcon.tsx`, see Icon
  convention in `CLAUDE.md`), **Menu** (`menu`). All five are wired; Scan opens
  the camera overlay rather than switching tabs, so it is never marked active. A
  `DockTab` can pass `renderIcon(color, active)` to draw a custom glyph in place
  of the Material name.
- Three shapes from one component: **prompt + tabs** (Chat), **prompt only**
  (Manage Memory, Figma node 5381-8383), **tabs only** (Discover, Menu).

### Search field (`src/components/SearchField.tsx`)
Figma `inputField` (node 5433-34513) - **one component for every search box in the
app**: Discover, the collection page, and the Add pieces sheet. Do not hand-roll
another one. `height 48`, **`radius 12`** (radiusInput_Dropdown, the same rounded
rectangle as the prompt field rather than a pill), `#161616` on `1px solid #282828`,
`gap 8`. Left to right: `search` glyph 24px `#8b8b8b`, the input (16/22, `#f6f6f6`),
a `cancel` clear that appears once there is text, then an optional trailing action.
- Trailing actions go through `<SearchFieldAction>`: Discover passes `<ScanIcon>`,
  the Add pieces sheet passes `photo_camera`, both 24px and both opening the scan
  overlay. The buttons are 32x40 for a usable touch target while the design draws
  bare 24px glyphs, so the field's right padding is **12 rather than 16** - that
  puts the glyph centre 28px from the edge, exactly where Figma's `16 + 24/2` does.
- Placeholders are `#8b8b8b` from a single global `input::placeholder` rule in
  `index.css`, so the search field, the prompt field and the memory input match.

### Search modal (`src/components/SearchModal.tsx`)
**The one search experience in the app.** Every search affordance opens this rather
than filtering in place: Discover's field (`<SearchField>` with `onActivate`,
sitting on the page so the way to search is visible without a tap to discover it),
the Add pieces sheet's, and the collection page's header `search`. **Saved is the
exception** - its field is a live filter over the grid, since that list is short,
already on screen and already scoped. Full screen at `z 320` over whatever opened
it, entering with `sheetSlideUp` 260ms.
- **`showAllWhenEmpty`** skips the idle state and renders `children` straight away.
  The collection page uses it: over a short, known list there is nothing to
  suggest, so the modal opens onto **every piece in the collection** and typing
  narrows it.
- **Top row**: the shared `<SearchField>` (`flex 1`, autofocused) + a plain
  **"Cancel"** text button 16/500. Cancelling clears the query.
- **Three states**, driven by the query and the caller's `resultCount`:
  - *Idle* (empty query): no headline - the field's placeholder already says what
    this searches. A **single horizontally-scrolling row of suggestion chips**
    (36px pills, `#161616` on `#282828`, `nowrap`, padding on the track so the
    right inset survives at scroll end), then **`<AskConciergeOffer>`**. The chips
    are **real rows from the data being searched** - pieces in the catalogue,
    pieces in this collection - never a list of departments, so a chip is a
    demonstration of a good query and can never come back empty.
  - *Results*: whatever the caller passes as `children`, so each surface renders its
    own row type (Discover a 2-col `ProductCard` grid, Saved `CollectionCard`s, a
    collection its `ItemRow`s). The modal never knows about them.
  - *Nothing found*: the same centred block with `search_off`, "No matches", and a
    light primary **Ask AI Concierge** pill. It is the point of the state - a dead
    end hands the query to the concierge instead of stranding the user.

### Screen chrome (`src/screens/screenChrome.tsx`)
`screenStyle`, `bodyStyle`, `Header`, and `iconButtonStyle` - the shell every
top-level tab and detail view shares (full-bleed column, scroll body running under
the gradient-fade header). Lives in its own module so tabs can use it without
importing FeedScreen.
- **Header** takes `title` (string or node), optional `subtitle` (14/20 `#999`,
  stacked under the title and centered), `onBack`, `left` (a leading control that
  replaces the plain back arrow), `right`, and `height` (56 for the Figma navBar,
  64 for the plain title header). Title-only callers render exactly as before.
  `left` / `right` are the 40px `iconButtonStyle` circle and are **centred from the
  header height** (`(height - 40) / 2`), so an action reads as part of the nav bar at
  any height rather than sitting at a fixed offset.
- **`iconButtonStyle`** - the Figma `buttonIcon`: a **bordered circle**, 40px /
  `theme.radii.button` / `#101111` on `1px solid #444547`. The 32px variant is
  `sheetIconButtonStyle` in `components/Sheet.tsx`.

### Menu tab (`src/screens/MenuScreen.tsx`)
Top-level tab (Figma "Menu", node 497-13232), so **no back button**. Page is a
stack of labelled groups on `#101111`, `gap 16`, page margin 16.
- **Header card** (`#1b1b1c`, `radius 16`): signed in → a 52px circular avatar of
  initials (`#101111` fill, `1px solid #444547`, white 16/600) + name 16/600 and
  email 16/400 `#f4f5f7`. Passing `userName={null}` drops the avatar and shows the
  email alone (the Figma's second variant). Guest → the centered "Some features
  are limited in guest mode..." copy + a full-width **"Create an account or log in"**
  pill (48px, `#f6f6f6`/`#121212`).
- **Scan product action** (reference node 4510-80962, the "Actions" row): a
  full-width outlined button directly under the header card - `height 40`,
  `1px solid #444547`, **pill** (the reference draws `radius 12`, but every button
  in this app is fully rounded), `<ScanIcon>` 24px + "Scan product" 16/22/500,
  `gap 4`, centred. Opens the same overlay as the Scan dock item.
- **Group**: a 16/400 `#f6f6f6` label, then an `#1b1b1c` `radius 16` card padded
  `8px 12px` holding rows separated by `gap 8` (no dividers). Groups:
  **Personalization** (Appearance, Language, Data Memory, Haptic feedback),
  **Support & Legal** (Legal, Share your feedback, Need help? Contact us),
  **Account** (Sign out, Delete account).
- **Row**: 24px `<MIcon />` + 16/400 label + optional 12/400 `#f4f5f7` value +
  `keyboard_arrow_right`, `padding 12px 0`. Destructive rows tint icon, label, and
  chevron `#dc8589`.
- **Row icons** (Figma "Settings", node 5380-6999 - Material Symbols names taken
  verbatim from the design): Appearance `routine`, Language `language`, Data Memory
  `menu_book`, Haptic feedback `vibration`, Legal `balance`, Share your feedback
  `feedback`, Need help `help`, Sign out `logout`, Delete account `delete`.
- **Toggle** (Haptic feedback, Enable Memory): 52x32 track, `radius 100`, 24px
  thumb `#252526`; off `#9a979b`, on `#f6f6f6` (same white as the CTA pill), 200ms
  slide. Presentational `<Toggle>`; the wrapping control owns `role="switch"`.
- **Sheets**: Appearance, Language, and Data Memory open `<Sheet>` (below). Delete
  account opens the centered `<Dialog>` instead.
- **Footer**: "VIP AI V1.0", centered, 12/`16px`, `#f4f5f7` at 60% opacity.
- Sign out / Delete account / the guest CTA all return to **Welcome**.

### Bottom sheet (`src/components/Sheet.tsx`)
Figma BottomSheetHeader (node 5303-20609) on a top-rounded panel.
- Panel `#0d0d0d`, **`radius 12px 12px 0 0`**, backdrop `rgba(0,0,0,0.75)`,
  `sheetSlideUp` 300ms.
- **Header**: `padding 16px 16px 8px`, a 32px slot on each side so the title stays
  optically centred, title **16/20/500**, and a `sheetIconButtonStyle` close
  (32px **circle**, `#101111` on `1px solid #444547`). `onBack` fills the leading
  slot with the same control.
- **`action`** drops a custom control into the trailing slot (the collections
  sheet's "Create" text button) and moves the close X to the leading slot - the
  Figma "X · title · action" header. Without it, nothing changes.
- **`full`** raises the panel to `safe-area + 8` instead of hugging its content -
  the height the Memory sheet is drawn at in the design (744 of 806pt).
- **Overlays never move the content behind them.** Every one is absolutely
  positioned over the screen, so opening a sheet must not shift, scroll or resize
  anything underneath. Two rules keep that true:
  - **Never use the `autoFocus` attribute inside an overlay.** Use
    `useAutoFocus()` from `src/hooks/useAutoFocus.ts`, which focuses with
    `preventScroll: true`. Plain `autoFocus` fires while the panel is still
    translated a full height below the fold, so the browser scrolls the nearest
    scrollable ancestor to reveal the field and the whole screen lurches.
  - The frame and every screen root use **`overflow: clip`, not `hidden`**
    (`PhoneFrame`, `screenStyle`). `clip` cannot become a scroll container, so a
    panel overhanging the bottom mid-animation can never be scrolled into view.
    The scroll body inside keeps its own `overflowY: auto`.
- Shapes by intent: **bottom sheets** (`Sheet`) slide up and sit flush to the
  bottom edge; the **confirm `Dialog`** is deliberately a centred card
  (`dialogPop`, Figma node 5381-8672), not a sheet; `ContextualMenu` /
  `OverflowMenu` are popovers anchored to their trigger (`menuPop`).

### Confirm dialog (`src/components/Dialog.tsx`)
Figma "Dialog" (node 5381-8672). Centered card, **not** a bottom sheet - for
destructive confirmations (delete memory, delete account).
- `#1b1b1c` card, `radius 16`, inset 16 left/right, vertically centered, padding
  `24px 16px 16px`, `gap 16`; backdrop `rgba(0,0,0,0.75)`.
- 40px round `#252526` badge holding a 24px `<Icon />` (defaults to `warn`).
- Title 20/24/500 `#f6f6f6`, body 16/22 `#f4f5f7`, both centered.
- Stacked 48px pills: danger `#dc8589` on `#2b0d0f` text, then outline Cancel
  (`1px solid #313131`). Close X (40px) top-right.
- Motion: `dialogPop` 240ms - the keyframe carries the `translateY(-50%)` through,
  since that is what centers the card.

### Data Memory (`src/data/memory.ts`, `src/screens/MemoryScreen.tsx`)
Figma "Memory" section (node 5381-8698). Facts the concierge keeps about the user.
State lives in `FeedScreen` so the Menu tab and the Chat tab share one store.
- **Data Memory sheet** (`src/components/MemorySheet.tsx`, Figma nodes 5303-20603 "[On]"
  and 5385-13776 "[Off]"): a **`full`** `<Sheet>` titled "Data Memory". "Enable Memory"
  row (16/22 label + 14/20 subtitle + `<Toggle>`, `padding 12px 8px`) then a
  **pill** outline **Manage Memory** button (48px). Row and button share a 28px
  optical margin (sheet padding 20 + the row's own 8). Reached from Menu >
  Memory *and* from the chat's "Memory updated" chip, so it lives in `components/`.
  The Menu row shows `On` / `Off` as its value.
- **Off is "paused", not "locked"**: Manage Memory stays enabled and a 14/20
  centred note reads "Memory is paused. You still can access and manage your data."
- **Manage Data Memory** (Figma node 5381-8376): full-screen push (`z 200`,
  `screenSlideInRight`) over **whichever tab opened it**, so Back returns there.
  Header carries a circular back and a circular `more_horiz`, plus the subtitle
  "Updated <relative>".
- **Grouped card**: facts are grouped under four headings - **Style & sizes**,
  **Maisons & brands**, **Preferences**, **Places** - inside one `radius 16`
  `#1b1b1c` card, `padding 16`, `gap 20`. Each group is a 16/20/500 heading plus a
  **14/20** paragraph joining that group's facts. Empty groups are dropped.
- **`more_horiz` menu** (`<ContextualMenu>`, Figma node 5385-13724): "Update Data Memory"
  (`refresh`) and "Delete all memory" (`delete`), both on textPrimary - the warning
  is left to the dialog.
- **Prompt field**: `<BottomDock>` with `showAttach={false}` and the placeholder
  "Add things to remember or change". Everything typed is a memory command - a
  leading "forget/remove/delete" drops matching facts, anything else adds one and
  is routed to a group by `groupFor()`. Re-saying a fact refreshes its timestamp
  rather than stacking a duplicate.
- **Empty state** (Figma node 5381-11305): a 40px circular `#252526` badge with
  `menu_book`, "Nothing saved yet" (18/22/500), then "As you share your tastes,
  they'll appear here so I can tailor every suggestion." (16/22).
- **Delete**: "Delete all memory" opens `<Dialog>` ("Are you sure you want to
  delete your memory?" / "Delete my data").

### Chat tab (`src/screens/ChatScreen.tsx`)
Figma "Chat Idle" (node 4483-34608) for the empty state and "Chat / Memory" (node
5303-20889) for a thread. Thread + thumb state live in `FeedScreen` so leaving the
tab does not discard the conversation.
- **navBar** (`Header height={56}`): a node title of VIP mark 24px + "Concierge"
  16/20/500 + `chevron-down` 18px, and **actions that depend on the thread state**.
  Every one is the 40px bordered circle.
  - **Idle** (Figma node 5410-6912): two trailing `buttonIcon`s, **Incognito mode**
    (`<TemporaryChatIcon>`) and **History** (`history`) - the two ways to start a
    conversation. **New chat** keeps its leading slot and stays enabled.
  - **With at least one message**: Incognito gives way to **`more_horiz`**, so the
    trailing pair is **History then More**. History stays put across both states;
    Incognito is not offered mid-thread.
- **Idle state**: heading **24/28/600** "What would you like arranged?" and body
  16/22 centred in the free space, then four **Chat Suggestions** parked above the
  dock - `height 46`, **`radius 100`** (a pill, unlike the prompt field), `#1b1b1c`,
  `padding 12`, `gap 8`: 22px icon + 16/22 label + 22px `chevron-right`. Icons:
  `search`, `apparel`, `auto_awesome`, `palette`.
- **User bubble**: right-aligned, `#1b1b1c`, `radius 12px 12px 0 12px` (the square
  corner points at the sender), padding 12, max-width 85%.
- **Assistant turn**: 28px `#02110c` avatar + "VIP.ai Concierge" 14/20, then the
  optional **"Memory updated" chip**, the message 16/22, and a 36px action row:
  `copy`, `sync`, `like`, `dislike`, `more-horizontal`. Active thumb fills
  `rgba(246,246,246,0.12)`.
- **Memory chip** (Figma Chip, node 5303-21143): 40px tall, **pill**, `1px solid
  #444547` on `#101111`, carrying `menu_book` + 14/20 label + `keyboard_arrow_right`.
  **Tapping it opens the Memory sheet**, so a chat is a second way into editing what
  the concierge remembers. A **snackbar** confirms the same write and offers
  **Manage** as a shortcut to that sheet.
- **Thinking**: three 6px dots on `typingDot`, 700ms before the reply lands. If the
  user leaves the tab first the reply is delivered immediately rather than dropped.
- With memory **off** a remember-style message gets no chip, and the reply points
  at Settings > Data Memory instead of pretending it saved.

### Product Page (`src/screens/ProductPage.tsx`)
Full-screen overlay opened by tapping any product card.
- **Nav**: back (left), "Details" centered, **share + heart** (right; the heart
  fills `#ef4d63` when the piece is in any collection). Absolutely
  positioned with `pointer-events: none` so everything scrolls underneath; the
  buttons re-enable taps. The **fade** is a `backdrop-filter: blur(14px)` layer
  plus an `rgba(10,10,10,.86) -> transparent` gradient, both under a
  `mask-image` that tapers the blur off as well - so content dissolving under the
  nav has no hard edge where the effect stops. Buttons use a **translucent dark
  fill** (`rgba(20,20,20,.55)` + blur, `1px solid rgba(255,255,255,.14)`,
  `borderRadius 100`) so they stay legible over both the light hero and the dark
  body.
- **Hero**: 300px, `background #ececec`, image `objectFit contain`. The **scroll
  body** is inset by the nav height (`safeTop(70)`) so the hero **starts just below
  the nav** on the dark page background, as in Figma - the hero itself carries no
  top padding, so it scrolls straight up under the nav rather than leaving a slice
  of the light backdrop stranded behind the fade (which read as a pinned image).
- **Title** 24/600 (`brand + name`), **general price** 20/500 `#ededed`, formatted from the price-history current value (`$8,200.00`) so it always
  shows and matches the chart's "today".
- **Historical price**: the `HistoricalPrice` card sits directly under the price
  (see its own entry below). Starts **collapsed**; tapping its header row expands
  it. Keyed by product so it resets per item.
- **Actions** (stacked, right under the historical price, `gap 12`, **`height 44`**,
  15/500). Exactly one is filled (`primaryActionStyle`, `#f6f6f6`/`#121212`); the
  rest are **outlined** (`outlinedActionStyle`, transparent on `1px solid #313131`,
  `#f6f6f6`), so the hierarchy reads at a glance:
  1. **Virtual try-on** (`apparel` glyph) - **primary**, clothing only.
  2. **Ask AI Concierge** - outlined, with the **VIP mark** before the label.
  3. **Explore on Official Site** - always outlined.
  When there is **no try-on**, **Ask AI Concierge takes the filled slot**, so the
  page is never left without exactly one primary action.
  Try-on uses the same `isClothing()` gate as the collection menu but is **omitted
  rather than disabled** - a car has nothing to try on, so a dead button would be
  noise. Both report through the optional `onNotice` prop, which every caller (feed,
  collection page, scan) passes. The old floating "Ask about this product" `ChatBar`
  was **removed**.
- **Description**: paragraph + derived bullet list (category / type / gender).
- **Spec table**: Brand / For / Category rows, label `#999` medium left, value
  `#f2f2f2` right, hairline dividers.
- **Section divider**: 6px `#141414` band.
- **Where to buy**: the stockist section, see below.

### Historical price (`src/components/HistoricalPrice.tsx`)
Collapsible price-history card under the price on the Product Page. Built 1:1 from
Figma **"Historical price"** (node `5294-26355`) and the Product Page states
(`5294-28266`). Data comes from `src/data/priceHistory.ts` (deterministic
per-product mock; a series of price-change events drawn as a **step** line).

This card carries its **own token set** straight from the Figma dark theme, which
differs from the app-wide palette above - keep the two apart:

| Role | Value | Figma variable |
| --- | --- | --- |
| Card / section background | `#101111` | Background/backgroundPrimary |
| Border + all dividers | `#444547` | Border/borderPrimary |
| Primary text | `#f6f6f6` | Text/textPrimary |
| Secondary text | `#f4f5f7` | Text/textSecondary |
| Gridline | `#2a2a2c` | - |
| Neutral chip / tag fill | `#2f2f31` on `#f8f8f8` | Brand+Tag/…Secondary |
| Up line / marker / tag | `#82ed9a` / `#66c9ad` / `#006347` on `#f2faf8` | Graphs + Alerts/Success |
| Down line / marker / tag | `#dc8589` / `#dc8589` / `#4e1518` on `#fcf5f5` | Alerts/Error |

Note the design leans on **size and weight**, not colour, for hierarchy: secondary
text is near-white here, not the app's `#999`.
- **Card**: `radius 16`, `1px solid #444547`, sections padded `16`, `gap 12`.
- **Collapsed** (64px tall): "Historical price" (16/500) + a **pill tag** - green
  `+X% ∙ 1Y`, red `-X% ∙ 1Y`, neutral `+0% ∙ 1Y` when the period is flat, or
  `No data` - and a 32px chevron. Whole row toggles. The tag **tracks the selected
  period chip** (suffix `3M` / `1Y` / `5Y` / `Max`, colour flips with the move) and
  keeps that reading when the card is collapsed again.
- **Expanded**: period chips (**3 month / 1 year / 5 years / Max**, equal width,
  `height 28`, pill; active `#2f2f31`, inactive outlined), the chart, then the
  lowest/highest stats box (`radius 10`, hairline split). There is **no insight
  line** and no muted/disabled chip state.
- **Chart** (`296 x 247` in Figma, measured pixel width in code): 44px y-label
  gutter with **left-aligned** `$` captions, 3 gridlines 77px apart, plot inset
  47px from the left running y `2 -> 221`, x labels start/mid/**Today** on the last
  16px row. Gradient **area** (`0.24 -> 0.02` of the line colour) + 2px step
  **line**; 8px markers (tone fill, white ring) sit on **change events only**, not
  on today. **Scrub**: press-drag shows a dotted drop line, a marker, and a
  price+date tooltip (`touch-action: pan-y` so vertical page scroll still works).
- **Price change log**: its own section under a full-bleed divider. **Scoped to the
  selected period**, like the tag, chart and stats - the whole card must describe
  one window, so a card reading "+0% ∙ 3M" never lists changes from two years
  ago (the section hides entirely when the window holds none). Newest first,
  **3 rows** at a time behind an outlined pill **"View more"** (no count - each tap
  reveals the next three and the button hides once the list is exhausted); changing
  the period collapses it back to the first page. Row order is `date` / delta pill /
  `price` (14/600). The "First tracked" listing carries a neutral tag and only shows
  when tracking began inside the window; the header count is hidden when that is the
  only row.
- **Empty state**: 158px block - 40px circular `#2f2f31` badge with the `history`
  glyph, "No price data yet" (18/500), then "We started tracking this price on
  {date}. Changes will appear here." (16/400).
- Type scale: h4 18/22, h5 + body 16, secondary subtext 14/20, caption 12/16.

### Where to buy (`src/components/WhereToBuy.tsx`, `src/components/StoreMap.tsx`)
The product page's stockist section and the full-screen map behind it. Adapted
from the Chatoshi "nearby locations" list (node `178-62443`) and its map view
(node `172-60775`), re-toned for the dark theme.

**Boutiques carry no photography.** A storefront photo said nothing about whether
the piece is there today and doubled the height of every row, so everything that
decides where you go is text. Boutiques stay informational - **not saveable**
(no heart, unlike products).

- **Header**: "Where to buy" 16/600 + "N boutiques near you" 14/20 `#999`.
- **Map preview**: 168px card, `radius 16`, `1px solid #282828`, showing a zoomed
  band of the map around the user. A centred **glass pill** ("View on map",
  `map` glyph, `rgba(18,18,18,.72)` + blur on a hairline white border) is the
  affordance; the **whole card** is the tap target, so the pins here are inert.
  The crop (`PREVIEW_REGION`) is framed so the user marker sits off-centre and
  nothing hides under the pill.
- **Filter chips** (MD3 filter chips, `height 34`, pill, `check` glyph when on):
  **Nearest to me** (on by default) sorts by distance; **Open now** and **In
  stock** filter. With Nearest off the list falls back to relevance - in stock,
  then open, then distance - so the chip is never a no-op. Filtering everything
  out gives a centred "No boutique matches these filters." + **Clear filters**.
- **Row** (`radius 16`, `1px solid #282828` on `#0c0c0c`, padding 14): name 16/600
  + a green **"Closest"** tag (`rgba(130,237,154,.12)` on `#82ed9a`) on the nearest
  one only; `kind · address` 14/20 `#999`; `schedule` + hours + **Open now**
  (`#82ed9a`) / **Closed** (`#dc8589`); `inventory_2` + **In stock** / **Available
  to order**. Then a **button pair**: a soft-filled `near_me` + distance and an
  outlined **Contacts** that expands phone + email rows in place. Tapping the row
  body, or the distance button, opens the map focused on that boutique.
  Both row buttons are deliberately quiet - the page spends its one filled button
  on Virtual try-on / Ask AI Concierge.
- **Show all N boutiques** / **Show less** (outlined, 44px) below three rows.
- **Full-screen map** (`z 90`, inside the product page's `z 80` context, so
  snackbars still land on top): the drawn map full-bleed, a floating back button
  under a top scrim, and a **pinned detail card** (`radius 16` top corners,
  `#0d0d0d`, grabber) that always describes one boutique. Pins select; the card
  re-plays on change. Its actions stack full width: **Directions · N km** filled
  `#f6f6f6`/`#121212` (here it IS the page's primary), then outlined **phone** and
  **email** rows carrying the actual number and address, as in the reference.

### Store map (drawn, not tiled)
`StoreMap` renders a dark city plate as SVG - land, blocks, two parks, the river,
a road grid broken by diagonals and curves, a plaza under the flagship, faint
street labels - plus a teardrop **pin** per boutique and a blue **"you are here"**
marker. No tiles, no API key, no network, and it can be themed with the app
instead of fighting a light map surface.
- Selected pin: `#f6f6f6` at `scale 1.15` with a `#121212` core. Others `#2b2e33`
  under a `rgba(255,255,255,.45)` hairline. Pins draw farthest-first so the
  nearest sits on top, and each has a 20px invisible hit circle.
- Geometry lives in `src/data/mapCanvas.ts` (`360 x 780` plate, user position,
  km scale, the two crop regions) and is shared with `src/data/boutiques.ts`,
  which **derives each distance from its pin**. A pin can never disagree with the
  "3.5 km" next to its name.
- One canvas serves both surfaces; `region` crops it (`preserveAspectRatio
  ="xMidYMid slice"`).

### Prompt field
Lives inside `<BottomDock>` (see **Bottom dock** above) - there is no standalone
chat-bar component. `radius 12`, never a pill.

### Snackbar z-order
The snackbar sits above the product-page overlay (`z 80`) at its default `z 90`, so
collection toasts appear **everywhere** a heart is tapped - feed, saved view, and
product page. The `zIndex` prop raises it
again over full-screen pushes - Manage Memory and the collection page (`z 200` →
250) - and over the scan overlay (`z 220`) and any open sheet (`z 301`) → **310**
(also the Chat tab's default, above the Memory sheet its chip opens). `bottom`
shifts it to clear whichever dock is on screen: 71px for tabs-only, 74px for
prompt-only, **129px on the Chat tab** where the dock carries both.

Overlay stack, bottom to top: product page `80` → pushes (Manage Memory,
collection page) `200` → scan `220` → sheets `300/301` → dialogs `400`.

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
| Dialog in | `dialogPop` 240ms (carries `translateY(-50%)`) |
| Chat thinking | `typingDot` 1100ms, 160ms stagger |

---

## 7. Where things live

- Tokens: `src/theme.ts` (colors, `radii`, spacing, animation, safe-area helpers)
- Feed / cards / snackbar / bottom bar / tab + memory + collections state: `src/screens/FeedScreen.tsx`
- Data Memory store + intent parsing: `src/data/memory.ts`
- Collections model + price totals: `src/data/collections.ts`
- Collections sheets (select / create / add / note): `src/components/CollectionSheets.tsx`
- Collection page (push over Saved): `src/screens/CollectionPage.tsx`
- Scan overlay (capture / processing / results): `src/screens/ScanScreen.tsx`
- Where to buy (section + full-screen map): `src/components/WhereToBuy.tsx`
- Drawn map plate + pins: `src/components/StoreMap.tsx`, geometry in `src/data/mapCanvas.ts`
- Boutique data (venues, hours, stock, coordinates): `src/data/boutiques.ts`
- Floating nav icon button (product page + map): `src/components/NavIconButton.tsx`
- Scan tab glyph (design's own vector): `src/components/ScanIcon.tsx`
- Swipe deck, thumb & icon buttons: `src/screens/RefineYourTaste.tsx`
- Flow, nav, progress, onboarding %: `src/App.tsx`
- Flow logic, copy tone, placeholder rule, gender/lifestyle branches: `CLAUDE.md`
