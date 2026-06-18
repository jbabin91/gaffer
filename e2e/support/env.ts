// E2E runs on dedicated ports/db so it never collides with `pnpm dev` (:3000)
// or the dev Postgres (:5432).
export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

// The first-manager signup is the env-designated bootstrap admin, so the invite
// gate admits it on a fresh e2e DB. Wired into the server as INITIAL_ADMIN_EMAIL.
export const E2E_ADMIN_EMAIL = 'manager@example.com';

export const E2E_DB_PORT = 5440;
export const E2E_DB_NAME = 'fc2026_e2e';
export const E2E_DB_USER = 'postgres';
export const E2E_DB_PASSWORD = 'postgres';
export const E2E_DATABASE_URL = `postgres://${E2E_DB_USER}:${E2E_DB_PASSWORD}@localhost:${E2E_DB_PORT}/${E2E_DB_NAME}`;
