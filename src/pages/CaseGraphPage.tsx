import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useCases } from '../hooks/useCases'
import {
  buildCaseGraph,
  NODE_TYPE_META,
  type CaseGraphNode,
  type GraphNodeType,
} from '../utils/caseGraph'
import { ArtifactMap } from '../components/ArtifactMap'

// The force-directed Case Graph pulls in the heavy `react-force-graph-2d`
// dependency. Load it on demand (only when the Case Graph tab is opened) so the
// initial bundle and the default Artifact Map stay light.
const CaseGraph = lazy(() =>
  import('../components/CaseGraph').then((module) => ({ default: module.CaseGraph })),
)
import { clearCaseLayout, loadCaseLayout, saveNodePosition } from '../utils/graphLayout'
import { closureStatusLabels, verdictLabels } from '../data/labels'

type VizMode = 'map' | 'graph'

const COLOR_BY_TYPE = Object.fromEntries(
  NODE_TYPE_META.map((meta) => [meta.type, meta.color]),
) as Record<GraphNodeType, string>

interface CaseGraphPageProps {
  /** The shared active case; falls back to the first stored case when null. */
  activeCaseId: string | null
  onSelectCase: (id: string) => void
  onOpenCase: (id: string | null) => void
}

/**
 * Read-only Case Graph view. Visualizes the relationships inside ONE case
 * (the shared active case, or the first stored case). No editing.
 */
export function CaseGraphPage({ activeCaseId, onSelectCase, onOpenCase }: CaseGraphPageProps) {
  const { cases } = useCases()
  const [viz, setViz] = useState<VizMode>('map')
  const [selectedNode, setSelectedNode] = useState<CaseGraphNode | null>(null)
  // Bumped by "Reset layout" to rebuild the graph with cleared positions.
  const [layoutVersion, setLayoutVersion] = useState(0)

  const activeCase = useMemo(() => {
    if (cases.length === 0) return null
    return cases.find((socCase) => socCase.id === activeCaseId) ?? cases[0]
  }, [cases, activeCaseId])

  const graph = useMemo(() => {
    if (!activeCase) return { nodes: [], links: [] }
    const built = buildCaseGraph(activeCase)
    // Restore any saved (pinned) positions for this case.
    const layout = loadCaseLayout(activeCase.id)
    for (const node of built.nodes) {
      const saved = layout[node.id]
      if (saved) {
        node.x = saved.x
        node.y = saved.y
        node.fx = saved.x
        node.fy = saved.y
      }
    }
    return built
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layoutVersion forces a fresh rebuild on reset
  }, [activeCase, layoutVersion])

  function handleNodePinned(nodeId: string, x: number, y: number) {
    if (activeCase) saveNodePosition(activeCase.id, nodeId, { x, y })
  }

  function handleResetLayout() {
    if (!activeCase) return
    clearCaseLayout(activeCase.id)
    setSelectedNode(null)
    setLayoutVersion((version) => version + 1)
  }

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
  }, [viz])

  if (cases.length === 0) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">Case Graph</h1>
          <p className="page__subtitle">Visualize the relationships inside one case.</p>
        </header>
        <div className="empty-state">
          <p className="cases-note">
            No cases to visualize yet. Create a case or load a guided sample case first, then come
            back to inspect its Case Graph or Artifact Map.
          </p>
          <button type="button" className="btn" onClick={() => onOpenCase(null)}>
            Go to Cases
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="graph-page">
      <header className="graph-page__head">
        <div>
          <h1 className="page__title">{viz === 'map' ? 'Artifact Map' : 'Case Graph'}</h1>
          <p className="page__subtitle">
            {viz === 'graph'
              ? `Read-only relationship view · ${graph.nodes.length} nodes · ${graph.links.length} links.`
              : 'Read-only investigation-flow view: artifacts grouped into lanes.'}
          </p>
          {(activeCase?.closure?.verdict || activeCase?.closure?.closureStatus) && (
            <p className="graph-classification">
              {activeCase.closure.verdict && (
                <span className="chip">{verdictLabels[activeCase.closure.verdict]}</span>
              )}
              {activeCase.closure.closureStatus && (
                <span className="chip">{closureStatusLabels[activeCase.closure.closureStatus]}</span>
              )}
            </p>
          )}
        </div>
        <div className="graph-controls">
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
          {viz === 'graph' && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={handleResetLayout}
              title="Clear pinned positions for this case and re-run the layout"
            >
              Reset layout
            </button>
          )}
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => onOpenCase(activeCase?.id ?? null)}
          >
            Open selected case
          </button>
        </div>
      </header>

      <div className="viz-tabs" role="tablist" aria-label="Visualization mode">
        <button
          type="button"
          role="tab"
          aria-selected={viz === 'map'}
          className={`viz-tab${viz === 'map' ? ' viz-tab--active' : ''}`}
          onClick={() => setViz('map')}
        >
          Artifact Map
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viz === 'graph'}
          className={`viz-tab${viz === 'graph' ? ' viz-tab--active' : ''}`}
          onClick={() => setViz('graph')}
        >
          Case Graph
        </button>
      </div>

      {viz === 'map' ? (
        activeCase && <ArtifactMap socCase={activeCase} />
      ) : (
      <div className="graph-body">
        <div className="graph-canvas" ref={containerRef}>
          <Suspense fallback={<div className="graph-loading">Loading graph…</div>}>
            <CaseGraph
              data={graph}
              width={size.width}
              height={size.height}
              onNodeClick={setSelectedNode}
              onNodePinned={handleNodePinned}
            />
          </Suspense>
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
            <p className="graph-hint">
              Click a node for details. Drag a node to pin it (positions are saved
              per case); scroll to zoom; drag the background to pan.
            </p>
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
      )}
    </div>
  )
}
