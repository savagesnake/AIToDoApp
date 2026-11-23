import Link from "next/link";
import { Suspense } from "react";

import { RedirectIfSignedIn } from "@/components/auth/RedirectIfSignedIn";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <div className="flex flex-col gap-6 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <SignupForm />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 underline focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-blue-400"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
