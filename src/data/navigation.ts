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
  { id: 'samples', label: 'Sample Cases', description: 'Load a guided synthetic demo case to explore.' },
  { id: 'guide', label: 'Analyst Guide', description: 'Short practical guidance for SOC case writing.' },
  { id: 'cases', label: 'Cases', description: 'Build and assess structured investigations.' },
  { id: 'graph', label: 'Investigation Visuals', description: 'Explore flow in Artifact Map or relationships in Case Graph.' },
  { id: 'evidence', label: 'Evidence', description: 'Review collected evidence across all cases.' },
  { id: 'timeline', label: 'Timeline', description: 'Review investigation events chronologically.' },
  { id: 'journal', label: 'Decision Journal', description: 'Review analyst questions and decisions.' },
  { id: 'mitre', label: 'MITRE ATT&CK Mapping', description: 'Review analyst-authored ATT&CK mappings.' },
  { id: 'reports', label: 'Reports', description: 'Preview, copy, or download a Markdown report.' },
  { id: 'settings', label: 'Settings', description: 'Back up, restore, or reset your local data.' },
]
