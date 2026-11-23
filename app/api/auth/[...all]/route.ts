import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Better Auth's HTTP endpoints (/api/auth/*). Our forms use Server Actions,
// but this keeps the standard endpoints available (and is required by SPEC §4).
export const { GET, POST } = toNextJsHandler(auth);
