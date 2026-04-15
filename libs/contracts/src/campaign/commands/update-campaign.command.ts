import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { createCampaignRequestSchema } from './create-campaign.command';

export const updateCampaignRequestSchema = createCampaignRequestSchema.partial();

export const updateCampaignResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор сбора')
	})
);
