import { z } from 'zod';

// TanStack Router JSON-parses search values, so ?verified=1 arrives as the
// number 1; z.string() would throw and error the _app layout. Coerce instead.
export const verifiedSearchSchema = z.object({
  verified: z.coerce.string().optional(),
});
