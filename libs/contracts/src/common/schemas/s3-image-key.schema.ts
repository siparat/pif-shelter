import { ALLOW_IMAGE_EXT } from '@pif/shared';
import z from 'zod';

export const s3ImageKeySchema = z
	.string()
	.min(1, 'Ключ не может быть пустым')
	.trim()
	.refine(
		(val) => {
			const ext = val.split('.').pop()?.toLowerCase();
			return ext && ALLOW_IMAGE_EXT.includes(ext);
		},
		{
			message: `Недопустимый формат файла. Разрешены: ${ALLOW_IMAGE_EXT.join(', ')}`
		}
	);
