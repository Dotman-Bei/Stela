import type { Hex } from 'viem'

/** Stella's mark: a four-point star. */
export function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2 18.9 13.1 30 16 18.9 18.9 16 30 13.1 18.9 2 16 13.1 13.1Z" fill="var(--accent)" />
    </svg>
  )
}

const REACTION_PATHS: Record<number, React.ReactNode> = {
  0: (
    <>
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
  1: <path d="M8 1.5 9.6 6.4 14.5 8 9.6 9.6 8 14.5 6.4 9.6 1.5 8 6.4 6.4Z" />,
  2: (
    <>
      <path d="M8 1.8c1.2 1.4 1.6 2.4 1.6 3.2a1.6 1.6 0 0 1-3.2 0c0-.8.4-1.8 1.6-3.2Z" />
      <path d="M6 8h4v6.5H6Z" />
    </>
  ),
  3: <path d="M8 13.5S2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 7.5-6 7.5Z" />,
}

export function ReactionGlyph({ code, size = 16 }: { code: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
      {REACTION_PATHS[code]}
    </svg>
  )
}

/** Each address drawn as its own constellation: six points placed from its bytes, joined in order. */
export function Constellation({ address, size = 20 }: { address: Hex | string; size?: number }) {
  const hex = address.slice(2).padEnd(40, '0')
  const bytes = Array.from({ length: 12 }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16))
  const raw = Array.from({ length: 6 }, (_, i) => [bytes[i * 2], bytes[i * 2 + 1]])
  // Fit the shape to the circle: scale its bounding box (aspect kept) into the inner square and centre it.
  const xs = raw.map((p) => p[0]), ys = raw.map((p) => p[1])
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)]
  const span = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0, 1)
  const inner = 56
  const ox = 50 - ((Math.max(...xs) - x0) / span) * inner / 2
  const oy = 50 - ((Math.max(...ys) - y0) / span) * inner / 2
  const pts = raw.map(([x, y]) => [ox + ((x - x0) / span) * inner, oy + ((y - y0) / span) * inner])
  const small = size < 32
  return (
    <svg className="constellation" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="var(--raised)" />
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#8a8a8a" strokeWidth={small ? 3 : 1.6} strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={(i === 0 ? 1.6 : 1) * (small ? 6 : 3.6)} fill="var(--accent)" />
      ))}
    </svg>
  )
}

export function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V3.5A1 1 0 0 0 9.5 2.5H3.5A1 1 0 0 0 2.5 3.5v6a1 1 0 0 0 1 1h2" />
    </svg>
  )
}

export function ArrowOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M6 3h7v7M13 3 4 12" />
    </svg>
  )
}
