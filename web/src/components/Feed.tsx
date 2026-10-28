import { Link } from 'react-router-dom'
import { CATEGORIES, REACTIONS } from '../data/genesis'
import { totalReactions, type Entry } from '../lib/chain'
import { ago, num, short } from '../lib/format'
import { Constellation, ReactionGlyph } from './Glyphs'

/** Entries on the chain strand: one gold point per entry, each row naming the hash it links to. */
export function ChainFeed({ entries, fresh, showAuthor = true }: { entries: Entry[]; fresh?: number | null; showAuthor?: boolean }) {
  return (
    <ul className="strand">
      {entries.map((e) => (
        <EntryRow key={e.id} entry={e} fresh={e.id === fresh} showAuthor={showAuthor} />
      ))}
    </ul>
  )
}

function EntryRow({ entry: e, fresh, showAuthor }: { entry: Entry; fresh: boolean; showAuthor: boolean }) {
  const total = totalReactions(e)
  return (
    <li className={`entry-row${fresh ? ' is-fresh' : ''}`}>
      <span className="point" aria-hidden="true" />
      <div className="entry-main">
        <p className="entry-meta">
          <Link to={`/entry/${e.id}`} className="entry-id">#{num(e.id)}</Link>
          <span>{CATEGORIES[e.category].name}</span>
          {e.genesis && <span className="pill">Genesis</span>}
          <time className="entry-time" dateTime={new Date(e.timestamp).toISOString()}>{ago(e.timestamp)}</time>
        </p>
        <Link to={`/entry/${e.id}`} className="entry-text">{e.text}</Link>
        <p className="entry-foot">
          {showAuthor && (
            <Link to={`/author/${e.author}`} className="author">
              <Constellation address={e.author} size={24} />
              <code>{short(e.author)}</code>
            </Link>
          )}
          <span className="link-hash" title={`prevEntryHash ${e.prevEntryHash}`}>
            {e.id === 1 ? 'first link' : <>links to #{num(e.id - 1)} <code>{short(e.prevEntryHash, 6, 4)}</code></>}
          </span>
        </p>
      </div>
      <div className="entry-aside">
      <time className="aside-time" dateTime={new Date(e.timestamp).toISOString()}>{ago(e.timestamp)}</time>
      <p className="entry-reactions" aria-label={`${num(total)} reactions`}>
        {total === 0 ? (
          <span className="faint">No reactions yet</span>
        ) : (
          REACTIONS.filter((r) => e.reactions[r.code] > 0).map((r) => (
            <span key={r.code} className="rx" title={r.name}>
              <ReactionGlyph code={r.code} size={14} />
              {num(e.reactions[r.code])}
            </span>
          ))
        )}
      </p>
      </div>
    </li>
  )
}

export function CategoryTabs({ counts, total, value, onChange, hideEmpty = false }: { counts: number[]; total: number; value: number | null; onChange: (v: number | null) => void; hideEmpty?: boolean }) {
  const tabs = [{ id: null as number | null, label: 'All', n: total }, ...CATEGORIES.map((c) => ({ id: c.id as number | null, label: c.plural, n: counts[c.id] }))].filter((t) => !hideEmpty || t.id === null || t.n > 0)
  return (
    <div className="tabs" role="tablist" aria-label="Filter by category">
      {tabs.map((t) => (
        <button key={t.label} type="button" role="tab" aria-selected={value === t.id} className={value === t.id ? 'is-on' : ''} onClick={() => onChange(t.id)}>
          {t.label} <span className="tab-n">{num(t.n)}</span>
        </button>
      ))}
    </div>
  )
}
