export type PromptVersion = { id: string; content: string; savedAt: string };
export type Prompt = {
  id: string; title: string; description: string; content: string; category: string;
  tags: string[]; favorite: boolean; createdAt: string; updatedAt: string; versions: PromptVersion[];
};
export type PromptDraft = Pick<Prompt, "title" | "description" | "content" | "category" | "tags" | "favorite">;

export function extractVariables(content: string): string[] {
  return [...new Set(Array.from(content.matchAll(/{{\s*([\w.-]+)\s*}}/g), m => m[1]))];
}
export function renderTemplate(content: string, values: Record<string, string>): string {
  return content.replace(/{{\s*([\w.-]+)\s*}}/g, (match, key: string) => values[key] ?? match);
}
export function makeVersion(content: string): PromptVersion {
  return { id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()), content, savedAt: new Date().toISOString() };
}
export function createPrompt(draft: PromptDraft): Prompt {
  const now = new Date().toISOString();
  return { ...draft, id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()), createdAt: now, updatedAt: now, versions: [makeVersion(draft.content)] };
}
export function exportPrompts(prompts: Prompt[]): string {
  return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), prompts }, null, 2);
}
export function parsePromptImport(raw: string): Prompt[] {
  const parsed: unknown = JSON.parse(raw);
  const rows = Array.isArray(parsed) ? parsed : (parsed as { prompts?: unknown })?.prompts;
  if (!Array.isArray(rows)) throw new Error("文件格式不正确：找不到 prompts 数组");
  return rows.map((item, index) => {
    const p = item as Partial<Prompt>;
    if (!p || typeof p.title !== "string" || typeof p.content !== "string") throw new Error(`第 ${index + 1} 条提示词缺少 title 或 content`);
    const now = new Date().toISOString();
    return {
      id: typeof p.id === "string" ? p.id : (globalThis.crypto?.randomUUID?.() ?? String(Date.now() + index)),
      title: p.title, description: typeof p.description === "string" ? p.description : "",
      content: p.content, category: typeof p.category === "string" ? p.category : "未分类",
      tags: Array.isArray(p.tags) ? p.tags.filter((x): x is string => typeof x === "string") : [],
      favorite: Boolean(p.favorite), createdAt: p.createdAt ?? now, updatedAt: p.updatedAt ?? now,
      versions: Array.isArray(p.versions) ? p.versions : [makeVersion(p.content)]
    } satisfies Prompt;
  });
}
export function filterPrompts(prompts: Prompt[], query: string, category: string, favoritesOnly = false): Prompt[] {
  const q = query.trim().toLocaleLowerCase();
  return prompts.filter(p => {
    const matchesQuery = !q || [p.title, p.description, p.content, p.category, ...p.tags].join(" ").toLocaleLowerCase().includes(q);
    return matchesQuery && (category === "全部" || p.category === category) && (!favoritesOnly || p.favorite);
  }).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt.localeCompare(a.updatedAt));
}
