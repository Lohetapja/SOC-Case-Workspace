import { describe, expect, it } from 'vitest'
import type { SocCase } from '../types'
import { demoCases } from '../data/demoCases'
import { buildCaseHtmlDocument, caseHtmlFilename } from './caseHtml'

const sample = demoCases[0]

describe('buildCaseHtmlDocument', () => {
  it('produces a self-contained HTML document with no external references or scripts', () => {
    const html = buildCaseHtmlDocument(sample)
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain(sample.title)
    expect(html).toContain('static read-only export')
    // Self-contained: no scripts and no external URLs/resources.
    expect(html).not.toContain('<script')
    expect(html).not.toContain('http://')
    expect(html).not.toContain('https://')
    expect(html).not.toMatch(/\ssrc=/)
  })

  it('escapes user-controlled text to keep the export inert', () => {
    const malicious: SocCase = {
      ...sample,
      title: '<img src=x onerror=alert(1)>',
      summary: 'a & b < c > d "quote" \'q\'',
    }
    const html = buildCaseHtmlDocument(malicious)
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).toContain('a &amp; b &lt; c &gt; d')
  })

  it('builds a safe, dated filename', () => {
    expect(caseHtmlFilename(sample)).toMatch(/^soc-case-[a-z0-9-]+-\d{4}-\d{2}-\d{2}\.html$/)
  })
})
