import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

const manualExpenseAmountKopecksSchema = z
	.number()
	.int('Сумма в целых копейках')
	.positive('Сумма расхода должна быть больше нуля')
	.max(10_000_000_00, 'Сумма расхода не может быть больше 10 000 000 рублей, используйте несколько платежей');

export const createManualExpenseRequestSchema = z.object({
	amount: manualExpenseAmountKopecksSchema,
	occurredAt: z.iso.datetime().describe('Момент расхода для отчёта за месяц'),
	title: z.string().trim().min(1).max(200),
	note: z.string().trim().max(2000).optional(),
	receiptStorageKey: z.string().trim().min(1).describe('Ключ объекта чека в S3')
});

export const createManualExpenseResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid()
	})
);
