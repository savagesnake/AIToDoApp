import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/prisma";

// Better Auth stores users, sessions and (hashed) passwords in our own
// Postgres through Prisma. Secret and base URL come from BETTER_AUTH_SECRET /
// BETTER_AUTH_URL, which Better Auth reads from the environment itself.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  // nextCookies() must stay LAST: it lets auth.api.* calls made inside Server
  // Actions write the session cookie through Next's cookies() API.
  plugins: [nextCookies()],
});
