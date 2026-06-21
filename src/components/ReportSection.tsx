import { useMemo, useRef, useState } from 'react'
import type { SocCase } from '../types'
import { buildCaseReport, reportFilename } from '../utils/caseReport'

interface ReportSectionProps {
  socCase: SocCase
}

/** Generated Markdown report for one case, with Copy and Download. */
export function ReportSection({ socCase }: ReportSectionProps) {
  const markdown = useMemo(() => buildCaseReport(socCase), [socCase])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
    } catch {
      // Fallback: select the text so the user can copy manually.
      textareaRef.current?.select()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = reportFilename(socCase)
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="report">
      <div className="report__actions">
        <button type="button" className="btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Markdown'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleDownload}>
          Download .md
        </button>
      </div>
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
