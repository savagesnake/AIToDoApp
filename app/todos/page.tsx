import { Suspense } from "react";

import { TodoForm } from "@/components/todos/TodoForm";
import { TodoList } from "@/components/todos/TodoList";
import { TodosHeader } from "@/components/todos/TodosHeader";

export default function TodosPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      {/* The title and form are static and ship immediately in the prerendered
          shell. Anything that reads the session (header, list) streams in
          behind its own <Suspense> boundary at request time. */}
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Todos</h1>
        <Suspense fallback={<div className="h-8 w-32" />}>
          <TodosHeader />
        </Suspense>
      </header>
      <TodoForm />
      <Suspense
        fallback={
          <div aria-busy="true" className="flex flex-col gap-3 py-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        }
      >
        <TodoList />
      </Suspense>
    </main>
  );
}
