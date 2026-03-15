export const ALLOW_IMAGE_EXT = ['png', 'jpeg', 'jpg', 'webp', 'avif'];

export const IMAGE_MIME_TYPES: Record<(typeof ALLOW_IMAGE_EXT)[number], string> = {
	png: 'image/png',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	webp: 'image/webp',
	avif: 'image/avif'
};
