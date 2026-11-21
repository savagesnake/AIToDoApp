import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // The Prisma CLI (migrate, studio) uses the direct, unpooled connection.
    // The app itself connects through the pooled DATABASE_URL in lib/prisma.ts.
    // process.env (not Prisma's env(), which throws when unset) so that
    // `prisma generate` — run by postinstall/build — works without a database;
    // migrate/studio still fail with a clear error if DIRECT_URL is missing.
    url: process.env.DIRECT_URL,
  },
});
