import { createApiSuccessResponseSchema } from '../../common';
import { campaignResponseSchema } from './campaign-response.schema';

export const getCampaignByIdResponseSchema = createApiSuccessResponseSchema(campaignResponseSchema);
