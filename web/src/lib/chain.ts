// The one data layer. In demo mode (no CONTRACT_ADDRESS in config.ts) it builds the board from the
// sample set in data/genesis.ts with the same hashing the contract uses, so every hash, link and
// verification on screen is real keccak256 arithmetic. Swapping in the deployed contract means
// replacing the bodies here; the screens only use the exported functions and hooks.

import { useSyncExternalStore } from 'react'
import {
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  parseAbi,
  toBytes,
  zeroHash,
  type Hex,
} from 'viem'
import { CATEGORIES, GENESIS, GENESIS_START, INCOMING, ORGANIC, type Category } from '../data/genesis'
import { MAX_CHARS } from '../config'

export type Entry = {
  id: number
  author: Hex
  category: Category
  text: string
  timestamp: number // ms
  textHash: Hex
  prevEntryHash: Hex
  entryHash: Hex
  txHash: Hex
  reactions: [number, number, number, number]
  genesis: boolean
}

export const stellaAbi = parseAbi([
  'function postEntry(string text, uint8 category) returns (uint256 entryId)',
  'function react(uint256 entryId, uint8 emojiCode)',
  'function getEntry(uint256 entryId) view returns (address author, uint8 category, string text, uint64 timestamp, uint32[4] reactions)',
  'event EntryPosted(uint256 indexed entryId, address indexed author, uint8 category, bytes32 textHash, bytes32 prevEntryHash, uint64 timestamp)',
])

export function hashText(text: string): Hex {
  return keccak256(toBytes(text))
}

export function hashEntry(e: Pick<Entry, 'id' | 'author' | 'category' | 'textHash' | 'prevEntryHash' | 'timestamp'>): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'uint256' },
        { type: 'address' },
        { type: 'uint8' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint64' },
      ],
      [BigInt(e.id), e.author, e.category, e.textHash, e.prevEntryHash, BigInt(Math.floor(e.timestamp / 1000))],
    ),
  )
}

/** The raw eth_call for getEntry(id): request data and ABI-encoded response, as a node returns them. */
export function rawGetEntry(e: Entry) {
  const data = encodeFunctionData({ abi: stellaAbi, functionName: 'getEntry', args: [BigInt(e.id)] })
  const result = encodeAbiParameters(
    [{ type: 'address' }, { type: 'uint8' }, { type: 'string' }, { type: 'uint64' }, { type: 'uint32[4]' }],
    [e.author, e.category, e.text, BigInt(Math.floor(e.timestamp / 1000)), e.reactions],
  )
  return { data, result }
}

// ---------- store ----------

type Wallet = { address: Hex; kind: 'browser' | 'demo' } | null

type State = {
  entries: Entry[] // oldest first; entries[i].id === i + 1
  wallet: Wallet
  myReactions: Record<string, true> // `${id}:${code}`
  lastArrival: number | null // id of the newest entry that arrived live
}

let state: State = { entries: [], wallet: null, myReactions: {}, lastArrival: null }
const listeners = new Set<() => void>()

function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function append(seed: { author: string; category: Category; text: string; reactions: [number, number, number, number] }, timestamp: number, genesis: boolean): Entry {
  const prev = state.entries[state.entries.length - 1]
  const id = state.entries.length + 1
  const author = seed.author.toLowerCase() as Hex
  const textHash = hashText(seed.text)
  const prevEntryHash = prev ? prev.entryHash : zeroHash
  const base = { id, author, category: seed.category, textHash, prevEntryHash, timestamp }
  const entryHash = hashEntry(base)
  const txHash = keccak256(toBytes(`tx:${entryHash}`))
  const entry: Entry = { ...base, text: seed.text, entryHash, txHash, reactions: [...seed.reactions], genesis }
  state = { ...state, entries: [...state.entries, entry] }
  return entry
}

