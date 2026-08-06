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
| Unread dot | `theme.colors.unread` `#E53935` | The bell's badge and unread notification rows. The only red in the chrome, so a dot reads as "something happened" instead of as another white highlight. Both dots share the token, never a literal |
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

`CollectionCard` (used by **Collections**) is the shared **`CollectionCover`
2x2 grid** of the pieces inside + name **18/24/600** + meta **14/20 `#999`**, plus
a **favorite heart** (saves the whole look to Saved > Collections) and a "..." menu
(self-contained `OverflowMenu`, portaled like the product-card menu). Discover's
**Mixed Collections** group stays a **horizontal carousel** but the cards read
exactly like the Saved tab's: same cover, and the same **"N items · $total"**
meta via `outfitMeta()` rather than a bare "N pieces". **Tapping one opens the
collection page**, not a generic product list - previewed until the look is
hearted (see **Collection page**). One card in both places, so a collection is
always the same object.

**Tailored Outfits** is the row underneath, and the only thing that separates it
is the card. `OutfitCard` is the **styled flat-lay as shot**
(`/public/outfits/*.webp`, **landscape 4:3**) rather than a cover built from
contents: the shared rail width, a 4:3 image box with the art **`contain`ed on
white inside 10px of padding**, then the same name + "N pieces · $total" and the
same **heart and "..."** a collection card carries. `cover` was tried and clipped
the outer pieces off the ends of the look. Tapping one opens the **ordinary
collection page** under `outfit-col-<id>`; there is no separate outfit page, and
it must not grow one.

**Every card in a Discover rail is `RAIL_CARD_W` (280) wide** - product,
collection, outfit and category alike - so the rails line up down the page and
the next card peeks by the same amount in each. Change it in one place.

**Collections have no cover picture.** There is no `cover` field, no upload and
no "Generate cover" - the pieces inside *are* the cover, so the card is always
truthful about what is in it and nothing has to be chosen, stored or regenerated.
An outfit's flat-lay lives on the outfit card only; once the look is filed it
becomes an ordinary collection and its card becomes the 2x2 mosaic. The inset 4:3
cover hero on the collection page went with it.

**Every horizontal rail keeps its inset on the inner track, and the track is
`width: max-content`** - `Section`, and the Categories two-row grid. Put the
padding on the scroller itself and the trailing inset is not part of the
scrollable width, so the last card ends flush against the screen edge at scroll
end and the margin only reappears at rest.

Discover opens with the **onboarding-progress banner** (while onboarding is under
100%) at the very top and then goes **straight into the rails**. There is no
search field: see **No search** below. The camera the field used to carry is the
**Scan dock item**, and looking something up is the **Chat dock item**.

The Discover bottom is just the **tab bar**. Products are stably shuffled
(deterministic) so every group mixes categories. Products **without real imagery**
(the VIP-logo placeholder) are hidden from the feed, as is anything marked "Do not
recommend". "View all" / a collection opens a titled full-screen list.

### Saved view
A **top-level tab** (heart in the bottom bar), so **no back button**. The dock
label is **"Saved"**, the page header **"Saved collections"**. The page is
**collections only** - no segment switcher, no saved-products list, and stores
are not saveable anywhere. The header is the **56px navBar** carrying nothing but
its title: **there is no `+`**, because collections are created inside the Add to
collection flow and an empty collection is not a thing anyone wants. Under it
sits **the app's only search field** - a `<SearchField>` that filters the list
**in place**, matching the collection name. It is not catalog search (there is
none; see **No search** below): it is a filter over a short list the user named
themselves. The body is a **single column** (`savedColStyle`) of full-width
`CollectionCard`s whose meta line is **"N items · $total"** (`meta` prop overrides
the default "count unit"); tap opens the **collection page**. Collections are
ordered **newest first** (`createdAt` descending), so the one just saved leads the
list. **No pinning**, no "Pinned" rail, no "All collections" heading, no creator
row.

