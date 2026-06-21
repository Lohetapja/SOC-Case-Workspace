import { useMemo, useState } from 'react'
import type { SocCase } from '../types'
import {
  ARTIFACT_LANES,
  buildArtifactMap,
  type ArtifactEdge,
  type ArtifactNode,
  type ArtifactType,
} from '../utils/artifactMap'
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

const FALLBACK_GAPS = [
  'Full email headers still needed',
  'Decoded payload still needed',
  'Endpoint script-block logs still needed',
  'DNS / proxy follow-up still needed',
  'Containment confirmation still needed',
]

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

  const evidenceTitleById = useMemo(
    () => new Map(socCase.evidence.map((item) => [item.id, item.title])),
    [socCase],
  )
  const nodeById = useMemo(() => new Map(map.nodes.map((node) => [node.id, node])), [map])

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
    return openQuestions.length > 0 ? openQuestions : FALLBACK_GAPS
  }, [socCase])

  const center = (id: string) => {
    const p = positions.get(id)
    return p ? { x: p.x + CARD_W / 2, y: p.y + CARD_H / 2 } : null
  }

  const resolveEvidence = (ids?: string[]) =>
    (ids ?? []).map((id) => evidenceTitleById.get(id)).filter((title): title is string => Boolean(title))

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

        <div className="amap__canvas" style={{ width, height }}>
          <svg className="amap__edges" width={width} height={height}>
            {map.edges.map((edge) => {
              const a = center(edge.source)
              const b = center(edge.target)
              if (!a || !b) return null
              const dx = (b.x - a.x) * 0.4
              const d = `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
              const active = selection?.kind === 'edge' && selection.edge.id === edge.id
              return (
                <g key={edge.id} className="amap__edge">
                  <path
                    className="amap__edge-hit"
                    d={d}
                    onClick={() => setSelection({ kind: 'edge', edge })}
                  />
                  <path className={`amap__edge-line${active ? ' amap__edge-line--active' : ''}`} d={d} />
                </g>
              )
            })}
          </svg>

          {map.nodes.map((node) => {
            const p = positions.get(node.id)
            if (!p) return null
            const meta = ARTIFACT_META[node.type]
            const active = selection?.kind === 'node' && selection.node.id === node.id
            return (
              <button
                key={node.id}
                type="button"
                className={`amap__card${active ? ' amap__card--selected' : ''}`}
                style={{ left: p.x, top: p.y, width: CARD_W, height: CARD_H, borderLeftColor: meta.color }}
                onClick={() => setSelection({ kind: 'node', node })}
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
        {selection?.kind === 'node' ? (
          <div className="amap__detail">
            <span className="amap__detail-type">
              <span className="graph-dot" style={{ background: ARTIFACT_META[selection.node.type].color }} />
              {ARTIFACT_META[selection.node.type].label}
            </span>
            <h3 className="amap__detail-title">{selection.node.title}</h3>
            <p className="amap__detail-text">{selection.node.description}</p>
            {selection.node.timestamp && (
              <p className="amap__detail-meta">When: {formatDateTime(selection.node.timestamp)}</p>
            )}
            {resolveEvidence(selection.node.relatedEvidenceIds).length > 0 && (
              <p className="amap__detail-meta">
                Evidence: {resolveEvidence(selection.node.relatedEvidenceIds).join(', ')}
              </p>
            )}
            <p className="amap__detail-meta">
              {selection.node.degree ?? 0}{' '}
              {(selection.node.degree ?? 0) === 1 ? 'connection' : 'connections'}
            </p>
          </div>
        ) : selection?.kind === 'edge' ? (
          <div className="amap__detail">
            <span className="amap__detail-type">Relationship</span>
            <h3 className="amap__detail-title">{selection.edge.label}</h3>
            <p className="amap__detail-text">
              <strong>{nodeById.get(selection.edge.source)?.title ?? selection.edge.source}</strong>
              {' → '}
              <strong>{nodeById.get(selection.edge.target)?.title ?? selection.edge.target}</strong>
            </p>
            {resolveEvidence(selection.edge.supportingEvidenceIds).length > 0 && (
              <p className="amap__detail-meta">
                Supporting evidence: {resolveEvidence(selection.edge.supportingEvidenceIds).join(', ')}
              </p>
            )}
          </div>
        ) : (
          <p className="graph-hint">
            Click an artifact card or a connection line to see its details. Cards are
            grouped into investigation lanes left → right.
          </p>
        )}

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
