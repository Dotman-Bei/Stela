# Stella — Frontend spec

Source: `stella-prd.md` v1.0. Design rules: the `design-taste-frontend` skill, app-screen run
(`references/app-screens.md`), style dealt as **True-black flat** (seed 508482306, kind `community`).

Stella's frontend is a set of screens people work in (a feed with filters, an object's detail page,
a person's page, a composer), so it follows the app-screen rules, not the landing-page run. The board
is also the public front door: evaluators, the demo video and shared links all land on it.

Figures in the copy below (1,042 entries, #211…) illustrate the layout; every count on screen is
computed from the entries the app loads.

---

## 1. Who it is for, and what each screen drives

| Reader | Arrives from | Wants |
|---|---|---|
| Casual poster | A friend's shared entry link | To put one wish or message somewhere it will last, in one transaction |
| Collector of moments | Their own author link, once a year | To add this year's entry and see the diary grow |
| Community or brand | Their announcement draft | A pledge with a transaction link nobody can walk back |
| Evaluator (BOT Labs) | The ecosystem listing | To post, then read the entry back from the contract and check it matches |

| Screen | Route | Its one question | The one action it drives |
|---|---|---|---|
| Board | `/` | "What are people putting on-chain, and can I add mine?" | **Post an entry** |
| Entry | `/entry/:id` | "Is this entry really on-chain, exactly as shown?" | **Verify on-chain** (recompute the hash in the browser) — then share |
| Author | `/author/:address` | "What has this wallet said, ever?" | **Copy this page's link** (share the diary) |
| Post flow | composer on `/`, sheet from the top bar | "Did it go on-chain?" | **Sign and post** → open the new entry |

---

## 2. Visual direction

**Thesis.** The board is a night sky that keeps everything. True black ground, light only where
something was written. Each entry is a point of light; the hash chain that links every entry to the
one before it is drawn as the line between them, so the board's one technical claim (nothing can be
removed without breaking the line) is the thing you see first. Colour is spent on one thing only: the
star-gold of a recorded entry, its chain link and its reactions.

**The face of this product** (what makes it Stella, not a dark-mode kit):
1. **The chain strand** — a vertical line down the left of every feed, one gold point per entry, the
   short `prevEntryHash` beside each link. The signature element; it appears on Board, Entry and Author.
