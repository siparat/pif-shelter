import { BlacklistSource, BlacklistStatus } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createApiPaginatedResponseSchema } from '../../common/base.responses';
import { paginationSchema } from '../../common/schemas/pagination.schema';
import { blacklistEntrySchema } from './blacklist-entry.schema';

const BLACKLIST_SORT_FIELDS = ['addedAt', 'value', 'status', 'context', 'source'] as const;

const blacklistSortSchema = z
	.string()
	.trim()
	.regex(/^[a-zA-Z0-9_]+:(asc|desc)$/, 'Формат сортировки: field:asc или field:desc')
	.default('addedAt:desc')
	.superRefine((val, ctx) => {
		const [field] = val.split(':') as [string];
		if (!BLACKLIST_SORT_FIELDS.includes(field as (typeof BLACKLIST_SORT_FIELDS)[number])) {
			ctx.addIssue({
				code: 'custom',
				message: `Допустимые поля сортировки: ${BLACKLIST_SORT_FIELDS.join(', ')}`
			});
		}
	});

export const listBlacklistQuerySchema = paginationSchema.omit({ sort: true }).extend({
	sort: blacklistSortSchema,
	status: z.enum(BlacklistStatus).optional(),
	source: z.enum(BlacklistSource).optional()
});

export class ListBlacklistQueryDto extends createZodDto(listBlacklistQuerySchema) {}

export const listBlacklistResponseSchema = createApiPaginatedResponseSchema(blacklistEntrySchema);

export class ListBlacklistResponseDto extends createZodDto(listBlacklistResponseSchema) {}

export type ListBlacklistResult = Omit<z.infer<typeof listBlacklistResponseSchema>, 'success'>;
