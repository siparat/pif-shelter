import { createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';
import { guardianships } from '../schemas';

export const guardianshipSchema = createSelectSchema(guardianships);

export type Guardianship = z.infer<typeof guardianshipSchema>;
