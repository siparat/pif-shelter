import z from 'zod';

export const telegramNicknameSchema = z
	.string()
	.trim()
	.refine((val) => val.startsWith('@'), {
		message: 'Никнейм должен начинаться с символа @'
	})
	.refine(
		(val) => {
			const namePart = val.slice(1);
			return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(namePart);
		},
		{
			message: 'Невалидный никнейм Telegram'
		}
	);
