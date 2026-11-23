import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTodo, deleteTodo, toggleTodo, updateTodo } from "@/app/todos/actions";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/session";

// Stand-in for the logged-in user. requireUser() is mocked so tests don't need
// a real session cookie; the actions still do everything else for real
// against the test database.
let currentUser: CurrentUser | null = null;
vi.mock("@/lib/session", () => ({
  requireUser: vi.fn(async () => {
    if (!currentUser) throw new Error("NEXT_REDIRECT /login");
    return currentUser;
  }),
}));

const alice: CurrentUser = { id: "user_alice", name: "Alice", email: "alice@test.local" };
const bob: CurrentUser = { id: "user_bob", name: "Bob", email: "bob@test.local" };

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function todoFor(user: CurrentUser, title = "Bob's todo") {
  return prisma.todo.create({ data: { title, userId: user.id } });
}

beforeEach(async () => {
  // Deleting users cascades to their todos, sessions and accounts.
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [alice, bob].map(({ id, name, email }) => ({ id, name, email })),
  });
  currentUser = alice;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("createTodo", () => {
  it("creates a trimmed todo owned by the current user", async () => {
    expect(await createTodo(null, form({ title: "  Buy milk  " }))).toEqual({ ok: true });

    const todos = await prisma.todo.findMany();
    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject({ title: "Buy milk", completed: false, userId: alice.id });
  });

  it("rejects an empty title and creates nothing", async () => {
    expect(await createTodo(null, form({ title: "   " }))).toEqual({
      ok: false,
      error: "Todo can't be empty.",
    });
    expect(await prisma.todo.count()).toBe(0);
  });

  it("ignores a userId sent in the form", async () => {
    await createTodo(null, form({ title: "Sneaky", userId: bob.id }));
    expect(await prisma.todo.findFirst()).toMatchObject({ userId: alice.id });
  });

  it("requires a logged-in user", async () => {
    currentUser = null;
    await expect(createTodo(null, form({ title: "x" }))).rejects.toThrow(/login/);
    expect(await prisma.todo.count()).toBe(0);
  });
});

describe("updateTodo", () => {
  it("renames the user's own todo", async () => {
    const todo = await todoFor(alice, "Old");
    expect(await updateTodo(null, form({ id: todo.id, title: "New" }))).toEqual({ ok: true });
    expect(await prisma.todo.findUnique({ where: { id: todo.id } })).toMatchObject({ title: "New" });
  });

  it("rejects an empty title without changing (or deleting) the todo", async () => {
    const todo = await todoFor(alice, "Keep me");
    const result = await updateTodo(null, form({ id: todo.id, title: "" }));
    expect(result).toEqual({ ok: false, error: "Todo can't be empty." });
    expect(await prisma.todo.findUnique({ where: { id: todo.id } })).toMatchObject({
      title: "Keep me",
    });
  });

  it("cannot rename another user's todo", async () => {
    const todo = await todoFor(bob);
    const result = await updateTodo(null, form({ id: todo.id, title: "Hacked" }));
    expect(result).toEqual({ ok: false, error: "Todo not found." });
    expect(await prisma.todo.findUnique({ where: { id: todo.id } })).toMatchObject({
      title: "Bob's todo",
    });
  });
});

describe("toggleTodo", () => {
  it("flips completed on the user's own todo, both ways", async () => {
    const todo = await todoFor(alice);
    await toggleTodo(null, form({ id: todo.id }));
    expect((await prisma.todo.findUniqueOrThrow({ where: { id: todo.id } })).completed).toBe(true);
    await toggleTodo(null, form({ id: todo.id }));
    expect((await prisma.todo.findUniqueOrThrow({ where: { id: todo.id } })).completed).toBe(false);
  });

  it("rejects an invalid id", async () => {
    expect(await toggleTodo(null, form({ id: "not-a-cuid!" }))).toEqual({
      ok: false,
      error: "Todo not found.",
    });
  });

  it("cannot toggle another user's todo", async () => {
    const todo = await todoFor(bob);
    expect(await toggleTodo(null, form({ id: todo.id }))).toEqual({
      ok: false,
      error: "Todo not found.",
    });
    expect((await prisma.todo.findUniqueOrThrow({ where: { id: todo.id } })).completed).toBe(false);
  });
});

describe("deleteTodo", () => {
  it("deletes the user's own todo", async () => {
    const todo = await todoFor(alice);
    expect(await deleteTodo(null, form({ id: todo.id }))).toEqual({ ok: true });
    expect(await prisma.todo.count()).toBe(0);
  });

  it("reports a todo that doesn't exist", async () => {
    const todo = await todoFor(alice);
    await prisma.todo.delete({ where: { id: todo.id } });
    expect(await deleteTodo(null, form({ id: todo.id }))).toEqual({
      ok: false,
      error: "Todo not found.",
    });
  });

  it("cannot delete another user's todo", async () => {
    const todo = await todoFor(bob);
    expect(await deleteTodo(null, form({ id: todo.id }))).toEqual({
      ok: false,
      error: "Todo not found.",
    });
    expect(await prisma.todo.findUnique({ where: { id: todo.id } })).not.toBeNull();
  });
});
