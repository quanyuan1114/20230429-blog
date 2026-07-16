import {
  clearLoginFailures,
  createSessionToken,
  getStoredCredential,
  isLoginRateLimited,
  isSameOrigin,
  recordLoginFailure,
  sessionCookieHeader,
  verifyEditorPassword,
} from "@/lib/editor-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "请求来源无效。" }, { status: 403 });
  if (!(await getStoredCredential())) {
    return Response.json({ error: "编辑密码尚未设置。", setupRequired: true }, { status: 428 });
  }
  if (await isLoginRateLimited(request)) {
    return Response.json({ error: "登录尝试过多，请 15 分钟后再试。" }, { status: 429 });
  }

  const payload = (await request.json()) as { password?: string };
  if (!(await verifyEditorPassword(payload.password ?? ""))) {
    await recordLoginFailure(request);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return Response.json({ error: "密码不正确。" }, { status: 401 });
  }

  await clearLoginFailures(request);
  const token = await createSessionToken();
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": sessionCookieHeader(token) } },
  );
}
