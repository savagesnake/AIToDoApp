import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema, todoTitleSchema } from "@/lib/validation";

describe("todoTitleSchema", () => {
  it("rejects an empty title", () => {
    expect(todoTitleSchema.safeParse("").success).toBe(false);
  });

  it("rejects a whitespace-only title", () => {
    const result = todoTitleSchema.safeParse("   ");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Todo can't be empty.");
  });

  it("accepts exactly 200 characters", () => {
    expect(todoTitleSchema.safeParse("a".repeat(200)).success).toBe(true);
  });

  it("rejects 201 characters", () => {
    const result = todoTitleSchema.safeParse("a".repeat(201));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Keep it under 200 characters.");
  });

  it("trims surrounding whitespace", () => {
    expect(todoTitleSchema.parse("  Buy milk  ")).toBe("Buy milk");
  });

  it("rejects non-string input (e.g. a missing form field)", () => {
    expect(todoTitleSchema.safeParse(null).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  const valid = { name: "Ada", email: "ada@example.com", password: "12345678" };

  it("accepts valid input", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("trims and lowercases the email before checking it", () => {
    expect(signUpSchema.parse({ ...valid, email: "  Ada@Example.COM " }).email).toBe(
      "ada@example.com",
    );
  });

  it("rejects an invalid email", () => {
    expect(signUpSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("enforces name length 1–100", () => {
    expect(signUpSchema.safeParse({ ...valid, name: "  " }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, name: "a".repeat(100) }).success).toBe(true);
    expect(signUpSchema.safeParse({ ...valid, name: "a".repeat(101) }).success).toBe(false);
  });

  it("enforces password length 8–128", () => {
    expect(signUpSchema.safeParse({ ...valid, password: "1234567" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, password: "a".repeat(128) }).success).toBe(true);
    expect(signUpSchema.safeParse({ ...valid, password: "a".repeat(129) }).success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("requires a password but not a minimum length", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
});
