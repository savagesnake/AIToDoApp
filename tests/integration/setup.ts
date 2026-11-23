import { existsSync, readFileSync } from "node:fs";

import { config, parse } from "dotenv";
import { vi } from "vitest";

// Integration tests write to and wipe a real database, so they must only ever
// run against the separate Neon `test` branch in .env.test (CLAUDE.md:
// "Never run tests against production"). Refuse loudly otherwise.
if (!existsSync(".env.test")) {
  throw new Error(
    "Missing .env.test — integration tests need a separate test database (see .env.example).",
  );
}
config({ path: ".env.test", override: true, quiet: true });

const testUrl = process.env.DATABASE_URL;
if (!testUrl) throw new Error(".env.test must set DATABASE_URL.");

// Neon branches have distinct endpoint hosts; compare those (ignoring the
// -pooler suffix) so a copy-pasted dev URL is caught even if the params differ.
const endpoint = (url: string) => new URL(url).hostname.replace("-pooler", "");
if (existsSync(".env")) {
  const devUrl = parse(readFileSync(".env")).DATABASE_URL;
  if (devUrl && endpoint(devUrl) === endpoint(testUrl)) {
    throw new Error(".env.test points at the same database as .env — refusing to run tests.");
  }
}

// Outside Next.js: `server-only` would throw on import, and revalidatePath
// needs Next's request context.
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
