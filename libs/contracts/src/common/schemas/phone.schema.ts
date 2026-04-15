import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { z } from 'zod';

export const phoneSchema = z
	.string()
	.trim()
	.min(6)
	.max(40)
	.transform((rawValue: string, ctx) => {
		try {
			const phoneNumber = parsePhoneNumberWithError(rawValue, 'RU');
			if (!phoneNumber.isValid()) {
				ctx.addIssue({
					code: 'custom',
					message: 'Invalid phone number'
				});
				return z.NEVER;
			}
			const number: string = phoneNumber.number;
			return number;
		} catch {
			ctx.addIssue({
				code: 'custom',
				message: 'Invalid phone number format'
			});
			return z.NEVER;
		}
	});
