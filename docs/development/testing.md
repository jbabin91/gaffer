# Testing

Vitest, split into `unit` and `integration` projects (see `docs/decisions/0008`).

## Projects

- **unit** — `**/*.test.{ts,tsx}` (excluding integration). Pure logic: query-key
  factories, chart math, small helpers. No database.
- **integration** — `**/*.integration.test.{ts,tsx}`. Anything that touches a
  real database via `createMemoryDb()`.

```bash
pnpm test               # both projects
pnpm test:unit          # fast, no database
pnpm test:integration   # in-memory PGlite
```

Name a database-touching test `*.integration.test.*` so it lands in the right
project.

## Repository tests

Call repository functions directly against `createMemoryDb()` — real SQL, real
constraints, real transactions. A mocked database hides constraint violations,
transaction rollback, and null handling; a real one doesn't.

## Hook tests

Hook tests opt into jsdom with a `// @vitest-environment jsdom` docblock and use
the harness in `test/harness.ts`:

- `renderHookWithClient(fn)` wraps the hook in a fresh QueryClient (retries off).
- Mock the database seam, keeping `createMemoryDb` real:

```ts
const dbRef = vi.hoisted(() => ({ current: null as dbClient.DB | null }));
vi.mock('#/db/client', async (importOriginal) => {
  const actual = await importOriginal<typeof dbClient>();
  return { ...actual, getDb: () => Promise.resolve(dbRef.current!) };
});
```

Assert observable outcomes (data reappears after a mutation), not spies on
`invalidateQueries` — that keeps the tests refactor-resilient.
