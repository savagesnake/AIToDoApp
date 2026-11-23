import { redirect } from "next/navigation";

import { getUser } from "@/lib/session";

// For "/": sends signed-in users to /todos and everyone else to /login.
// Reads the session (request-time), so it must render inside <Suspense>.
export async function RedirectBySession(): Promise<never> {
  redirect((await getUser()) ? "/todos" : "/login");
}
