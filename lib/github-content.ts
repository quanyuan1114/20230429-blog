import { env } from "cloudflare:workers";
import {
  isContentType,
  normalizeContentDocument,
  parseContentDocument,
  serializeContentDocument,
  type ContentDocument,
  type ContentType,
} from "./content-format";

const DEFAULT_REPOSITORY = "quanyuan1114/20230429-blog";
const DEFAULT_BRANCH = "main";

type GithubFile = {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
};

function runtimeEnv() {
  return env as unknown as Record<string, string | undefined>;
}

function settings() {
  const repository = runtimeEnv().GITHUB_CONTENT_REPOSITORY || DEFAULT_REPOSITORY;
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) throw new Error("GITHUB_CONTENT_REPOSITORY 配置无效。");
  return {
    owner,
    repo,
    branch: runtimeEnv().GITHUB_CONTENT_BRANCH || DEFAULT_BRANCH,
    token: runtimeEnv().GITHUB_CONTENT_TOKEN,
  };
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function base64ToUtf8(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function utf8ToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

async function githubRequest(path: string, init: RequestInit = {}) {
  const { token } = settings();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

function directoryFor(type: ContentType) {
  return type === "note" ? "content/notes" : "content/reflections";
}

function filePath(type: ContentType, slug: string) {
  return `${directoryFor(type)}/${slug}.md`;
}

async function readGithubFile(path: string) {
  const { owner, repo, branch } = settings();
  const response = await githubRequest(
    `/repos/${owner}/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`,
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub 读取失败（${response.status}）。`);
  const file = (await response.json()) as GithubFile;
  if (!file.content || file.encoding !== "base64") throw new Error("GitHub 返回的文件内容无效。");
  return { raw: base64ToUtf8(file.content), sha: file.sha };
}

export async function listContent(type: ContentType) {
  const { owner, repo, branch } = settings();
  const directory = directoryFor(type);
  const response = await githubRequest(
    `/repos/${owner}/${repo}/contents/${encodePath(directory)}?ref=${encodeURIComponent(branch)}`,
  );
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`GitHub 内容列表读取失败（${response.status}）。`);
  const entries = (await response.json()) as GithubFile[];
  const files = entries.filter((entry) => entry.type === "file" && entry.name.endsWith(".md"));
  const documents = await Promise.all(
    files.map(async (file) => {
      try {
        const source = await readGithubFile(file.path);
        if (!source) return null;
        const document = parseContentDocument(source.raw, source.sha);
        return document.type === type ? document : null;
      } catch {
        return null;
      }
    }),
  );
  return documents
    .filter((document): document is ContentDocument => Boolean(document))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getContent(type: ContentType, slug: string) {
  const source = await readGithubFile(filePath(type, slug));
  if (!source) return null;
  const document = parseContentDocument(source.raw, source.sha);
  return document.type === type ? document : null;
}

export async function saveContent(
  typeValue: string,
  slug: string,
  input: Partial<ContentDocument>,
) {
  if (!isContentType(typeValue)) throw new Error("内容类型无效。");
  const document = normalizeContentDocument(input, typeValue, slug);
  const { owner, repo, branch, token } = settings();
  if (!token) throw new Error("站点尚未配置 GitHub 内容写入令牌。");

  const path = filePath(typeValue, slug);
  const payload: Record<string, unknown> = {
    message: `content(${typeValue}s): ${document.status === "published" ? "publish" : "save"} ${slug}`,
    content: utf8ToBase64(serializeContentDocument(document)),
    branch,
  };
  if (document.sha) payload.sha = document.sha;

  const response = await githubRequest(
    `/repos/${owner}/${repo}/contents/${encodePath(path)}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
  if (response.status === 409 || response.status === 422) {
    const current = await getContent(typeValue, slug);
    return { conflict: true as const, current };
  }
  if (!response.ok) throw new Error(`GitHub 保存失败（${response.status}）。`);
  const result = (await response.json()) as { content?: { sha?: string } };
  return {
    conflict: false as const,
    document: { ...document, sha: result.content?.sha },
  };
}

export async function deleteContent(typeValue: string, slug: string, sha: string) {
  if (!isContentType(typeValue)) throw new Error("内容类型无效。");
  const { owner, repo, branch, token } = settings();
  if (!token) throw new Error("站点尚未配置 GitHub 内容写入令牌。");
  const response = await githubRequest(
    `/repos/${owner}/${repo}/contents/${encodePath(filePath(typeValue, slug))}`,
    {
      method: "DELETE",
      body: JSON.stringify({
        message: `content(${typeValue}s): delete ${slug}`,
        sha,
        branch,
      }),
    },
  );
  if (response.status === 409 || response.status === 422) return { conflict: true as const };
  if (!response.ok) throw new Error(`GitHub 删除失败（${response.status}）。`);
  return { conflict: false as const };
}
