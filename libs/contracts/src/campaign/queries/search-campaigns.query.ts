import { CampaignStatus } from '@pif/shared';
import { z } from 'zod';
import { createApiPaginatedResponseSchema, paginationSchema } from '../../common';
import { campaignResponseSchema } from './campaign-response.schema';

export const searchCampaignsRequestSchema = paginationSchema.extend({
	status: z.optional(z.enum(CampaignStatus)),
	animalId: z.optional(z.uuid())
});

export const searchCampaignsResponseSchema = createApiPaginatedResponseSchema(campaignResponseSchema);
