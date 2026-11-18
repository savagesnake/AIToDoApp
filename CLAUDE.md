# CLAUDE.md

Guidance for Claude when working in this repository.

## Project

A full-stack todo app with email/password accounts. Each user has full CRUD over **their own** todos.

**Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Postgres on Neon · Prisma 7 · Better Auth · Zod · Vercel.

**`SPEC.md` is the source of truth** for features, data model, routes and acceptance criteria. Read it before making changes, and update it if a change alters behavior.

This is a learning project. When you make a non-obvious change (auth flow, Prisma setup, caching, Server/Client boundaries), briefly explain *why* in your reply.

## Commands

```bash
npm run dev          # Next.js dev server (http://localhost:3000)
npm run build        # prisma generate && next build
npm run lint         # ESLint (next lint no longer exists in Next.js 16)
npm run typecheck    # tsc --noEmit
npm test             # Vitest unit + integration
npm run test:e2e     # Playwright (optional)
npm run db:migrate   # prisma migrate dev — create/apply a migration locally
npm run db:studio    # Prisma Studio
npx prisma generate  # regenerate the client after schema changes
```

Before saying a task is done, run `npm run typecheck`, `npm run lint` and `npm test`, and make sure they pass. Run `npm run build` after changes to config, layouts, routes or Server/Client boundaries.

## Architecture

```
prisma/schema.prisma        # Auth models (Better Auth CLI) + Todo
prisma.config.ts            # Prisma 7 config: schema path, migrations, DIRECT_URL
src/app/                    # Routes: (auth)/login, (auth)/signup, todos/, api/auth/[...all]
src/app/todos/actions.ts    # All todo Server Actions
src/components/             # auth/ and todos/ UI components
src/lib/prisma.ts           # PrismaClient singleton (PrismaPg adapter)
src/lib/auth.ts             # Better Auth server config
src/lib/auth-client.ts      # Better Auth React client
src/lib/session.ts          # getUser() / requireUser()
src/lib/validation.ts       # Zod schemas
src/generated/prisma/       # Generated Prisma Client — gitignored, never edit
src/proxy.ts                # Optional cookie-presence redirects only
```

## Rules That Must Not Be Broken

### Auth and authorization
- Every Server Action and protected page calls `requireUser()` (or `getUser()`) **on the server**. Never rely on `proxy.ts`, client state or hidden fields for security.
- Every todo query is scoped to the current user: `where: { id, userId: user.id }`. Use `updateMany` / `deleteMany` with that filter and treat `count === 0` as not found.
- Never accept a `userId` from the client.
- Don't hand-edit core fields of the Better Auth models (`User`, `Session`, `Account`, `Verification`). Change Better Auth config and regenerate with `npx @better-auth/cli@latest generate`.
- `nextCookies()` must stay the **last** plugin in `lib/auth.ts`.
- Login errors stay generic ("Email or password is incorrect.").

### Server Actions
Follow the steps in SPEC.md §6 in order: authenticate → validate with Zod → scoped Prisma query → `revalidatePath("/todos")` → return `ActionResult` (`{ ok: true } | { ok: false; error: string }`). Never return raw errors or stack traces to the client; `console.error` them on the server.

### Prisma 7
- Generator is `prisma-client` (not `prisma-client-js`) with output `src/generated/prisma`. Import from `@/generated/prisma/client`, never from `@prisma/client`.
- `PrismaClient` always gets the `PrismaPg` adapter; use the singleton in `lib/prisma.ts` only — never `new PrismaClient()` elsewhere.
- The datasource URL lives in `prisma.config.ts` (`DIRECT_URL`), not in `schema.prisma`. The app uses the pooled `DATABASE_URL`.
- Schema changes: edit `schema.prisma` → `npm run db:migrate -- --name <descriptive_name>` → commit the migration. Never edit a migration that's already committed.
- **If `prisma migrate dev` asks to reset the database, stop and ask the user first.** Never run `prisma migrate reset` or `prisma db push --force-reset` without asking.

### Database safety
- Never run migrations, seeds or tests against the production database. Tests use `.env.test` pointing at a separate Neon branch or local Postgres.
- Don't print or commit secrets. `.env*` files are gitignored except `.env.example`; keep `.env.example` updated when adding variables.
- Nothing secret uses the `NEXT_PUBLIC_` prefix.

### Server vs Client Components
- Default to Server Components. Add `"use client"` only for interactivity (forms with pending state, `useOptimistic`, edit mode, auth forms).
- `lib/prisma.ts`, `lib/auth.ts` and `lib/session.ts` start with `import "server-only"`. Client Components must never import them.
- Fetch data in Server Components; mutate with Server Actions. Don't add API routes for todos.

## Next.js 16 Notes
- Middleware is now `src/proxy.ts` exporting `proxy()` (Node.js runtime). Don't create `middleware.ts`.
- `params`, `searchParams`, `cookies()` and `headers()` are async — `await` them.
- `next lint` was removed; use `npm run lint`.

## TypeScript
- No `any`; use `unknown` and narrow. Derive types from Zod (`z.infer`) and Prisma (generated types) instead of redeclaring them.
- Avoid `!` and `as` unless unavoidable; add a comment if used.
- Props as `type XProps = { ... }` next to the component. Shared types in `lib/types.ts`.
- Import with the `@/` alias.

## Styling (Tailwind)
- Utility classes in JSX. No new CSS files; `globals.css` holds only the Tailwind import and minimal base styles.
- Support dark mode with `dark:`. Every interactive element has a visible `focus-visible` style.
- No UI kits or `clsx` / `tailwind-merge` unless asked.

## Code Style
- Function components, named exports — except Next.js files that need a default export (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- One component per file: `PascalCase.tsx`; other modules `camelCase.ts` / `kebab-case.ts` as in the tree above.
- Semantic HTML and native controls; forms are real `<form>` elements bound to Server Actions so they work without JS.
- Accessibility rules in SPEC.md §9 apply to every new UI.
- No stray `console.log`.

## Testing
- Unit-test Zod schemas and pure helpers.
- Integration-test every Server Action: happy path, invalid input, and **another user's todo can't be touched**.
- Mock `requireUser()` in integration tests; reset the test database between tests.
- When fixing a bug, add a test that would have caught it.

## Dependencies
Don't add packages beyond the stack in SPEC.md §2 without a clear reason and asking first.

## Git and Deployment
- Vercel deploys `main` to production and builds a preview for every PR; the Neon integration gives previews their own database branch.
- Commit migrations together with the schema change that created them.
- Don't push, force-push or change Vercel / Neon settings unless the user asks.

## Workflow
- Make small, focused changes; don't refactor unrelated code.
- Check work against SPEC.md §13 (acceptance criteria).
- Items in SPEC.md §14 (Future Enhancements) are out of scope unless the user asks.
- If the spec is unclear or a request conflicts with it, ask before building.
