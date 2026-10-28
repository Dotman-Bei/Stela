import { useState } from 'react'
import { CopyIcon } from './Glyphs'
import { short } from '../lib/format'

/** A machine value in mono, truncated, with a copy button. */
export function Hash({ value, label, full = false }: { value: string; label: string; full?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <span className="hash">
      <code title={value}>{full ? value : short(value)}</code>
      <CopyButton text={value} label={`Copy ${label}`} onCopied={() => setCopied(true)} onReset={() => setCopied(false)} copied={copied} />
    </span>
  )
}

export function CopyButton({ text, label, copied, onCopied, onReset }: { text: string; label: string; copied: boolean; onCopied: () => void; onReset: () => void }) {
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={copied ? 'Copied' : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          /* clipboard blocked; the value is still selectable */
        }
        onCopied()
        setTimeout(onReset, 1500)
      }}
    >
      {copied ? <span className="copied">Copied</span> : <CopyIcon />}
    </button>
  )
}

/** A text button that copies a link. */
export function CopyLink({ url, children, className = 'btn' }: { url: string; children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url)
        } catch {
          /* ignore */
        }
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? 'Link copied' : children}
    </button>
  )
}
