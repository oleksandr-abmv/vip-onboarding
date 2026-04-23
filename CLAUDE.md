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

**Always use the `<Icon />` component from `src/components/Icon.tsx`. Do not hand-draw SVG glyphs or use Material Symbols Rounded for new icons.**

- Icons come from the **CORE UI Design icons** library: <https://github.com/oleksandr-abmv/core-ui-design-icons>
- SVG files live in `src/icons/core/` (242 icons, stroke-based, 24×24 viewBox, `currentColor` stroke so they recolor via the `color` prop)
- Usage:

  ```tsx
  import { Icon } from '../components/Icon';

  <Icon name="timer" size={16} color="#e7e7e7" />
  ```

- `name` is the filename without `.svg`. Browse `src/icons/core/` or the library [icons page](https://icons.coreui.design/) for names.
- Set `decorative={false}` + `label="Something"` when the icon conveys meaning to screen readers.
- If a glyph is genuinely missing from the library, add it there first (or drop a new SVG into `src/icons/core/` with `currentColor` strokes) rather than inlining raw SVG in a screen.
- Material Symbols Rounded is still used for the few existing cases (e.g. `material-symbols-rounded` class in a handful of old screens), but new code should prefer `<Icon />`.

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

- Background: `#0A0A0A` (near-black) or `transparent` on inner screens
- Primary text: `#FFFFFF`
- Secondary text: `#999`
- Borders: `1px solid #282828` inactive, `1.5px solid #fff` selected
- Corner radius: `12px` for cards, `100px` (pill) for CTAs
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
