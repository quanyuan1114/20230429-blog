import {
  hasEditorSession,
  isSameOrigin,
  updateEditorPassword,
  verifyEditorPassword,
} from "@/lib/editor-auth";

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "请求来源无效。" }, { status: 403 });
  if (!(await hasEditorSession(request))) return Response.json({ error: "请重新登录。" }, { status: 401 });
  const payload = (await request.json()) as { currentPassword?: string; newPassword?: string };
  if (!(await verifyEditorPassword(payload.currentPassword ?? ""))) {
    return Response.json({ error: "当前密码不正确。" }, { status: 401 });
  }
  try {
    await updateEditorPassword(payload.newPassword ?? "");
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "密码修改失败。" },
      { status: 400 },
    );
  }
}
