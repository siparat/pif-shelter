import { createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';
import { invitations } from '../schemas';

export const invitationSchema = createSelectSchema(invitations);
export type Invitation = z.infer<typeof invitationSchema>;
