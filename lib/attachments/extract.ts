import { generateText } from "ai";
import { getLanguageModel } from "@/lib/ai/client";
import { DEFAULT_MODEL_TIER, type ModelTier } from "@/lib/ai/model-tiers";

const TEXT_EXTENSIONS = [".txt", ".md", ".json", ".csv"];
const IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

export async function extractFromFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  modelTier: ModelTier = DEFAULT_MODEL_TIER,
): Promise<string> {
  const ext = getExtension(filename);

  if (
    TEXT_EXTENSIONS.includes(ext) ||
    mimeType.startsWith("text/") ||
    mimeType === "application/json"
  ) {
    return buffer.toString("utf-8").slice(0, 8000);
  }

  if (mimeType === "application/pdf" || ext === ".pdf") {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return (result.text ?? "").slice(0, 8000);
    } catch {
      return "[Could not extract PDF text — file stored for reference]";
    }
  }

  if (IMAGE_MIMES.includes(mimeType)) {
    try {
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const { text } = await generateText({
        model: getLanguageModel(modelTier),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract project themes, constraints, product ideas, and any useful context from this image for a developer project idea generator. Be concise and structured.",
              },
              { type: "image", image: dataUrl },
            ],
          },
        ],
      });
      return text.slice(0, 8000);
    } catch {
      return "[Could not extract from image — ensure your LLM supports vision. File stored for reference]";
    }
  }

  return "[Unsupported type — file stored for reference]";
}
