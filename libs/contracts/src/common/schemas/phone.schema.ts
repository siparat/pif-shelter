import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { z } from 'zod';

export const phoneSchema = z
	.string('Некорректно указан номер телефона')
	.trim()
	.min(6, 'Некорректно указан номер телефона')
	.max(40, 'Некорректно указан номер телефона')
	.transform((rawValue: string, ctx) => {
		try {
			const phoneNumber = parsePhoneNumberWithError(rawValue, 'RU');
			if (!phoneNumber.isValid()) {
				ctx.addIssue({
					code: 'custom',
					message: 'Некорректно указан номер телефона'
				});
				return z.NEVER;
			}
			const number: string = phoneNumber.number;
			return number;
		} catch {
			ctx.addIssue({
				code: 'custom',
				message: 'Некорректно указан номер телефона'
			});
			return z.NEVER;
		}
	});
