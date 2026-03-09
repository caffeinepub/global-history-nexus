import { CategoryBadge, RegionBadge } from "@/components/shared/CategoryBadge";
import { Button } from "@/components/ui/button";
import { useGetEventsByYearRange } from "@/hooks/useQueries";
import type { HistoricalEvent } from "@/hooks/useQueries";
import { CATEGORY_HEX, formatYear } from "@/utils/categoryColors";
import { Info, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface NetworkViewProps {
  onEventClick: (event: HistoricalEvent) => void;
}

interface NodeState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  event: HistoricalEvent;
}

const MAX_NODES = 60;
const REPULSION = 3000;
const ATTRACTION = 0.05;
const DAMPING = 0.85;
const LINK_DISTANCE = 120;

// The two 1453 event IDs for spotlight
const SPOTLIGHT_IDS = ["evt-1453-001", "evt-1453-002"];

function runSimulation(
  nodes: NodeState[],
  edges: [number, number][],
  iterations: number,
): NodeState[] {
  const updated = nodes.map((n) => ({ ...n }));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all nodes
    for (let i = 0; i < updated.length; i++) {
      for (let j = i + 1; j < updated.length; j++) {
        const dx = updated[j].x - updated[i].x;
        const dy = updated[j].y - updated[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = REPULSION / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        updated[i].vx -= fx;
        updated[i].vy -= fy;
        updated[j].vx += fx;
        updated[j].vy += fy;
      }
    }

    // Attraction along edges
    for (const [a, b] of edges) {
      if (a >= updated.length || b >= updated.length) continue;
      const dx = updated[b].x - updated[a].x;
      const dy = updated[b].y - updated[a].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - LINK_DISTANCE) * ATTRACTION;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      updated[a].vx += fx;
      updated[a].vy += fy;
      updated[b].vx -= fx;
      updated[b].vy -= fy;
    }

    // Apply velocity with damping
    for (const node of updated) {
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;
      // Clamp to bounds
      node.x = Math.max(40, Math.min(760, node.x));
      node.y = Math.max(40, Math.min(460, node.y));
    }
  }

  return updated;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ onEventClick }) => {
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [edges, setEdges] = useState<[number, number][]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [spotlightActive, setSpotlightActive] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const nodesRef = useRef<NodeState[]>([]);

  const { data: events, isLoading } = useGetEventsByYearRange(-500, 2000);

  const initializeGraph = useCallback((eventsData: HistoricalEvent[]) => {
    const limited = eventsData.slice(0, MAX_NODES);
    const idToIndex = new Map(limited.map((e, i) => [e.id, i]));

    const initialNodes: NodeState[] = limited.map((event, i) => {
      const angle = (i / limited.length) * 2 * Math.PI;
      const radius = 150 + (i % 3) * 60;
      return {
        id: event.id,
        x: 400 + Math.cos(angle) * radius,
        y: 250 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        event,
      };
    });

    const edgeSet = new Set<string>();
    const edgeList: [number, number][] = [];
    for (let i = 0; i < limited.length; i++) {
      const event = limited[i];
      for (const relId of event.relatedEventIds || []) {
        const j = idToIndex.get(relId);
        if (j !== undefined && j !== i) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edgeList.push([i, j]);
          }
        }
      }
    }

    nodesRef.current = initialNodes;
    setNodes(initialNodes);
    setEdges(edgeList);
    setIsSimulating(true);
    // Reset spotlight when graph reinitializes
    setSpotlightActive(true);
    setSelectedNode(null);
  }, []);

  useEffect(() => {
    if (events && events.length > 0) {
      initializeGraph(events);
    }
  }, [events, initializeGraph]);

  // Run force simulation with requestAnimationFrame
  useEffect(() => {
    if (!isSimulating) return;

    let frame = 0;
    const MAX_FRAMES = 150;

    const tick = () => {
      frame++;
      const current = nodesRef.current;
      const updated = runSimulation(current, edges, 3);
      nodesRef.current = updated;
      setNodes([...updated]);

      if (frame < MAX_FRAMES) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setIsSimulating(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSimulating, edges]);

  // Auto-select the Constantinople node once simulation finishes and spotlight is active
  useEffect(() => {
    if (isSimulating || !spotlightActive || nodes.length === 0) return;
    const constantinopleNode = nodes.find((n) => n.id === "evt-1453-001");
    if (constantinopleNode) {
      setSelectedNode(constantinopleNode);
    }
  }, [isSimulating, spotlightActive, nodes]);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDragNode(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 500 / rect.height;
    setDragOffset({
      x: node.x - (e.clientX - rect.left) * scaleX,
      y: node.y - (e.clientY - rect.top) * scaleY,
    });
  };

  const handleSVGMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragNode || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 500 / rect.height;
      const newX = (e.clientX - rect.left) * scaleX + dragOffset.x;
      const newY = (e.clientY - rect.top) * scaleY + dragOffset.y;

      setNodes((prev) => {
        const updated = prev.map((n) =>
          n.id === dragNode ? { ...n, x: newX, y: newY, vx: 0, vy: 0 } : n,
        );
        nodesRef.current = updated;
        return updated;
      });
    },
    [dragNode, dragOffset],
  );

  const handleSVGMouseUp = () => {
    setDragNode(null);
  };

  const handleNodeClick = (e: React.MouseEvent, node: NodeState) => {
    e.stopPropagation();
    // Clicking a non-spotlight node deactivates spotlight
    if (!SPOTLIGHT_IDS.includes(node.id)) {
      setSpotlightActive(false);
    }
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  };

  const handleSVGBackgroundClick = () => {
    setSelectedNode(null);
    setSpotlightActive(false);
  };

  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const idx = nodes.findIndex((n) => n.id === selectedNode.id);
    const connected = new Set<string>();
    for (const [a, b] of edges) {
      if (a === idx) connected.add(nodes[b]?.id);
      if (b === idx) connected.add(nodes[a]?.id);
    }
    return connected;
  }, [selectedNode, nodes, edges]);

  // Identify if a given edge connects the two 1453 spotlight nodes
  const is1453Edge = useCallback(
    (a: number, b: number) => {
      const nodeA = nodes[a];
      const nodeB = nodes[b];
      if (!nodeA || !nodeB) return false;
      return (
        SPOTLIGHT_IDS.includes(nodeA.id) && SPOTLIGHT_IDS.includes(nodeB.id)
      );
    },
    [nodes],
  );

  const resetSimulation = () => {
    if (events && events.length > 0) {
      setSelectedNode(null);
      setSpotlightActive(true);
      initializeGraph(events);
    }
  };

  const dismissSpotlight = () => {
    setSpotlightActive(false);
    setSelectedNode(null);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-semibold text-sm text-foreground">
            Historical Connection Network
          </h2>
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
          )}
          {isSimulating && !isLoading && (
            <span className="text-[10px] font-mono text-muted-foreground animate-pulse">
              Simulating…
            </span>
          )}

          {/* 1453 Spotlight Banner */}
          <AnimatePresence>
            {spotlightActive && !isSimulating && nodes.length > 0 && (
              <motion.div
                data-ocid="network.spotlight.panel"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: "oklch(0.72 0.18 45 / 0.1)",
                  border: "1px solid oklch(0.72 0.18 45 / 0.3)",
                }}
              >
                <Sparkles
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: "oklch(0.82 0.2 50)" }}
                />
                <span
                  className="text-[11px] font-display font-semibold whitespace-nowrap"
                  style={{ color: "oklch(0.82 0.2 50)" }}
                >
                  1453 Spotlight — Fall of Constantinople ↔ Gutenberg Press
                </span>
                <button
                  type="button"
                  data-ocid="network.spotlight.close_button"
                  onClick={dismissSpotlight}
                  className="ml-1 text-[11px] font-mono leading-none transition-opacity hover:opacity-60 flex-shrink-0"
                  style={{ color: "oklch(0.72 0.18 45 / 0.7)" }}
                  aria-label="Dismiss 1453 spotlight"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetSimulation}
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* Graph */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          data-ocid="network.canvas_target"
          ref={svgRef}
          viewBox="0 0 800 500"
          className="w-full h-full"
          style={{
            background: "oklch(0.08 0.015 260)",
            cursor: dragNode ? "grabbing" : "default",
          }}
          onMouseMove={handleSVGMouseMove}
          onMouseUp={handleSVGMouseUp}
          onMouseLeave={handleSVGMouseUp}
          onClick={handleSVGBackgroundClick}
          onKeyDown={(e) => e.key === "Escape" && handleSVGBackgroundClick()}
          role="application"
          aria-label="Historical events connection network"
        >
          <title>Historical events connection network</title>
          {/* Edges */}
          <g>
            {edges.map(([a, b]) => {
              const nodeA = nodes[a];
              const nodeB = nodes[b];
              if (!nodeA || !nodeB) return null;

              const aSelected =
                selectedNode?.id === nodeA.id || selectedNode?.id === nodeB.id;
              const isSpotlightEdge = is1453Edge(a, b);

              // Spotlight edge gets gold highlight regardless of selection
              if (isSpotlightEdge && spotlightActive) {
                return (
                  <line
                    key={`edge-${nodeA.id}-${nodeB.id}`}
                    x1={nodeA.x}
                    y1={nodeA.y}
                    x2={nodeB.x}
                    y2={nodeB.y}
                    stroke="oklch(0.72 0.18 45)"
                    strokeWidth={2.5}
                    strokeOpacity={0.85}
                  />
                );
              }

              const opacity = selectedNode ? (aSelected ? 0.8 : 0.08) : 0.2;

              return (
                <line
                  key={`edge-${nodeA.id}-${nodeB.id}`}
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={
                    aSelected ? "oklch(0.72 0.18 45)" : "oklch(0.4 0.05 255)"
                  }
                  strokeWidth={aSelected ? 1.5 : 0.8}
                  strokeOpacity={opacity}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((node) => {
              const color =
                CATEGORY_HEX[node.event.category.toLowerCase()] || "#888";
              const isSelected = selectedNode?.id === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const isSpotlightNode =
                SPOTLIGHT_IDS.includes(node.id) && spotlightActive;
              const dimmed =
                selectedNode && !isSelected && !isConnected && !isSpotlightNode;
              const r = isSelected ? 10 : isSpotlightNode ? 9 : 7;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: "pointer" }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={(e) => handleNodeClick(e, node)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleNodeClick(e as unknown as React.MouseEvent, node)
                  }
                  // biome-ignore lint/a11y/useSemanticElements: SVG group cannot be a button element
                  role="button"
                  tabIndex={0}
                  aria-label={node.event.title}
                >
                  {/* Golden glow ring for 1453 spotlight nodes */}
                  {isSpotlightNode && !isSelected && (
                    <>
                      <circle
                        r={20}
                        fill="oklch(0.72 0.18 45)"
                        fillOpacity={0.06}
                      />
                      <circle
                        r={14}
                        fill="none"
                        stroke="oklch(0.72 0.18 45)"
                        strokeWidth={1.5}
                        strokeOpacity={0.4}
                      />
                    </>
                  )}

                  {/* Glow for selected */}
                  {isSelected && (
                    <circle r={16} fill={color} fillOpacity={0.15} />
                  )}
                  {isConnected && !isSpotlightNode && (
                    <circle r={12} fill={color} fillOpacity={0.08} />
                  )}

                  {/* Node circle */}
                  <circle
                    data-ocid="network.chart_point"
                    r={r}
                    fill={
                      isSpotlightNode && !isSelected
                        ? "oklch(0.72 0.18 45)"
                        : color
                    }
                    fillOpacity={dimmed ? 0.25 : 0.9}
                    stroke={
                      isSpotlightNode
                        ? "oklch(0.92 0.12 55)"
                        : "oklch(0.08 0.01 260)"
                    }
                    strokeWidth={isSpotlightNode ? 2 : 1.5}
                  />

                  {/* Label - only for selected or connected or nearby */}
                  {(isSelected ||
                    isConnected ||
                    isSpotlightNode ||
                    !selectedNode) && (
                    <text
                      x={0}
                      y={r + 12}
                      textAnchor="middle"
                      fontSize={isSelected || isSpotlightNode ? "9" : "7"}
                      fill={
                        isSpotlightNode
                          ? "oklch(0.82 0.16 50)"
                          : dimmed
                            ? "oklch(0.3 0.01 255)"
                            : "oklch(0.7 0.02 85)"
                      }
                      fontFamily="Geist Mono, monospace"
                      fontWeight={isSpotlightNode ? "700" : "400"}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {node.event.title.slice(0, 18)}
                      {node.event.title.length > 18 ? "…" : ""}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected node info card */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-4 left-4 w-64 rounded-xl p-4 space-y-3"
              style={{
                background: "oklch(0.12 0.025 255 / 0.95)",
                border: SPOTLIGHT_IDS.includes(selectedNode.id)
                  ? "1px solid oklch(0.72 0.18 45 / 0.4)"
                  : "1px solid oklch(0.25 0.04 255)",
                backdropFilter: "blur(12px)",
                boxShadow: SPOTLIGHT_IDS.includes(selectedNode.id)
                  ? "0 8px 32px oklch(0 0 0 / 0.4), 0 0 20px oklch(0.72 0.18 45 / 0.1)"
                  : "0 8px 32px oklch(0 0 0 / 0.4)",
              }}
            >
              {SPOTLIGHT_IDS.includes(selectedNode.id) && (
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md -mt-1 mb-1"
                  style={{ background: "oklch(0.72 0.18 45 / 0.1)" }}
                >
                  <Sparkles
                    className="w-2.5 h-2.5"
                    style={{ color: "oklch(0.82 0.2 50)" }}
                  />
                  <span
                    className="text-[9px] font-mono font-bold uppercase tracking-wider"
                    style={{ color: "oklch(0.72 0.18 45)" }}
                  >
                    1453 Spotlight Event
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CategoryBadge category={selectedNode.event.category} />
                  <RegionBadge region={selectedNode.event.region} />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground leading-tight">
                  {selectedNode.event.title}
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {formatYear(Number(selectedNode.event.year))}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {selectedNode.event.shortSummary}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="network.node.primary_button"
                  onClick={() => onEventClick(selectedNode.event)}
                  className="flex-1 text-xs font-display font-semibold py-1.5 rounded-md hover:bg-primary/20 transition-colors text-primary"
                  style={{ border: "1px solid oklch(0.35 0.1 45 / 0.4)" }}
                >
                  View Details
                </button>
                <button
                  type="button"
                  data-ocid="network.node.close_button"
                  onClick={() => setSelectedNode(null)}
                  className="text-xs font-mono px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  style={{ border: "1px solid oklch(0.22 0.025 255)" }}
                >
                  ×
                </button>
              </div>

              {connectedNodeIds.size > 0 && (
                <p className="text-[10px] font-mono text-muted-foreground">
                  {connectedNodeIds.size} connected event
                  {connectedNodeIds.size !== 1 ? "s" : ""}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            data-ocid="network.loading_state"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-mono">
              Loading historical network…
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && nodes.length === 0 && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            data-ocid="network.empty_state"
          >
            <Info className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No events to display in the network
            </p>
          </div>
        )}

        {/* Instructions */}
        {!isLoading && nodes.length > 0 && !selectedNode && (
          <div
            className="absolute bottom-4 right-4 px-3 py-2 rounded-lg text-[10px] font-mono text-muted-foreground"
            style={{
              background: "oklch(0.12 0.02 255 / 0.8)",
              border: "1px solid oklch(0.2 0.025 255)",
            }}
          >
            Click node to explore • Drag to reposition
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkView;
