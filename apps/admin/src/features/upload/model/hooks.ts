import { useRef, useState } from 'react';

export interface UploaderHandle {
	startUpload: (file: File) => void;
	reset: () => void;
}

interface DefaultValues {
	defaultUploadedUrl?: string | null;
	defaultIsUploading?: boolean;
}

export const useUploader = ({ defaultIsUploading = false, defaultUploadedUrl = null }: DefaultValues = {}) => {
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(defaultUploadedUrl);
	const [isUploading, setIsUploading] = useState(defaultIsUploading);
	const ref = useRef<UploaderHandle>(null);

	return {
		uploadedUrl,
		isUploading,
		setUploadedUrl,
		setIsUploading,
		ref
	};
};
