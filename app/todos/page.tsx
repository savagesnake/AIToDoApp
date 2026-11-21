import { Suspense } from "react";

import { TodoForm } from "@/components/todos/TodoForm";
import { TodoList } from "@/components/todos/TodoList";

export default function TodosPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Todos</h1>
      <TodoForm />
      {/* The header and form are static and ship immediately; the list
          reads the database per request and streams in behind this boundary. */}
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
