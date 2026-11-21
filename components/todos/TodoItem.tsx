"use client";

import { useActionState, useState } from "react";

import { deleteTodo, toggleTodo, updateTodo } from "@/app/todos/actions";
import type { Todo } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/types";

type TodoItemProps = {
  todo: Pick<Todo, "id" | "title" | "completed">;
};

const buttonClass =
  "rounded px-2 py-1 text-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50 dark:hover:bg-gray-800";

export function TodoItem({ todo }: TodoItemProps) {
  const [editing, setEditing] = useState(false);

  const [toggleState, toggleAction, toggling] = useActionState(toggleTodo, null);
  const [deleteState, deleteAction, deleting] = useActionState(deleteTodo, null);
  const [updateState, updateAction, saving] = useActionState(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await updateTodo(prev, formData);
      if (result.ok) setEditing(false);
      return result;
    },
    null,
  );

  const error = [updateState, toggleState, deleteState].find(
    (state) => state?.ok === false,
  );
  const errorId = `todo-${todo.id}-error`;

  return (
    <li className="flex flex-col gap-1 py-2">
      <div className="flex items-center gap-3">
        <form action={toggleAction}>
          <input type="hidden" name="id" value={todo.id} />
          <input
            type="checkbox"
            checked={todo.completed}
            disabled={toggling}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            aria-label={`Mark '${todo.title}' as ${todo.completed ? "not complete" : "complete"}`}
            className="size-4 focus-visible:outline-2 focus-visible:outline-blue-500"
          />
        </form>

        {editing ? (
          <form action={updateAction} className="flex flex-1 gap-2">
            <input type="hidden" name="id" value={todo.id} />
            <label htmlFor={`edit-${todo.id}`} className="sr-only">
              Edit todo
            </label>
            <input
              id={`edit-${todo.id}`}
              name="title"
              defaultValue={todo.title}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Escape") setEditing(false);
              }}
              aria-describedby={error ? errorId : undefined}
              className="flex-1 rounded border border-gray-300 bg-transparent px-2 py-1 focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-gray-700"
            />
            <button type="submit" disabled={saving} className={buttonClass}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={buttonClass}>
              Cancel
            </button>
          </form>
        ) : (
          <>
            <span
              className={`flex-1 ${todo.completed ? "text-gray-400 line-through" : ""}`}
            >
              {todo.title}
            </span>
            <button type="button" onClick={() => setEditing(true)} className={buttonClass}>
              Edit
            </button>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={todo.id} />
              <button type="submit" disabled={deleting} className={buttonClass}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </form>
          </>
        )}
      </div>

      {error?.ok === false && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error.error}
        </p>
      )}
    </li>
  );
}
