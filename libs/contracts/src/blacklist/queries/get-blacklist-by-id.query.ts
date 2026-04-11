import { createZodDto } from 'nestjs-zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { blacklistEntrySchema } from './blacklist-entry.schema';

export const getBlacklistByIdResponseSchema = createApiSuccessResponseSchema(blacklistEntrySchema);

export class GetBlacklistByIdResponseDto extends createZodDto(getBlacklistByIdResponseSchema) {}
