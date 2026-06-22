import { describe, expect, it } from 'vitest'
import { demoCases } from '../data/demoCases'
import { buildArtifactMap } from './artifactMap'
import { buildCaseGraph } from './caseGraph'

describe('investigation visual transforms', () => {
  it('builds a connected Case Graph from a populated case', () => {
    const graph = buildCaseGraph(demoCases[0])
    const nodeIds = new Set(graph.nodes.map((node) => node.id))
    const nodeTypes = new Set(graph.nodes.map((node) => node.type))

    expect(nodeTypes).toContain('case')
    expect(nodeTypes).toContain('evidence')
    expect(nodeTypes).toContain('timeline')
    expect(nodeTypes).toContain('finding')
    expect(nodeTypes).toContain('mitre')
    expect(graph.links.length).toBeGreaterThan(0)
    expect(graph.links.every((link) => nodeIds.has(link.source) && nodeIds.has(link.target))).toBe(true)
  })

  it('builds Artifact Map nodes, lanes, and valid edges', () => {
    const map = buildArtifactMap(demoCases[0])
    const nodeIds = new Set(map.nodes.map((node) => node.id))
    const lanes = new Set(map.nodes.map((node) => node.lane))

    expect(map.nodes.length).toBeGreaterThan(0)
    expect(map.edges.length).toBeGreaterThan(0)
    expect(lanes).toContain('identity')
    expect(lanes).toContain('detection')
    expect(lanes).toContain('response')
    expect(map.edges.every((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))).toBe(true)
  })
})
