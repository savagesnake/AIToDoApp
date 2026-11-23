import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// UX shortcut only — NOT the security check. It just looks for the session
// cookie (no database lookup), so logged-out visitors skip rendering /todos.
// The real check is requireUser() in the page and in every Server Action.
//
// Deliberately one-way: it never sends cookie holders away from /login. A
// stale or expired cookie would then bounce /login → /todos → /login forever.
// /login and /signup do a real session check instead (RedirectIfSignedIn).
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/todos/:path*"],
};
