import { Link } from 'react-router-dom'
import { useChain } from '../lib/chain'
import { ChainFeed } from '../components/Feed'

export default function NotFound({ title = 'There is nothing at this address', line = 'Stella has three kinds of page: the board, an entry, and a wallet’s entries.' }: { title?: string; line?: string }) {
  const { entries } = useChain()
  return (
    <div className="col page">
      <div className="not-found">
        <h1>{title}</h1>
        <p className="subline">{line}</p>
        <Link to="/" className="btn btn-primary">Back to the board</Link>
      </div>
      <section className="feed" aria-labelledby="nf-h">
        <div className="feed-head"><h2 id="nf-h">Written most recently</h2></div>
        <ChainFeed entries={entries.slice(-3).reverse()} />
      </section>
    </div>
  )
}
