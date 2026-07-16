import { EditorAuthForm } from "@/app/components/editor-auth-form";
import { EDITOR_COOKIE, verifySessionToken } from "@/lib/editor-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditorPasswordPage() {
  const cookieStore = await cookies();
  if (!(await verifySessionToken(cookieStore.get(EDITOR_COOKIE)?.value))) {
    redirect("/editor/login?returnTo=/editor/password");
  }
  return <EditorAuthForm mode="password" />;
}
