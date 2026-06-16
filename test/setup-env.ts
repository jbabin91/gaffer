// t3-env validates at import; seed valid placeholders before modules load.
// Tests inject the real container DB via createAuth(getTestDb()), so DATABASE_URL here is unused.
process.env.DATABASE_URL ??= 'postgres://test:test@127.0.0.1:5432/test';
process.env.BETTER_AUTH_SECRET ??= 'test-secret-at-least-32-characters-long';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000';
