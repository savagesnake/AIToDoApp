import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { RedirectIfSignedIn } from "@/components/auth/RedirectIfSignedIn";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      {/* Reads the session, so it needs its own boundary; the card around it
          stays in the static shell. */}
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <div className="flex flex-col gap-6 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <LoginForm />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No account yet?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 underline focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-blue-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
