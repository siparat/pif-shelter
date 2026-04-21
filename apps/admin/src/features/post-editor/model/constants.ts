import { IMAGE_MIME_TYPES, VIDEO_MIME_TYPES } from '@pif/shared';

export const ACCEPT_ATTRIBUTE = [...Object.values(IMAGE_MIME_TYPES), ...Object.values(VIDEO_MIME_TYPES)].join(',');
