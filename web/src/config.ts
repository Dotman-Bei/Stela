// Chain settings. Fill RPC_URL, EXPLORER_URL and CONTRACT_ADDRESS from BOT Chain's Builder Docs
// (botchain.ai) and https://chainlist.org/chain/677 at deploy time — never from memory (PRD §12).
// While CONTRACT_ADDRESS is null the app runs on the demo chain in src/lib/chain.ts.

export const CHAIN_ID = 677
export const CHAIN_NAME = 'BOT Chain'
export const RPC_URL: string | null = null
export const EXPLORER_URL: string | null = null
export const CONTRACT_ADDRESS: `0x${string}` | null = null

export const MAX_CHARS = 280
export const DEMO_MODE = CONTRACT_ADDRESS === null

export function explorerTx(hash: string) {
  return EXPLORER_URL ? `${EXPLORER_URL}/tx/${hash}` : null
}
export function explorerAddress(address: string) {
  return EXPLORER_URL ? `${EXPLORER_URL}/address/${address}` : null
}
