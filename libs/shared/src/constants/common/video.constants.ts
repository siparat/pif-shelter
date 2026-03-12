export const ALLOW_VIDEO_EXT = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

export const VIDEO_MIME_TYPES: Record<(typeof ALLOW_VIDEO_EXT)[number], string> = {
	mp4: 'video/mp4',
	mov: 'video/quicktime',
	avi: 'video/x-msvideo',
	mkv: 'video/x-matroska',
	webm: 'video/webm'
};
