"use client";

import { useActionState, useRef } from "react";

import { createTodo } from "@/app/todos/actions";
import type { ActionResult } from "@/lib/types";

type FormState = { result: ActionResult | null; title: string };

const initialState: FormState = { result: null, title: "" };

export function TodoForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createTodo(null, formData);
      if (result.ok) inputRef.current?.focus();
      // React resets the form after the action; keeping the submitted text as
      // defaultValue means an invalid title survives the reset so it can be fixed.
      return { result, title: result.ok ? "" : String(formData.get("title") ?? "") };
    },
    initialState,
  );

  const error = state.result?.ok === false ? state.result.error : null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label htmlFor="new-todo" className="sr-only">
          New todo
        </label>
        <input
          ref={inputRef}
          id="new-todo"
          name="title"
          defaultValue={state.title}
          placeholder="What needs doing?"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "new-todo-error" : undefined}
          className="flex-1 rounded border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && (
        <p id="new-todo-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
