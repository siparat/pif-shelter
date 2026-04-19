export const ALLOW_IMAGE_EXT = ['png', 'jpeg', 'jpg', 'webp', 'avif'] as const;

export const IMAGE_MIME_TYPES = {
	png: 'image/png',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	webp: 'image/webp',
	avif: 'image/avif'
} as const satisfies Record<(typeof ALLOW_IMAGE_EXT)[number], string>;
