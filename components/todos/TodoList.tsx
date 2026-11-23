import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TodoItem } from "@/components/todos/TodoItem";

// Server Component: queries the database directly. Rendered inside <Suspense>
// in app/todos/page.tsx, because requireUser() reads request headers.
export async function TodoList() {
  // Redirects to /login if there's no valid session. Reading headers() also
  // marks this as request-time, so it's never prerendered at build time.
  const user = await requireUser();

  const todos = await prisma.todo.findMany({
    where: { userId: user.id },
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
