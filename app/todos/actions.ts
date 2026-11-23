"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ActionResult } from "@/lib/types";
import { todoIdSchema, todoTitleSchema } from "@/lib/validation";

// Every action follows SPEC.md §6: authenticate → validate → scoped query →
// revalidate → return ActionResult. Signature is (prevState, formData) so the
// forms can use React's useActionState to show the returned error inline.
//
// Authorization is the `userId: user.id` in every `where`. updateMany /
// deleteMany with that filter means another user's todo id simply matches
// nothing (count === 0) and is reported as "not found" — never touched.
// The userId always comes from the session, never from the form.

const NOT_FOUND = "Todo not found.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

export async function createTodo(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const title = todoTitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { ok: false, error: firstIssue(title.error) };

  try {
    await prisma.todo.create({ data: { title: title.data, userId: user.id } });
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
  const user = await requireUser();

  const id = todoIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const title = todoTitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { ok: false, error: firstIssue(title.error) };

  try {
    const { count } = await prisma.todo.updateMany({
      where: { id: id.data, userId: user.id },
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
  const user = await requireUser();

  const id = todoIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { ok: false, error: NOT_FOUND };

  try {
    const todo = await prisma.todo.findFirst({
      where: { id: id.data, userId: user.id },
      select: { completed: true },
    });
    if (!todo) return { ok: false, error: NOT_FOUND };

    const { count } = await prisma.todo.updateMany({
      where: { id: id.data, userId: user.id },
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
  const user = await requireUser();

  const id = todoIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { ok: false, error: NOT_FOUND };

  try {
    const { count } = await prisma.todo.deleteMany({
      where: { id: id.data, userId: user.id },
    });
    if (count === 0) return { ok: false, error: NOT_FOUND };
  } catch (error) {
    console.error("deleteTodo failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/todos");
  return { ok: true };
}
