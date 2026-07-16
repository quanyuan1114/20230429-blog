import { NotesBrowser } from "@/app/components/notes-browser";
import { PageAmbient } from "@/app/components/page-ambient";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export default function NotesPage() {
  return (
    <div className="site-shell inner-shell">
      <PageAmbient />
      <SiteHeader active="notes" />
      <main className="container inner-main">
        <header className="inner-hero">
          <p className="eyebrow">Learning notes · Markdown knowledge base</p>
          <div><h1>学习笔记</h1><p>把零散知识变成可检索、可复用、可继续推演的长期记忆。</p></div>
          <a href="/notes/editor">写笔记 <span>↗</span></a>
        </header>
        <NotesBrowser type="note" />
      </main>
      <SiteFooter />
    </div>
  );
}
