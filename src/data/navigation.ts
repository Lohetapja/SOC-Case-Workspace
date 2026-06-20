import type { SectionId } from '../types'

export interface NavItem {
  id: SectionId
  label: string
  /** One-line description shown on the overview cards. */
  description: string
}

/**
 * The workspace sections, in investigation-lifecycle order. This is static
 * presentation data only — no case logic lives here.
 */
export const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', description: 'Project summary and starting point.' },
  { id: 'cases', label: 'Cases', description: 'Create and track investigations as structured cases.' },
  { id: 'evidence', label: 'Evidence', description: 'Collect and annotate the evidence for a case.' },
  { id: 'timeline', label: 'Timeline', description: 'Reconstruct the sequence of events.' },
  { id: 'journal', label: 'Decision Journal', description: 'Record analyst questions and decisions.' },
  { id: 'mitre', label: 'MITRE Mapping', description: 'Map findings to ATT&CK techniques.' },
  { id: 'reports', label: 'Reports', description: 'Export the case as a Markdown report.' },
]
