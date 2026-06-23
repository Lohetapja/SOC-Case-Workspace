import { useEffect, useRef } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import {
  NODE_TYPE_META,
  type CaseGraphData,
  type CaseGraphNode,
  type GraphNodeType,
} from '../utils/caseGraph'

const NODE_COLORS = Object.fromEntries(
  NODE_TYPE_META.map((meta) => [meta.type, meta.color]),
) as Record<GraphNodeType, string>

interface CaseGraphProps {
  data: CaseGraphData
  width: number
  height: number
  onNodeClick: (node: CaseGraphNode) => void
  /** Called when a node is dragged and released, with its pinned position. */
  onNodePinned: (nodeId: string, x: number, y: number) => void
}

/** A node once the force engine has assigned it a position. */
type PositionedNode = CaseGraphNode & { x: number; y: number }

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

/**
 * Read-only force-directed graph of a single case. Zoom (scroll) and pan (drag)
 * are enabled by default; clicking a node bubbles up via onNodeClick.
 */
export function CaseGraph({ data, width, height, onNodeClick, onNodePinned }: CaseGraphProps) {
  // The force-graph instance exposes imperative helpers (e.g. zoomToFit). Its
  // generic typing is awkward, so we keep the ref loosely typed.
  const graphRef = useRef<{ zoomToFit?: (ms?: number, px?: number) => void } | null>(null)

  // Frame the graph nicely whenever the case (data) changes.
  useEffect(() => {
    const timer = window.setTimeout(() => graphRef.current?.zoomToFit?.(500, 60), 350)
    return () => window.clearTimeout(timer)
  }, [data])

  return (
    <ForceGraph2D
      ref={graphRef as never}
      graphData={data}
      width={width}
      height={height}
      backgroundColor="#0b0e14"
      nodeRelSize={4}
      d3VelocityDecay={0.3}
      nodeLabel={(node) => (node as CaseGraphNode).label}
      linkColor={() => 'rgba(148, 163, 184, 0.22)'}
      linkWidth={1}
      onNodeClick={(node) => onNodeClick(node as CaseGraphNode)}
      onNodeDragEnd={(node) => {
        // Pin the node where it was dropped (force-graph releases it otherwise)
        // and persist the position.
        const positioned = node as PositionedNode
        positioned.fx = positioned.x
        positioned.fy = positioned.y
        onNodePinned(positioned.id, positioned.x, positioned.y)
      }}
      nodePointerAreaPaint={(node, color, ctx) => {
        const positioned = node as PositionedNode
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(positioned.x, positioned.y, 7, 0, 2 * Math.PI)
        ctx.fill()
      }}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const positioned = node as PositionedNode
        const radius = positioned.type === 'case' ? 7 : 4.5

        ctx.beginPath()
        ctx.arc(positioned.x, positioned.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = NODE_COLORS[positioned.type]
        ctx.fill()

        if (positioned.type === 'case') {
          ctx.lineWidth = 1.5 / globalScale
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
          ctx.stroke()
        }

        // Labels appear when zoomed in (and always for the central case node)
        // to keep the zoomed-out view uncluttered.
        if (positioned.type === 'case' || globalScale > 0.65) {
          const fontSize = Math.max(3, 11 / globalScale)
          ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillStyle = 'rgba(203, 213, 225, 0.9)'
          ctx.fillText(truncate(positioned.label, 24), positioned.x, positioned.y + radius + 1.5)
        }
      }}
    />
  )
}
