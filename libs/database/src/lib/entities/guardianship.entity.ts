import { createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';
import { guardianships } from '../schemas';
import { animalSchema } from './animal.entity';
import { userSchema } from './user.entity';

export const guardianshipSchema = createSelectSchema(guardianships).omit({
	telegramReminderSentAt: true,
	paidPeriodEndAt: true,
	guardianPrivilegesUntil: true
});
export type Guardianship = z.infer<typeof guardianshipSchema>;

export const guardianshipViewSchema = guardianshipSchema.omit({ cancelledAt: true, startedAt: true }).extend({
	animal: animalSchema,
	guardian: userSchema
});
export type GuardianshipView = z.infer<typeof guardianshipViewSchema>;

export const guardianshipWithAnimalSchema = guardianshipSchema.omit({ cancelledAt: true, startedAt: true }).extend({
	animal: z.nullable(animalSchema)
});
export type GuardianshipWithAnimal = z.infer<typeof guardianshipWithAnimalSchema>;
