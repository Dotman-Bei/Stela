import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, REACTIONS } from '../data/genesis'
import { authorEntries, getEntry, hashEntry, hashText, rawGetEntry, react, useChain, type Entry } from '../lib/chain'
import { dateTimeUtc, num, plural, short } from '../lib/format'
import { CONTRACT_ADDRESS, explorerTx } from '../config'
import { ArrowOut, Constellation, ReactionGlyph } from '../components/Glyphs'
import { CopyLink, Hash } from '../components/Copy'
import { useUi } from '../components/Shell'
import NotFound from './NotFound'

export default function EntryPage() {
  const { id: raw } = useParams()
  const { entries } = useChain()
  const id = Number(raw)
  const e = Number.isInteger(id) && id > 0 ? getEntry(id) : undefined

  useEffect(() => {
    document.title = e ? `Entry #${e.id} — Stella` : 'Stella'
  }, [e])

  if (!e) {
    return (
      <NotFound
        title={Number.isInteger(id) && id > 0 ? `Entry #${num(id)} hasn't been written yet` : 'That is not an entry number'}
        line={`The board has ${plural(entries.length, 'entry', 'entries')} so far.`}
      />
    )
  }

  const prev = getEntry(e.id - 1)
  const next = getEntry(e.id + 1)
  const byAuthor = authorEntries(entries, e.author).length
  const tx = explorerTx(e.txHash)

  return (
    <div className="col page entry-page">
      <header className="card object-head">
        <Constellation address={e.author} size={50} />
        <div className="object-id">
          <div className="object-name">
            <h1>Entry #{num(e.id)}</h1>
            <span className="pill">{CATEGORIES[e.category].name}</span>
            {e.genesis && <span className="pill">Genesis</span>}
          </div>
          <p className="object-meta">
            <Link to={`/author/${e.author}`} className="author"><code>{short(e.author)}</code></Link>
            <span>{dateTimeUtc(e.timestamp)}</span>
            <span className="tx">tx <Hash value={e.txHash} label="transaction hash" /></span>
          </p>
        </div>
        <div className="object-actions">
          <CopyLink url={location.href}>Copy link</CopyLink>
          {tx ? (
            <a className="btn" href={tx} target="_blank" rel="noreferrer">View transaction on explorer <ArrowOut /></a>
          ) : (
            <span className="faint">Explorer link appears once the contract is deployed</span>
          )}
        </div>
      </header>

      <blockquote className={`the-entry${[...e.text].length > 64 ? ' is-long' : ''}`}>
        <p>{e.text}</p>
        <footer>
          Posted by <Link to={`/author/${e.author}`} className="inline-link">{short(e.author)}</Link>
          {byAuthor > 1 && <> — <Link to={`/author/${e.author}`} className="inline-link">see all {byAuthor} entries from this wallet</Link></>}
        </footer>
      </blockquote>

      <div className="grid6">
        <Reactions entry={e} />
        <section className="card span4" aria-labelledby="chain-h">
          <h2 id="chain-h" className="card-title">Place in the chain</h2>
          <ol className="chain-line">
            <ChainNode e={prev} label={prev ? `#${num(prev.id)}` : 'Start of the board'} />
            <ChainNode e={e} label={`#${num(e.id)}`} current />
            <ChainNode e={next} label={next ? `#${num(next.id)}` : 'Not written yet'} />
          </ol>
          <p className="muted chain-note">
            {e.id === 1
              ? 'This is the first entry. Its link is all zeros; every entry after it carries the hash of the one before.'
              : `This entry's hash includes the hash of #${num(e.id - 1)}. Change one word in any earlier entry and every hash after it stops matching.`}
          </p>
        </section>
      </div>

      <Verify entry={e} next={next} />
    </div>
  )
}

function ChainNode({ e, label, current }: { e?: Entry; label: string; current?: boolean }) {
  const inner = (
    <>
      <span className="node-point" aria-hidden="true" />
      <span className="node-label">{label}</span>
      {e ? <code className="node-hash">{short(e.entryHash, 8, 6)}</code> : <span className="node-hash faint">—</span>}
    </>
  )
  return (
    <li className={`chain-node${current ? ' is-current' : ''}${e ? '' : ' is-empty'}`} aria-current={current ? 'page' : undefined}>
      {e && !current ? <Link to={`/entry/${e.id}`}>{inner}</Link> : <div>{inner}</div>}
    </li>
  )
}

