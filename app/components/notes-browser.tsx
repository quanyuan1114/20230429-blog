"use client";

import { useEffect, useState } from "react";
import type { ContentDocument, ContentType } from "@/lib/content-format";
import { MarkdownPreview } from "./markdown-preview";

export function NotesBrowser({ type = "note" }: { type?: ContentType }) {
  const [documents, setDocuments] = useState<ContentDocument[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/content?type=${type}`)
      .then(async (response) => {
        const data = (await response.json()) as { documents?: ContentDocument[]; error?: string };
        if (!response.ok) throw new Error(data.error || "读取内容失败");
        setDocuments(data.documents ?? []);
        setSelectedSlug(data.documents?.[0]?.slug ?? null);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [type]);

  const selected = documents.find((document) => document.slug === selectedSlug) ?? null;
  const label = type === "note" ? "笔记" : "心得";

  if (loading) return <div className="notes-state">正在整理{label}…</div>;
  if (error) return <div className="notes-state error-state">暂时无法读取{label}：{error}</div>;

  if (!documents.length) {
    return (
      <div className="notes-empty-state">
        <span>EMPTY {type === "note" ? "NOTEBOOK" : "REFLECTIONS"}</span>
        <h2>第一篇{label}，从网页编辑器开始。</h2>
        <p>支持 Markdown 实时预览，保存后会写入 GitHub；设置为公开发布后才会显示在这里。</p>
        <a className="primary-link" href={`/notes/editor?type=${type}`}>进入编辑器 <b>↗</b></a>
      </div>
    );
  }

  return (
    <div className="notes-layout">
      <aside className="notes-index" aria-label={`${label}列表`}>
        {documents.map((document) => (
          <button
            type="button"
            className={selectedSlug === document.slug ? "note-index-card active" : "note-index-card"}
            onClick={() => setSelectedSlug(document.slug)}
            key={document.slug}
          >
            <span>{document.tags[0] || (type === "note" ? "学习笔记" : "学习心得")}</span>
            <strong>{document.title}</strong>
            <small>{new Date(document.updatedAt).toLocaleDateString("zh-CN")}</small>
          </button>
        ))}
      </aside>
      <section className="note-reader">
        {selected && (
          <>
            <div className="note-reader-heading">
              <div className="method-tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <h1>{selected.title}</h1>
              {selected.summary && <p>{selected.summary}</p>}
            </div>
            <MarkdownPreview content={selected.markdown} />
          </>
        )}
      </section>
    </div>
  );
}
