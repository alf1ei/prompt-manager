import { describe, expect, it } from "vitest";
import { extractVariables, filterPrompts, parsePromptImport, renderTemplate, type Prompt } from "./prompts";

describe("prompt utilities", () => {
  it("extracts unique template variables", () => {
    expect(extractVariables("{{name}} meets {{ topic }} and {{name}}")).toEqual(["name", "topic"]);
  });
  it("renders known variables and preserves missing ones", () => {
    expect(renderTemplate("Hi {{name}}, write about {{topic}}", { name: "Ada" })).toBe("Hi Ada, write about {{topic}}");
  });
  it("filters by title, category and favorites", () => {
    const rows = [
      { id: "1", title: "Research", description: "", content: "", category: "工作", tags: [], favorite: true, createdAt: "", updatedAt: "2025", versions: [] },
      { id: "2", title: "Email", description: "", content: "", category: "生活", tags: [], favorite: false, createdAt: "", updatedAt: "2026", versions: [] }
    ] satisfies Prompt[];
    expect(filterPrompts(rows, "research", "全部")).toHaveLength(1);
    expect(filterPrompts(rows, "", "工作", true).map(p => p.id)).toEqual(["1"]);
  });
  it("rejects malformed imports", () => {
    expect(() => parsePromptImport("{}")).toThrow("prompts 数组");
    expect(() => parsePromptImport('{"prompts":[{"title":4}]}')).toThrow("title 或 content");
  });
  it("accepts a valid import envelope", () => {
    expect(parsePromptImport('{"prompts":[{"title":"T","content":"C"}]}')[0].title).toBe("T");
  });
});
