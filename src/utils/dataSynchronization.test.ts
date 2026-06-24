import { describe, expect, it } from 'vitest'
import type { SocCase } from '../types'
import { buildWorkspaceSnapshot, parseWorkspaceImport } from '../data/workspaceSnapshot'
import { buildArtifactMap } from './artifactMap'
import { buildCaseGraph } from './caseGraph'
import { buildCaseReport } from './caseReport'

const syncedCase: SocCase = {
  id: 'case-sync-audit',
  title: 'Synchronization Audit Case',
  summary: 'Synthetic case used to verify that every view reads from one SocCase aggregate.',
  source: 'siem',
  severity: 'high',
  status: 'investigating',
  owner: 'SOC Analyst',
  createdAt: '2026-06-24T08:00:00Z',
  updatedAt: '2026-06-24T09:00:00Z',
  affectedEntities: [
    {
      id: 'entity-user',
      type: 'user',
      value: 'analyst.user@example.invalid',
      role: 'Affected user',
      description: 'Synthetic user identity for sync testing.',
    },
  ],
  evidence: [
    {
      id: 'ev-sync',
      type: 'log',
      title: 'Synthetic SIEM correlation',
      source: 'SIEM search',
      observedAt: '2026-06-24T08:10:00Z',
      detail: 'Synthetic event record used to verify evidence propagation.',
      relatedEntityIds: ['entity-user'],
    },
  ],
  timeline: [
    {
      id: 'tl-sync',
      timestamp: '2026-06-24T08:15:00Z',
      phase: 'detection',
      title: 'Alert triaged',
      description: 'Analyst reviewed the synthetic SIEM correlation.',
      relatedEvidenceIds: ['ev-sync'],
    },
  ],
  analystQuestions: [
    {
      id: 'q-sync',
      question: 'Does the synthetic evidence support escalation?',
      status: 'open',
      rationale: 'Open question should surface in Artifact Map investigation gaps and reports.',
      createdAt: '2026-06-24T08:20:00Z',
    },
  ],
  findings: [
    {
      id: 'f-sync',
      title: 'Suspicious synthetic activity confirmed',
      description: 'The finding is tied to evidence and timeline context.',
      confidence: 'medium',
      category: 'malicious_activity',
      severity: 'high',
      status: 'confirmed',
      relatedEvidenceIds: ['ev-sync'],
      relatedTimelineEventIds: ['tl-sync'],
    },
  ],
  mitreMappings: [
    {
      id: 'mt-sync',
      tactic: 'Execution',
      techniqueId: 'T1059',
      techniqueName: 'Command and Scripting Interpreter',
      confidence: 'medium',
      rationale: 'Synthetic analyst-authored mapping tied to the finding and evidence.',
      relatedFindingIds: ['f-sync'],
      relatedEvidenceIds: ['ev-sync'],
    },
  ],
  recommendations: [
    {
      id: 'rec-sync',
      title: 'Review related synthetic alerts',
      category: 'monitoring',
      priority: 'medium',
      status: 'proposed',
      description: 'Synthetic response recommendation used to verify report/export sync.',
    },
  ],
  closure: {
    verdict: 'suspicious',
    closureStatus: 'monitoring',
    rationale: 'Synthetic closure rationale for sync testing.',
    recommendedAction: 'Continue monitoring the synthetic scenario.',
    impactSummary: 'No real impact; synthetic test data only.',
  },
}

describe('cross-page data synchronization contract', () => {
  it('uses one SocCase aggregate for visual maps, report export, and snapshots', () => {
    const graph = buildCaseGraph(syncedCase)
    const graphNodeIds = new Set(graph.nodes.map((node) => node.id))

    expect([...graphNodeIds]).toEqual(
      expect.arrayContaining([
        'case:case-sync-audit',
        'entity:entity-user',
        'evidence:ev-sync',
        'timeline:tl-sync',
        'finding:f-sync',
        'mitre:mt-sync',
        'rec:rec-sync',
      ]),
    )

    const map = buildArtifactMap(syncedCase)
    const mapNodeTitles = new Set(map.nodes.map((node) => node.title))

    expect([...mapNodeTitles]).toEqual(
      expect.arrayContaining([
        'analyst.user@example.invalid',
        'Suspicious synthetic activity confirmed',
        'T1059 Command and Scripting Interpreter',
        'Review related synthetic alerts',
      ]),
    )

    const report = buildCaseReport(syncedCase)

    for (const expectedText of [
      'Synthetic SIEM correlation',
      'Alert triaged',
      'Does the synthetic evidence support escalation?',
      'Suspicious synthetic activity confirmed',
      'T1059',
      'Synthetic closure rationale for sync testing.',
      'Review related synthetic alerts',
    ]) {
      expect(report).toContain(expectedText)
    }

    const snapshot = buildWorkspaceSnapshot(
      [syncedCase],
      {
        [syncedCase.id]: {
          'case:case-sync-audit': { x: 42, y: -13 },
        },
      },
      { exportType: 'selected-case', selectedCaseIds: [syncedCase.id] },
    )
    const imported = parseWorkspaceImport(snapshot)

    expect(snapshot.cases[0]).toEqual(syncedCase)
    expect(snapshot.graphLayouts[syncedCase.id]['case:case-sync-audit']).toEqual({ x: 42, y: -13 })
    expect(imported).toEqual({ kind: 'snapshot', snapshot })
  })
})
