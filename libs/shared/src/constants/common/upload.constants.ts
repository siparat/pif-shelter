export const UPLOAD_SPACE = ['posts', 'users', 'animals', 'ledger_receipts'] as const;
export type UploadSpace = (typeof UPLOAD_SPACE)[number];

export const UPLOAD_TYPE = ['image', 'video'] as const;
export type UploadType = (typeof UPLOAD_TYPE)[number];

const MB = 1024 * 1024;
export const DEFAULT_IMAGE_MAX_BYTES = 2 * MB;
export const DEFAULT_VIDEO_MAX_BYTES = 512 * MB;

export const UPLOAD_MAX_BYTES: Record<UploadSpace, Partial<Record<UploadType, number>>> = {
	posts: { image: 5 * MB, video: 512 * MB },
	users: { image: 2 * MB },
	animals: { image: 5 * MB },
	ledger_receipts: { image: 5 * MB }
};

export const PRESIGNED_EXPIRES_SECONDS: Record<UploadType, number> = {
	image: 60,
	video: 300
};
