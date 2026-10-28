# PRD — Stella
**A permanent, on-chain board for messages and wishes on BOT Chain**
Version 1.0 · 2026-10-28 · Status: approved for build
Ecosystem category: Social (https://www.botchain.ai/en/project-party/)

---

## 1. Overview

**Stella** is a decentralized social board where anyone can post a message or a wish to BOT Chain. Every entry is permanently recorded on-chain — timestamped, wallet-signed, uneditable, undeletable — and publicly viewable by anyone, forever. No escrow, no custody, no token required for v1.

**One-sentence pitch:** *Say it on-chain. It stays on-chain.*

## 2. Problem

Almost everything people write online is mutable, deletable, and platform-owned. Wishes, memorials, declarations, predictions, love notes, "I was here" — the messages people most want to *last* are the ones platforms handle worst. Stella gives them a neutral, permanent home where the record itself is the product: not an app storing data, but a public ledger where the data has nowhere to go.

## 3. Goals & Non-Goals

**Goals (v1)**
- Anyone with an EVM wallet can post a message/wish on-chain in one transaction.
- Every entry is permanently recorded, publicly readable, and individually linkable (perma-URL to explorer + in-app view).
- A clean public board UI: newest feed, category filters, author pages, on-chain stats.
- A demo-worthy live board at launch (demo content + organic posts).

**Non-goals (v1)**
- No escrow, no payments, no tipping.
- No token, no post-to-earn rewards.
- No edits or deletes — permanence is the feature, and v1 does not soften it.
- No comments/reply threads (scope guardrail — see §10).
- No moderation deletion; filtering is viewer-side only.

## 4. Users & User Stories

| Actor | Story |
|---|---|
| Casual user | "I wrote my wedding date on-chain as a wish, and I can show anyone the transaction — it will outlive every app." |
| Collector of moments | "I post one wish every New Year; my author page is a permanent public diary." |
| Community/brand | "We posted our launch pledge on Stella and linked the tx in our announcement — it's verifiable and can't be walked back." |
| Evaluator (BOT Labs) | "I posted a message and read it back from the contract myself — the explorer is the source of truth, the UI is a lens." |

## 5. Product Requirements

### 5.1 Smart contract — `Stella.sol` (Solidity, one contract, ~150 lines)
- `postEntry(text, category)` → stores the entry, assigns a monotonically increasing `entryId`, emits `EntryPosted(entryId, author, category, textHash, prevEntryHash, timestamp)`. `prevEntryHash` links each entry to the previous one, making the board one tamper-evident hash chain — removing or rewriting history breaks the chain visibly.
- `categories`: a small fixed enum set (e.g., Wish / Message / Memorial / Declaration / Prediction). Stored as `uint8` to keep calldata cheap.
- `react(entryId, emojiCode)` → lightweight, free-of-charge-per-token wallet-signed reaction (a counter per entry per emoji, one reaction per address per entry). Emits `EntryReacted`. Reactions are sentiment signals only — no value transfer anywhere.
- `getEntry(entryId)` → author, category, text, timestamp, reaction counts.
- `getAuthorEntries(address)` → paginated index by author (reader-side pagination; contract stores counts, frontend walks events/logs).
- Access control: none needed for posting — board is permissionless; only the author can react for themselves (one wallet = one voice per entry).
- Standard checks-effects-interactions, no unbounded loops, `text` length-capped (e.g., 280 chars stored on-chain; near-zero fees make full on-chain storage viable on BOT Chain and permanence shouldn't depend on an external pointer).

### 5.2 Frontend (static, wallet-connected)
- **Board feed:** newest entries, category filter chips, live refresh via chain events.
- **Entry page:** full text, author address, timestamp, reaction row, direct link to the explorer transaction, "verify on-chain" panel showing the raw `eth_call` result beside the rendered entry.
- **Author page:** all entries by a wallet address with a shareable perma-URL.
- **Post box:** wallet connect → text input (char counter) → category picker → one-confirm transaction → confetti + link to explorer (sub-second finality means near-instant confirmation UX).
- **Stats strip:** total entries, entries today, most-reacted entry — all read live from chain.

### 5.3 Demo & launch assets
- Seed the board with ~30 demo entries across categories at deploy (clearly tagged genesis entries) so the board never looks empty in screenshots or the demo video.
- README: pitch, architecture diagram, contract addresses, run instructions.
- 2–4 min demo video: connect wallet → post an entry → watch it confirm in under a second → read it back from the explorer.

## 6. Technical Architecture

```
User (browser + wallet)                 BOT Chain
┌─────────────────────────┐  postEntry  ┌──────────────────────────┐
│ text + category → sign  │ ──────────► │ Stella                   │
│ → broadcast             │             │  hash-chained entries    │
│                         │  react      │  reaction counters       │
│ read feed via events ── │ ◄────────── │                          │
└─────────────────────────┘             └──────────┬───────────────┘
         ▲                                         │ events (index)
         └─────────────── static frontend ◄────────┘
```

- Chain economics exploited deliberately: **full text lives on-chain** (no IPFS pointer dependency for the record itself). Near-zero fees make this viable, and it turns permanence into a technical property rather than a promise. This is a live demo point: "every word is in the state trie."
- The hash chain (`prevEntryHash`) means even the *contract owner* can't silently alter history — anyone can recompute and verify ordering.

## 7. Key Flows

1. **Post** → wallet connect → compose → `postEntry(text, category)` → sub-second confirmation → entry appears in feed and gets a perma-URL + explorer link.
2. **React** → wallet connect → tap an emoji on an entry → one transaction → counter updates.
3. **Verify** → open any entry's "on-chain proof" panel → raw `eth_call` output shown beside rendered text; explorer link for full provenance.
4. **Browse** → feed with category filters; author pages via address route.

Edge cases: empty category defaults to Message; duplicate rapid posts are fine (each is its own tx); reaction spam bounded by one-reaction-per-address-per-emoji; text over cap rejected client-side and by `require`.

## 8. Success Metrics

| Metric | v1 target |
|---|---|
| Contract deployed & verified on mainnet | Day 1 |
| Genesis/demo entries on board at launch | ≥ 30 |
| Organic entries posted in month one | ≥ 100 |
| Unique author wallets month one | ≥ 50 |
| Demo video + submission complete | Week 1–2 |
| Ecosystem directory listing live (botchain.ai/en/project-party/) | On acceptance |

## 9. Roadmap (mapped to BOT Labs phased funding)

- **M1 — Deployed MVP:** contract + board UI live on mainnet, genesis entries posted, demo video done. *(unlocks: capital + tooling support)*
- **M2 — Community:** reactions live, author pages shared socially, bug/docs feedback contributions to the BOT Chain ecosystem, "post your entry" campaigns with partner communities. *(unlocks: traffic via official wallet / DApp portal, gas rebates)*
- **M3 — Depth:** milestone/anniversary entries (date-stamped future entries), optional "entry fulfilled" self-attestation flag on an entry (no escrow — just a permanent status flip), localized UI, explore API/subgraph so other dApps can embed the board. *(unlocks: listing green channel, ecosystem certification)*

## 10. Scope Guardrails

- **No reply threads in v1** — threading is where moderation, abuse, and complexity live. Reactions carry the social signal at 10% of the surface area.
- **No delete, no edit, no moderation queue.** Viewer-side category filters only. Permanence is the brand; any softening of it in v1 undermines the pitch.
- **No tokenomics.** If a mechanic needs a token to function, it doesn't ship in v1.

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Chain config drift (RPC, chain ID) | Fetch from official docs (botchain.ai → Builder Docs) and https://chainlist.org/chain/677 at build time; CI re-check against chainlist |
| Abuse/spam content on a permissionless board | Accept as cost of permanence (near-zero fees make spam cheap); v1 mitigation is viewer-side filters + hash-chain transparency, not censorship |
| Board looks empty at launch | Genesis entry set (§5.3) guarantees a populated board on day one |
| "Just a message board" perception | Pitch leads with hash-chained permanence + full on-chain text + sub-second confirm UX; the demo (read it back from the explorer) is the rebuttal |
| Scope creep into SocialFi rewards | §10 guardrails enforced in review; reactions carry no value by design |

## 12. Dependencies

- BOT Chain mainnet access: RPC, explorer, faucet from official docs (botchain.ai → Builder Docs) — verify before first deploy; never hardcode RPC from memory.
- Standard EVM tooling (Foundry or Hardhat), a wallet, static frontend hosting.
- Ecosystem submission: "Submit a Project" flow at botchain.ai/en/project-party/ for Social category listing.
