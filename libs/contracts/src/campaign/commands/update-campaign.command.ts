import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { createCampaignRequestSchema } from './create-campaign.command';

export const updateCampaignRequestSchema = createCampaignRequestSchema.partial();

export class UpdateCampaignRequestDto extends createZodDto(updateCampaignRequestSchema) {}

export const updateCampaignResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор сбора')
	})
);

export class UpdateCampaignResponseDto extends createZodDto(updateCampaignResponseSchema) {}
