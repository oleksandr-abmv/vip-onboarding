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

`CollectionCard` (used by **Collections**) matches the **regular product card**
(230px wide, 4:3 image, same height): its image is a **2x2 grid of the first four
items** (1px even gutters, no "+N" overflow) + name + "N pieces", plus a **favorite
heart** (saves the whole look to Saved > Collections) and a "..." menu
(self-contained `OverflowMenu`, portaled like the product-card menu). The
Categories/carousel scrollers keep their horizontal padding on the **inner track**
so the right inset survives at scroll end.

The Discover bottom is just the **tab bar** (the search `ChatBar` was removed here
as redundant; it stays on the Product Page). Products are stably shuffled
(deterministic) so every group mixes categories. Products **without real imagery**
(the VIP-logo placeholder) are hidden from the feed, as is anything marked "Do not
recommend". "View all" / a collection opens a titled full-screen list.

### Saved view
A **top-level tab** (heart in the bottom bar), so **no back button**. Header
"Saved", then a **full-width 3-segment switcher** (`Products` / `Collections` /
`Stores`, pill track `#141414`, active segment filled `#f6f6f6`/`#121212`). **Every
tab is a single full-width column** (`savedColStyle`):
- **Products** - saved `ProductCard`s (`width: 100%`).
- **Collections** - looks saved via the heart on a collection card, as full-width
  `CollectionCard`s (heart filled, tap to open the look's list).
- **Stores** - boutiques saved via the heart on a product page's store card, as
  full-width `SavedStoreCard`s (storefront photo + name + tagline + address, filled
  heart to remove).

Each empty tab has a **centered empty state** (no button): one shared **skeleton
illustration** (`SkeletonCards` - three static fanned ghost cards mimicking the real
content, no animation), title, and subtitle. Category "See all" pages keep a back
button + single-column large cards. The shared `CenteredEmptyState` renders these.

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
  label `#f6f6f6` (icon `FILL 1`), inactive `#8b8b8b`. Tabs: **Home** (`home`),
  **Alerts** (`notifications`), **Chat** (`chat_bubble`), **History** (`history`),
  **Menu** (`menu`). Home, Chat and Menu are wired; Alerts / History are still
  visual placeholders.
- Three shapes from one component: **prompt + tabs** (Chat), **prompt only**
  (Manage Memory, Figma node 5381-8383), **tabs only** (Discover, Menu).

### Screen chrome (`src/screens/screenChrome.tsx`)
`screenStyle`, `bodyStyle`, `Header`, and `iconButtonStyle` - the shell every
top-level tab and detail view shares (full-bleed column, scroll body running under
the gradient-fade header). Lives in its own module so tabs can use it without
importing FeedScreen.
- **Header** takes `title` (string or node), optional `subtitle` (14/20 `#999`,
  stacked under the title and centered), `onBack`, `left` (a leading control that
  replaces the plain back arrow), `right`, and `height` (56 for the Figma navBar,
  64 for the plain title header). Title-only callers render exactly as before.
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
- **`full`** raises the panel to `safe-area + 8` instead of hugging its content -
  the height the Memory sheet is drawn at in the design (744 of 806pt).

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
- **navBar** (`Header height={56}`): leading new-chat `buttonIcon` (`edit`), a node
  title of VIP mark 24px + "Concierge" 16/20/500 + `chevron-down` 18px, and two
  trailing `buttonIcon`s - `temporary-chat` and `more-horizontal`. All three are
  the 40px bordered circle.
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
- **Nav**: the **only pinned element on the page** - back (left), "Details"
  centered, share + heart (right, heart fills `#ef4d63` when saved). Absolutely
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
- **Title** 24/600 (`brand + name`), **general price** 20/500 `#ededed`, formatted
  from the price-history current value (`$8,200.00`) so it always shows and matches
  the chart's "today".
- **Historical price**: the `HistoricalPrice` card sits directly under the price
  (see its own entry below). Starts **collapsed**; tapping its header row expands
  it. Keyed by product so it resets per item.
- **Actions** (stacked, right under the historical price, `gap 12`, `height 54`):
  **"Explore on Official Site"** (filled pill `#f6f6f6`/`#121212`) then **"Ask
  VIP.ai"** (dark pill `#242424`, `1px solid #313131`, `#f2f2f2`, VIP mark + label).
  The old floating "Ask about this product" `ChatBar` was **removed**.
- **Description**: paragraph + derived bullet list (category / type / gender).
- **Spec table**: Brand / For / Category rows, label `#999` medium left, value
  `#f2f2f2` right, hairline dividers.
- **Section divider**: 6px `#141414` band.
- **Available in stores**: horizontal Store Cards.

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

### Store card
264px wide, `borderRadius 16`. Image area 150px shows a **real storefront photo**
(`object-fit: cover`, pulled from the internet via loremflickr), with an `onError`
fallback to the brand wordmark (uppercase, letter-spaced, `#1a1a1a` on `#ececec`).
A "Nkm from you" pill tag (bottom-right) and a rounded-square favorite (top-right,
toggles + fires the snackbar). Meta: name 16/600, tagline `#999`, then location +
phone rows (Material icon + text).

### Prompt field
Lives inside `<BottomDock>` (see **Bottom dock** above) - there is no standalone
chat-bar component. `radius 12`, never a pill.

### Snackbar z-order
The snackbar sits above the product-page overlay (`z 80`) at its default `z 90`, so
favorite toasts appear **everywhere** a favorite is added - feed, saved view, and
product page (product heart + store card favorites). The `zIndex` prop raises it
again over full-screen pushes like Manage Memory (`z 200` → 250) and over the
Memory sheet the chat chip opens (`z 301` → 310). `bottom` shifts it to clear
whichever dock is on screen: 71px for tabs-only, 74px for prompt-only, **129px on
the Chat tab** where the dock carries both.

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
- Feed / cards / snackbar / bottom bar / tab + memory state: `src/screens/FeedScreen.tsx`
- Data Memory store + intent parsing: `src/data/memory.ts`
- Swipe deck, thumb & icon buttons: `src/screens/RefineYourTaste.tsx`
- Flow, nav, progress, onboarding %: `src/App.tsx`
- Flow logic, copy tone, placeholder rule, gender/lifestyle branches: `CLAUDE.md`
