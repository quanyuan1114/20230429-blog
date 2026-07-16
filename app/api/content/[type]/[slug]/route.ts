import { hasEditorSession, isSameOrigin } from "@/lib/editor-auth";
import { isContentType, type ContentDocument } from "@/lib/content-format";
import { deleteContent, saveContent } from "@/lib/github-content";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ type: string; slug: string }> };

async function authorize(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "请求来源无效。" }, { status: 403 });
  if (!(await hasEditorSession(request))) return Response.json({ error: "请重新登录。" }, { status: 401 });
  return null;
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;
  const { type, slug } = await context.params;
  if (!isContentType(type)) return Response.json({ error: "内容类型无效。" }, { status: 400 });

  try {
    const payload = (await request.json()) as Partial<ContentDocument>;
    const result = await saveContent(type, slug, payload);
    if (result.conflict) {
      return Response.json(
        { error: "GitHub 文件已经发生变化，请重新载入后再保存。", current: result.current },
        { status: 409 },
      );
    }
    return Response.json({ document: result.document });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "保存失败。" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;
  const { type, slug } = await context.params;
  if (!isContentType(type)) return Response.json({ error: "内容类型无效。" }, { status: 400 });
  const sha = new URL(request.url).searchParams.get("sha") ?? "";
  if (!sha) return Response.json({ error: "缺少文件版本信息。" }, { status: 400 });

  try {
    const result = await deleteContent(type, slug, sha);
    if (result.conflict) {
      return Response.json({ error: "GitHub 文件已经发生变化，请重新载入。" }, { status: 409 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "删除失败。" },
      { status: 400 },
    );
  }
}
