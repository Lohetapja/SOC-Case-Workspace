import { useEffect, useMemo, useState } from 'react'
import type { SocCase } from '../types'
import {
  ARTIFACT_LANES,
  buildArtifactMap,
  type ArtifactEdge,
  type ArtifactNode,
  type ArtifactType,
} from '../utils/artifactMap'
import { reviewCaseQuality } from '../utils/caseQuality'
import { formatDateTime } from '../utils/format'

/** Colour + label per artifact type (drives card accent and details panel). */
const ARTIFACT_META: Record<ArtifactType, { label: string; color: string }> = {
  user: { label: 'User', color: '#5aa9e6' },
  host: { label: 'Host', color: '#22d3ee' },
  email: { label: 'Email', color: '#fbbf24' },
  file: { label: 'File', color: '#4ade80' },
  process: { label: 'Process', color: '#b794f6' },
  destination: { label: 'Destination', color: '#fb923c' },
  detection: { label: 'Detection', color: '#f472b6' },
  finding: { label: 'Finding', color: '#f9a8d4' },
  mitre: { label: 'ATT&CK', color: '#fb7185' },
  response: { label: 'Response', color: '#38bdf8' },
}

const NO_GAPS_MESSAGE =
  'No major investigation gaps flagged. Confirm evidence limits before final closure.'

// Deterministic layout constants (no DOM measurement needed).
const CARD_W = 170
const CARD_H = 58
const V_GAP = 14
const LANE_GAP = 40
const TOP_PAD = 10
const LANE_COL_W = CARD_W + LANE_GAP

type Selection =
  | { kind: 'node'; node: ArtifactNode }
  | { kind: 'edge'; edge: ArtifactEdge }
  | null

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

interface ArtifactMapProps {
  socCase: SocCase
}

