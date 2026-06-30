import { useState } from 'react'

interface CopyButtonProps {
  /** The text to place on the clipboard. */
  value: string
  /** Accessible/hover label, e.g. "Copy IP address". */
  label?: string
}

/**
 * Small, subtle copy-to-clipboard button with transient "Copied" feedback.
 * Local-only: uses the browser clipboard API (with a DOM fallback) and never
 * sends data anywhere.
 */
export function CopyButton({ value, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Fallback for non-secure contexts (e.g. an opened-from-disk page).
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
      } catch {
        /* clipboard unavailable — nothing else to do locally */
      }
      document.body.removeChild(textarea)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        handleCopy()
      }}
      aria-label={`${label}: ${value}`}
      title={copied ? 'Copied' : label}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
