# VIP.AI Onboarding - Project Guide

This file is read by Claude at the start of every session. It captures conventions, rules, and "apply this everywhere" invariants so changes stay consistent across the prototype.

---

## What this is

A React + Vite + TypeScript **mobile prototype** for a luxury-goods concierge onboarding flow. Rendered inside a `PhoneFrame` component. Dark theme, Inter typography, Material Symbols Rounded icons.

**Screen flow (happy path):**

```
Welcome → OnboardingGate → Gender → Status (LifestyleScreen) → [Kids if family]
  → LifestyleType → Interests → Subcategory (one screen per selected category, sequentially)
  → Products (unified swipe deck - RefineYourTaste) → Notifications → Tailoring
```

OnboardingGate lets the user skip straight to Tailoring. Subcategory screens are traversed sequentially (one per selected interest), then a SINGLE Products screen shows the unified swipe deck for all selections.

All navigation lives in `src/App.tsx` via `goTo(screen, direction)`. Screen state is in App.tsx and passed down as props.

---

## The "apply everywhere" rules

**Always update related designs, even ones the prompt didn't name.** When a change
touches a component, pattern, or flow that appears in more than one place, propagate
it to every related surface so the app stays consistent - and keep
[`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) in sync. Do this by default; only skip a
related surface when the user explicitly says not to touch it. (Examples: a card
restyle should hit that card everywhere it renders; a new saved sub-tab should reuse
the same card + empty-state patterns as the others; a copy/tone tweak applies to
every matching string.)

**When the user asks to change something, it must propagate across every conditional branch.** These are the axes:

### 1. Gender variants (`gender`: `male` / `female` / `rather-not`)

- Gendered categories (`categoryConfig.ts` → `gendered: true`) have **separate subcategory arrays for women** (`subcategoriesWomen`). **Edit both** - don't change only one.
- Gendered categories also have separate image folders: `/public/images/categories/{men,women}/` and `/public/images/subcategories/{folder}/{men,women}/`.
- Gendered today: Accessories, Bags, Clothing, Jewelry, Shoes, Watches.
- Non-gendered: Cars, Fine Art, Furniture, Cigars, Collectibles, Wine & Spirits, Yachts & Boats.

### 2. Lifestyle variants (`lifestyle`: `solo` / `couple` / `family` / `prefer-not`)

- `LifestyleScreen` (the "status" screen) labels: **Single / Couple / Family**. The internal id for "Single" is still `solo` - don't rename the id without updating every reference.
- `family` triggers the **Kids screen** in the flow. Other lifestyles skip it.

### 3. Kids-age branching (only when `lifestyle === 'family'`)

- `LifestyleTypeScreen` shows different options based on `kidsAges`:
  - **All kids <12** → 5 family options including **Kid-Friendly**
  - **Any kid ≥12** → 4 options (Kid-Friendly hidden). `12` counts as "above".
- If you edit the family options, edit both branches or the filter in `LifestyleTypeScreen.tsx`.

### 4. Progress bar math

`App.tsx` → `getProgressPct()` + `totalSteps`. **When you add or remove a screen, update both.** The `Kids` screen is counted conditionally (`hasKidsStep`).

### 5. Back navigation

`App.tsx` → `handleBack()` switch. **New screens need a back handler.** Conditional screens (like Kids) need branch-aware back logic.

---

## Icon convention

**The icon library is Material Symbols Rounded (Material Design 3) - the same library the Figma file uses. Always use `<MIcon />` from `src/components/MIcon.tsx`. Do not hand-draw SVG glyphs.**

- Usage:

  ```tsx
  import MIcon from '../components/MIcon';

  <MIcon name="menu_book" size={24} color="#f6f6f6" />
  ```

- `name` is the **Material Symbols name exactly as it appears in the Figma layer** (`menu_book`, `keyboard_arrow_right`, `more_horiz`, `edit_square`, `add_2`, `auto_awesome`, ...). No translation step: what the design says is what you type.
- Defaults match the file's "Icons/Outlined/Large" style: 24px, `wght 300` (Light), `FILL 0`, `GRAD 0`. `weight` and `fill` are props - the active bottom-dock tab uses `weight={400} fill={1}`.
- Set `decorative={false}` + `label="Something"` when the icon conveys meaning to screen readers.
- The font is loaded in `index.html` with the full `opsz,wght,FILL,GRAD` axes, so any Material Symbols name works without adding assets.
- **The one exception:** a few glyphs in the file are custom vectors rather than Material Symbols. Do not substitute the nearest Material name (a `crop_free` stand-in for the temporary-chat bubble read as four corner brackets and was wrong). Export the path from Figma and wrap it in a component next to `MIcon`, as `src/components/TemporaryChatIcon.tsx` (the chat nav bar's Incognito mode) and `src/components/ScanIcon.tsx` (the dock's Scan tab and the Menu tab's scan row) do. Note in the file that it is the design's own path, not a redraw. The dock supports these via `DockTab.renderIcon`.
- **Legacy:** `src/components/Icon.tsx` + `src/icons/core/` (the CORE UI SVG library) are no longer used by any screen. Do not add icons there.

---

## Image / placeholder convention

Any category or subcategory **without an image asset yet** uses the **VIP logotype placeholder**:

```tsx
<img
  src="/vip-logo.svg"
  alt=""
  aria-hidden
  style={{ width: 48, height: 48, opacity: 0.35, display: 'block' }}
/>
```

- Pattern: the screen checks `if (item.image/imageFile)` → real image, else → VIP logo placeholder.
- Both `InterestsScreen.tsx` and `SubcategoryScreen.tsx` implement this pattern; copy it if you add a new screen with image tiles.
- **Never invent per-item icons for placeholders.** One uniform placeholder (the VIP logo) across everything image-less, for visual consistency.
- When real imagery arrives: drop the file in the right folder, set the `image` / `imageFile` field, the placeholder disappears automatically.

---

## Data conventions

**Categories (`src/data/categoryConfig.ts`)**

- Top-level: `categoryConfigs: Record<string, CategoryConfig>`. Key is the category id (matches what `InterestsScreen` sends).
- `subcategories` is the shared/default list. `subcategoriesWomen` overrides for female users on gendered categories.
- Subcategories have `image?` (filename) OR `icon?` (Material glyph). When neither is set, the VIP logo placeholder still kicks in.

**Categories list (`src/screens/InterestsScreen.tsx`)**

- `CATEGORIES: Category[]` - each entry has `id`, `label`, and `imageFile?` OR `icon?`.
- Keep alphabetical by label.
- Every entry here must have a matching `categoryConfigs[id]` entry, or `SubcategoryScreen` returns null.

**Products (`src/data/products.ts`)**

- Products reference `category` (matches `CategoryConfig.id`) and optional `subcategory`.
- Gender is `male` / `female` / `unisex`.
- New categories without products yield an empty swipe deck - fine for now, fix when tagging.
- A product's imagery is `image` (the primary shot) plus `images` (every view,
  primary first). **Always read the list through `viewsOf(product)`**, never
  `product.images` directly - it is the one function that answers "how many
  images does this have", so the gallery and its counter cannot disagree.
  Extra shots go in `EXTRA_VIEWS` in `productImages.ts`, keyed by the primary
  image path: the filename parser reads one file as one product, so a second
  shot dropped into the folder would parse as a separate piece.

---

## Copy & tone rules

**Never use long dashes anywhere.** This includes code comments, string literals, markdown, and commit messages. Long dashes read as an AI tell and break the voice of the product.

- Em dash (—, U+2014): **banned**
- En dash (–, U+2013): **banned**
- Use: regular hyphen `-`, comma, colon, or split into two sentences

**Subcategory subtitle voice (pattern locked in):**

- Short evocative descriptors in the "X and Y" pattern: *"Timeless and refined"*, *"Power and range"*, *"Sleek and two-door"*
- No brand names, region lists, or proper-noun lists (don't write *"Scotch, Japanese, Bourbon"* or *"Bordeaux, Burgundy, Napa"*)
- Fine Art is the only era-based category and uses date ranges like `"1400 - 1600"` (hyphen, never dash)
- 5-7 subcategories per category
- Pick **one slicing dimension** per category (all type-based, or all style-based, or all era-based) - don't mix axes within the same category

**Custom option on Subcategory screens:**

- Every Subcategory screen automatically appends a "Custom" tile (id = `'custom'`) at the end of the grid. Do NOT declare it in `categoryConfig.ts` - it's injected by `SubcategoryScreen.tsx`.
- Picking Custom is **additive** (doesn't deselect other subs) and reveals a text area for free-form preferences, stored in `customByCategory` state in `App.tsx`.
- Product filtering ignores the `'custom'` id - it's purely a preference-capture signal for the AI.

---

## Styling conventions

**Overlays must never move the content behind them.** Sheets, dialogs and menus are
absolutely positioned over the screen; opening one may not shift, scroll or resize
anything underneath. Two rules protect that, and both are easy to undo by accident:

- **Never use the `autoFocus` attribute inside an overlay.** Use `useAutoFocus()`
  from `src/hooks/useAutoFocus.ts` (it focuses with `preventScroll: true`). Plain
  `autoFocus` fires while the panel is still translated a full height below the
  fold, so the browser scrolls the nearest scrollable ancestor to reveal the field
  and the entire screen visibly jumps, then unwinds as the animation lands.
- The frame and every screen root use **`overflow: clip`, not `hidden`**
  (`PhoneFrame.tsx`, `screenStyle` in `screens/screenChrome.tsx`). `clip` cannot
  become a scroll container, so nothing can scroll them. Do not "fix" these back
  to `hidden`.

**Full design system: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).** Follow its tokens and
component specs for any UI work. **Use `theme.radii` / `theme.colors` from
`src/theme.ts` rather than raw values.** Key invariant: **buttons, icon buttons and
chips are fully rounded** (`theme.radii.button` = 100px - a pill when wide, a circle
when square), never sharp and never a rounded square. Cards are 16px. The prompt
field is the one deliberate exception at `theme.radii.input` (12px), so it reads as
a field rather than a button. Quick reference below.

- Background: `#0A0A0A` (near-black) or `transparent` on inner screens
- Primary text: `#FFFFFF`
- Secondary text: `#999`
- Borders: `1px solid #282828` inactive, `1.5px solid #fff` selected
- Corner radius: `16px` for cards, `100px` (pill/circle) for every button and chip
- CTA pill: `#f6f6f6` bg / `#121212` text (enabled), `#252525` bg / `#666` text (disabled)
- Animation easing: `cubic-bezier(0.25, 0.1, 0.25, 1)` 400ms default
- Safe area: use `safeTop()` from `src/theme.ts`; `calc(X + env(safe-area-inset-bottom, 0px))` for bottom

---

## Flow-affecting state in App.tsx

These are the signals downstream screens depend on - keep them in sync:

- `gender: string | null`
- `lifestyle: string | null` (`solo` / `couple` / `family` / `prefer-not`)
- `kidsCount: number`, `kidsAges: (number | null)[]`, `kidsNames: (string | null)[]` (only relevant when family)
- `lifestyleType: string | null`
- `selectedInterests: string[]`
- `subcategoriesByCategory: Record<string, string[]>`
- `customByCategory: Record<string, string>` (free-form text captured via the Custom tile on each Subcategory screen)
- `likedProducts: string[]`
- `isGuest: boolean` - set by which Welcome button was used (`onNext(guest)`). The
  **Menu tab** swaps its profile card for the "create an account" prompt when true.

## Post-onboarding state in FeedScreen.tsx

Once the user reaches the feed, `FeedScreen` owns the tab state and everything the
tabs share. Anything two tabs both touch belongs here, not inside a tab:

- `tab: 'home' | 'saved' | 'chat' | 'menu'` - the four stateful dock tabs; `home`
  also carries the detail views. The dock order is **Home · Saved · Chat · Scan ·
  Menu** (Figma node 5410-6902); **Scan**, the fourth item, is an overlay
  (`showScan`), not a tab - Close returns to whatever was underneath, and the
  Scan item is never marked active.
- `notifications: AppNotification[]` - what the **bell in the Discover nav bar**
  opens (Figma node 5570-55102). The bell is the standard bordered `buttonIcon`
  in the header's trailing slot and carries a dot while anything is unread; the
  list itself is a `detail` push over Home (`{kind: 'notifications'}`), so it
  keeps the dock and Back returns to Discover. Two rules: **every notification
  opens something** - it is seeded from the user's own collections so the piece
  it names is one they filed, and a row with nowhere to go would be the dead end
  the app refuses everywhere else - and **leaving the list is what marks it
  read**, not opening it, so the dots are still there while you read them. See
  `src/data/notifications.ts`.
- **There is no catalog search.** No field on Discover, no search modal, no
  results grid. Matching a typed string against tags only ever returns what the
  catalog has already been labelled with, while the questions people actually
  have are not ("something for a wedding in Como, under 5k") - so **the concierge
  is the search**: the Chat dock tab, or the prompt field on a page that is
  already about one thing. `SearchModal`, `AskConciergeOffer` and `matchesQuery()`
  were deleted with the feature. Do not put a field back on Discover.
- `savedQuery: string` - **the one search field left**, on the Saved tab, and it
  is a different animal: a filter over the handful of collections the user named
  themselves, where the name they chose is exactly what they would type. It runs
  **in place** (no modal, no pushed screen), matches on the collection **name**
  (the only text a collection has), and has two empty states - "Nothing found /
  Check the spelling or try a different name." with a query, "Nothing saved yet"
  without one. The field is `<SearchField>` (`src/components/SearchField.tsx`),
  which now exists solely for this. **The collection page itself has no search**:
  it is a short list the user assembled and every piece is already on screen.
- `memoryEnabled: boolean`, `memoryFacts: MemoryFact[]` - **Data Memory**. The Menu
  tab edits them (Data Memory sheet, Manage Data Memory) and the Chat tab writes to them,
  so both must read the same store. See `src/data/memory.ts`.
- `chatMessages`, `chatRatings` - the concierge thread. Held here so switching tabs
  does not discard the conversation. `chatPrompt` is the "Ask AI Concierge" hand-off:
  set it and switch to the chat tab, and `ChatScreen` auto-sends it once.
  **The chat nav bar actions depend on whether the thread is empty**: idle offers
  Incognito mode + History, and once there is a message it becomes New chat + More
  (Figma node 5410-6912). Keep both variants working when editing that header.
- `collections: Collection[]` - **Collections**, the only kind of saving in the
  app (Figma node 5531-2750). The Saved tab (dock label **"Saved"**, page header
  **"Saved collections"**) lists collections and nothing else - no segments, no
  saved-products list, and boutiques/stores are NOT saveable. See
  `src/data/collections.ts`.

  **A collection is a name and the pieces in it. Nothing else.** No description,
  no per-piece notes, no cover picture, no pinning, no virtual
  try-on. Each of those existed and was removed; do not reintroduce one without
  being asked. Its card is the pieces themselves (the 2x2 `<CollectionCover>`),
  which is why it never needs a cover of its own.

  **A piece lives in exactly one collection.** `collectionOf()` answers "which
  one", and every write that adds items runs through FeedScreen's `exclusive()`
  so filing a piece (or a whole look) somewhere *moves* it. This is why the Add
  to collection sheet is a radio list, and why `seedCollections` draws from a
  shared pool - overlapping seeds would be an illegal state on first paint.

  **Collections are created while filing a piece**, via "Add to collection" >
  Create. The Saved header carries no `+` and the list no creator row: an empty
  collection is not a thing anyone wants.

  **Newest first, wherever collections are listed** (Figma nodes 5531-2751 and
  5550-27212). `collectionsNewestFirst` is the one sort and both the Saved tab
  and the Add to collection sheet render from it - the collection you just made
  in that very sheet has to be the one at the top, not appended under the seeds.
  A new surface listing collections takes the same list, never raw `collections`.
- **Hearts manage collection membership everywhere.** A heart is filled when the
  piece sits in a collection (`isSaved`), and tapping one - on a product card,
  the product page, or a scan match - opens the Add to collection flow with that
  collection already selected. Choosing a different one moves the piece; tapping
  the selected one again clears it and saving takes the piece out altogether.
  There is no separate bookmark icon; do not add one.
- **A Discover look opens the collection page, not a product list.** Looks carry a
  deterministic `look-<id>` collection id, so tapping one opens the same page a
  saved collection does. Until it is hearted there is no stored `Collection`, so
  FeedScreen builds one from the look and passes `preview`. The page stays fully
  usable (hearts work, meaning what they mean everywhere else); only what needs a
  stored collection changes - the page floats **"Save to my collections"** instead of
  the concierge field, and Rename / Delete stay out of the menu. Either way the
  page then becomes the real one.
- `openCollectionId` - the collection page push over the Saved **or Home** tab
  (Home so a Discover look can open it). Deliberately
  kept when switching tabs so "Ask AI Concierge" and back lands on the same
  collection; tapping the Saved dock item while already on Saved pops it.
- **Tailored Outfits** (`src/data/outfits.ts`) - the Discover row **after Mixed Collections**
  (the group of coordinated looks; the Saved tab's own list stays "Saved").
  An outfit is one look already styled, where a collection is a bag of pieces the
  user gathered. **The difference lives entirely in the card**; there is no
  outfit page:
  - The card is the **styled flat-lay as shot** (`/public/outfits/*.webp`,
    generated for this prototype), squared off with `object-fit: contain` on
    white so nothing is cropped, and it carries **no heart and no "..."**. You
    open an outfit; you decide about it inside.
  - Opening one **pushes the ordinary collection page** under the deterministic
    id `outfit-col-<id>`, exactly the way a Discover look pushes `look-<id>`.
    FeedScreen builds the preview `Collection` from `OUTFITS`; "Save to
    collection" then files it (moving its pieces out of any other one). A look
    is a look once you are inside it, so **do not give outfits their own page** -
    that was tried and removed, along with a cover image at the top of it. The
    flat-lay stays on the card only: a filed outfit is an ordinary collection and
    its card becomes the 2x2 mosaic of what is in it.
  - The imagery is **menswear**, so the row is hidden when `gender === 'female'`
    rather than offering a look that cannot be worn. New imagery, new branch.
  - **Furniture & Decor Ideas** is the same object for rooms instead of people
    (`DECOR_SETS`, the row underneath): same card, same flat-lay treatment, same
    collection page behind it. It is unisex, so it has no gender branch. Both
    lists resolve through `allStyledSets`, so an id from either row opens and
    covers correctly - add a third row there too.
  - The flat-lays are **landscape 4:3 with their own ~6% safe margin baked in**,
    so they land flush in a 4:3 box. Portrait art was tried and left grey gutters
    in both the card and the cover; padding on top of the art's own margin was
    tried and doubled it.
- `addTarget: Product | null` - the piece the heart's sheet flow is managing.

When memory is **off**, nothing may be written silently: the chat says so in its
reply and skips the "Memory updated" chip.

There are **two ways into editing memory** and both must keep working: Menu > Data
Memory, and tapping the "Memory updated" chip (or the snackbar's Manage action) in
a chat. Both open the same `<MemorySheet>`.

**Every way into Add to collection must keep working**: hearts (product cards,
product page, collection page, scan match rows) and hearting a Discover look or
outfit (files the whole look as a collection). Both run through the same
`AddToCollectionFlow` / `CreateCollectionSheet`, and creating a collection only
happens inside that flow ("Create" in the sheet header).

**Reaching the concierge starts a NEW chat** (thread and ratings cleared) and
auto-sends a prompt carrying an attachment card - the collection (cover + meta),
the piece, or the scanned photo. Everything routes through `askConcierge` in
FeedScreen. **The attachment card is tappable and opens what it names**: it carries
an `AttachmentTarget` (`{kind: 'collection', id}` / `{kind: 'product', name}`) and
FeedScreen's `openAttachment` resolves it, since the chat does not own collections
or the product page. A scan with no confident match has no target and stays inert;
so does a collection that has since been deleted.

**Where something stands for the concierge, use the VIP logotype, not the
`auto_awesome` sparkle**: `<ConciergeMark>` (`src/components/ConciergeMark.tsx`,
`onLight` for the filled pill). The sparkle is every AI product's badge and this
one is ours. The exception is the chat's own suggestion rows, where the glyph
labels a kind of prompt rather than the concierge (whose name is in the label).

**On a page about one thing, the concierge is a prompt field, not a button.** The
product page pins a `<BottomDock>` that sends whatever the user typed with that
piece attached, and so does the collection page **once the collection is the
user's own** ("Ask me to find you a piece"). What you want to ask is specific
("what shoes go with this?"), so it goes in one step instead of landing in an
empty chat and typing it there. Where a field ever needs to advertise more than
one job, `<BottomDock>` takes a `placeholder` array plus a **static**
`placeholderPrefix` and cycles only the tail; a plain string stays a plain
placeholder.

**The collection page's bottom has one job at a time, and `preview` picks it.**
A look that is not the user's yet has exactly one decision attached to it, so the
slot goes to a full-width **"Save to my collections"** pill (the `favorite` heart, the
same glyph that saves a single piece) floating over the list on a gradient fade
rather than docked - it is a decision, not a fixture, and the pieces stay visible
underneath. Once the collection is theirs there is nothing left to decide and the
slot goes to the concierge field. Never both.

**Asked for pieces like something, the concierge hands back a collection**
(Figma node 5555-53458). A set of pieces chosen to go together *is* a collection,
so it arrives as one rather than as a list the user then files five times over.
The flow, and the copy that carries it:

1. **Ask** - from the product page's field ("Ask me for pieces like this") or the
   chat. `WANTS_SIMILAR` in `ChatScreen` catches it and wins over the
   update-a-collection intent, since "more pieces like this" is a request for new
   pieces, not for an existing collection to grow.
2. **Propose** - `conciergeProposeCollection` picks four, same category first,
   and only from pieces no collection already holds. The anchor piece can be
   **attached or merely named in the sentence**; both must keep working.
   Suggestion chips never name a piece, because the catalogue is gender-filtered
   and a hardcoded name is absent for half the users.
3. **Reply** - "Here are 4 pieces that sit alongside the {piece}. I have gathered
   them into "{name}". Open it to save it to your collections." plus the
   collection as a tappable attachment card. The copy has one job past naming
   what it found: say the set is a thing you can keep, and that keeping it is
   still your call.
4. **Keep it** - the card opens the ordinary collection page in `preview`, whose
   floating button reads **"Save to my collections"**, confirming with
   **"Saved to your collections" / View**.

**A proposal is not a save.** It lives in FeedScreen's `proposals`, never in
`collections`, until the user says so - so `openAttachment` and
`previewCollection` both have to resolve proposals as well as stored collections
and Discover looks.

**Where a page has nothing to ask about, the concierge is a button.** The scan
results carry one filled "Ask AI Concierge" on the "None of these?" row, because
the answer to a bad match is to hand the photo over, not to type. **No dead end
just stops**: the catalog only holds what is already tagged in it, so the
concierge is always the way out. The action is called **"Ask AI Concierge"**
everywhere.

**Virtual try-on is the product page's, and clothing-only**, via `isClothing()`
in `src/data/collections.ts`. Keep that gate if categories are renamed. The button
is **omitted entirely** for a non-clothing piece (a car has nothing to try on, so a
dead button is noise). **The collection page has no try-on** - and no action stack
at all: its only button is the floating "Save to my collections", and only while it is
a `preview` look the user has not filed yet.

**The product page builds its actions as exactly one filled primary, the rest
outlined, full width** (`primaryActionStyle` / `outlinedActionStyle` in
`src/screens/screenChrome.tsx` - use those, don't restyle a button in place). When
the natural primary is unavailable the next action takes the filled slot rather than
leaving the page with none; it promotes Ask AI Concierge.

**There is no stockist section.** The product page had one - a drawn map, a rail
of store cards and a sheet per boutique - and it was removed along with
`WhereToBuy.tsx`, `StoreMap.tsx`, `boutiques.ts` and `mapCanvas.ts`. Where to
buy a piece is a question for the concierge, which the page already carries as
its prompt field. Do not put boutiques, stock or a map back on this page
without being asked; the deleted version is in git history if it is ever wanted
back.

**Save to your collections** (`src/components/SaveToCollection.tsx`) is the
product page's last section, in the space the stockist section used to hold. It
has **two states, and only ever one of them**:

- **Unsaved**: a rail of every collection, newest first, bookended by two
  narrower cards of the same shape: **Create**, straight to the create sheet,
  and **More**, which opens the Add to collection sheet (the same list, with a
  search over the names).
- **Saved**: the rail is **gone**, replaced by that same row at full width with
  a filled **Saved** pill, and New disappears with it. There is no second choice
  to offer once a piece is filed, because a piece lives in exactly one
  collection. Refiling is unsave, then save again: one deliberate step instead
  of a tap that quietly empties a slot in a collection the user had already
  built.

**Every collection here is a horizontal row** - preview, name, meta, control -
in both states, so filing a piece does not change the shape of what you were
looking at. This is the one surface that does NOT use `<CollectionCard>`: that
card stacks its cover above its text, and a rail of those at picker size left
the name truncated and the meta wrapping. **The preview is one piece, not the
2x2 cover**, for the same reason `CollectionThumb` is one piece in the sheet:
at row size, four images are four thumbnails too small to read.

Saving and unsaving both confirm in the snackbar with **Undo**, and both end in
FeedScreen's `fileProduct`, the same function the heart's sheet ends in, so the
two can never disagree. **Create makes a collection while filing this piece**,
opening the shared `AddToCollectionFlow` on its create step (`startOnCreate`),
rather than being a second way to make an empty collection.

---

## Things NOT to do

- Don't invent new top-level categories outside the defined set without asking - this is a luxury-goods catalog, not a lifestyle concierge. Approved verticals only.
- Don't commit `.claude/` - gitignored on purpose.
- Don't hardcode product data inline in screen components - always via `src/data/`.
- Don't skip the `subcategoriesWomen` branch when editing a gendered category.
- Don't forget to update `getProgressPct()` and `totalSteps` when adding/removing screens.
- Don't use native `<select>` for pickers - use the bottom-sheet wheel pattern (see `KidsScreen.tsx` → `AgePickerSheet`).

---

## Quick reference: common change recipes

**Add a new category**
1. Add entry to `CATEGORIES` in `InterestsScreen.tsx` (alphabetical)
2. Add matching `categoryConfigs[id]` entry in `src/data/categoryConfig.ts` with subcategories
3. If gendered: add both `subcategories` and `subcategoriesWomen`
4. Add image assets to `/public/images/categories/{men,women}/{id}.webp` OR use icon placeholder (VIP logo shows automatically)
5. Tag products in `src/data/products.ts` (or leave empty for now - deck will be empty)

**Add a new subcategory**
1. Add entry to `subcategories` array in `categoryConfig.ts`
2. If the category is gendered: also add to `subcategoriesWomen` unless it's genuinely one-gender-only
3. Add image to `/public/images/subcategories/{folder}/{men,women}/{id}.webp` or omit for VIP logo placeholder
4. Tag products with the new `subcategory` id

**Add a new onboarding screen**
1. Create `src/screens/NewScreen.tsx` mirroring an existing one
2. Add screen id to the `Screen` union in `App.tsx`
3. Wire state + handlers (`handleNewScreenNext`, `handleNewScreenBack`)
4. Add to `renderScreen` switch
5. Add to `handleBack` switch
6. Update `getProgressPct()` and `totalSteps`

**Rename a visible label**
- Check for the label string across `App.tsx`, screen files, and `categoryConfig.ts`. Update all occurrences. IDs stay the same unless the user explicitly asks to rename the id too.