function Reactions({ entry: e }: { entry: Entry }) {
  const { wallet, myReactions } = useChain()
  const { open } = useUi()
  const [pending, setPending] = useState<number | null>(null)
  const mine = REACTIONS.filter((r) => myReactions[`${e.id}:${r.code}`])
  return (
    <section className="card span2" aria-labelledby="rx-h">
      <h2 id="rx-h" className="card-title">Reactions</h2>
      <div className="rx-grid">
        {REACTIONS.map((r) => {
          const on = !!myReactions[`${e.id}:${r.code}`]
          return (
            <button
              key={r.code}
              type="button"
              className={`rx-btn${on ? ' is-on' : ''}`}
              aria-pressed={on}
              disabled={pending !== null}
              onClick={async () => {
                if (!wallet) return open('connect')
                if (on) return
                setPending(r.code)
                try {
                  await react(e.id, r.code)
                } finally {
                  setPending(null)
                }
              }}
            >
              <ReactionGlyph code={r.code} />
              <span className="rx-name">{pending === r.code ? 'Signing…' : r.name}</span>
              <span className="rx-n">{num(e.reactions[r.code])}</span>
            </button>
          )
        })}
      </div>
      <p className="faint rx-note">
        {mine.length ? `You reacted: ${mine.map((r) => r.name.toLowerCase()).join(', ')}.` : 'One per wallet per reaction. Free, and recorded on-chain.'}
      </p>
    </section>
  )
}

function Verify({ entry: e, next }: { entry: Entry; next?: Entry }) {
  const call = rawGetEntry(e)
  const [result, setResult] = useState<null | { textHash: string; entryHash: string }>(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    setResult(null)
    setShown(0)
  }, [e.id])

  // Type the recomputed hash in, left to right.
  useEffect(() => {
    if (!result || shown >= 66) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => setShown(reduce ? 66 : shown + 3), 25)
    return () => clearTimeout(t)
  }, [result, shown])

  const textOk = result?.textHash === e.textHash
  const linkOk = next ? result?.entryHash === next.prevEntryHash : result?.entryHash === hashEntry(e)
  const done = result && shown >= 66

  const request = JSON.stringify(
    { jsonrpc: '2.0', method: 'eth_call', params: [{ to: CONTRACT_ADDRESS ?? '(contract address)', data: call.data }, 'latest'] },
    null,
    2,
  )

  return (
    <section className="card verify" aria-labelledby="verify-h">
      <div className="verify-head">
        <div>
          <h2 id="verify-h" className="section-h">Verify on-chain</h2>
          <p className="muted">Recompute this entry's hashes in your browser and check them against what the contract recorded.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => { setShown(0); setResult({ textHash: hashText(e.text), entryHash: hashEntry(e) }) }}>
          {result ? 'Recompute again' : 'Recompute hash'}
        </button>
      </div>

      {result && (
        <div className="verify-result" aria-live="polite">
          <div className="check">
            <p className="check-label">keccak256 of the text shown below</p>
            <code className="check-hash">{result.textHash.slice(0, shown)}<span className="caret" /></code>
            {done && (
              <span className={`pill ${textOk ? 'pill-positive' : 'pill-negative'}`}>
                {textOk ? 'Matches the textHash in EntryPosted' : 'Does not match the recorded textHash'}
              </span>
            )}
          </div>
          <div className="check">
            <p className="check-label">Entry hash, rebuilt from id, author, category, textHash, prevEntryHash and timestamp</p>
            <code className="check-hash">{result.entryHash.slice(0, shown)}</code>
            {done && (
              <span className={`pill ${linkOk ? 'pill-positive' : 'pill-negative'}`}>
                {next ? (linkOk ? `Matches the link stored in #${num(next.id)}` : `Breaks the link stored in #${num(next.id)}`) : linkOk ? 'Latest entry — the next one will link to this' : 'Does not match'}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="verify-cols">
        <div>
          <h3 className="col-h">As shown on Stella</h3>
          <dl className="kv">
            <div><dt>Author</dt><dd><Hash value={e.author} label="author address" /></dd></div>
            <div><dt>Category</dt><dd>{e.category} · {CATEGORIES[e.category].name}</dd></div>
            <div><dt>Timestamp</dt><dd>{Math.floor(e.timestamp / 1000)} · {dateTimeUtc(e.timestamp)}</dd></div>
            <div><dt>Reactions</dt><dd>[{e.reactions.join(', ')}]</dd></div>
            <div><dt>textHash</dt><dd><Hash value={e.textHash} label="text hash" /></dd></div>
            <div><dt>prevEntryHash</dt><dd><Hash value={e.prevEntryHash} label="previous entry hash" /></dd></div>
          </dl>
          <p className="kv-text">{e.text}</p>
        </div>
        <div>
          <h3 className="col-h">Raw <code>eth_call</code> for <code>getEntry({e.id})</code></h3>
          <p className="well-label">Request</p>
          <pre className="well">{request}</pre>
          <p className="well-label">Result</p>
          <pre className="well well-hex">{call.result}</pre>
        </div>
      </div>
      <p className="faint verify-foot">The explorer is the source of truth. This page is a lens on it.</p>
    </section>
  )
}
