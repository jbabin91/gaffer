import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

// global-setup and global-teardown run in the same Playwright process, so the
// started container is shared through this module's state.
let started: StartedPostgreSqlContainer | undefined;

export function setContainer(container: StartedPostgreSqlContainer): void {
  if (started) throw new Error('e2e container already started');
  started = container;
}

export async function stopContainer(): Promise<void> {
  await started?.stop();
  started = undefined;
}
