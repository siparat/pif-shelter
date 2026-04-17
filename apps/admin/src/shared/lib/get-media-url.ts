export const getMediaUrl = (bucketKey: string): string => {
	return `${import.meta.env.VITE_BUCKET_HOST}/${bucketKey}`;
};
