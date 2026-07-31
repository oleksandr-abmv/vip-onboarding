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
- **The one exception:** a few glyphs in the file are custom vectors rather than Material Symbols. Do not substitute the nearest Material name (a `crop_free` stand-in for the temporary-chat bubble read as four corner brackets and was wrong). Export the path from Figma and wrap it in a component next to `MIcon`, as `src/components/TemporaryChatIcon.tsx` (the chat nav bar's Incognito mode) and `src/components/ScanIcon.tsx` (the dock's Scan tab and the search field's trailing action) do. Note in the file that it is the design's own path, not a redraw. The dock supports these via `DockTab.renderIcon`.
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
- `query: string` - **Discover search**. A non-empty query swaps the feed groups
  for a results grid in place; it does not push a screen. Tapping the Home dock
  item while on Home clears it. **Search is one experience, `<SearchModal>`**
  (`src/components/SearchModal.tsx`): a full screen with an autofocused field, a
  Cancel button, an idle state, live results supplied by the caller, and an **Ask
  AI Concierge** offer on **both** its idle and no-match states.

  Discover's field and the Add pieces sheet's both open it. **Saved is the
  exception and filters in place**: its field sits on the page and narrows the
  grid as you type, because that list is short, already on screen and already
  scoped. **The collection page has no search at all**: a collection is a short
  list the user assembled themselves and every piece is already on screen, so a
  field to find something inside it only added a step. Searching happens where
  there is a catalog to search, not inside a result. The field
  itself is the shared `<SearchField>` (`src/components/SearchField.tsx`), which
  also backs the Add pieces sheet. Do not hand-roll another one, and match with
  **`matchesQuery()` from `src/data/products.ts`** rather than an inline predicate.
  It tests the category's **display name as well as its id**, which is load-bearing:
  several ids are internal and differ from the only label the user sees (`Footwear`
  is "Shoes", `Vehicles` is "Cars", `Fashion and Apparel` is "Clothing", `Jewellery`
  is "Jewelry"), so an id-only match makes "shoes" return nothing.
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
  app. The Saved tab (dock label and page header both **"Saved"**) lists
  collections and nothing else - no segments, no saved-products list, and
  boutiques/stores are NOT saveable. Creating one is the **`add_2` icon button in
  the header's top-right corner**, not a row in the list. See
  `src/data/collections.ts`.
- `pinnedIds: string[]` - **pinned collections**, most recently pinned last. A
  pin toggle sits beside each card's name (`keep`, filled when pinned), and
  pinned collections lift out of the Saved column into a **horizontal rail at
  the top of the tab**, the same carousel Discover's Collections row uses, so a
  pinned collection is the same object in a faster place rather than a new kind
  of thing. The column below only gains its "All collections" heading once
  something is pinned. Pinned ids are **derived against the live list, not
  pruned on delete**, so deleting a pinned collection and hitting Undo brings
  the pin back with it.
- **Hearts manage collection membership everywhere.** A heart is filled when the
  piece sits in any collection (`isSaved`), and tapping one - on a product card,
  the product page, or a scan match - opens the Add to collection flow with the
  piece's current collections pre-checked. Unchecking and saving removes it.
  There is no separate bookmark icon; do not add one.
- **A Discover look opens the collection page, not a product list.** Looks carry a
  deterministic `look-<id>` collection id, so tapping one opens the same page a
  saved collection does. Until it is hearted there is no stored `Collection`, so
  FeedScreen builds one from the look and passes `preview`. The page stays fully
  usable (notes and hearts work, hearts meaning what they mean everywhere else);
  only what needs a stored collection changes - "Save Collection" replaces Add
  pieces, and Rename / Delete leave the menu. **Writing a note files the look** in
  the same state update, so a note is never dropped. Either way the page then
  becomes the real one.
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
    FeedScreen builds the preview `Collection` from `OUTFITS`; "Save Collection"
    then files it for real. A look is a look once you are inside it, so **do not
    give outfits their own page** - that was tried and removed, along with a
    cover image at the top of it.
  - The imagery is **menswear**, so the row is hidden when `gender === 'female'`
    rather than offering a look that cannot be worn. New imagery, new branch.
- `addTarget: Product | null` - the piece the heart's sheet flow is managing.

When memory is **off**, nothing may be written silently: the chat says so in its
reply and skips the "Memory updated" chip.

There are **two ways into editing memory** and both must keep working: Menu > Data
Memory, and tapping the "Memory updated" chip (or the snackbar's Manage action) in
a chat. Both open the same `<MemorySheet>`.

**Every way into Add to collection must keep working**: hearts (product cards,
product page, scan match rows), hearting a Discover look (files the look as a
collection), the collection page's pinned "Add pieces" sheet (combined search +
scan, one piece per tap), and Saved > New collection. All of them run through
the same `AddToCollectionFlow` / `AddItemsSheet` / `CreateCollectionSheet`.

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
collection page, the product page and the scan results each pin a prompt-only
`<BottomDock>` (no attach) that sends whatever the user typed with that thing
attached. **Where the field does more than one job its placeholder cycles**, with
a **static lead-in and only the tail moving**: the collection page runs "Ask to
find you a piece / add pieces / modify this collection". A single static hint only
advertises one of the three and nobody would guess the rest, but rotating whole
sentences is hard to read at a glance. Pass `placeholder` an array plus
`placeholderPrefix`; a plain string stays a plain placeholder. Keep the lead-in
short - spelling out "Ask AI Concierge to" ate the width the tails need. What you want to ask is specific
("what shoes go with this?"), so it goes in one step instead of landing in an empty
chat and typing it there. **On a page about nothing in particular** - the search
modal's idle and no-match states, both empty states of the Add pieces sheet - it is
the **"Ask AI Concierge"** offer instead (`src/components/AskConciergeOffer.tsx`),
because there is nothing yet to ask about. Either way **no dead end just stops**:
searching only finds what is already tagged in the catalog, so the concierge is
always the way out. The action is called **"Ask AI Concierge"** everywhere.

**The offer argues, in one line.** Most people assume a search box is all there
is, so `<AskConciergeOffer>` carries a line under its CTA saying what the concierge
does that search cannot ("Describe an occasion, a budget or a mood. It looks past
the catalog."). One line, not a panel: a headline plus worked examples was tried
here and made an empty search screen feel like homework.

**Search suggestion chips are real rows from the data being searched**, never a
list of departments: pieces from the catalogue on Discover, pieces in this
collection on the collection page. A chip is a demonstration of a good query, so it
must never come back empty. They sit in **one horizontally-scrolling row**, and the
idle state carries no headline - the field's placeholder already says what this
searches.

**Virtual try-on is clothing-only**, via `isClothing()` / `collectionHasClothing()`
in `src/data/collections.ts`. Keep that gate if categories are renamed. On the
**product page** the button is **omitted entirely** for a non-clothing piece (a car
has nothing to try on, so a dead button is noise). On the **collection page** it is
the **primary button** of the action stack when the collection has clothing, and
otherwise a **disabled menu item** - the collection still exists, so the action stays
named rather than vanishing.

**Both pages build their actions the same way: exactly one filled primary, the rest
outlined, full width** (`primaryActionStyle` / `outlinedActionStyle` in
`src/screens/screenChrome.tsx` - use those, don't restyle a button in place). When
the natural primary is unavailable the next action takes the filled slot rather than
leaving the page with none. The collection page's priority is **Save Collection →
Virtual try-on → Add pieces** (a preview look never offers Add pieces, having no
stored collection to add to); the product page promotes Ask AI Concierge.

**Where to buy** (`src/components/WhereToBuy.tsx`) is the product page's stockist
section: map preview, filter chips, then one row per boutique. Two invariants:

- **Boutiques carry no photography.** Name, address, hours and stock are what
  decide where you go; a storefront photo said nothing and doubled every row.
  Do not reintroduce store images. Boutiques stay **not saveable** (no heart).
- **The map is drawn, not tiled** (`src/components/StoreMap.tsx`), and pins and
  distances come from one set of coordinates in `src/data/mapCanvas.ts` /
  `src/data/boutiques.ts` - a boutique's `x` / `y` **produces** its distance.
  Move a pin and the row follows; never hardcode a distance next to a pin.

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
