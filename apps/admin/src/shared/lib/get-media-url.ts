export const getMediaUrl = (bucketKey: string): string => {
	if (bucketKey.startsWith('http://') || bucketKey.startsWith('https://')) {
		return bucketKey;
	}
	return `${import.meta.env.VITE_BUCKET_HOST}/${bucketKey}`;
};
