# Testing

Vitest, split into `unit` and `integration` projects (see `docs/decisions/0008`).

## Projects

- **unit** — `**/*.test.{ts,tsx}` (the integration glob is excluded). Pure logic:
  query-key factories, chart math, zod schema validation, small helpers. No
  database.
- **integration** — `**/*.integration.{ts,tsx}`. Anything that touches a real
  database. The split keys on the `.integration.` segment, so use that exact
  suffix (not `.integration.test.`).

```bash
pnpm test               # both projects
pnpm test:unit          # fast, no database
pnpm test:integration   # real Postgres in a container
```

Name a database-touching test `*.integration.{ts,tsx}` so it lands in the right
project. A file named `*.integration.test.*` would match the unit project and
run without a database.

## The database harness

Integration tests run against one real Postgres container started once per run
by `test/global-setup.ts` (testcontainers), migrated up front. The connection
URL is handed to workers via `provide()`/`inject()`. The integration project
runs single-threaded and resets data between tests, so:

- `getTestDb()` (`test/db.ts`) — a drizzle handle bound to the container.
- `resetDb()` — `TRUNCATE`s all tables; call it in `beforeEach`.

## Service tests

Call service functions directly against `getTestDb()` — real SQL, real
constraints, real transactions. A mocked database hides constraint violations,
transaction rollback, and null handling; a real one doesn't.

```ts
import { getTestDb, resetDb } from '#test/db';

let db: DB;
beforeEach(async () => {
  await resetDb();
  db = getTestDb();
});
```

## Hook tests

Hook tests opt into jsdom with a `// @vitest-environment jsdom` docblock and use
the harness in `test/harness.ts`:

- `renderHookWithClient(fn)` wraps the hook in a fresh QueryClient (retries off).
- Hooks call server functions, so mock the module's `api/<m>` and route each
  server fn to the service against the test db:

```ts
const dbRef = vi.hoisted(() => ({ current: null as DB | null }));
vi.mock('#/modules/career/api/careers', async () => {
  const svc = await import('#/modules/career/services/careers');
  return { listCareersFn: () => svc.listCareers(dbRef.current!) };
});
```

Assert observable outcomes (data reappears after a mutation), not spies on
`invalidateQueries` — that keeps the tests refactor-resilient.
