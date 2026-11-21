"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";
import { todoIdSchema, todoTitleSchema } from "@/lib/validation";

// Every action follows SPEC.md §6. Signature is (prevState, formData) so the
// forms can use React's useActionState to show the returned error inline.
//
// TODO(auth): step 1 (authenticate) and step 3 (authorize) arrive with Better
// Auth. Each action will start with `const user = await requireUser()` and
// every `where` gains `userId: user.id`. The queries already use
// updateMany/deleteMany + `count === 0` so that change is a one-line filter.

const NOT_FOUND = "Todo not found.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

export async function createTodo(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const title = todoTitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { ok: false, error: firstIssue(title.error) };

  try {
    await prisma.todo.create({ data: { title: title.data } });
  } catch (error) {
    console.error("createTodo failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/todos");
  return { ok: true };
}

export async function updateTodo(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = todoIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const title = todoTitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { ok: false, error: firstIssue(title.error) };

  try {
    const { count } = await prisma.todo.updateMany({
      where: { id: id.data },
      data: { title: title.data },
    });
    if (count === 0) return { ok: false, error: NOT_FOUND };
  } catch (error) {
    console.error("updateTodo failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/todos");
  return { ok: true };
}

export async function toggleTodo(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = todoIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { ok: false, error: NOT_FOUND };

  try {
    const todo = await prisma.todo.findFirst({
      where: { id: id.data },
      select: { completed: true },
    });
    if (!todo) return { ok: false, error: NOT_FOUND };

    const { count } = await prisma.todo.updateMany({
      where: { id: id.data },
      data: { completed: !todo.completed },
    });
    if (count === 0) return { ok: false, error: NOT_FOUND };
  } catch (error) {
    console.error("toggleTodo failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/todos");
  return { ok: true };
}

export async function deleteTodo(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = todoIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { ok: false, error: NOT_FOUND };

  try {
    const { count } = await prisma.todo.deleteMany({ where: { id: id.data } });
    if (count === 0) return { ok: false, error: NOT_FOUND };
  } catch (error) {
    console.error("deleteTodo failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/todos");
  return { ok: true };
}
