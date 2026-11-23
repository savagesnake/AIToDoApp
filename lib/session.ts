import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

export type CurrentUser = { id: string; name: string; email: string };

// The one place that reads the session (a small Data Access Layer). It looks
// the session token up in the database, so it's the real security check —
// unlike proxy.ts, which only sees whether a cookie exists.
//
// headers() is request-time data: with cacheComponents on, any component that
// calls this must render inside a <Suspense> boundary.
//
// React's cache() dedupes it per request: the header and the list on /todos
// both ask for the user, but the session is only looked up once.
export const getUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
