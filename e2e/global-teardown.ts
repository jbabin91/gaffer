import { stopContainer } from './support/container';

export default async function globalTeardown(): Promise<void> {
  await stopContainer();
}
