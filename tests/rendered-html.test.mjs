import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "cloudflare:workers") {
      const source =
        "export const env = new Proxy({}, { get: (_, key) => globalThis.__CLOUDFLARE_TEST_ENV__?.[key] });";
      return {
        shortCircuit: true,
        url: `data:text/javascript,${encodeURIComponent(source)}`,
      };
    }
    return nextResolve(specifier, context);
  },
});

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

class FakeStatement {
  constructor(database, query) {
    this.database = database;
    this.query = query;
    this.values = [];
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  async first() {
    if (this.query.includes("FROM editor_credentials")) {
      return this.database.passwordHash ? { password_hash: this.database.passwordHash } : null;
    }
    if (this.query.includes("FROM auth_attempts")) {
      return { count: this.database.attempts.get(this.values[0]) ?? 0 };
    }
    return null;
  }

  async run() {
    if (this.query.startsWith("INSERT INTO editor_credentials")) {
      this.database.passwordHash = this.values[0];
    } else if (this.query.startsWith("UPDATE editor_credentials")) {
      this.database.passwordHash = this.values[0];
    } else if (this.query.startsWith("INSERT INTO auth_attempts")) {
      this.database.attempts.set(this.values[0], (this.database.attempts.get(this.values[0]) ?? 0) + 1);
    } else if (this.query.startsWith("DELETE FROM auth_attempts WHERE key")) {
      this.database.attempts.delete(this.values[0]);
    }
    return { success: true };
  }
}

class FakeD1 {
  constructor() {
    this.passwordHash = null;
    this.attempts = new Map();
  }

  prepare(query) {
    return new FakeStatement(this, query);
  }
}

function environment(database = new FakeD1()) {
  return {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    DB: database,
    EDITOR_SETUP_TOKEN: "one-time-setup-token",
    EDITOR_SESSION_SECRET: "test-session-secret-that-is-long-enough",
    GITHUB_CONTENT_REPOSITORY: "quanyuan1114/20230429-blog",
    GITHUB_CONTENT_BRANCH: "main",
    GITHUB_CONTENT_TOKEN: "github-test-token",
  };
}

const context = { waitUntil() {}, passThroughOnException() {} };

async function appRequest(path, options = {}, env = environment()) {
  globalThis.__CLOUDFLARE_TEST_ENV__ = env;
  return worker.fetch(new Request(`https://20230429.xyz${path}`, options), env, context);
}

test("server-renders the academic workspace and module routes", async () => {
  const response = await appRequest("/", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /个人学术工作台/);
  assert.match(html, /博士研究规划/);
  assert.match(html, /学习笔记/);
  assert.match(html, /学习心得/);
  assert.match(html, /文献阅读/);
  assert.doesNotMatch(html, /Codex is working|Your site is taking shape/);
});

test("frontmatter round-trips notes and reflections", async () => {
  const { parseContentDocument, serializeContentDocument } = await import("../lib/content-format.ts");
  const document = {
    type: "note",
    slug: "test-note",
    title: "测试标题",
    summary: "摘要",
    tags: ["电池", "时序"],
    status: "published",
    createdAt: "2026-07-16T00:00:00.000Z",
    updatedAt: "2026-07-16T00:00:00.000Z",
    markdown: "# 标题\n\n| A | B |\n|---|---|\n| 1 | 2 |",
  };
  const restored = parseContentDocument(serializeContentDocument(document), "sha-1");
  assert.equal(restored.title, document.title);
  assert.deepEqual(restored.tags, document.tags);
  assert.equal(restored.markdown, document.markdown);
  assert.equal(restored.sha, "sha-1");
});

test("independent password setup creates a secure editor session", async () => {
  const database = new FakeD1();
  const env = environment(database);
  const setup = await appRequest(
    "/api/editor/setup",
    {
      method: "POST",
      headers: { origin: "https://20230429.xyz", "content-type": "application/json" },
      body: JSON.stringify({ setupToken: "one-time-setup-token", password: "a-strong-editor-password" }),
    },
    env,
  );
  assert.equal(setup.status, 201);
  const cookie = setup.headers.get("set-cookie");
  assert.match(cookie ?? "", /HttpOnly/);
  assert.match(cookie ?? "", /Secure/);
  assert.match(cookie ?? "", /SameSite=Strict/);

  const session = await appRequest(
    "/api/editor/session",
    { headers: { cookie: cookie.split(";")[0] } },
    env,
  );
  assert.deepEqual(await session.json(), { authenticated: true, setupRequired: false });

  const invalid = await appRequest(
    "/api/editor/login",
    {
      method: "POST",
      headers: { origin: "https://20230429.xyz", "content-type": "application/json" },
      body: JSON.stringify({ password: "wrong-password" }),
    },
    env,
  );
  assert.equal(invalid.status, 401);
});

test("authenticated saves use the GitHub contents API and preserve conflict safety", async () => {
  const database = new FakeD1();
  const env = environment(database);
  const setup = await appRequest(
    "/api/editor/setup",
    {
      method: "POST",
      headers: { origin: "https://20230429.xyz", "content-type": "application/json" },
      body: JSON.stringify({ setupToken: "one-time-setup-token", password: "a-strong-editor-password" }),
    },
    env,
  );
  const cookie = setup.headers.get("set-cookie").split(";")[0];
  const realFetch = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), init };
    return Response.json({ content: { sha: "new-file-sha" } }, { status: 201 });
  };
  try {
    const response = await appRequest(
      "/api/content/note/api-test",
      {
        method: "PUT",
        headers: {
          origin: "https://20230429.xyz",
          cookie,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          type: "note",
          slug: "api-test",
          title: "API 测试",
          summary: "",
          tags: ["test"],
          status: "draft",
          markdown: "# API",
          createdAt: "2026-07-16T00:00:00.000Z",
        }),
      },
      env,
    );
    assert.equal(response.status, 200);
    assert.match(captured.url, /repos\/quanyuan1114\/20230429-blog\/contents\/content\/notes\/api-test\.md/);
    assert.equal(captured.init.method, "PUT");
    const requestBody = JSON.parse(captured.init.body);
    assert.equal(requestBody.branch, "main");
    assert.match(requestBody.message, /save api-test/);
    assert.ok(requestBody.content.length > 20);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("Markdown renderer enables GFM and skips raw HTML", async () => {
  const source = await readFile(new URL("../app/components/markdown-preview.tsx", import.meta.url), "utf8");
  assert.match(source, /remarkPlugins=\{\[remarkGfm\]\}/);
  assert.match(source, /skipHtml/);
});
