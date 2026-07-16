export const CONTENT_TYPES = ["note", "reflection"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type ContentStatus = "draft" | "published";

export type ContentDocument = {
  type: ContentType;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  markdown: string;
  sha?: string;
};

export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPES.includes(value as ContentType);
}

export function isValidSlug(value: string) {
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
}

export function createSlug(type: ContentType) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${type}-${date}-${suffix}`;
}

function parseScalar(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed) as string;
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

export function parseContentDocument(raw: string, sha?: string): ContentDocument {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Markdown 文件缺少有效的 frontmatter。\n");

  const values = new Map<string, string>();
  const tags: string[] = [];
  let listKey = "";

  for (const line of match[1].split("\n")) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey === "tags") {
      tags.push(parseScalar(listItem[1]));
      continue;
    }
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!field) continue;
    listKey = field[1];
    if (field[2]) values.set(field[1], parseScalar(field[2]));
  }

  const typeValue = values.get("type") ?? "";
  const slug = values.get("slug") ?? "";
  const statusValue = values.get("status") ?? "draft";
  if (!isContentType(typeValue)) throw new Error("内容类型无效。\n");
  if (!isValidSlug(slug)) throw new Error("内容 slug 无效。\n");

  return {
    type: typeValue,
    slug,
    title: values.get("title")?.trim() || slug,
    summary: values.get("summary")?.trim() || "",
    tags: tags.filter(Boolean).slice(0, 8),
    status: statusValue === "published" ? "published" : "draft",
    createdAt: values.get("createdAt") || new Date(0).toISOString(),
    updatedAt: values.get("updatedAt") || values.get("createdAt") || new Date(0).toISOString(),
    markdown: match[2].replace(/^\n+/, ""),
    sha,
  };
}

export function serializeContentDocument(document: ContentDocument) {
  const tags = document.tags
    .map((tag) => `  - ${JSON.stringify(tag)}`)
    .join("\n");
  const tagSection = tags ? `tags:\n${tags}` : "tags: []";

  return [
    "---",
    `type: ${document.type}`,
    `title: ${JSON.stringify(document.title)}`,
    `slug: ${document.slug}`,
    `summary: ${JSON.stringify(document.summary)}`,
    tagSection,
    `status: ${document.status}`,
    `createdAt: ${document.createdAt}`,
    `updatedAt: ${document.updatedAt}`,
    "---",
    "",
    document.markdown.replace(/\r\n/g, "\n").replace(/^\n+/, ""),
  ].join("\n");
}

export function normalizeContentDocument(
  input: Partial<ContentDocument>,
  type: ContentType,
  slug: string,
) {
  if (!isValidSlug(slug)) throw new Error("slug 只能包含小写字母、数字和连字符，最长 64 个字符。");
  const title = input.title?.trim() ?? "";
  if (!title) throw new Error("请输入标题。");
  const now = new Date().toISOString();

  return {
    type,
    slug,
    title: title.slice(0, 120),
    summary: (input.summary ?? "").trim().slice(0, 280),
    tags: (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
    status: input.status === "published" ? "published" : "draft",
    createdAt: input.createdAt || now,
    updatedAt: now,
    markdown: input.markdown ?? "",
    sha: input.sha,
  } satisfies ContentDocument;
}
