import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/messages");
  return <MessagesClient currentUserId={(session.user as { id?: string }).id ?? session.user.email ?? ""} />;
}
