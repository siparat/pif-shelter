import {
	createCampaignRequestSchema,
	createCampaignResponseSchema,
	getCampaignByIdResponseSchema,
	searchCampaignsRequestSchema,
	searchCampaignsResponseSchema,
	updateCampaignRequestSchema,
	updateCampaignResponseSchema
} from '@pif/contracts';
import { z } from 'zod';

export type CampaignListParams = z.input<typeof searchCampaignsRequestSchema>;
export type CampaignListData = z.infer<typeof searchCampaignsResponseSchema>;
export type CampaignItem = CampaignListData['data'][number];
export type CampaignDetails = z.infer<typeof getCampaignByIdResponseSchema>['data'];

export type CreateCampaignPayload = z.input<typeof createCampaignRequestSchema>;
export type CreateCampaignResult = z.infer<typeof createCampaignResponseSchema>['data'];
export type UpdateCampaignPayload = z.input<typeof updateCampaignRequestSchema>;
export type UpdateCampaignResult = z.infer<typeof updateCampaignResponseSchema>['data'];
