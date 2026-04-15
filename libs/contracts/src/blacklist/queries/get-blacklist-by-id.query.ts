import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { blacklistEntrySchema } from './blacklist-entry.schema';

export const getBlacklistByIdResponseSchema = createApiSuccessResponseSchema(blacklistEntrySchema);
