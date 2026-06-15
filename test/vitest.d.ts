import 'vitest';

// Values shared from global-setup to test workers via provide()/inject().
declare module 'vitest' {
  interface ProvidedContext {
    databaseUrl: string;
  }
}
