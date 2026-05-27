import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import ThreadClient from "./ThreadClient";

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/messages");
  const { threadId } = await params;
  return <ThreadClient threadId={threadId} currentUserId={(session.user as { id?: string }).id ?? session.user.email ?? ""} />;
}