2. **Star-gold as the one data hue** (replacing the sheet's lime, which belongs to sport).
3. **An author constellation** — each wallet address drawn as its own small constellation (points
   placed from the address bytes, joined in order). Same address, same shape, everywhere. Stands in
   for an avatar; no generated faces.

### Palette (exact values)

| Token | Value | Role |
|---|---|---|
| `--ground` | `#000000` | Page, top bar, everything at rest |
| `--surface` | `#111111` | Cards (one lightness step up, no border, no shadow) |
| `--raised` | `#2a2a2a` | Nested wells: the raw `eth_call` panel, input fields |
| `--rule` | `#1c1c1c` | Row rules, the tab rule |
| `--control` | `#444444` | Outlined buttons, input borders |
| `--text` | `#ffffff` | Entry text, titles, key figures |
| `--muted` | `#b4b4b4` | Secondary text, inactive nav (`#bbbbbb` per the style) |
| `--faint` | `#949494` | Meta: times, block numbers, labels |
| `--accent` | `#f4c95d` | Star-gold. Data only: chain points, reaction counts you gave, the "confirmed" state, the stats' answer figure. Never on buttons, tabs or nav. |
| `--positive` | `#f4c95d` | Same as accent: "Recorded", "Hash matches" |
| `--negative` | `#e5484d` | "Hash does not match", failed transaction, text over the cap |
| `--primary` / `--primary-ink` | `#ffffff` / `#000000` | The one primary control per screen: a white 36px pill, black text |
| pills | positive `#2a2410` / `#f4c95d` · negative `#2c1a20` / `#e5566f` · neutral `#222222` / `#ffffff` | Status only |

Colour budget: ≤ 3% of pixels on any screen.

### Type (two faces, no more)

- **Inter** 400 / 500 / 600 — everything. Sizes: entry text on the Entry page 28px (desktop) / 22px
  (phone); title 24px; entry text in feeds 16px; section 16px; KPI 24px, answer figure 32px; body
  14px; small 12px. Tabular figures on every count, id and time.
- **JetBrains Mono** 400 — only for machine values: hashes, addresses, entry ids in the chain, and the
  raw `eth_call` output. Body size, truncated with an ellipsis and a copy button.

No tracked capitals, no weight above 600, sentence case everywhere.

### Spacing scale

`4 · 8 · 14 · 22 · 32 · 48 · 64` px. **14px is the one gutter** (between cards, horizontal and
vertical). **22px is card padding.** 32px from the title row to the first card. Feed rows: text
block + 22px top/bottom. Column: 1120px centred, 16px side margins on phone.

Radii: cards 20px, controls fully round (999px), code wells 12px. Nothing in between.

### Motion rules

- Motion is feedback, never an entrance. No section fades in on load.
- Transform and opacity only. Press 120ms, hover 150ms, UI 200ms, easing `cubic-bezier(.22,1,.36,1)`.
- **A new entry arriving** in the live feed: the row slides down 12px and fades in over 240ms; its
  chain point pulses gold once.
- **Post confirmed:** the new entry's chain point flares and throws 12–16 small gold points that
  settle within 900ms (the PRD's "confetti", in the product's own shape). Once, never on loop.
- **Verify on-chain:** the recomputed hash types in left to right (≤ 600ms), then the match state.
- `prefers-reduced-motion`: every move above becomes an instant state change; nothing is hidden.

---

## 3. Screens and sections, in build order

### 3.0 Shell (shared)

No sidebar (Stella has three destinations). A 48px top bar on the black ground, aligned to the
1120px column; a 1px rule appears only once content scrolls under it.

- Left: the Stella mark (a four-point star in gold, drawn) + wordmark **Stella**.
- Links: **Board** · **My entries** (only when connected; goes to `/author/<you>`) · **How it works**
  (opens a sheet).
- Right: **Connect wallet** (outlined) → once connected, the short address with its constellation.
  **Post an entry** (white pill) — the one primary.
- Network line, 12px faint, left of the wallet: `BOT Chain` (`BOT Chain · demo data` until the contract is deployed).
- Phone: mark and menu button; links, wallet and **Post an entry** go into a menu sheet. On the board
  the composer is the first block, so no floating post button is needed.

Footer (all screens), one quiet row: `Stella is one contract on BOT Chain.` · contract address (mono,
copy) · `View contract on explorer` · `Source on GitHub`.

### 3.1 Board — `/`

**Title row**
- h1: **The board**
- Subline (16px, muted): *Every entry here is stored word for word on BOT Chain and linked by hash to
  the one before it. Nothing can be edited or deleted — not by you, not by us.*
- Right: freshness stamp `Live · last entry 2 min ago`.

**Row 1 — 6-column grid: composer (4) beside the record (2)**

*Composer card* (4 columns)
- Heading: **Say it on-chain. It stays on-chain.**
- Field label: `Your entry`. Textarea, 4 lines. Counter at the bottom right: `0 / 280`; turns
  `--negative` past 280 with `14 characters over the limit` tied by `aria-describedby`.
- Category picker as a segmented row: **Wish · Message · Memorial · Declaration · Prediction**.
  Default **Message** (PRD §7).
- Permanence line beside the button (14px, muted): *Once posted, this can't be changed or removed.*
- Button: **Connect wallet to post** when disconnected → **Post to BOT Chain** when connected.

*The record* (2 columns) — the stats strip, stacked as type, no tiles:
- **Entries on the board** — `1,042` (answer figure, 32px, gold)
- **Posted today** — `17`
- **Most reacted** — `#211 · 148 reactions` + the first two lines of its text, linking to the entry.
- **Entries per day, last 7 days** — seven columns, today in gold, counts on the marks.
- 12px faint line: `Read live from the contract at 0x5te1…a77a`.

**Row 2 — the feed**
- Section heading: **Latest entries**
- Underline tabs with counts: **All 1,042 · Wishes 391 · Messages 288 · Memorials 104 ·
  Declarations 151 · Predictions 108**.
- Toolbar: search (`Search text or address`), right side `1,042 entries · Newest first`.
- New-entries notice when not at the top: `3 new entries — show them` (a text button in the feed head).
- Rows on the chain strand (see §4 Entry row). 20 rows, then **Load 20 more** with
  `Showing 1–20 of 1,042`.
- Genesis entries carry a neutral pill **Genesis** (PRD §5.3).

**Real copy for the demo entries** (genesis set, sample content to confirm before launch — full list
lives in `src/data/genesis.ts`), for example:
- Wish — *That my mother's garden still has tomatoes in it when I'm old enough to grow my own.*
- Declaration — *We, the BOT Chain Builders Guild, will publish every grant decision we make, with
  reasons, on this board. Hold us to it.*
- Memorial — *Kemi Adeyemi, 1941–2026. Taught three generations of Ibadan to read. Every word here
  is for you.*
- Prediction — *Before the end of 2027, a nurse in Lagos will open a savings account on-chain
  without knowing it was on-chain.*
- Message — *I was here, on the first night the board went live. Hello to whoever reads this in 2060.*

### 3.2 Entry — `/entry/:id`

**Header card** (the object itself)
- The author's constellation (50×50), then h1 **Entry #211**, category pill (**Wish**), icon buttons:
  copy link, share.
- Meta line: `0x3f1c…9b2e · 14 Oct 2026, 21:04 UTC · tx 0xf35d…ddc9` (copyable).
- Right: **View transaction on explorer** (outlined).

**The entry** — the text itself set at 28px, white, full width, max 34ch per line. Under it:
`Posted by 0x3f1c…9b2e — see all 6 entries from this wallet`.

**Row — 6-column grid**
- *Reactions* (2 columns). Heading **Reactions**. Four reaction buttons, drawn glyphs, not emoji:
  **Witnessed · Starred · A candle · Love**, each with its count. One per wallet per reaction (PRD §7).
  Disconnected: tapping one opens the connect step. Your own reaction shows in gold with
  `You reacted`.
- *Place in the chain* (4 columns). Heading **Place in the chain**. Three linked points on the strand:
  `#210` ← **#211** → `#212`, each with its entry hash in mono. Line: *This entry's hash includes the
  hash of #210. Change one word in any earlier entry and every hash after it stops matching.*

**Verify on-chain** (6 columns, the screen's live thing)
- Heading **Verify on-chain**.
- Two columns: left *As shown on Stella* (category, author, timestamp, text); right *Raw `eth_call`
  result* — `getEntry(211)` request and the ABI-encoded response in a mono well, decoded fields beside.
- Button **Recompute hash** (white pill — the screen's primary). Result row:
  `keccak256(text) = 0x9a4e…c01d` · `Matches the textHash in EntryPosted` (gold pill) or
  `Does not match` (negative pill).
- Footnote: *The explorer is the source of truth. This page is a lens on it.*

Not found: `/entry/99999` → title **Entry #99,999 hasn't been written yet**, line
*The board has 1,042 entries so far.* and **Back to the board**.

### 3.3 Author — `/author/:address`

**Header card**
- The wallet's constellation (88×88), h1 = short address `0x3f1c…9b2e`, full address in mono with
  copy, **Copy this page's link** (white pill — primary), **View on explorer** (outlined).
- Figures as type, one row: **6 entries** · **First entry 1 Jan 2026** · **312 reactions received**.
- When it's your own wallet: subline *This is your page. Everything here is permanent and public.*

**The diary** — heading **Every entry from this wallet**. Grouped by year (heading per year:
**2026**), entries on the chain strand, oldest-to-newest toggle (**Newest first / Oldest first**).
Category tabs as on the board, only those with entries.

Empty: *This wallet hasn't posted anything yet.* + (when it's yours) **Post your first entry**.

### 3.4 Post flow (composer states + sheet)

Opened from the composer on the board or **Post an entry** in the top bar (a sheet on other screens).
States, all built and checked:

1. **Disconnected** — button *Connect wallet to post*; on tap, a sheet: **Connect a wallet** /
   *Stella needs an EVM wallet on BOT Chain (chain 677) to sign your entry.* / **Connect browser
   wallet** / no wallet found → *No wallet found in this browser. Install one, then come back.*
2. **Wrong network** — *Your wallet is on another network.* **Switch to BOT Chain**.
3. **Composing** — counter, category, **Post to BOT Chain**.
4. **Waiting for signature** — button reads *Confirm in your wallet…*, field locked.
5. **Confirming** — *Writing to BOT Chain…* (typically under a second).
6. **Recorded** — the composer turns into the receipt: **Recorded as entry #1,043**, the text, the
   flare on its chain point, its proof (entry hash, the entry it links to, transaction hash), links **Open entry** · **View transaction** · **Copy link**, and
   **Write another**. The new row appears at the top of the feed.
7. **Rejected / failed** — *You cancelled in your wallet. Nothing was posted.* / *The transaction
   failed: <reason>. Nothing was posted.* with **Try again**; text kept.

### 3.5 How it works (sheet)

Heading **How Stella works**. Four short paragraphs from PRD §6:
- *Your words are stored on-chain, in full.* Up to 280 characters per entry, written into BOT Chain's
  state — not a link to somewhere else.
- *Each entry is chained to the last.* Every entry records the hash of the one before it. Removing or
  rewriting any entry breaks every link after it, in public.
- *Nobody can edit or delete.* Not the author, not the contract owner. Filters on this site only change
  what you see.
- *Reactions are free signals.* One per wallet per reaction. No tokens, no payments, no rewards.

---

## 4. Components

| Component | Desktop (≥ 1024) | Phone (≤ 640) |
|---|---|---|
| **Top bar** | Mark + 3 links + wallet + white pill, on the 1120 column | Mark, search icon, menu; links and wallet in a sheet |
| **Chain strand** | 56px left gutter: 1px line `--rule`, 7px gold point per entry, short prev-hash under the point on hover/focus | 28px gutter, points 6px, hash hidden (shown on Entry page) |
| **Entry row** | Strand · `#211` mono 12px · category text · relative time right · text 16px white (full, up to 280 chars) · author constellation 20px + short address · reaction counts (glyph + count) | Same order, one column; reactions wrap under the author line |
| **Category tabs** | Underline tabs on a 1px rule, 2px white indicator, counts in faint | Scroll sideways in their own row |
| **Composer** | 4 of 6 columns beside the record | Full width, above the record |
| **Segmented category picker** | Inline row of 5 | Wraps to 2 lines, still 36px controls |
| **Record (stats)** | Stacked type, 2 columns wide | 2-up grid; most-reacted spans both |
| **Reaction button** | 36px pill, glyph + count; hover lifts the fill one step; yours in gold | Same, 44px hit area |
| **Constellation** | SVG, 20 / 50 / 88px, points from address bytes, gold points on `--raised` | Same |
| **Hash / address** | Mono, truncated `0x3f1c…9b2e`, copy button 12px after; copied → `Copied` for 1.5s | Same |
| **Raw call well** | `--raised`, 12px radius, mono 13px, scrolls inside itself | Stacks under "As shown on Stella" |
| **Sheet** | Centred 480px panel, the one shadowed surface, Esc closes, focus trapped | Bottom sheet, full width |
| **Buttons** | Primary white pill 36px; secondary outlined `--control`; text actions in white | Primary may go full width |

States every block has: loading (rows hold their height with `--surface` blocks, no shimmer), empty,
error (*Couldn't reach BOT Chain. Retrying in 10s.* + **Retry now**), and zero (`0` printed, not hidden).

Data layer: one module (`src/lib/chain.ts`) with `getEntries`, `getEntry`, `getAuthorEntries`,
`getStats`, `postEntry`, `react`, `subscribe`. v1 frontend runs on a demo backend built from the
genesis set with real keccak256 hashing, so the chain verification is real arithmetic; swapping in the
deployed contract is a change to this file only. RPC, chain id and explorer come from
`src/config.ts` and must be filled from BOT Chain's Builder Docs and chainlist (PRD §12) — never from
memory.

---

## 5. Avoid

- A purple/indigo "web3" gradient hero, glowing orbs, neon borders, glassmorphism panels.
- A centred hero with a big tagline and three icon feature cards ("Permanent · Decentralized · Free").
- KPI tiles with icons in tinted circles, sparklines, or "+12%" on a week-old board.
- Emoji as UI. Reactions are drawn glyphs from Stella's own set.
- Card-per-entry masonry with shadows; zebra rows; uppercase letter-spaced labels; eyebrow chips
  ("NEW", "ON-CHAIN") above headings; 01/02/03 step numbering.
- Monospace used as decoration — only real hashes, addresses and raw call output.
- The accent on buttons, tabs or nav. Gold is data.
- Fake proof: no partner logos, testimonials, "trusted by", or invented usage totals presented as
  real. Demo figures are labelled sample data in the code and listed for replacement.
- Generated avatars or stock photos of people. The constellation is the avatar.
