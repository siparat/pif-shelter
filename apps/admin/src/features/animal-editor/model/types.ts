import { createAnimalRequestSchema, updateAnimalRequestSchema } from '@pif/contracts';
import { z } from 'zod';

const animalEditorExtensions = {
	status: z.string().optional(),
	curatorId: z.string().nullable().optional(),
	costOfGuardianship: z.number().nullable().optional(),
	labelIds: z.array(z.string()).optional()
} satisfies Record<string, z.ZodTypeAny>;

export const createAnimalEditorSchema = createAnimalRequestSchema.extend(animalEditorExtensions);

export const editAnimalEditorSchema = createAnimalRequestSchema.extend({
	...animalEditorExtensions,
	avatarKey: z.union([z.literal(''), z.string().trim().min(1, 'Укажите аватар')])
});

export type AnimalEditorValues = z.input<typeof editAnimalEditorSchema>;
export type UpdateAnimalValues = z.input<typeof updateAnimalRequestSchema>;