function boot() {
  GENESIS.forEach((s, i) => append(s, GENESIS_START + i * 60_000, true))
  const now = Date.now()
  ;[...ORGANIC].sort((a, b) => b.minutesAgo - a.minutesAgo).forEach((s) => append(s, now - s.minutesAgo * 60_000, false))
  INCOMING.forEach((s) =>
    setTimeout(() => {
      const e = append(s, Date.now(), false)
      set({ lastArrival: e.id })
    }, s.afterSeconds * 1000),
  )
  // The chain must verify end to end.
  state.entries.forEach((e, i) => {
    console.assert(e.textHash === hashText(e.text), `text hash ${e.id}`)
    console.assert(e.prevEntryHash === (i ? state.entries[i - 1].entryHash : zeroHash), `link ${e.id}`)
    console.assert(e.entryHash === hashEntry(e), `entry hash ${e.id}`)
  })
}
boot()

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useChain() {
  return useSyncExternalStore(subscribe, () => state)
}

// ---------- reads ----------

export function getEntry(id: number): Entry | undefined {
  return state.entries[id - 1]
}

export function totalReactions(e: Entry) {
  return e.reactions.reduce((a, b) => a + b, 0)
}

export function getStats(entries: Entry[]) {
  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)
  const today = entries.filter((e) => e.timestamp >= midnight.getTime()).length
  const mostReacted = entries.reduce((best, e) => (totalReactions(e) > totalReactions(best) ? e : best), entries[0])
  const byCategory = CATEGORIES.map((c) => entries.filter((e) => e.category === c.id).length)
  console.assert(byCategory.reduce((a, b) => a + b, 0) === entries.length, 'categories sum to total')
  return { total: entries.length, today, mostReacted, byCategory }
}

export function authorEntries(entries: Entry[], address: string) {
  const a = address.toLowerCase()
  return entries.filter((e) => e.author === a)
}

// ---------- wallet ----------

type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown> }

export function hasBrowserWallet() {
  return typeof window !== 'undefined' && !!(window as unknown as { ethereum?: Eip1193 }).ethereum
}

export async function connectBrowserWallet() {
  const eth = (window as unknown as { ethereum?: Eip1193 }).ethereum
  if (!eth) throw new Error('No wallet found in this browser.')
  const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[]
  if (!accounts[0]) throw new Error('Your wallet returned no account.')
  set({ wallet: { address: accounts[0].toLowerCase() as Hex, kind: 'browser' } })
}

export function connectDemoWallet() {
  set({ wallet: { address: '0x4b7e2c9d1a0f3e5b6c8d7a9e0f1b2c3d4e5f6a17', kind: 'demo' } })
}

export function disconnect() {
  set({ wallet: null })
}

// ---------- writes ----------

export class PostError extends Error {}

/** Demo: resolves after a short confirmation, the way a sub-second chain would. */
export async function postEntry(text: string, category: Category, onStage?: (stage: 'signing' | 'confirming') => void): Promise<Entry> {
  if (!state.wallet) throw new PostError('Connect a wallet first.')
  const trimmed = text.trim()
  if (!trimmed) throw new PostError('Write something first.')
  if ([...trimmed].length > MAX_CHARS) throw new PostError(`Entries are capped at ${MAX_CHARS} characters.`)
  onStage?.('signing')
  await new Promise((r) => setTimeout(r, 900))
  onStage?.('confirming')
  await new Promise((r) => setTimeout(r, 450))
  const e = append({ author: state.wallet.address, category, text: trimmed, reactions: [0, 0, 0, 0] }, Date.now(), false)
  set({ lastArrival: e.id })
  return e
}

export async function react(id: number, code: number) {
  if (!state.wallet) throw new PostError('Connect a wallet first.')
  const key = `${id}:${code}`
  if (state.myReactions[key]) return
  await new Promise((r) => setTimeout(r, 400))
  const entries = state.entries.map((e) => {
    if (e.id !== id) return e
    const reactions = [...e.reactions] as Entry['reactions']
    reactions[code] += 1
    return { ...e, reactions }
  })
  set({ entries, myReactions: { ...state.myReactions, [key]: true } })
}
