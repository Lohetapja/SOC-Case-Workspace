import { useEffect, useMemo, useRef, useState } from 'react'
import { useCases } from '../hooks/useCases'
import { buildCaseGraph, type CaseGraphNode, type GraphNodeType } from '../utils/caseGraph'
import { CaseGraph, NODE_TYPE_META } from '../components/CaseGraph'

const COLOR_BY_TYPE = Object.fromEntries(
  NODE_TYPE_META.map((meta) => [meta.type, meta.color]),
) as Record<GraphNodeType, string>

interface CaseGraphPageProps {
  /** The shared active case; falls back to the first stored case when null. */
  activeCaseId: string | null
  onSelectCase: (id: string) => void
}

/**
 * Read-only Case Graph view. Visualizes the relationships inside ONE case
 * (the shared active case, or the first stored case). No editing.
 */
export function CaseGraphPage({ activeCaseId, onSelectCase }: CaseGraphPageProps) {
  const { cases } = useCases()
  const [selectedNode, setSelectedNode] = useState<CaseGraphNode | null>(null)

  const activeCase = useMemo(() => {
    if (cases.length === 0) return null
    return cases.find((socCase) => socCase.id === activeCaseId) ?? cases[0]
  }, [cases, activeCaseId])

  const graph = useMemo(
    () => (activeCase ? buildCaseGraph(activeCase) : { nodes: [], links: [] }),
    [activeCase],
  )

  const countByType = useMemo(() => {
    const counts: Partial<Record<GraphNodeType, number>> = {}
    for (const node of graph.nodes) counts[node.type] = (counts[node.type] ?? 0) + 1
    return counts
  }, [graph])

  // Reset the inspected node when the case changes.
  useEffect(() => setSelectedNode(null), [activeCase?.id])

  // Measure the canvas container so the graph fills it responsively.
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 800, height: 520 })
  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const update = () => setSize({ width: element.clientWidth, height: element.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (cases.length === 0) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">Case Graph</h1>
          <p className="page__subtitle">Visualize the relationships inside one case.</p>
        </header>
        <p className="cases-note">No cases to visualize yet. Create a case first.</p>
      </div>
    )
  }

  return (
    <div className="graph-page">
      <header className="graph-page__head">
        <div>
          <h1 className="page__title">Case Graph</h1>
          <p className="page__subtitle">
            Read-only relationship view · {graph.nodes.length} nodes · {graph.links.length} links.
          </p>
        </div>
        <label className="graph-select">
          <span>Case</span>
          <select
            value={activeCase?.id}
            onChange={(event) => onSelectCase(event.target.value)}
          >
            {cases.map((socCase) => (
              <option key={socCase.id} value={socCase.id}>
                {socCase.title}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="graph-body">
        <div className="graph-canvas" ref={containerRef}>
          <CaseGraph
            data={graph}
            width={size.width}
            height={size.height}
            onNodeClick={setSelectedNode}
          />
        </div>

        <aside className="graph-panel">
          {selectedNode ? (
            <div className="graph-detail">
              <span className="graph-detail__type">
                <span
                  className="graph-dot"
                  style={{ background: COLOR_BY_TYPE[selectedNode.type] }}
                />
                {selectedNode.typeLabel}
              </span>
              <h2 className="graph-detail__title">{selectedNode.label}</h2>
              <p className="graph-detail__text">{selectedNode.detail}</p>
              <p className="graph-detail__meta">
                {selectedNode.degree ?? 0}{' '}
                {(selectedNode.degree ?? 0) === 1 ? 'connection' : 'connections'}
              </p>
            </div>
          ) : (
            <p className="graph-hint">Click a node to see its details. Scroll to zoom, drag to pan.</p>
          )}

          <div className="graph-legend">
            <div className="graph-legend__title">Legend</div>
            {NODE_TYPE_META.map((meta) => (
              <div key={meta.type} className="graph-legend__row">
                <span className="graph-dot" style={{ background: meta.color }} />
                <span>{meta.label}</span>
                <span className="graph-legend__count">{countByType[meta.type] ?? 0}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
