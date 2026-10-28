import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Constellation, Mark } from './Glyphs'
import { Hash } from './Copy'
import { connectBrowserWallet, connectDemoWallet, disconnect, hasBrowserWallet, useChain } from '../lib/chain'
import { short } from '../lib/format'
import { CHAIN_ID, CHAIN_NAME, CONTRACT_ADDRESS, DEMO_MODE, explorerAddress } from '../config'
import { Composer } from './Composer'

type SheetName = 'connect' | 'how' | 'post' | 'menu' | null
const UiContext = createContext<{ open: (s: SheetName) => void; postAction: () => void }>({ open: () => {}, postAction: () => {} })
export const useUi = () => useContext(UiContext)

export function Shell({ children }: { children: React.ReactNode }) {
  const [sheet, setSheet] = useState<SheetName>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const onBoard = location.pathname === '/'

  useEffect(() => {
    setSheet(null)
  }, [location.pathname])

  // On the board the composer is on the page; elsewhere it opens in a sheet.
  const postAction = () => {
    if (onBoard) {
      const field = document.getElementById('entry-text') as HTMLTextAreaElement | null
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      field?.focus({ preventScroll: true })
    } else setSheet('post')
  }

  return (
    <UiContext.Provider value={{ open: setSheet, postAction }}>
      <TopBar onMenu={() => setSheet('menu')} />
      <main id="main">{children}</main>
      <Footer />
      <Sheet open={sheet === 'connect'} onClose={() => setSheet(null)} title="Connect a wallet">
        <ConnectBody onDone={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === 'how'} onClose={() => setSheet(null)} title="How Stella works">
        <HowBody />
      </Sheet>
      <Sheet open={sheet === 'post'} onClose={() => setSheet(null)} title="Post an entry" wide>
        <Composer inSheet onOpenEntry={(id) => { setSheet(null); navigate(`/entry/${id}`) }} />
      </Sheet>
      <Sheet open={sheet === 'menu'} onClose={() => setSheet(null)} title="Menu">
        <MenuBody />
      </Sheet>
    </UiContext.Provider>
  )
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { wallet } = useChain()
  const { open, postAction } = useUi()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
      <div className="col topbar-in">
        <Link to="/" className="brand" aria-label="Stella, the board">
          <Mark /> <span>Stella</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>Board</NavLink>
          {wallet && <NavLink to={`/author/${wallet.address}`}>My entries</NavLink>}
          <button type="button" className="nav-btn" onClick={() => open('how')}>How it works</button>
        </nav>
        <div className="topbar-right">
          <span className="netline">{CHAIN_NAME}{DEMO_MODE ? ' · demo data' : ''}</span>
          {wallet ? (
            <Link to={`/author/${wallet.address}`} className="wallet-chip" aria-label={`Your wallet ${wallet.address}`}>
              <Constellation address={wallet.address} size={20} />
              <code>{short(wallet.address)}</code>
            </Link>
          ) : (
            <button type="button" className="btn" onClick={() => open('connect')}>Connect wallet</button>
          )}
          <button type="button" className="btn btn-primary" onClick={postAction}>Post an entry</button>
        </div>
        <button type="button" className="menu-btn" aria-label="Open menu" onClick={onMenu}>
          <svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 6h14M3 14h14" /></svg>
        </button>
      </div>
    </header>
  )
}

function Footer() {
  const contract = CONTRACT_ADDRESS
  const link = contract ? explorerAddress(contract) : null
  return (
    <footer className="footer">
      <div className="col footer-in">
        <p className="footer-name"><Mark size={22} /> Stella</p>
        <p className="muted">Stella is one contract on {CHAIN_NAME}. Every entry on this site is read from it, and none can be edited or deleted.</p>
        <p className="footer-links">
          {contract ? <Hash value={contract} label="contract address" /> : <span className="faint">Contract address appears here once deployed.</span>}
          {link && <a href={link} target="_blank" rel="noreferrer">View contract on explorer</a>}
          <a href="https://www.botchain.ai/en/project-party/" target="_blank" rel="noreferrer">BOT Chain projects</a>
        </p>
      </div>
    </footer>
  )
}

export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className={`sheet${wide ? ' sheet-wide' : ''}`}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="sheet-in">
          <div className="sheet-head">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" /></svg>
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

function ConnectBody({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const browser = hasBrowserWallet()
  return (
    <div className="stack">
      <p className="muted">Stella needs an EVM wallet on {CHAIN_NAME} (chain {CHAIN_ID}) to sign your entry. Reading the board needs nothing.</p>
      {browser ? (
        <button
          type="button"
          className="btn btn-primary btn-wide"
          autoFocus
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            setError(null)
            try {
              await connectBrowserWallet()
              onDone()
            } catch (e) {
              setError(e instanceof Error && /reject|denied/i.test(e.message) ? 'You cancelled in your wallet. Nothing was connected.' : (e as Error).message)
            } finally {
              setBusy(false)
            }
          }}
        >
          {busy ? 'Confirm in your wallet…' : 'Connect browser wallet'}
        </button>
      ) : (
        <p className="note">No wallet found in this browser. Install one, then come back.</p>
      )}
      {DEMO_MODE && (
        <button type="button" className="btn btn-wide" autoFocus={!browser} onClick={() => { connectDemoWallet(); onDone() }}>
          Use a demo wallet
        </button>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  )
}

function HowBody() {
  return (
    <div className="how">
      <h3>Your words are stored on-chain, in full.</h3>
      <p>Up to 280 characters per entry, written into {CHAIN_NAME}'s state — not a link to somewhere else that could go offline.</p>
      <h3>Each entry is chained to the last.</h3>
      <p>Every entry records the hash of the one before it. Removing or rewriting any entry would break every link after it, in public.</p>
      <h3>Nobody can edit or delete.</h3>
      <p>Not the author, not the contract owner. The filters on this site only change what you see.</p>
      <h3>Reactions are free signals.</h3>
      <p>One per wallet per reaction. No tokens, no payments, no rewards.</p>
    </div>
  )
}

function MenuBody() {
  const { wallet } = useChain()
  const { open, postAction } = useUi()
  return (
    <div className="stack menu-sheet">
      <Link to="/">Board</Link>
      {wallet && <Link to={`/author/${wallet.address}`}>My entries</Link>}
      <button type="button" className="nav-btn" onClick={() => open('how')}>How it works</button>
      {wallet ? (
        <div className="wallet-row">
          <Constellation address={wallet.address} size={32} />
          <code>{short(wallet.address)}</code>
          <button type="button" className="btn" onClick={() => { disconnect(); open(null) }}>Disconnect</button>
        </div>
      ) : (
        <button type="button" className="btn btn-wide" onClick={() => open('connect')}>Connect wallet</button>
      )}
      <button type="button" className="btn btn-primary btn-wide" onClick={() => { open(null); setTimeout(postAction, 50) }}>Post an entry</button>
      <p className="faint">{CHAIN_NAME}{DEMO_MODE ? ' · demo data' : ''}</p>
    </div>
  )
}
