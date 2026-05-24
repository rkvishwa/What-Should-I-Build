"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  PanOnScrollMode,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { nodeTypes, type CanvasNodeData } from "./custom-nodes";
import { DesignSystemPanel } from "./design-system-panel";
import { ValidationPanel } from "./validation-panel";
import type { CanvasData, NodeType, ValidationIssue } from "@/lib/schemas/canvas";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { TabNav } from "@/components/design-system/app-shell";
import { useWorkspaceLayout } from "@/lib/client/workspace-layout-context";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;

function needsAutoLayout(nodes: CanvasData["architecture"]["nodes"]): boolean {
  if (nodes.length === 0) return false;
  return nodes.every(
    (n) =>
      (n.position.x === 0 && n.position.y === 0) ||
      Number.isNaN(n.position.x) ||
      Number.isNaN(n.position.y),
  );
}

function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );

  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  validEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  try {
    dagre.layout(g);
  } catch {
    return nodes;
  }

  return nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") {
      return node;
    }
    return {
      ...node,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
    };
  });
}

function canvasToFlow(canvas: CanvasData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = canvas.architecture.nodes.map((n) => ({
    id: n.id,
    type: "canvasNode",
    position: n.position,
    data: {
      label: n.data.label,
      description: n.data.description,
      nodeType: n.type,
    } satisfies CanvasNodeData,
  }));

  const edges: Edge[] = canvas.architecture.edges
    .filter(
      (e) =>
        canvas.architecture.nodes.some((n) => n.id === e.source) &&
        canvas.architecture.nodes.some((n) => n.id === e.target),
    )
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: "smoothstep",
    }));

  const laidOutNodes = needsAutoLayout(canvas.architecture.nodes)
    ? layoutNodes(nodes, edges)
    : nodes;

  return { nodes: laidOutNodes, edges };
}

function flowToCanvas(
  nodes: Node[],
  edges: Edge[],
  designSystem: CanvasData["designSystem"],
): CanvasData {
  return {
    architecture: {
      nodes: nodes.map((n) => {
        const data = n.data as CanvasNodeData;
        return {
          id: n.id,
          type: data.nodeType,
          position: n.position,
          data: { label: data.label, description: data.description ?? "" },
        };
      }),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === "string" ? e.label : "",
      })),
    },
    designSystem,
  };
}

const NODE_PALETTE: { type: NodeType; label: string }[] = [
  { type: "service", label: "Service" },
  { type: "database", label: "Database" },
  { type: "api", label: "API" },
  { type: "ui", label: "UI" },
  { type: "user", label: "User" },
  { type: "agent", label: "Agent" },
  { type: "model", label: "Model" },
];

