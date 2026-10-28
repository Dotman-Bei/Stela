import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { hexToBytes } from 'viem'
import { CATEGORIES } from '../data/genesis'
import { totalReactions, type Entry } from '../lib/chain'
import { ago, num, short } from '../lib/format'
import { Constellation } from './Glyphs'

const PAD_X = 14

/**
 * The whole board as one constellation: every entry a star, left to right in chain order, its height
 * taken from its own entry hash and its size from its reactions, each joined to the one before it.
 * Hover, drag or arrow along it to read any entry. `highlight` brightens a subset (one category, one wallet).
 */
export function Sky({ entries, highlight, height = 220, label }: { entries: Entry[]; highlight?: (e: Entry) => boolean; height?: number; label: string }) {
  const navigate = useNavigate()
  const svgRef = useRef<SVGSVGElement>(null)
  const [W, setW] = useState(1000)
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const ro = new ResizeObserver(([r]) => setW(Math.max(200, Math.round(r.contentRect.width))))
    ro.observe(svg)
    return () => ro.disconnect()
  }, [])
  const lit = useMemo(() => entries.filter((e) => !highlight || highlight(e)), [entries, highlight])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  // Follow the newest lit entry until the reader picks one.
  const selected = entries.find((e) => e.id === selectedId) ?? lit[lit.length - 1] ?? entries[entries.length - 1]

  useEffect(() => {
    if (selectedId !== null && highlight && !lit.some((e) => e.id === selectedId)) setSelectedId(null)
  }, [highlight, lit, selectedId])

  const maxR = Math.max(1, ...entries.map(totalReactions))
  const step = (W - PAD_X * 2) / Math.max(1, entries.length - 1)
  const stars = entries.map((e, i) => {
    const b = hexToBytes(e.entryHash)
    const y = 18 + ((b[0] * 256 + b[1]) / 65535) * (height - 36)
    const r = 2.2 + Math.sqrt(totalReactions(e) / maxR) * 4.6
    return { e, x: PAD_X + i * step, y, r, on: !highlight || highlight(e) }
  })

  function pick(clientX: number) {
    const svg = svgRef.current
    if (!svg) return
    const box = svg.getBoundingClientRect()
    const x = clientX - box.left
    const candidates = stars.filter((s) => s.on)
    if (!candidates.length) return
    const near = candidates.reduce((a, s) => (Math.abs(s.x - x) < Math.abs(a.x - x) ? s : a))
    setSelectedId(near.e.id)
  }

  function move(dir: 1 | -1) {
    const i = lit.findIndex((e) => e.id === selected.id)
    const next = lit[Math.min(lit.length - 1, Math.max(0, i + dir))]
    if (next) setSelectedId(next.id)
  }

  const sel = stars.find((s) => s.e.id === selected.id)

  return (
    <div className="sky">
      <svg
        ref={svgRef}
        className="sky-svg"
        viewBox={`0 0 ${W} ${height}`}
        height={height}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={entries.length}
        aria-valuenow={selected.id}
        aria-valuetext={`Entry ${selected.id}: ${selected.text}`}
        onPointerMove={(ev) => pick(ev.clientX)}
        onPointerDown={(ev) => pick(ev.clientX)}
        onClick={() => navigate(`/entry/${selected.id}`)}
        onKeyDown={(ev) => {
          if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { ev.preventDefault(); move(1) }
          if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { ev.preventDefault(); move(-1) }
          if (ev.key === 'Home') { ev.preventDefault(); setSelectedId(lit[0]?.id ?? null) }
          if (ev.key === 'End') { ev.preventDefault(); setSelectedId(lit[lit.length - 1]?.id ?? null) }
          if (ev.key === 'Enter') navigate(`/entry/${selected.id}`)
        }}
      >
        <polyline className="sky-chain" points={stars.map((s) => `${s.x},${s.y}`).join(' ')} />
        {sel && <line className="sky-cursor" x1={sel.x} x2={sel.x} y1={0} y2={height} />}
        {stars.map((s) => (
          <circle
            key={s.e.id}
            className={`sky-star${s.on ? '' : ' is-dim'}${s.e.id === selected.id ? ' is-sel' : ''}${s.e.id === entries.length ? ' is-newest' : ''}`}
            cx={s.x}
            cy={s.y}
            r={s.r}
           
          />
        ))}
      </svg>
      <SkyCaption entry={selected} />
    </div>
  )
}

function SkyCaption({ entry: e }: { entry: Entry }) {
  return (
    <div className="sky-caption" aria-live="polite">
      <p className="sky-cap-meta">
        <span className="entry-id">#{num(e.id)}</span>
        <span>{CATEGORIES[e.category].name}</span>
        <span className="faint">{ago(e.timestamp)}</span>
        <span className="faint">{num(totalReactions(e))} reactions</span>
      </p>
      <Link to={`/entry/${e.id}`} className="sky-cap-text">{e.text}</Link>
      <Link to={`/author/${e.author}`} className="author">
        <Constellation address={e.author} size={24} />
        <code>{short(e.author)}</code>
      </Link>
    </div>
  )
}
