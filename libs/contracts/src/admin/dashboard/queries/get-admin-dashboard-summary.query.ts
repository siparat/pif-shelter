import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const adminDashboardSummarySchema = z.object({
	meetingRequests: z.object({
		newCount: z.number().int().nonnegative(),
		upcoming24hCount: z.number().int().nonnegative(),
		myNewCount: z.number().int().nonnegative(),
		myUpcoming24hCount: z.number().int().nonnegative()
	}),
	wishlist: z.object({
		sosCount: z.number().int().nonnegative(),
		activeItemsCount: z.number().int().nonnegative()
	})
});

export const getAdminDashboardSummaryResponseSchema = createApiSuccessResponseSchema(adminDashboardSummarySchema);

export class GetAdminDashboardSummaryResponseDto extends createZodDto(getAdminDashboardSummaryResponseSchema) {}
