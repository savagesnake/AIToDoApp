export type ActionResult = { ok: true } | { ok: false; error: string };

// State for the login/signup forms. The auth actions redirect on success, so
// they only ever return a failure — plus the non-secret values to re-fill
// (never the password).
export type AuthFormState = { error: string | null; name: string; email: string };
