import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

const manualExpenseAmountKopecksSchema = z
	.number()
	.int('Сумма в целых копейках')
	.positive('Сумма расхода должна быть больше нуля')
	.max(10_000_000_00, 'Сумма расхода не может быть больше 10 000 000 рублей, используйте несколько платежей');

export const updateManualExpenseRequestSchema = z
	.object({
		id: z.uuid(),
		amount: manualExpenseAmountKopecksSchema.optional(),
		occurredAt: z.iso.datetime().optional(),
		title: z.string().trim().min(1).max(200).optional(),
		note: z.string().trim().max(2000).nullable().optional(),
		receiptStorageKey: z.string().trim().min(1).optional()
	})
	.refine(
		(v) =>
			v.amount !== undefined ||
			v.occurredAt !== undefined ||
			v.title !== undefined ||
			v.note !== undefined ||
			v.receiptStorageKey !== undefined,
		{ message: 'Укажите хотя бы одно поле для обновления' }
	);

export const updateManualExpenseResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid()
	})
);
