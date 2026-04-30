import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';
import { telegramNicknameSchema } from '../../../common/schemas/telegram-nickname.schema';

export const setUserProfileRequestSchema = z.object({
	name: z.string().trim().min(1, 'Укажите имя'),
	email: z.email('Некорректный email'),
	position: z.string().trim().min(1, 'Укажите должность'),
	telegram: telegramNicknameSchema
});

export const setUserProfileResponseSchema = createApiSuccessResponseSchema(
	z.object({
		userId: z.string(),
		name: z.string(),
		email: z.string(),
		position: z.string(),
		telegram: z.string()
	})
);

export type SetUserProfileRequest = z.infer<typeof setUserProfileRequestSchema>;
export type SetUserProfileResult = z.infer<typeof setUserProfileResponseSchema>;
