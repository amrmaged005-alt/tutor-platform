import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import FavoritesClient from "./FavoritesClient";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/favorites");
  return <FavoritesClient />;
}
