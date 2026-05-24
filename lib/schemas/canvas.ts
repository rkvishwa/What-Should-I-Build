import { z } from "zod";

export const nodeTypeSchema = z.enum([
  "service",
  "database",
  "api",
  "ui",
  "user",
  "agent",
  "model",
  "designToken",
  "component",
]);

export const flowNodeSchema = z.object({
  id: z.string(),
  type: nodeTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    label: z.string(),
    description: z.string(),
  }),
});

export const flowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string(),
});

export const canvasSchema = z.object({
  architecture: z.object({
    nodes: z.array(flowNodeSchema).max(30),
    edges: z.array(flowEdgeSchema).max(50),
  }),
  designSystem: z.object({
    tokens: z.object({
      colors: z.array(z.object({ name: z.string(), value: z.string() })),
      typography: z.array(z.object({ name: z.string(), value: z.string() })),
      spacing: z.array(z.object({ name: z.string(), value: z.string() })),
      radius: z.array(z.object({ name: z.string(), value: z.string() })),
    }),
    components: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          variants: z.array(z.string()),
        }),
      )
      .max(15),
  }),
});

export const validationIssueSchema = z.object({
  nodeId: z.string().nullable(),
  severity: z.enum(["error", "warning", "info"]),
  message: z.string(),
});

export type CanvasData = z.infer<typeof canvasSchema>;
export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowEdge = z.infer<typeof flowEdgeSchema>;
export type ValidationIssue = z.infer<typeof validationIssueSchema>;
export type NodeType = z.infer<typeof nodeTypeSchema>;
