import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, type Category } from '../data/genesis'
import { postEntry, PostError, useChain, type Entry } from '../lib/chain'
import { MAX_CHARS, explorerTx } from '../config'
import { num } from '../lib/format'
import { useUi } from './Shell'
import { CopyLink, Hash } from './Copy'
import { ArrowOut } from './Glyphs'

type Stage = 'compose' | 'signing' | 'confirming' | 'recorded'

export function Composer({ inSheet = false, onOpenEntry }: { inSheet?: boolean; onOpenEntry?: (id: number) => void }) {
  const { wallet } = useChain()
  const { open } = useUi()
  const [text, setText] = useState('')
  const [category, setCategory] = useState<Category>(1)
  const [stage, setStage] = useState<Stage>('compose')
  const [error, setError] = useState<string | null>(null)
  const [posted, setPosted] = useState<Entry | null>(null)
  const counterId = useId()
  const errorId = useId()

  const length = [...text].length
  const over = length - MAX_CHARS
  const busy = stage === 'signing' || stage === 'confirming'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!wallet) return open('connect')
    setError(null)
    try {
      const entry = await postEntry(text, category, setStage)
      setPosted(entry)
      setStage('recorded')
      setText('')
    } catch (err) {
      setStage('compose')
      const msg = (err as Error).message
      setError(err instanceof PostError ? msg : /reject|denied/i.test(msg) ? 'You cancelled in your wallet. Nothing was posted.' : `The transaction failed: ${msg}. Nothing was posted.`)
    }
  }

  if (stage === 'recorded' && posted) {
    const tx = explorerTx(posted.txHash)
    const url = `${location.origin}/entry/${posted.id}`
    return (
      <div className="receipt" aria-live="polite">
        <div className="receipt-head">
          <span className="flare" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ '--a': `${(i / 14) * 360}deg`, '--d': `${22 + (i % 3) * 9}px` } as React.CSSProperties} />
            ))}
          </span>
          {inSheet ? <h3>Recorded as entry #{num(posted.id)}</h3> : <h2>Recorded as entry #{num(posted.id)}</h2>}
        </div>
        <p className="receipt-text">{posted.text}</p>
        <p className="faint">{CATEGORIES[posted.category].name} · stored on BOT Chain for good</p>
        <dl className="receipt-proof">
          <div><dt>Entry hash</dt><dd><Hash value={posted.entryHash} label="entry hash" /></dd></div>
          <div><dt>Links to</dt><dd>{posted.id > 1 ? <>#{num(posted.id - 1)} <Hash value={posted.prevEntryHash} label="previous entry hash" /></> : 'Start of the board'}</dd></div>
          <div><dt>Transaction</dt><dd><Hash value={posted.txHash} label="transaction hash" /></dd></div>
        </dl>
        <div className="row-actions">
          {onOpenEntry ? (
            <button type="button" className="btn btn-primary" onClick={() => onOpenEntry(posted.id)}>Open entry</button>
          ) : (
            <Link className="btn btn-primary" to={`/entry/${posted.id}`}>Open entry</Link>
          )}
          {tx && <a className="btn" href={tx} target="_blank" rel="noreferrer">View transaction <ArrowOut /></a>}
          <CopyLink url={url}>Copy link</CopyLink>
          <button type="button" className="btn-text" onClick={() => { setStage('compose'); setPosted(null) }}>Write another</button>
        </div>
      </div>
    )
  }

  return (
    <form className="composer" onSubmit={submit} aria-busy={busy}>
      {!inSheet && <h2 className="composer-title">Say it on-chain. It stays on-chain.</h2>}
      <label htmlFor={inSheet ? 'entry-text-sheet' : 'entry-text'} className="label">Your entry</label>
      <div className={`field${over > 0 ? ' is-over' : ''}`}>
        <textarea
          id={inSheet ? 'entry-text-sheet' : 'entry-text'}
          rows={4}
          value={text}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
          aria-describedby={`${counterId}${error ? ` ${errorId}` : ''}`}
          aria-invalid={over > 0}
        />
        <span id={counterId} className="counter" aria-live="polite">
          {over > 0 ? `${num(over)} ${over === 1 ? 'character' : 'characters'} over the limit` : `${num(length)} / ${MAX_CHARS}`}
        </span>
      </div>

      <fieldset className="segmented" disabled={busy}>
        <legend className="label">Category</legend>
        <div className="segmented-track">
          {CATEGORIES.map((c) => (
            <label key={c.id} className={category === c.id ? 'is-on' : ''}>
              <input type="radio" name={inSheet ? 'cat-sheet' : 'cat'} value={c.id} checked={category === c.id} onChange={() => setCategory(c.id)} />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="composer-foot">
        <p className="muted">Once posted, this can't be changed or removed.</p>
        <button type="submit" className="btn btn-primary" disabled={busy || (!!wallet && (length === 0 || over > 0))}>
          {!wallet ? 'Connect wallet to post' : stage === 'signing' ? 'Confirm in your wallet…' : stage === 'confirming' ? 'Writing to BOT Chain…' : 'Post to BOT Chain'}
        </button>
      </div>
      {error && (
        <p id={errorId} className="error" role="alert">
          {error} <button type="button" className="btn-text" onClick={() => setError(null)}>Try again</button>
        </p>
      )}
    </form>
  )
}
