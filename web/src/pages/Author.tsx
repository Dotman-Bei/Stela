import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isAddress } from 'viem'
import { CATEGORIES } from '../data/genesis'
import { authorEntries, totalReactions, useChain } from '../lib/chain'
import { dateLong, num, plural, short } from '../lib/format'
import { explorerAddress } from '../config'
import { ArrowOut, Constellation } from '../components/Glyphs'
import { CopyLink, Hash } from '../components/Copy'
import { CategoryTabs, ChainFeed } from '../components/Feed'
import { useUi } from '../components/Shell'
import NotFound from './NotFound'

export default function AuthorPage() {
  const { address = '' } = useParams()
  const { entries, wallet } = useChain()
  const { postAction } = useUi()
  const [category, setCategory] = useState<number | null>(null)
  const [oldestFirst, setOldestFirst] = useState(false)
  const valid = isAddress(address, { strict: false })
  const addr = address.toLowerCase()
  const mine = authorEntries(entries, addr)
  const isYou = wallet?.address === addr

  useEffect(() => {
    document.title = `${short(addr)} — Stella`
  }, [addr])

  const counts = useMemo(() => CATEGORIES.map((c) => mine.filter((e) => e.category === c.id).length), [mine])
  if (!valid) return <NotFound title="That is not a wallet address" line="Author pages live at /author/ followed by a 0x address." />

  const received = mine.reduce((sum, e) => sum + totalReactions(e), 0)
  const filtered = mine.filter((e) => category === null || e.category === category)
  const ordered = oldestFirst ? filtered : [...filtered].reverse()
  const years = [...new Set(ordered.map((e) => new Date(e.timestamp).getUTCFullYear()))]
  const explorer = explorerAddress(addr)

  return (
    <div className="col page author-page">
      <header className="card author-head">
        <Constellation address={addr} size={88} />
        <div className="author-id">
          <h1>{short(addr)}</h1>
          <Hash value={addr} label="full address" full />
          {isYou && <p className="muted">This is your page. Everything here is permanent and public.</p>}
        </div>
        <div className="object-actions">
          <CopyLink url={location.href} className="btn btn-primary">Copy this page's link</CopyLink>
          {explorer && <a className="btn" href={explorer} target="_blank" rel="noreferrer">View on explorer <ArrowOut /></a>}
        </div>
        <dl className="author-figures">
          <div><dt>Entries</dt><dd>{num(mine.length)}</dd></div>
          <div><dt>First entry</dt><dd>{mine[0] ? dateLong(mine[0].timestamp) : '—'}</dd></div>
          <div><dt>Latest entry</dt><dd>{mine.length ? dateLong(mine[mine.length - 1].timestamp) : '—'}</dd></div>
          <div><dt>Reactions received</dt><dd>{num(received)}</dd></div>
        </dl>
      </header>

      <section className="feed" aria-labelledby="diary-h">
        <div className="feed-head">
          <h2 id="diary-h">Every entry from this wallet</h2>
          {mine.length > 1 && (
            <div className="segmented-track order" role="group" aria-label="Order">
              <button type="button" className={!oldestFirst ? 'is-on' : ''} aria-pressed={!oldestFirst} onClick={() => setOldestFirst(false)}>Newest first</button>
              <button type="button" className={oldestFirst ? 'is-on' : ''} aria-pressed={oldestFirst} onClick={() => setOldestFirst(true)}>Oldest first</button>
            </div>
          )}
        </div>

        {mine.length === 0 ? (
          <div className="empty">
            <p>This wallet hasn't posted anything yet.</p>
            {isYou && <button type="button" className="btn btn-primary" onClick={postAction}>Post your first entry</button>}
          </div>
        ) : (
          <>
            <CategoryTabs counts={counts} total={mine.length} value={category} onChange={setCategory} hideEmpty />
            {years.map((y) => (
              <div key={y} className="year">
                <h3 className="year-h">{y} <span className="faint">{plural(ordered.filter((e) => new Date(e.timestamp).getUTCFullYear() === y).length, 'entry', 'entries')}</span></h3>
                <ChainFeed entries={ordered.filter((e) => new Date(e.timestamp).getUTCFullYear() === y)} showAuthor={false} />
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  )
}
