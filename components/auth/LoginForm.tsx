"use client";

import { useActionState } from "react";

import { signIn } from "@/app/(auth)/actions";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = { error: null, name: "", email: "" };

const inputClass =
  "rounded border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-gray-700";

export function LoginForm() {
  // The Server Action goes in directly (no client wrapper) so the form still
  // posts without JavaScript. On failure it returns the email to re-fill.
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const { error } = state;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          aria-describedby={error ? "login-error" : undefined}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-describedby={error ? "login-error" : undefined}
          className={inputClass}
        />
      </div>
      {error && (
        <p id="login-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
