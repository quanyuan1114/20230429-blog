import {
  createSessionToken,
  getStoredCredential,
  isSameOrigin,
  sessionCookieHeader,
  setupEditorPassword,
} from "@/lib/editor-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ setupRequired: !(await getStoredCredential()) });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "请求来源无效。" }, { status: 403 });
  try {
    const payload = (await request.json()) as { setupToken?: string; password?: string };
    await setupEditorPassword(payload.setupToken ?? "", payload.password ?? "");
    const token = await createSessionToken();
    return Response.json(
      { ok: true },
      { status: 201, headers: { "Set-Cookie": sessionCookieHeader(token) } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "设置失败。";
    return Response.json({ error: message }, { status: 400 });
  }
}