**Two empty states, both the shared `<CenteredState>`** (`src/components/CenteredState.tsx`:
56px icon disc, title 20/600, one hint line, optional action). **Filtered to
nothing**: `search`, "Nothing found" / "Check the spelling or try a different
name." - and **no action**, because the filter only ever failed to match a name
the user wrote and the fix is to retype it. **Nothing saved at all**: `favorite`,
"Nothing saved yet", and the line that says how that changes ("Heart a piece
anywhere in the app and file it into a collection"), also with no action - that
action is out in the app, on the pieces. Category "See all" pages keep a back
button + single-column large cards.

**Hearts manage collection membership everywhere.** A heart fills when the piece
sits in a collection; tapping one (product card, product page nav, collection
page, scan match row) opens the Add to collection flow with that collection
already selected. There is no separate bookmark glyph.

### Collections (`src/data/collections.ts`, `src/components/CollectionSheets.tsx`, `src/screens/CollectionPage.tsx`)
User-curated groups of saved pieces: `id`, `name`, ordered `items` (product
names), `createdAt`. **That is the whole model** - no description, no per-piece
notes, no cover. Owned by `FeedScreen` (like Data Memory) because Saved, the
product page, the scan results, and Discover's look hearts all write to the same
list. Prices come from the shared deterministic price history (`priceOf`), summed
into the "N items · $total" meta line (`collectionMeta`).

**A piece lives in exactly one collection.** `collectionOf()` answers which, and
every write that adds items runs through FeedScreen's `exclusive()`, so filing a
piece (or a whole look) *moves* it. `seedCollections` draws from a shared pool so
the starter data is disjoint on first paint.

**The card cover** is `CollectionCover`, the **2x2 grid**, at
`size="100%" aspect="600/400"` on a card and 56px square as a row thumb. 0 items →
one full tile on `#161616` with the VIP logotype at `opacity 0.35`; 1-4 items →
images fill in on the `#ececec` gallery backdrop and **empty cells take the same
`#161616` surface** with the logotype at `opacity 0.22`. The light backdrop exists
to sit a product on, so a slot with no product does not get it. 5+ items → **the
first four, and nothing else**. The hairline between tiles is a **1px gap over
`#101111`** - the page showing through, not a border; a lighter rule framed each
piece.

**There is no "+N" overflow count.** The four tiles are a preview, not an
inventory, and the card's own meta line already reads "6 items · $45,550" - the
badge said it a second time and spent a whole tile doing it. Do not reintroduce
one.

The fanned cover (`CollectionFan`, tiles dropped on a table at -15/0/+15deg) was
tried here and removed: at four pieces it showed less of each one than the grid.

**Ways in** (all lead to the same sheet flow):
- **Hearts** - product cards, the product page nav, the collection page, scan
  match rows.
- Hearting a **look or outfit** on Discover files the whole look as a collection.
- **Create**, inside the Add to collection sheet's header. That is the only place
  a collection is born.

**Add to collection flow** (`AddToCollectionFlow`): select → save, with create as
a detour.
- *Select*: sheet header is **X · "Add to collection" · Create**, the X in the
  **leading** slot (`Sheet`'s `closeLeading`) and Create a 32px bordered pill in
  the `action` slot. Rows: **56px single-image thumb** (`radius 12`, the
  collection's first piece - a 2x2 grid at that size is four thumbnails too small
  to read) + name **16/22/600** + meta **14/20 `#999`** + **`RadioDot`**: a 24px
  ring, `1.5px #444547` empty, `#f6f6f6` ring with a 12px `#f6f6f6` centre when
  chosen. **Radio, not checkbox** - a piece has one home, so this is an answer to
  change, not a set to edit. The collection currently holding the piece opens
  selected; tapping it again clears it, which is how a piece leaves collections
  altogether. **Save** is disabled while unchanged. No collections yet → opens on
  *create*.
- *Create* (`CreateCollectionSheet`): a **single "Collection name" field**
  (`#161616` on `1px solid #282828`, `radius 12`, placeholder "e.g. Riviera
  Summer", trailing `close` to clear) + **Create collection** CTA. Reused for
  **Rename** with `title="Rename collection"`, `cta="Save"`.
- Confirmation: **"Added to {name}" / View** (View opens the collection); clearing
  the selection confirms with **"Removed from your collections" / Undo**.

The old **Add pieces sheet** (`AddItemsSheet`: catalog search + scan inside the
collection page) is gone with the collection page's action stack. Pieces arrive by
being hearted where you find them.

**Collection page** (`CollectionPage`, Figma node 5539-20057; a z-200 push over the
Saved tab, kept while visiting other tabs, entering with `screenSlideInRight`
320ms). The whole page is: the nav bar, a **centered title block** - name
**22/28/600**, then "N items · $total" **14/20 `#999`** - the pieces in a 2-col
grid, and **one thing at the bottom**.

**Nav bar**: back on the left, then **`share`** and **`more_horiz`** on the right,
both the 40px `iconButtonStyle` circle (Figma node 5555-53458). Share sits in the
bar rather than inside the menu because handing a collection to someone is a
large part of the point of making one, and because a **`preview` look has no menu
at all** and still has to be shareable - so in preview the bar is back + share,
and only once the collection is the user's does `more_horiz` appear beside it.
Sharing goes through `collectionShare()` + the OS sheet (`navigator.share`),
falling back to the clipboard; only the fallback and an outright failure say
anything, since the OS sheet confirms itself.

Items are the app's `<ProductCard>` **verbatim**: `subtitle={brand}` +
`price`, the heart filled `#ef4d63` (in a saved collection that means "in here",
and tapping removes it). No `footer`, no note strip, no per-item "..." menu.

**No cover hero, no description, no action stack, no try-on, no Add pieces, no
search.** Every one of those was on this page and was taken off.

**The bottom has one job at a time, and `preview` picks which.**

- **Not yours yet** (a Discover look, an outfit, or a set the concierge just put
  together - no stored `Collection`, so FeedScreen stands one up): a **full-width
  "Save to my collections"** pill
  (`primaryActionStyle` + `favorite` at 18 + a `0 8px 24px rgba(0,0,0,0.55)`
  shadow) **floating** over the list. It is `position: absolute` at the bottom
  inside a `pointer-events: none` container on a `to top, #0A0A0A 55%` gradient
  fade, with `pointer-events: auto` back on the button itself, so the list still
  scrolls under it and the last row fades out rather than being sliced. The body
  takes `paddingBottom: 96` in this mode to clear it. Floating rather than
  docked: it is one decision, not a fixture. Saving files the look (moving its
  pieces out of any other collection), flips the page into the real one, and
  confirms with the **"Saved to your collections" / View** snackbar.
- **Already yours**: nothing is left to decide, so the slot goes to the
  concierge - a `<BottomDock>` prompt field whose **placeholder cycles**: a
  static `placeholderPrefix` **"Ask me"** with only the tail moving through
  "to find you a piece", "what completes this" and "to restyle this". The field
  does more than one job and a single static hint advertises one of them, but
  rotating whole sentences was hard to read at a glance, so the lead-in stays put
  and the tail changes under it. Keep tails to **~19 characters** or they truncate
  against the attach and mic buttons. Sending starts a NEW chat with the typed
  text and the collection attached; the question is usually specific ("what shoes
  go with this?"), so asking it takes one step instead of landing in an empty chat
  and typing it there. The **product page** ("Ask about this piece") pins the same
  field with a plain static placeholder.

Never both, and never neither. Mechanically the cycle is a `placeholder` array
plus `placeholderPrefix`, drawn in a span over a placeholder-less input (the
attribute cannot animate) and swapped every **2800ms** on `placeholderCycle`,
which rises each phrase in, holds it, and lifts it out. Cycling stops as soon as
there is text; a plain string stays a plain placeholder.

In `preview`, Rename / Delete also stay out of the "..." menu, which leaves it
empty, so the header **drops the `more_horiz` button** rather than opening onto
nothing.

The "..." menu carries exactly **Rename** and destructive **Delete collection**
(confirm `Dialog`: "Delete this collection?" / "The pieces will be removed from
this collection." / **Delete collection**, then "Collection deleted" / Undo).

An **empty collection** fills the page below the title block with a centred empty
state (`flex: 1`, `justify-content: center`, so it sits in the middle of what is
left rather than under the title): the shared **`<GhostCards>`** illustration,
"Nothing here yet" 18/24/600, and a 14/20 `#999` line pointing back out at the app
("Heart a piece anywhere in the app to file it here, or ask your concierge below").
No button - there is nothing here to add from.

**`<GhostCards>`** (`src/components/GhostCards.tsx`) is the app's empty-state
illustration: three 152px placeholder cards fanned at -9 / 0 / +9 degrees, the
outer two at `opacity 0.5`, on `#101010` with a `#242424` border. It draws the
*shape of the content that is missing*, which reads better than an icon of
nothing. No shimmer - this is empty, not loading. Reuse it for any empty state
that stands for an absent list.

### Scan (`src/screens/ScanScreen.tsx`, z-220 overlay, Figma node 5488-3358)
The dock's fourth item; an overlay (Close returns to whatever was underneath),
never an active tab. Three phases:
- **Viewfinder backdrop** (capture + processing both): the file's *Viewfinder
  glow*, `radial-gradient(41.7% 55.6% at 50% 50%, #232323 0%, #101010 55%,
  #060606 100%)`, mirrored for the front camera and brighter with flash on, under
  its *Vignette* (`180deg` black `0.55 → 0 → 0 → 0.65`). The design only draws
  these on the Processing frame, but swapping the backdrop on the shutter press
  reads as a flicker, so capture wears it too.
- **Capture**: chrome is the app's standard `iconButtonStyle` 40px circle
  (`#101111` on `1px #444547`) - Close top-left, flash
  (**`flashlight_on`/`flashlight_off`**, gold + filled when on) +
  **`flip_camera_ios`** top-right. Corner brackets (34px L-corners, `2.5px
  #d3d3d5`, `radius 18`) frame a **280 x 368** area. Then the hint **"Frame the
  piece, its label, or a detail"** 16/22 `#f6f6f6`, `gap 24`, and the controls
  row: `justify-between` inside `24px`, an **Upload** group (40px circle,
  `add_photo_alternate`, with a **"Upload" 12/16/500 label under it**) at one end,
  an equal 55px **spacer** at the other so the shutter stays centred on the
  screen, and the **shutter** between them - 74px ring (`2.5px #d3d3d5`) around a
  60px `#f6f6f6` core. The shutter "captures" a catalog piece; Upload takes a real
  image.
- **Processing**: Cancel pill top-left (`#101111` on `1px #444547`, 40px tall,
  16/22/500), the photo **8px inside the same corner brackets** it was framed in
  (`radius 12`; catalog cut-outs sit contained on `#ececec`, uploads fill), a
  **sweep line** (`scanSweep` 1600ms, white gradient + glow), then `gap 24` and
  **"Identifying the piece..."** 16/22 `#f6f6f6`, for ~2.4s.
- **Results**: the shared `<Header>` at 56 - **X · Matches · Retake** - over a
  `padding 16 / gap 16` column: a **120 x 160** photo recap (`radius 12`,
  `1px #282828`), "Choose the piece that matches yours" 16/22 `#999`, then the
  match rows at `gap 8` (card `#101111` on `1px #444547`, `radius 16`,
  `padding 8`, `gap 12`: 64px `radius 8` thumb, the piece **16/22/600 wrapping
  rather than truncating**, category · price 13/18 `#999`, and a 40px `#2f2f31`
  circle holding a 24px **heart** → the Add to collection flow; tapping the row
  opens the product page inside the overlay). It closes on the **"None of these?"**
  row: the question stays 16/22 `#999` text and only the answer is a control - a
  filled **`Ask AI Concierge`** pill (`#222124`, 48px, 16/22/500 `#f6f6f6`) that
  starts a NEW chat with the scanned photo attached. There is **no prompt field
  and no "Search manually"** here: searching only finds what the catalog is
  already tagged with, so the way out of a bad match is to hand the photo over.

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

### No search, except one field (`src/components/SearchField.tsx`)
**The app has no catalog search.** No field on Discover, no search modal, no
results grid, no suggestion chips, no `matchesQuery()`. Matching a typed string
against tags only ever returns what the catalog has already been labelled with,
while the questions people actually have are not ("something for a wedding in
Como, under 5k") - so **the concierge is the search**: the Chat dock item, or the
prompt field on a page that is already about one thing. `SearchModal` and
`AskConciergeOffer` were deleted with the feature. Do not put a field back on
Discover; if browsing needs a shortcut, it goes to the concierge.

**The one exception is the Saved tab**, and it is a different job: a filter over
the handful of collections the user named themselves, where the name they chose
is exactly the word they would type to find it again. `<SearchField>` exists
solely for that, and it filters **in place** - no modal, no pushed screen,
because that list is short, already scoped and already on screen.

Figma `inputField` (node 5433-34513): `height 48`, **`radius 12`**
(radiusInput_Dropdown, the same rounded rectangle the prompt field is rather than
a pill), `#161616` on `1px solid #282828`, padding `0 16`, `gap 8`. Left to right:
`search` glyph 24px `#8b8b8b`, the input (16/22, `#f6f6f6`), and a `close` clear
once there is text. The clear button is 32x40 for a usable touch target where the
design draws a bare 24px glyph, so it carries a `-4px` horizontal margin:
`16 - 4 + 32/2` puts the glyph centre 28px from the edge, exactly where Figma's
`16 + 24/2` does. Placeholders are `#8b8b8b` from a single global
`input::placeholder` rule in `index.css`, so this field, the prompt field and the
memory input match.

The field has **no `onActivate` and no `trailing` slot** any more - both existed
for Discover, which no longer has a field. The scan camera that used to sit in it
is the **Scan dock item**.

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
- **Hero**: the `ProductGallery` (see its own entry below) - 300px,
  `background #ececec`, image `objectFit contain`. The **scroll
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
- **Save to collection**: the collections rail, see below. A **stockist section**
  (drawn map, store-card rail, a sheet per boutique) sat here and was removed;
  where to buy is a question for the concierge field the page already pins.

### Product gallery (`src/components/ProductGallery.tsx`)
The Product Page's hero, and the **only** place a piece's imagery is rendered
large. There is one details page, so restyling this restyles every route into it
(Discover, a collection, a scan match).
- **Views cross-fade, they never slide.** Each shot is a piece on its own
  backdrop, not a frame of one continuous strip, so a slide read as dragging a
  filmstrip past a window. A fade reads as the same object being re-lit, and it
  keeps the piece centred throughout, which a slide cannot. `opacity` over
  400ms on `theme.animation.easing`, stacked absolutely, no transform.
- **Counter**: `n / total` pill, bottom-right, `rgba(18,18,18,.72)` + blur,
  12/500, `theme.radii.pill`, tabular numerals so the width does not jitter as
  the number changes. Bottom-right keeps it clear of the piece.
- **One image is not a gallery.** A single view renders as a plain static image:
  no counter, no fade, no swipe. Most of the catalogue is single-image today, so
  this is the common case, not the edge case.
- **Gesture**: horizontal pointer drag past 40px steps one view, clamped at both
  ends (never wraps - "3 / 3" has to mean there is nothing after it). Arrow keys
  do the same. `touchAction: pan-y` hands every vertical gesture to the page, so
  swiping the hero can never hijack the scroll.
- **Every view loads eagerly.** A fade cannot cover an image that has not
  arrived; lazy-loading shows the bare backdrop for the whole transition and
  pops the shot in at the end.
- The image list comes from `viewsOf(product)` in `src/data/products.ts`, the
  one function that answers "how many images does this have" - so the track and
  the counter can never disagree. Extra shots are attached in `EXTRA_VIEWS`
  (`src/data/productImages.ts`), keyed by the primary image path, because the
  filename parser reads one file as one product and would otherwise treat a
  second shot as a separate piece.

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

### Save to your collections (`src/components/SaveToCollection.tsx`)
The product page's last section, in the space the stockist section used to hold.
**Two states, and only ever one of them.** Heading only: no subtitle, no create
control, no link out.

**Every collection here is a horizontal row** - a `64px` single-piece preview on
the gallery backdrop, name `16/22/600` over meta `14/20 #999` (both clipped to
one line), then the surface's control - on a `#101111` card, `1px solid #282828`,
`radius 16`, padding 12. Rows, not `<CollectionCard>`: that card stacks its cover
above its text, and a rail of those at picker size left the name with half its
characters and the meta wrapping. The preview is **one piece, not the 2x2 cover**,
the same call `CollectionThumb` makes in the sheet.

- **Unsaved**: a rail at `RAIL_CARD_W`, the track carrying the `16px` inset
  (never the scroller, or the first card sits flush at x=0). Every collection,
  each ending in a `32px` outlined plus (`1px solid #444547`, transparent; a
  span, not a button, since the whole card is already the target), bookended by
  two **square** cards on the same shell - **Create** (`add_2`) at the head and
  **More** (`more_horiz`) at the tail, each a 24px glyph over a `14/18` label.
  Their side is the row's height (preview + padding + border), set as a number
  because `aspect-ratio` has no auto dimension to resolve against on a flex item
  whose width comes from its content.
- **Saved**: the rail is gone, replaced by the same row at full width, ending in
  a filled **Saved** pill (`#f6f6f6`/`#121212`, 40px) that takes the piece back
  out. Refiling is unsave, then save again.

Both directions confirm in the snackbar with **Undo**.

**The Add to collection sheet carries a `<SearchField>`** over the collection
names, above its radio list, with the Saved tab's empty state ("Nothing found /
Check the spelling or try a different name."). It and the Saved tab's field are
the app's only two search fields, and both filter the user's own collections by
a name they chose - never the catalog.

### Where to buy (removed)
The product page carried a stockist section - a drawn SVG map (`StoreMap`), a
preview card, a rail of 264px store cards and a bottom sheet per boutique with
Directions and a phone number - plus `boutiques.ts` / `mapCanvas.ts`, where a
pin's coordinates produced its distance. All of it is gone: where to buy a piece
is a question for the concierge field the page already pins. The last version is
in git history if the pattern is ever wanted back.

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
- Floating nav icon button (product page): `src/components/NavIconButton.tsx`
- Scan tab glyph (design's own vector): `src/components/ScanIcon.tsx`
- Swipe deck, thumb & icon buttons: `src/screens/RefineYourTaste.tsx`
- Flow, nav, progress, onboarding %: `src/App.tsx`
- Flow logic, copy tone, placeholder rule, gender/lifestyle branches: `CLAUDE.md`
