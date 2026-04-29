import { BUCKET_HOST } from '../config/api';

export const getMediaUrl = (bucketKey: string): string => {
	if (bucketKey.startsWith('http://') || bucketKey.startsWith('https://')) {
		return bucketKey;
	}
	return `${BUCKET_HOST}/${bucketKey}`;
};
