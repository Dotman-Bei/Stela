import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats, totalReactions, useChain, type Entry } from '../lib/chain'
import { CATEGORIES } from '../data/genesis'
import { ago, num, plural } from '../lib/format'
import { Composer } from '../components/Composer'
import { CategoryTabs, ChainFeed } from '../components/Feed'
import { DEMO_MODE } from '../config'

const PAGE = 20

export default function Board() {
  const { entries, wallet } = useChain()
  const stats = useMemo(() => getStats(entries), [entries])
  const latest = entries[entries.length - 1]

  const [category, setCategory] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [shownUpTo, setShownUpTo] = useState(entries.length)
  const feedRef = useRef<HTMLElement>(null)

  // New entries slide in when the feed head is in view, or when they are yours; otherwise they wait behind a notice.
  useEffect(() => {
    if (entries.length <= shownUpTo) return
    const top = feedRef.current?.getBoundingClientRect().top ?? 0
    if (top > -80 || (wallet && latest.author === wallet.address)) setShownUpTo(entries.length)
  }, [entries.length, shownUpTo, latest, wallet])
  const waiting = entries.length - shownUpTo

  // Re-render the relative times once a minute.
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60_000)
    return () => clearInterval(t)
  }, [])

  const q = query.trim().toLowerCase()
  const visible = entries
    .slice(0, shownUpTo)
    .filter((e) => category === null || e.category === category)
    .filter((e) => !q || e.text.toLowerCase().includes(q) || e.author.includes(q))
    .reverse()
  const shown = visible.slice(0, limit)
  const mr = stats.mostReacted
  const fresh = useFresh(latest.id)

  return (
    <div className="col page">
      <div className="title-row">
        <div>
          <h1>The board</h1>
          <p className="subline">Every entry here is stored word for word on BOT Chain and linked by hash to the one before it. Nothing can be edited or deleted — not by you, not by us.</p>
        </div>
        <p className="freshness">
          <span className="live-dot" aria-hidden="true" /> Live · last entry {ago(latest.timestamp)}
        </p>
      </div>

      <div className="grid6 board-top">
        <section className="card span4" aria-label="Post an entry">
          <Composer />
        </section>

        <section className="card span2 record" aria-labelledby="record-h">
          <h2 id="record-h" className="card-title">The record</h2>
          <dl className="figures">
            <div className="fig fig-lead">
              <dt>Entries on the board</dt>
              <dd>{num(stats.total)}</dd>
            </div>
            <div className="fig">
              <dt>Posted today</dt>
              <dd>{num(stats.today)}</dd>
            </div>
            <div className="fig fig-wide">
              <dt>Most reacted</dt>
              <dd>
                <Link to={`/entry/${mr.id}`} className="mr">
                  <span className="mr-head">#{num(mr.id)} · {plural(totalReactions(mr), 'reaction')}</span>
                  <span className="mr-text">{mr.text}</span>
                </Link>
              </dd>
            </div>
            <div className="fig fig-wide">
              <dt>Entries per day, last 7 days</dt>
              <dd><DayBars entries={entries} /></dd>
            </div>
          </dl>
          <p className="source">{DEMO_MODE ? 'Demo data, computed from the entries below.' : 'Read live from the contract.'}</p>
        </section>
      </div>

      <section className="feed" ref={feedRef} aria-labelledby="feed-h">
        <div className="feed-head">
          <h2 id="feed-h">Latest entries</h2>
          {waiting > 0 && (
            <button
              type="button"
              className="btn-text new-notice"
              onClick={() => {
                setShownUpTo(entries.length)
                feedRef.current?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {plural(waiting, 'new entry', 'new entries')} — show {waiting === 1 ? 'it' : 'them'}
            </button>
          )}
        </div>
        <CategoryTabs counts={stats.byCategory} total={stats.total} value={category} onChange={(v) => { setCategory(v); setLimit(PAGE) }} />
        <div className="toolbar">
          <label className="search">
            <span className="sr-only">Search text or address</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
            <input type="search" placeholder="Search text or address" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE) }} />
          </label>
          <p className="faint">{plural(visible.length, category === null ? 'entry' : CATEGORIES[category].name.toLowerCase(), category === null ? 'entries' : CATEGORIES[category].plural.toLowerCase())} · newest first</p>
        </div>

        {visible.length === 0 ? (
          <div className="empty">
            <p>No entries match “{query}”.</p>
            <button type="button" className="btn" onClick={() => { setQuery(''); setCategory(null) }}>Clear the filters</button>
          </div>
        ) : (
          <ChainFeed entries={shown} fresh={fresh} />
        )}

        {visible.length > shown.length && (
          <div className="load-more">
            <button type="button" className="btn" onClick={() => setLimit((l) => l + PAGE)}>Load {Math.min(PAGE, visible.length - shown.length)} more</button>
            <p className="faint">Showing 1–{shown.length} of {num(visible.length)}</p>
          </div>
        )}
      </section>
    </div>
  )
}

/** Seven columns, one per local day, today in the data hue. Counts are labelled on the marks, so no axis. */
function DayBars({ entries }: { entries: Entry[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - (6 - i))
    const end = start.getTime() + 86_400_000
    return {
      label: i === 6 ? 'Today' : start.toLocaleDateString('en-GB', { weekday: 'short' }),
      n: entries.filter((e) => e.timestamp >= start.getTime() && e.timestamp < end).length,
    }
  })
  const max = Math.max(1, ...days.map((d) => d.n))
  return (
    <ol className="daybars" aria-label={days.map((d) => `${d.label} ${d.n}`).join(', ')}>
      {days.map((d, i) => (
        <li key={i} className={i === 6 ? 'is-today' : ''}>
          <span className="daybar-n">{d.n}</span>
          <span className="daybar" style={{ height: d.n ? `${Math.max(3, (d.n / max) * 56)}px` : 0 }} />
          <span className="daybar-day">{d.label}</span>
        </li>
      ))}
    </ol>
  )
}

/** The id of an entry that arrived after the board opened, so its row can announce itself once. */
function useFresh(latestId: number | null) {
  const first = useRef(latestId)
  return latestId !== first.current ? latestId : null
}
