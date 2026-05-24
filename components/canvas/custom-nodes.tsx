"use client";

import { memo, useCallback, useRef, useState } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  useStoreApi,
  type NodeProps,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { NodeType } from "@/lib/schemas/canvas";

const nodeColors: Record<NodeType, string> = {
  service: "border-blue-500 bg-blue-50 dark:bg-blue-950",
  database: "border-purple-500 bg-purple-50 dark:bg-purple-950",
  api: "border-cyan-500 bg-cyan-50 dark:bg-cyan-950",
  ui: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  user: "border-zinc-500 bg-zinc-50 dark:bg-zinc-900",
  agent: "border-amber-500 bg-amber-50 dark:bg-amber-950",
  model: "border-orange-500 bg-orange-50 dark:bg-orange-950",
  designToken: "border-pink-500 bg-pink-50 dark:bg-pink-950",
  component: "border-indigo-500 bg-indigo-50 dark:bg-indigo-950",
};

const handleClassName =
  "z-10 !h-3 !w-3 !border-2 !bg-zinc-400 !pointer-events-auto";

export type CanvasNodeData = {
  label: string;
  description?: string;
  nodeType: NodeType;
  hasError?: boolean;
  hasWarning?: boolean;
};

type DragState = {
  pointerId: number;
  startFlow: { x: number; y: number };
  origin: { x: number; y: number };
  lastPosition: { x: number; y: number };
};

function CanvasNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as CanvasNodeData;
  const colorClass = nodeColors[nodeData.nodeType] ?? nodeColors.service;
  const { screenToFlowPosition } = useReactFlow();
  const store = useStoreApi();
  const dragState = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const emitPosition = useCallback(
    (position: { x: number; y: number }, dragging: boolean) => {
      store.getState().triggerNodeChanges([
        { id, type: "position", position, dragging },
      ]);
    },
    [id, store],
  );

  const finishDrag = useCallback(
    (target: EventTarget, pointerId: number) => {
      const state = dragState.current;
      if (!state || state.pointerId !== pointerId) return;

      dragState.current = null;
      setIsDragging(false);
      if (target instanceof Element) {
        try {
          target.releasePointerCapture(pointerId);
        } catch {
          // Pointer capture may already be released.
        }
      }

      emitPosition(state.lastPosition, false);
    },
    [emitPosition],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      if (store.getState().connection.inProgress) return;

      const node = store.getState().nodeLookup.get(id)?.internals.userNode;
      if (!node) return;

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);

      dragState.current = {
        pointerId: event.pointerId,
        startFlow: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
        origin: { ...node.position },
        lastPosition: { ...node.position },
      };

      setIsDragging(true);
      emitPosition(node.position, true);
    },
    [emitPosition, id, screenToFlowPosition, store],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = dragState.current;
      if (!state || state.pointerId !== event.pointerId) return;

      const currentFlow = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const position = {
        x: state.origin.x + (currentFlow.x - state.startFlow.x),
        y: state.origin.y + (currentFlow.y - state.startFlow.y),
      };

      state.lastPosition = position;
      emitPosition(position, true);
    },
    [emitPosition, screenToFlowPosition],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(event.currentTarget, event.pointerId);
    },
    [finishDrag],
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(event.currentTarget, event.pointerId);
    },
    [finishDrag],
  );

  return (
    <div
      className={cn(
        "relative min-w-[120px] rounded-lg border-2 shadow-sm",
        colorClass,
        selected && "ring-2 ring-zinc-400",
        nodeData.hasError && "ring-2 ring-red-500",
        nodeData.hasWarning && !nodeData.hasError && "ring-2 ring-amber-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={handleClassName}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={handleClassName}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={handleClassName}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={handleClassName}
      />

      <div
        className={cn(
          "nopan touch-none px-3 py-2 select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <p className="text-xs font-medium uppercase text-zinc-500">
          {nodeData.nodeType}
        </p>
        <p className="text-sm font-semibold">{nodeData.label}</p>
        {nodeData.description && (
          <p className="mt-1 text-xs text-zinc-500">{nodeData.description}</p>
        )}
      </div>
    </div>
  );
}

export const CanvasNode = memo(CanvasNodeComponent);

export const nodeTypes = {
  canvasNode: CanvasNode,
};
