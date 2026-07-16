import { hasEditorSession } from "@/lib/editor-auth";
import { isContentType } from "@/lib/content-format";
import { listContent } from "@/lib/github-content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "note";
  const editorScope = url.searchParams.get("scope") === "editor";
  if (!isContentType(type)) return Response.json({ error: "内容类型无效。" }, { status: 400 });
  if (editorScope && !(await hasEditorSession(request))) {
    return Response.json({ error: "请先登录编辑器。" }, { status: 401 });
  }

  try {
    const documents = await listContent(type);
    const visible = editorScope
      ? documents
      : documents.filter((document) => document.status === "published");
    return Response.json(
      { documents: visible },
      { headers: { "Cache-Control": editorScope ? "private, no-store" : "public, max-age=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "读取内容失败。" },
      { status: 500 },
    );
  }
}
