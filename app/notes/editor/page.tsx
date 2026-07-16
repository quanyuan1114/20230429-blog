import { NoteEditor } from "@/app/components/note-editor";
import { EDITOR_COOKIE, verifySessionToken } from "@/lib/editor-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const initialType = params.type === "reflection" ? "reflection" : "note";
  const cookieStore = await cookies();
  if (!(await verifySessionToken(cookieStore.get(EDITOR_COOKIE)?.value))) {
    redirect(`/editor/login?returnTo=${encodeURIComponent(`/notes/editor?type=${initialType}`)}`);
  }
  return <NoteEditor initialType={initialType} />;
}
