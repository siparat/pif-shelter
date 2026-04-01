import { createZodDto } from 'nestjs-zod';
import { createApiSuccessResponseSchema } from '../../common';
import { campaignResponseSchema } from './campaign-response.schema';

export class GetCampaignByIdResponseDto extends createZodDto(createApiSuccessResponseSchema(campaignResponseSchema)) {}
