"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import type { AuthFormState } from "@/lib/types";
import { signInSchema, signUpSchema } from "@/lib/validation";

// Auth runs through Server Actions (not the browser client) so the forms work
// without JavaScript, like the todo forms. auth.api.* sets the session cookie
// via the nextCookies() plugin in lib/auth.ts.
//
// The forms pass these actions straight to useActionState (no client wrapper):
// that's what keeps the no-JS form post working.

const GENERIC_ERROR = "Something went wrong. Please try again.";
const INVALID_LOGIN = "Email or password is incorrect.";

function errorCode(error: unknown): string | undefined {
  return isAPIError(error) ? error.body?.code : undefined;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = text(formData, "name");
  const email = text(formData, "email");
  const fail = (error: string): AuthFormState => ({ error, name, email });

  const input = signUpSchema.safeParse({
    name,
    email,
    password: text(formData, "password"),
  });
  if (!input.success) return fail(input.error.issues[0]?.message ?? "Invalid input.");

  try {
    await auth.api.signUpEmail({ body: input.data, headers: await headers() });
  } catch (error) {
    if (errorCode(error)?.startsWith("USER_ALREADY_EXISTS")) {
      return fail("An account with this email already exists.");
    }
    console.error("signUp failed", error);
    return fail(GENERIC_ERROR);
  }

  // redirect() works by throwing, so it must stay outside the try/catch.
  redirect("/todos");
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email");
  const fail = (error: string): AuthFormState => ({ error, name: "", email });

  const input = signInSchema.safeParse({ email, password: text(formData, "password") });
  // A malformed email can't match an account; keep the message generic.
  if (!input.success) return fail(INVALID_LOGIN);

  try {
    await auth.api.signInEmail({ body: input.data, headers: await headers() });
  } catch (error) {
    if (errorCode(error) === "INVALID_EMAIL_OR_PASSWORD") return fail(INVALID_LOGIN);
    console.error("signIn failed", error);
    return fail(GENERIC_ERROR);
  }

  redirect("/todos");
}

export async function signOut(): Promise<void> {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    // Even if the session row is already gone, send the user to /login.
    console.error("signOut failed", error);
  }
  redirect("/login");
}
