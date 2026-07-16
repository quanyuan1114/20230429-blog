import { EditorAuthForm } from "@/app/components/editor-auth-form";

export default async function EditorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  return <EditorAuthForm mode="login" returnTo={params.returnTo} />;
}
