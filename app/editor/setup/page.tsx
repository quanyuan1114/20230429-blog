import { EditorAuthForm } from "@/app/components/editor-auth-form";

export default async function EditorSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <EditorAuthForm mode="setup" initialSetupToken={params.token ?? ""} />;
}
