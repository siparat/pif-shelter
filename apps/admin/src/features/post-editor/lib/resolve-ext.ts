import { ALLOW_IMAGE_EXT, ALLOW_VIDEO_EXT, PostMediaTypeEnum } from '@pif/shared';

export const resolveExt = (
	file: File
): { ext: (typeof ALLOW_IMAGE_EXT)[number] | (typeof ALLOW_VIDEO_EXT)[number]; type: PostMediaTypeEnum } | null => {
	const ext = file.name.split('.').pop()?.toLowerCase();
	if (!ext) return null;
	if ((ALLOW_IMAGE_EXT as readonly string[]).includes(ext)) {
		return { ext: ext, type: PostMediaTypeEnum.IMAGE };
	}
	if (ALLOW_VIDEO_EXT.includes(ext)) {
		return { ext, type: PostMediaTypeEnum.VIDEO };
	}
	return null;
};