/** Structured, read-only investigation-flow map for one case. */
export function ArtifactMap({ socCase }: ArtifactMapProps) {
  const map = useMemo(() => buildArtifactMap(socCase), [socCase])
  const [selection, setSelection] = useState<Selection>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null)

  function clearSelection() {
    setSelection(null)
    setHoveredNodeId(null)
    setHoveredEdgeId(null)
  }

  // Escape clears a locked selection (complements the Clear button and an
  // empty-space click/tap).
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelection(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const evidenceTitleById = useMemo(
    () => new Map(socCase.evidence.map((item) => [item.id, item.title])),
    [socCase],
  )
  const nodeById = useMemo(() => new Map(map.nodes.map((node) => [node.id, node])), [map])
  const edgeById = useMemo(() => new Map(map.edges.map((edge) => [edge.id, edge])), [map])

  const inspected = useMemo<Selection>(() => {
    if (selection) return selection
    if (hoveredEdgeId) {
      const edge = edgeById.get(hoveredEdgeId)
      if (edge) return { kind: 'edge', edge }
    }
    if (hoveredNodeId) {
      const node = nodeById.get(hoveredNodeId)
      if (node) return { kind: 'node', node }
    }
    return null
  }, [edgeById, hoveredEdgeId, hoveredNodeId, nodeById, selection])

  const highlighted = useMemo(() => {
    const nodeIds = new Set<string>()
    const edgeIds = new Set<string>()

    if (inspected?.kind === 'edge') {
      nodeIds.add(inspected.edge.source)
      nodeIds.add(inspected.edge.target)
      edgeIds.add(inspected.edge.id)
    }

    if (inspected?.kind === 'node') {
      nodeIds.add(inspected.node.id)
      for (const edge of map.edges) {
        if (edge.source === inspected.node.id || edge.target === inspected.node.id) {
          edgeIds.add(edge.id)
          nodeIds.add(edge.source)
          nodeIds.add(edge.target)
        }
      }
    }

    return {
      hasFocus: Boolean(inspected),
      nodeIds,
      edgeIds,
    }
  }, [inspected, map.edges])

  // Deterministic positions: lane index → column, order-in-lane → row.
  const { positions, width, height } = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>()
    let maxRows = 1
    ARTIFACT_LANES.forEach((lane, laneIndex) => {
      const laneNodes = map.nodes.filter((node) => node.lane === lane.id)
      maxRows = Math.max(maxRows, laneNodes.length)
      laneNodes.forEach((node, row) => {
        pos.set(node.id, {
          x: laneIndex * LANE_COL_W + LANE_GAP / 2,
          y: TOP_PAD + row * (CARD_H + V_GAP),
        })
      })
    })
    return {
      positions: pos,
      width: ARTIFACT_LANES.length * LANE_COL_W,
      height: TOP_PAD + maxRows * (CARD_H + V_GAP) + TOP_PAD,
    }
  }, [map])

  const gaps = useMemo(() => {
    const openQuestions = socCase.analystQuestions
      .filter((question) => question.status === 'open')
      .map((question) => question.question)
    const qualitySignals = reviewCaseQuality(socCase).checks
      .filter((check) => check.status !== 'pass')
      .map((check) => check.guidance)
      .filter((guidance) => !openQuestions.includes(guidance))
      .slice(0, 4)
    const combinedGaps = [...openQuestions, ...qualitySignals]
    return combinedGaps.length > 0 ? combinedGaps : [NO_GAPS_MESSAGE]
  }, [socCase])

  const center = (id: string) => {
    const p = positions.get(id)
    return p ? { x: p.x + CARD_W / 2, y: p.y + CARD_H / 2 } : null
  }

  const resolveEvidence = (ids?: string[]) =>
    (ids ?? []).map((id) => evidenceTitleById.get(id)).filter((title): title is string => Boolean(title))

  if (map.nodes.length === 0) {
    return (
      <div className="amap">
        <div className="amap__empty">
          <h2>No artifacts to map yet</h2>
          <p>
            Add affected entities, evidence, timeline events, findings, MITRE mappings, or
            recommendations inside the case workspace to build an investigation-flow map.
          </p>
        </div>

        <aside className="amap__panel">
          <p className="graph-hint">
            Artifact Map is read-only. It reflects the selected case once investigation records
            exist.
          </p>
          <div className="amap__gaps">
            <div className="amap__gaps-title">Investigation gaps</div>
            <ul className="amap__gaps-list">
              {gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    )
  }

  return (
    <div className="amap">
      <div className="amap__scroll">
        <div className="amap__lanes" style={{ width }}>
          {ARTIFACT_LANES.map((lane) => (
            <div key={lane.id} className="amap__lane-header" style={{ width: LANE_COL_W }}>
              {lane.title}
            </div>
          ))}
        </div>

        <div className="amap__canvas" style={{ width, height }} onClick={() => clearSelection()}>
          <svg className="amap__edges" width={width} height={height}>
            {map.edges.map((edge) => {
              const a = center(edge.source)
              const b = center(edge.target)
              if (!a || !b) return null
              const dx = (b.x - a.x) * 0.4
              const d = `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
              const active = highlighted.edgeIds.has(edge.id)
              const dimmed = highlighted.hasFocus && !active
              return (
                <g key={edge.id} className="amap__edge">
                  <path
                    className="amap__edge-hit"
                    d={d}
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId((current) => (current === edge.id ? null : current))}
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelection({ kind: 'edge', edge })
                    }}
                  />
                  <path
                    className={`amap__edge-line${active ? ' amap__edge-line--active' : ''}${dimmed ? ' amap__edge-line--dimmed' : ''}`}
                    d={d}
                  />
                </g>
              )
            })}
          </svg>

          {map.nodes.map((node) => {
            const p = positions.get(node.id)
            if (!p) return null
            const meta = ARTIFACT_META[node.type]
            const selected = selection?.kind === 'node' && selection.node.id === node.id
            const active = inspected?.kind === 'node' && inspected.node.id === node.id
            const related = highlighted.nodeIds.has(node.id) && !active
            const dimmed = highlighted.hasFocus && !highlighted.nodeIds.has(node.id)
            return (
              <button
                key={node.id}
                type="button"
                className={`amap__card${selected ? ' amap__card--selected' : ''}${active ? ' amap__card--active' : ''}${related ? ' amap__card--related' : ''}${dimmed ? ' amap__card--dimmed' : ''}`}
                style={{ left: p.x, top: p.y, width: CARD_W, height: CARD_H, borderLeftColor: meta.color }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId((current) => (current === node.id ? null : current))}
                onClick={(event) => {
                  event.stopPropagation()
                  setSelection({ kind: 'node', node })
                }}
              >
                <span className="amap__card-type" style={{ color: meta.color }}>
                  {meta.label}
                </span>
                <span className="amap__card-title">{truncate(node.title, 36)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <aside className="amap__panel">
        <div className="amap__panel-detail">
          {selection && (
            <div className="amap__detail-actions">
              <button type="button" className="btn-link" onClick={() => clearSelection()}>
                Clear selection
              </button>
            </div>
          )}
          {inspected?.kind === 'node' ? (
          <div className="amap__detail">
            <span className="amap__detail-type">
              <span className="graph-dot" style={{ background: ARTIFACT_META[inspected.node.type].color }} />
              {ARTIFACT_META[inspected.node.type].label}
            </span>
            <h3 className="amap__detail-title">{inspected.node.title}</h3>
            <p className="amap__detail-text">{inspected.node.description}</p>
            {inspected.node.timestamp && (
              <p className="amap__detail-meta">When: {formatDateTime(inspected.node.timestamp)}</p>
            )}
            {resolveEvidence(inspected.node.relatedEvidenceIds).length > 0 && (
              <p className="amap__detail-meta">
                Evidence: {resolveEvidence(inspected.node.relatedEvidenceIds).join(', ')}
              </p>
            )}
            <p className="amap__detail-meta">
              {inspected.node.degree ?? 0}{' '}
              {(inspected.node.degree ?? 0) === 1 ? 'connection' : 'connections'}
            </p>
          </div>
        ) : inspected?.kind === 'edge' ? (
          <div className="amap__detail">
            <span className="amap__detail-type">Relationship</span>
            <h3 className="amap__detail-title">{inspected.edge.label}</h3>
            <p className="amap__detail-text">
              <strong>{nodeById.get(inspected.edge.source)?.title ?? inspected.edge.source}</strong>
              {' → '}
              <strong>{nodeById.get(inspected.edge.target)?.title ?? inspected.edge.target}</strong>
            </p>
            {resolveEvidence(inspected.edge.supportingEvidenceIds).length > 0 && (
              <p className="amap__detail-meta">
                Supporting evidence: {resolveEvidence(inspected.edge.supportingEvidenceIds).join(', ')}
              </p>
            )}
          </div>
        ) : (
          <p className="graph-hint">
            Hover or tap an artifact card (or a connection line) to highlight what it
            relates to — related artifacts stay clear while unrelated ones dim. Tap an
            artifact to lock the selection; clear it with the button above, by tapping
            empty space, or with Escape.
          </p>
        )}
        </div>

        <div className="amap__gaps">
          <div className="amap__gaps-title">Investigation gaps</div>
          <ul className="amap__gaps-list">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
