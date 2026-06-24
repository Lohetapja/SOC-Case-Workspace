import { useMemo, useRef, useState } from 'react'
import type { SocCase } from '../types'
import { buildCaseReport, reportFilename } from '../utils/caseReport'
import { GuidedTip } from './GuidedTip'

interface ReportSectionProps {
  socCase: SocCase
  guidedMode?: boolean
}

/** Generated Markdown report for one case, with Copy and Download. */
export function ReportSection({ socCase, guidedMode = false }: ReportSectionProps) {
  const markdown = useMemo(() => buildCaseReport(socCase), [socCase])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [downloadFeedback, setDownloadFeedback] = useState<{
    error: boolean
    text: string
  } | null>(null)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopyFeedback('Markdown copied to the clipboard.')
    } catch {
      // Fallback: select the text so the user can copy manually.
      textareaRef.current?.focus()
      textareaRef.current?.select()
      setCopyFeedback('Clipboard access was unavailable. The report text is selected for manual copying.')
    }
    window.setTimeout(() => setCopyFeedback(null), 3000)
  }

  function handleDownload() {
    setDownloadFeedback(null)
    try {
      const filename = reportFilename(socCase)
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
      setDownloadFeedback({ error: false, text: `Download started: ${filename}` })
    } catch {
      setDownloadFeedback({
        error: true,
        text: 'Could not create the Markdown download. The report preview is still available.',
      })
    }
  }

  return (
    <div className="report">
      {guidedMode && (
        <GuidedTip>
          A good report should explain what happened, what supports the conclusion, what remains uncertain, and what should happen next.
        </GuidedTip>
      )}
      <div className="report__actions">
        <button type="button" className="btn" onClick={handleCopy}>
          {copyFeedback?.startsWith('Markdown copied') ? 'Copied!' : 'Copy Markdown'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleDownload}>
          Download .md
        </button>
      </div>
      {copyFeedback && <p className="action-feedback" role="status">{copyFeedback}</p>}
      {downloadFeedback && (
        <p
          className={`action-feedback${downloadFeedback.error ? ' action-feedback--error' : ''}`}
          role={downloadFeedback.error ? 'alert' : 'status'}
        >
          {downloadFeedback.text}
        </p>
      )}
      <textarea
        ref={textareaRef}
        className="report__preview"
        value={markdown}
        readOnly
        spellCheck={false}
        aria-label="Generated Markdown report"
      />
    </div>
  )
}
