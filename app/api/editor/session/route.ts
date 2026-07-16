import { getStoredCredential, hasEditorSession } from "@/lib/editor-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return Response.json({
    authenticated: await hasEditorSession(request),
    setupRequired: !(await getStoredCredential()),
  });
}