export function ProjectCanvas({
  projectId,
  initialCanvas,
}: {
  projectId: string;
  initialCanvas: CanvasData;
}) {
  const [tab, setTab] = useState<"architecture" | "design">("architecture");
  const [validationOpen, setValidationOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const { sidebarOpen, setSidebarOpen } = useWorkspaceLayout();
  const preFocusRef = useRef<{ sidebar: boolean; validation: boolean } | null>(
    null,
  );
  const [designSystem] = useState(initialCanvas.designSystem);
  const initial = useMemo(() => canvasToFlow(initialCanvas), [initialCanvas]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const validateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodeIdRef = useRef(0);
  const userEditedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const mountedRef = useRef(false);

  const persist = useCallback(
    (n: Node[], e: Edge[]) => {
      const canvas = flowToCanvas(n, e, designSystem);
      fetch(`/api/projects/${projectId}/canvas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(canvas),
      }).catch(console.error);
    },
    [projectId, designSystem],
  );

  const validate = useCallback(
    (n: Node[], e: Edge[]) => {
      const canvas = flowToCanvas(n, e, designSystem);
      fetch(`/api/projects/${projectId}/validate-canvas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(canvas),
      })
        .then((r) => r.json())
        .then((data: { issues: ValidationIssue[] }) => {
          setIssues(data.issues ?? []);
          if (isDraggingRef.current) return;
          const errorIds = new Set(
            data.issues
              ?.filter((i) => i.nodeId && i.severity === "error")
              .map((i) => i.nodeId!),
          );
          const warnIds = new Set(
            data.issues
              ?.filter((i) => i.nodeId && i.severity === "warning")
              .map((i) => i.nodeId!),
          );
          setNodes((prev) =>
            prev.map((node) => ({
              ...node,
              data: {
                ...(node.data as CanvasNodeData),
                hasError: errorIds.has(node.id),
                hasWarning: warnIds.has(node.id),
              },
            })),
          );
        })
        .catch(console.error);
    },
    [projectId, designSystem, setNodes],
  );

  const scheduleSave = useCallback(
    (n: Node[], e: Edge[]) => {
      if (!userEditedRef.current) return;
      clearTimeout(saveTimer.current ?? undefined);
      saveTimer.current = setTimeout(() => persist(n, e), 500);
      clearTimeout(validateTimer.current ?? undefined);
      validateTimer.current = setTimeout(() => validate(n, e), 1000);
    },
    [persist, validate],
  );

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      validateTimer.current = setTimeout(
        () => validate(nodes, edges),
        500,
      );
      return () => {
        clearTimeout(validateTimer.current ?? undefined);
      };
    }
    scheduleSave(nodes, edges);
    return () => {
      clearTimeout(saveTimer.current ?? undefined);
      clearTimeout(validateTimer.current ?? undefined);
    };
  }, [nodes, edges, scheduleSave, validate]);

  const onConnect = useCallback(
    (connection: Connection) => {
      userEditedRef.current = true;
      setEdges((eds) => {
        const next = addEdge(
          {
            ...connection,
            id: `e-${connection.source}-${connection.sourceHandle ?? "s"}-${connection.target}-${connection.targetHandle ?? "t"}`,
            type: "smoothstep",
          },
          eds,
        );
        return next;
      });
    },
    [setEdges],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      userEditedRef.current = true;
      if (changes.some((change) => change.type === "position" && change.dragging)) {
        isDraggingRef.current = true;
      }
      if (
        changes.some(
          (change) => change.type === "position" && change.dragging === false,
        )
      ) {
        isDraggingRef.current = false;
      }
      onNodesChange(changes);
    },
    [onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (...args: Parameters<typeof onEdgesChange>) => {
      userEditedRef.current = true;
      onEdgesChange(...args);
    },
    [onEdgesChange],
  );

  function addNode(type: NodeType) {
    userEditedRef.current = true;
    nodeIdRef.current += 1;
    const id = `${type}-${nodeIdRef.current}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type: "canvasNode",
        position: { x: 100 + prev.length * 20, y: 100 + prev.length * 20 },
        data: {
          label: `New ${type}`,
          nodeType: type,
        } satisfies CanvasNodeData,
      },
    ]);
  }

  function deleteSelected() {
    if (!selectedNodeId) return;
    userEditedRef.current = true;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) =>
      prev.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId,
      ),
    );
    setSelectedNodeId(undefined);
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const enterFocusMode = useCallback(() => {
    preFocusRef.current = {
      sidebar: sidebarOpen,
      validation: validationOpen,
    };
    setSidebarOpen(false);
    setValidationOpen(false);
    setFocusMode(true);
  }, [sidebarOpen, validationOpen, setSidebarOpen]);

  const exitFocusMode = useCallback(() => {
    setFocusMode(false);
    const previous = preFocusRef.current;
    if (previous) {
      setSidebarOpen(previous.sidebar);
      setValidationOpen(previous.validation);
      preFocusRef.current = null;
    }
  }, [setSidebarOpen]);

  const toggleFocusMode = useCallback(() => {
    if (focusMode) {
      exitFocusMode();
    } else {
      enterFocusMode();
    }
  }, [focusMode, enterFocusMode, exitFocusMode]);

  useEffect(() => {
    if (!focusMode) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        exitFocusMode();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [focusMode, exitFocusMode]);

  const canvasBody = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      {tab === "architecture" ? (
        <>
          <div className="relative min-h-[min(50vh,28rem)] flex-1 lg:min-h-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable
              elementsSelectable
              panOnScroll
              panOnScrollMode={PanOnScrollMode.Free}
              zoomOnScroll={false}
              zoomOnPinch
              panOnDrag={false}
              fitView
              className="h-full w-full"
            >
              <Background />
              <Controls className="!bg-white dark:!bg-zinc-900" />
              <MiniMap
                className="!bg-zinc-900"
                nodeColor="#71717a"
                maskColor="rgba(0,0,0,0.6)"
              />
            </ReactFlow>
          </div>
          {focusMode ? null : validationOpen ? (
            <div className="flex max-h-[min(40vh,20rem)] min-h-0 w-full shrink-0 flex-col border-t border-zinc-200 dark:border-zinc-800 lg:max-h-none lg:h-full lg:w-64 lg:border-t-0 lg:border-l xl:w-72">
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <h3 className="text-sm font-semibold">Validation</h3>
                <button
                  type="button"
                  onClick={() => setValidationOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                  aria-label="Hide validation panel"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <ValidationPanel
                  issues={issues}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                />
              </div>
            </div>
          ) : (
            <div className="flex shrink-0 flex-col items-center border-t border-zinc-200 py-2 dark:border-zinc-800 lg:h-full lg:w-10 lg:border-t-0 lg:border-l lg:py-3">
              <button
                type="button"
                onClick={() => setValidationOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                aria-label="Show validation panel"
                title="Show validation"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {(errorCount > 0 || warningCount > 0) && (
                <div className="mt-2 flex flex-col items-center gap-1 lg:mt-3">
                  {errorCount > 0 && (
                    <span
                      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1 text-[10px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
                      title={`${errorCount} error${errorCount === 1 ? "" : "s"}`}
                    >
                      {errorCount}
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span
                      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      title={`${warningCount} warning${warningCount === 1 ? "" : "s"}`}
                    >
                      {warningCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden">
          <DesignSystemPanel
            canvas={{
              architecture: flowToCanvas(nodes, edges, designSystem).architecture,
              designSystem,
            }}
          />
        </div>
      )}
    </div>
  );

  const canvasToolbar = (
    <div className="flex shrink-0 flex-col gap-1.5 border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-800 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
      <TabNav
        tabs={[
          { id: "architecture", label: "Architecture" },
          { id: "design", label: "Design system" },
        ]}
        active={tab}
        onChange={(id) => setTab(id as "architecture" | "design")}
        className="border-b-0"
      />
      {tab === "architecture" && (
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            <p className="hidden shrink-0 text-xs text-zinc-500 xl:block">
              Scroll to pan · Pinch to zoom · Drag nodes · Drag from dots to
              connect
            </p>
            {NODE_PALETTE.map((item) => (
              <Button
                key={item.type}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 shrink-0 px-2 text-xs whitespace-nowrap"
                onClick={() => addNode(item.type)}
              >
                + {item.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 px-2 text-xs whitespace-nowrap"
              onClick={deleteSelected}
              disabled={!selectedNodeId}
            >
              Delete
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2"
            onClick={toggleFocusMode}
            aria-label={focusMode ? "Exit fullscreen" : "Enter fullscreen"}
            title={
              focusMode
                ? "Exit fullscreen (Esc)"
                : "Fullscreen — hides sidebar and validation"
            }
          >
            {focusMode ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">
        {canvasToolbar}
        {canvasBody}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {canvasToolbar}
      {canvasBody}
    </div>
  );
}
