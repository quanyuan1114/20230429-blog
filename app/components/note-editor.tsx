"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  createSlug,
  isValidSlug,
  parseContentDocument,
  serializeContentDocument,
  type ContentDocument,
  type ContentType,
} from "@/lib/content-format";
import { MarkdownPreview } from "./markdown-preview";

type Draft = Omit<ContentDocument, "tags"> & { tags: string };

function blankDraft(type: ContentType): Draft {
  const now = new Date().toISOString();
  return {
    type,
    slug: createSlug(type),
    title: "",
    summary: "",
    markdown: type === "note" ? "# 新笔记\n\n从这里开始记录你的想法。" : "# 新心得\n\n这次学习改变了我哪些理解？",
    tags: "",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

function documentToDraft(document: ContentDocument): Draft {
  return { ...document, tags: document.tags.join(", ") };
}

function draftToDocument(draft: Draft): ContentDocument {
  return {
    ...draft,
    tags: draft.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
  };
}

function draftStorageKey(type: ContentType, slug: string) {
  return `firefly-unsaved-${type}-${slug}`;
}

export function NoteEditor({ initialType = "note" }: { initialType?: ContentType }) {
  const [type, setType] = useState<ContentType>(initialType);
  const [documents, setDocuments] = useState<ContentDocument[]>([]);
  const [draft, setDraft] = useState<Draft>(() => blankDraft(type));
  const [message, setMessage] = useState("正在连接 GitHub 内容库…");
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);

  const payload = useMemo(() => draftToDocument(draft), [draft]);

  async function loadDocuments(nextType: ContentType, preferredSlug?: string) {
    setMessage("正在从 GitHub 读取内容…");
    setConflict(false);
    const response = await fetch(`/api/content?type=${nextType}&scope=editor`, { cache: "no-store" });
    if (response.status === 401) {
      window.location.href = "/editor/login?returnTo=/notes/editor";
      return;
    }
    const data = (await response.json()) as { documents?: ContentDocument[]; error?: string };
    if (!response.ok) throw new Error(data.error || "读取内容失败。");
    const nextDocuments = data.documents ?? [];
    setDocuments(nextDocuments);

    const activeSlug = preferredSlug || window.localStorage.getItem(`firefly-unsaved-active-${nextType}`) || "";
    const savedDocument = nextDocuments.find((document) => document.slug === activeSlug) || nextDocuments[0];
    const localKey = activeSlug ? draftStorageKey(nextType, activeSlug) : "";
    const localDraft = localKey ? window.localStorage.getItem(localKey) : null;
    if (localDraft) {
      try {
        setDraft(JSON.parse(localDraft) as Draft);
        setMessage("已恢复浏览器中的未保存内容");
        return;
      } catch {
        window.localStorage.removeItem(localKey);
      }
    }
    setDraft(savedDocument ? documentToDraft(savedDocument) : blankDraft(nextType));
    setMessage("已连接 GitHub 内容库");
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadDocuments(type).catch((error: Error) => setMessage(error.message));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [type]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(draftStorageKey(draft.type, draft.slug), JSON.stringify(draft));
      window.localStorage.setItem(`firefly-unsaved-active-${draft.type}`, draft.slug);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [draft]);

  function selectDocument(document: ContentDocument) {
    const local = window.localStorage.getItem(draftStorageKey(document.type, document.slug));
    if (local) {
      try {
        setDraft(JSON.parse(local) as Draft);
        setMessage("已恢复这篇内容的本地修改");
        return;
      } catch {
        window.localStorage.removeItem(draftStorageKey(document.type, document.slug));
      }
    }
    setDraft(documentToDraft(document));
    setMessage("已载入 GitHub 文件");
    setConflict(false);
  }

  function switchType(nextType: ContentType) {
    if (nextType === type) return;
    setType(nextType);
  }

  async function save() {
    if (!draft.title.trim()) { setMessage("请先填写标题"); return; }
    if (!isValidSlug(draft.slug)) { setMessage("slug 只能包含小写字母、数字和连字符"); return; }
    setSaving(true); setMessage("正在提交到 GitHub…"); setConflict(false);
    try {
      const response = await fetch(`/api/content/${draft.type}/${encodeURIComponent(draft.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { document?: ContentDocument; error?: string };
      if (response.status === 409) {
        setConflict(true);
        throw new Error(data.error || "远端文件发生冲突。");
      }
      if (!response.ok || !data.document) throw new Error(data.error || "保存失败。");
      const saved = data.document;
      window.localStorage.removeItem(draftStorageKey(draft.type, draft.slug));
      window.localStorage.removeItem(`firefly-unsaved-active-${draft.type}`);
      setDraft(documentToDraft(saved));
      setDocuments((current) => [saved, ...current.filter((item) => item.slug !== saved.slug)]);
      setMessage(saved.status === "published" ? "已提交并公开发布" : "草稿已提交到公开 GitHub 仓库");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败。");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft.sha || !window.confirm("确定删除这个 GitHub Markdown 文件吗？此操作会产生删除提交。")) return;
    const response = await fetch(
      `/api/content/${draft.type}/${encodeURIComponent(draft.slug)}?sha=${encodeURIComponent(draft.sha)}`,
      { method: "DELETE" },
    );
    const data = (await response.json()) as { error?: string };
    if (response.status === 409) { setConflict(true); setMessage(data.error || "远端文件发生冲突。"); return; }
    if (!response.ok) { setMessage(data.error || "删除失败。"); return; }
    window.localStorage.removeItem(draftStorageKey(draft.type, draft.slug));
    const remaining = documents.filter((document) => document.slug !== draft.slug);
    setDocuments(remaining);
    setDraft(remaining[0] ? documentToDraft(remaining[0]) : blankDraft(type));
    setMessage("文件已从 GitHub 删除");
  }

  function importMarkdown(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((raw) => {
      try {
        const imported = parseContentDocument(raw);
        setType(imported.type);
        setDraft(documentToDraft({ ...imported, sha: undefined }));
      } catch {
        setDraft((current) => ({
          ...current,
          title: current.title || file.name.replace(/\.md$/i, ""),
          markdown: raw,
        }));
      }
      setMessage(`已导入 ${file.name}，点击保存后提交到 GitHub`);
    });
    event.target.value = "";
  }

  function exportMarkdown() {
    const blob = new Blob([serializeContentDocument(payload)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${draft.slug}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await fetch("/api/editor/logout", { method: "POST" });
    window.location.href = "/notes";
  }

  return (
    <div className="editor-shell">
      <aside className="editor-sidebar">
        <div className="editor-owner"><span>OWNER MODE</span><strong>GitHub Markdown Editor</strong></div>
        <div className="editor-type-tabs" aria-label="内容类型">
          <button type="button" className={type === "note" ? "active" : ""} onClick={() => switchType("note")}>学习笔记</button>
          <button type="button" className={type === "reflection" ? "active" : ""} onClick={() => switchType("reflection")}>学习心得</button>
        </div>
        <button className="new-note-button" type="button" onClick={() => { setDraft(blankDraft(type)); setConflict(false); setMessage("新建内容"); }}>＋ 新建{type === "note" ? "笔记" : "心得"}</button>
        <div className="editor-note-list">
          {documents.map((document) => (
            <button type="button" className={draft.slug === document.slug ? "active" : ""} onClick={() => selectDocument(document)} key={document.slug}>
              <span>{document.status === "published" ? "已发布" : "公开仓库草稿"}</span>
              <strong>{document.title}</strong>
            </button>
          ))}
        </div>
        <a href="/editor/password" className="editor-signout">修改编辑密码</a>
        <button type="button" className="editor-logout" onClick={logout}>退出编辑模式</button>
      </aside>

      <main className="editor-workspace">
        <div className="editor-public-warning">
          <strong>公开仓库提醒</strong>
          <span>即使保存为“草稿”，Markdown 文件和提交历史也会在 GitHub 上公开。</span>
        </div>
        <div className="editor-toolbar">
          <div><span className="status-dot" />{message}</div>
          <div className="editor-actions">
            {conflict && <button type="button" onClick={() => loadDocuments(type, draft.slug)}>重新载入远端</button>}
            <label className="file-action">导入 .md<input type="file" accept=".md,text/markdown" onChange={importMarkdown} /></label>
            <button type="button" onClick={exportMarkdown}>导出 .md</button>
            {draft.sha && <button className="danger-action" type="button" onClick={remove}>删除</button>}
            <button className="save-action" type="button" onClick={save} disabled={saving}>{saving ? "提交中" : draft.status === "published" ? "保存并发布" : "保存草稿"}</button>
          </div>
        </div>

        <div className="editor-meta">
          <input aria-label="标题" placeholder={type === "note" ? "笔记标题" : "心得标题"} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          <input aria-label="摘要" placeholder="一句话摘要（可选）" value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} />
          <div className="editor-meta-row">
            <input aria-label="slug" placeholder="url-slug" value={draft.slug} disabled={Boolean(draft.sha)} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
            <input aria-label="标签" placeholder="标签，以逗号分隔" value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} />
            <select aria-label="发布状态" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Draft["status"] })}>
              <option value="draft">草稿（GitHub 仍公开）</option>
              <option value="published">公开发布</option>
            </select>
          </div>
        </div>

        <div className="editor-columns">
          <section><div className="editor-pane-label">MARKDOWN</div><textarea aria-label="Markdown 内容" spellCheck={false} value={draft.markdown} onChange={(event) => setDraft({ ...draft, markdown: event.target.value })} /></section>
          <section><div className="editor-pane-label">PREVIEW</div><div className="editor-preview"><MarkdownPreview content={draft.markdown} /></div></section>
        </div>
      </main>
    </div>
  );
}
