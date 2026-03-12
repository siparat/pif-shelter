export const ALLOW_IMAGE_EXT = ['png', 'jpeg', 'jpg', 'webp', 'avif'];

export const IMAGE_MIME_TYPES: Record<(typeof ALLOW_IMAGE_EXT)[number], string> = {
	mp4: 'video/mp4',
	jpeg: 'video/jpeg',
	jpg: 'video/jpeg',
	webp: 'video/webp',
	avif: 'video/avif'
};
