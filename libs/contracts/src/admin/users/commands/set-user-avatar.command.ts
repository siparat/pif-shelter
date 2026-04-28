import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';
import { s3ImageKeySchema } from '../../../common/schemas/s3-key.schema';

export const setUserAvatarRequestSchema = z.object({
	avatarKey: s3ImageKeySchema
});

export const setUserAvatarResponseSchema = createApiSuccessResponseSchema(
	z.object({
		userId: z.string(),
		avatarKey: s3ImageKeySchema
	})
);

export type SetUserAvatarRequest = z.infer<typeof setUserAvatarRequestSchema>;
export type SetUserAvatarResult = z.infer<typeof setUserAvatarResponseSchema>;
