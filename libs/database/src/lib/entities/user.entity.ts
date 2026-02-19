import { createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';
import { users } from '../schemas';

export const userSchema = createSelectSchema(users);
export type User = z.infer<typeof userSchema>;
