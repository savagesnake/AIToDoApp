import { redirect } from "next/navigation";

import { getUser } from "@/lib/session";

// Server Component for /login and /signup: a real session check (not just a
// cookie check), so a stale cookie can't cause a /login ↔ /todos loop.
// Reads headers(), so it must render inside <Suspense>. Renders nothing.
export async function RedirectIfSignedIn() {
  if (await getUser()) redirect("/todos");
  return null;
}
