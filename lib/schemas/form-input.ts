import { z } from "zod";
import { attachmentMetaSchema } from "./attachment";

const modelTierSchema = z.enum(["fast", "advanced"]);

const GITHUB_USERNAME_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export function normalizeGitHubUsername(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)/i,
  );
  const username = urlMatch ? urlMatch[1] : trimmed.replace(/^@/, "");

  return username || undefined;
}

const githubUsernameSchema = z.preprocess(
  normalizeGitHubUsername,
  z
    .union([
      z.undefined(),
      z
        .string()
        .regex(
          GITHUB_USERNAME_PATTERN,
          "Enter a valid GitHub username (e.g. octocat) or profile URL",
        ),
    ])
    .optional(),
);

export const formInputSchema = z
  .object({
    mode: z.enum(["profile", "context", "both"]),
    agenticCoding: z.boolean().default(false),
    aiInProduct: z.boolean().default(false),
    seedIdea: z.string().max(2000).optional(),
    attachments: z.array(attachmentMetaSchema).optional(),
    skills: z.array(z.string().min(1).max(50)).max(20).optional(),
    githubUsername: githubUsernameSchema,
    timeAvailable: z.string().min(1).max(200).optional(),
    careerGoals: z.string().max(1000).optional(),
    context: z.string().max(2000).optional(),
    modelTier: modelTierSchema.default("fast"),
  })
  .superRefine((data, ctx) => {
    const hasProfile =
      (data.skills?.length ?? 0) > 0 ||
      !!data.timeAvailable?.trim() ||
      !!data.careerGoals?.trim() ||
      !!data.githubUsername?.trim() ||
      data.agenticCoding;

    const hasContext = !!data.context?.trim();

    if (data.mode === "profile" && !hasProfile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Add at least one profile field (skills, time, goals, GitHub) or enable agentic coding.",
        path: ["skills"],
      });
    }

    if (data.mode === "context" && !hasContext) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Describe your context or theme.",
        path: ["context"],
      });
    }

    if (data.mode === "both" && !hasProfile && !hasContext) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one detail above, or turn on agentic coding.",
        path: ["mode"],
      });
    }
  });

export type FormInput = z.infer<typeof formInputSchema>;

export function shouldGenerateFive(input: FormInput): boolean {
  return (
    !!input.seedIdea?.trim() || (input.attachments?.length ?? 0) > 0
  );
}

export function getIdeaCount(input: FormInput): 3 | 5 {
  return shouldGenerateFive(input) ? 5 : 3;
}
