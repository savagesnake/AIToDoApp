import { connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { TodoItem } from "@/components/todos/TodoItem";

// Server Component: queries the database directly. Rendered inside <Suspense>
// in app/todos/page.tsx.
export async function TodoList() {
  // With cacheComponents on, Next.js prerenders whatever it can at build time.
  // connection() says "this needs a real request", so the query always runs
  // fresh per request instead of being attempted (or baked in) during build.
  await connection();

  // TODO(auth): add `where: { userId: user.id }`.
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, completed: true },
  });

  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
        No todos yet — add one above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
