import { generateObject } from "ai";
import { z } from "zod";
import type { FormInput } from "@/lib/schemas/form-input";
import type { CanvasData, ValidationIssue } from "@/lib/schemas/canvas";
import { validationIssueSchema } from "@/lib/schemas/canvas";
import { getLanguageModel } from "./client";
import { getModelTierFromInput } from "./model-tiers";
import { buildValidationSystemPrompt } from "./prompts";

const validationOutputSchema = z.object({
  issues: z.array(validationIssueSchema),
});

export async function validateCanvas(
  input: FormInput,
  canvas: CanvasData,
  ideaTitle: string,
): Promise<ValidationIssue[]> {
  const { object } = await generateObject({
    model: getLanguageModel(getModelTierFromInput(input)),
    schema: validationOutputSchema,
    system: buildValidationSystemPrompt(input),
    prompt: `Validate this architecture for "${ideaTitle}":\n${JSON.stringify(canvas, null, 2)}`,
  });

  return object.issues;
}

function hasAiNodes(canvas: CanvasData): boolean {
  return canvas.architecture.nodes.some(
    (n) => n.type === "agent" || n.type === "model",
  );
}

export function quickValidateCanvas(
  input: FormInput,
  canvas: CanvasData,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(canvas.architecture.nodes.map((n) => n.id));
  const connected = new Set<string>();

  for (const edge of canvas.architecture.edges) {
    connected.add(edge.source);
    connected.add(edge.target);
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      issues.push({
        nodeId: null,
        severity: "error",
        message: `Edge ${edge.id} references missing node`,
      });
    }
  }

  for (const node of canvas.architecture.nodes) {
    if (node.type !== "user" && !connected.has(node.id)) {
      issues.push({
        nodeId: node.id,
        severity: "warning",
        message: `"${node.data.label}" is not connected to any other node`,
      });
    }
  }

  if (!input.aiInProduct && hasAiNodes(canvas)) {
    issues.push({
      nodeId: null,
      severity: "error",
      message:
        "AI/agent nodes found but AI in product is disabled. Remove agent/model nodes.",
    });
  }

  return issues;
}
