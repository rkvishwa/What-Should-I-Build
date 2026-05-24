"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  formInputSchema,
  normalizeGitHubUsername,
  type FormInput,
} from "@/lib/schemas/form-input";
import { getGitHubUsernameFromUser } from "@/lib/auth/github-username";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { Badge, Button, Input, Label, Textarea } from "@/components/ui";
import { Toggle } from "@/components/design-system/toggle";
import { FileUploadZone } from "@/components/file-upload-zone";
import { stashWorkspaceFiles } from "@/lib/client/pending-workspace-uploads";
import { useModelTier } from "@/lib/client/model-tier-context";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

type IdeaFormProps = {
  initialValues?: Partial<FormInput>;
};

function readStoredInput(): Partial<FormInput> | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = sessionStorage.getItem("wsib-last-input");
  if (!stored) return undefined;
  try {
    return JSON.parse(stored) as FormInput;
  } catch {
    return undefined;
  }
}

function hasAboutYouData(values?: Partial<FormInput>): boolean {
  return (
    (values?.skills?.length ?? 0) > 0 ||
    !!values?.githubUsername?.trim() ||
    !!values?.timeAvailable?.trim() ||
    !!values?.careerGoals?.trim() ||
    !!values?.context?.trim()
  );
}

export function IdeaForm({ initialValues: initialValuesProp }: IdeaFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthUser();
  const { modelTier } = useModelTier();

  const [agenticCoding, setAgenticCoding] = useState(
    initialValuesProp?.agenticCoding ?? false,
  );
  const [aiInProduct, setAiInProduct] = useState(
    initialValuesProp?.aiInProduct ?? false,
  );
  const [skills, setSkills] = useState<string[]>(
    initialValuesProp?.skills ?? [],
  );
  const [skillInput, setSkillInput] = useState("");
  const [githubUsername, setGithubUsername] = useState(
    initialValuesProp?.githubUsername ?? "",
  );
  const [timeAvailable, setTimeAvailable] = useState(
    initialValuesProp?.timeAvailable ?? "",
  );
  const [careerGoals, setCareerGoals] = useState(
    initialValuesProp?.careerGoals ?? "",
  );
  const [context, setContext] = useState(
    initialValuesProp?.context ?? "",
  );
  const [seedIdea, setSeedIdea] = useState(
    initialValuesProp?.seedIdea ?? "",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [aboutYouOpen, setAboutYouOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = readStoredInput();
    const merged = { ...stored, ...initialValuesProp };
    if (merged.agenticCoding !== undefined) setAgenticCoding(merged.agenticCoding);
    if (merged.aiInProduct !== undefined) setAiInProduct(merged.aiInProduct);
    if (merged.skills !== undefined) setSkills(merged.skills);
    if (merged.timeAvailable !== undefined) setTimeAvailable(merged.timeAvailable);
    if (merged.careerGoals !== undefined) setCareerGoals(merged.careerGoals);
    if (merged.context !== undefined) setContext(merged.context);
    if (merged.seedIdea !== undefined) setSeedIdea(merged.seedIdea);

    let github = merged.githubUsername?.trim() ?? "";
    if (!github && !authLoading && user) {
      github = getGitHubUsernameFromUser(user) ?? "";
    }
    if (github) setGithubUsername(github);

    if (hasAboutYouData({ ...merged, githubUsername: github })) {
      setAboutYouOpen(true);
    }
  }, [initialValuesProp, user, authLoading]);

  function normalizeGithubField() {
    const normalized = normalizeGitHubUsername(githubUsername);
    if (normalized && normalized !== githubUsername.trim()) {
      setGithubUsername(normalized);
    }
  }

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (!trimmed || skills.includes(trimmed) || skills.length >= 20) return;
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      mode: "both" as const,
      agenticCoding,
      aiInProduct,
      seedIdea: seedIdea.trim() || undefined,
      skills: skills.length ? skills : undefined,
      githubUsername: githubUsername.trim() || undefined,
      timeAvailable: timeAvailable.trim() || undefined,
      careerGoals: careerGoals.trim() || undefined,
      context: context.trim() || undefined,
      modelTier,
    };

    const parsed = formInputSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login?next=/dashboard/new");
      return;
    }

    setLoading(true);
    sessionStorage.setItem("wsib-last-input", JSON.stringify(parsed.data));

    try {
      const fd = new FormData();
      fd.append("input", JSON.stringify(parsed.data));
      fd.append("modelTier", modelTier);
      if (files.length > 0) {
        fd.append("pendingFileCount", String(files.length));
      }

      const response = await fetch("/api/workspaces", { method: "POST", body: fd });
      const data = (await response.json()) as {
        workspaceId?: string;
        error?: string;
      };

      if (response.status === 401) {
        router.push("/auth/login?next=/dashboard/new");
        return;
      }

      if (!data.workspaceId) {
        throw new Error(data.error ?? "Generation failed");
      }

      if (files.length > 0) {
        stashWorkspaceFiles(data.workspaceId, files);
      }

      router.push(`/workspace/${data.workspaceId}/generating`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-3">
        <Toggle
          id="agentic-coding"
          label="Agentic coding"
          description="Build with AI coding agents — skills become optional"
          checked={agenticCoding}
          onChange={setAgenticCoding}
        />
        <Toggle
          id="ai-in-product"
          label="AI in the product"
          description="Allow AI/agent features in the product itself (LLM, agents, models)"
          checked={aiInProduct}
          onChange={setAiInProduct}
        />
      </div>

      <section className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h3 className="text-sm font-medium">Your starting point</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            Optional — add a seed idea or files to generate{" "}
            <strong className="font-medium text-zinc-700 dark:text-zinc-300">
              5 tailored ideas
            </strong>{" "}
            instead of 3.
          </p>
        </div>
        <div className="space-y-2.5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <Label htmlFor="seed" className="block">
            Seed idea
          </Label>
          <Textarea
            id="seed"
            placeholder="e.g. A tool that turns Figma frames into React components..."
            value={seedIdea}
            onChange={(e) => setSeedIdea(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <FileUploadZone files={files} onChange={setFiles} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => setAboutYouOpen((open) => !open)}
          className="group flex w-full items-center gap-4 p-5 text-left"
          aria-expanded={aboutYouOpen ? "true" : "false"}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium leading-snug">
              About you{" "}
              <span className="font-normal text-zinc-500">
                (for personalized project ideas)
              </span>
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              Optional — skills, goals, time, or context.
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors group-hover:border-zinc-300 group-hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:group-hover:border-zinc-600 dark:group-hover:bg-zinc-800">
            {aboutYouOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </span>
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            aboutYouOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-6 border-t border-zinc-200 px-5 pb-5 pt-5 dark:border-zinc-800">
              <div className="space-y-2.5">
                <Label htmlFor="skills" className="block">
                  Skills{agenticCoding ? " (optional)" : ""}
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="skills"
                    placeholder="e.g. TypeScript, React"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                    className="min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSkill(skillInput)}
                    className="shrink-0 sm:w-auto"
                  >
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} className="gap-1 pr-1">
                        {skill}
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                          onClick={() =>
                            setSkills((prev) => prev.filter((s) => s !== skill))
                          }
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="github" className="block">
                  GitHub profile (optional)
                </Label>
                <Input
                  id="github"
                  placeholder="octocat or https://github.com/octocat"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  onBlur={normalizeGithubField}
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="time" className="block">
                  Time available
                </Label>
                <Input
                  id="time"
                  placeholder="e.g. 1 weekend, 2 weeks, 3 months"
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(e.target.value)}
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="goals" className="block">
                  Career goals
                </Label>
                <Textarea
                  id="goals"
                  placeholder="What are you trying to learn or achieve?"
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="context" className="block">
                  Anything else?
                </Label>
                <Textarea
                  id="context"
                  placeholder="e.g. weekend hackathon, side project for learning React, B2B SaaS niche..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          Sign in with GitHub or Google to create a workspace.
        </p>

        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Creating workspace..." : "Generate project ideas"}
        </Button>
      </div>
    </form>
  );
}
