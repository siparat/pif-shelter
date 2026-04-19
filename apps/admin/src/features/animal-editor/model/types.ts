import { createAnimalRequestSchema, updateAnimalRequestSchema } from '@pif/contracts';
import { z } from 'zod';

export const animalEditorSchema = createAnimalRequestSchema.extend({
	status: z.string().optional(),
	curatorId: z.string().nullable().optional(),
	costOfGuardianship: z.number().nullable().optional(),
	labelIds: z.array(z.string()).optional(),
	avatarKey: z.string().optional()
});

export type AnimalEditorValues = z.input<typeof animalEditorSchema>;
export type UpdateAnimalValues = z.input<typeof updateAnimalRequestSchema>;
