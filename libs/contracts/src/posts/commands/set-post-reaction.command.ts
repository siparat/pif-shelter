import { ALLOWED_POST_REACTION_EMOJIS } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const setPostReactionRequestSchema = z.object({
	emoji: z.enum(ALLOWED_POST_REACTION_EMOJIS).describe('Эмодзи реакции')
});

export class SetPostReactionRequestDto extends createZodDto(setPostReactionRequestSchema) {}
