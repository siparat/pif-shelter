import { ALLOW_IMAGE_EXT, IMAGE_MIME_TYPES } from '@pif/shared';
import { forwardRef, HTMLAttributes, JSX, useCallback, useId, useImperativeHandle } from 'react';
import { cn } from '../../../shared/lib';
import { UploaderHandle } from '../model/hooks';

interface Props extends HTMLAttributes<HTMLDivElement> {
	error?: string;
	onUpload: (file: File) => Promise<{ url: string } | void>;
	uploadedUrl: string | null;
	isUploading: boolean;
	setUploadedUrl: (url: string | null) => void;
	setIsUploading: (v: boolean) => void;
	title: string;
	accept?: string;
}

export const Uploader = forwardRef<UploaderHandle, Props>(
	(
		{
			error,
			onUpload,
			accept = Object.values(IMAGE_MIME_TYPES).join(','),
			title,
			uploadedUrl,
			isUploading,
			setIsUploading,
			setUploadedUrl,
			className,
			...props
		}: Props,
		ref
	): JSX.Element => {
		const id = useId();

		const uploadAvatar = useCallback(
			async (file: File) => {
				setIsUploading(true);
				const res = await onUpload(file);
				if (res) setUploadedUrl(res.url);
				setIsUploading(false);
			},
			[onUpload]
		);

		const isImageUrl = (url: string): boolean => {
			return ALLOW_IMAGE_EXT.some((ext) => url.endsWith(`.${ext}`));
		};

		useImperativeHandle(ref, () => ({
			startUpload: uploadAvatar,
			reset: () => {
				setUploadedUrl(null);
				setIsUploading(false);
			}
		}));

		return (
			<div
				{...props}
				className={cn('rounded-2xl border border-(--color-border) bg-(--color-bg-primary) p-4', className)}>
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
					<div className="flex items-start gap-3 max-lg:flex-col min-w-0">
						{uploadedUrl && isImageUrl(uploadedUrl) && (
							<div
								className={
									'overflow-hidden bg-(--color-bg-primary) rounded-lg w-[52px] h-[52px] max-lg:w-[92px] max-lg:h-[92px] shrink-0'
								}>
								<img
									loading="lazy"
									src={uploadedUrl}
									alt="Uploaded image"
									className="object-cover w-full h-full"
								/>
							</div>
						)}
						<div>
							<p className="font-semibold">{title}</p>
							<p className="text-sm text-(--color-text-secondary) break-all">
								{uploadedUrl ?? 'Файл еще не загружен'}
							</p>
						</div>
					</div>
					<label htmlFor={id} className="inline-flex w-full lg:w-auto shrink-0">
						<input
							aria-disabled={isUploading}
							disabled={isUploading}
							id={id}
							type="file"
							accept={accept}
							className="hidden"
							onChange={(event) => {
								const file = event.target.files?.[0];
								if (file) uploadAvatar(file);
							}}
						/>
						<span className="cursor-pointer rounded-xl border border-(--color-border) bg-(--color-bg-secondary) px-4 py-2 text-sm font-semibold hover:bg-(--color-bg-primary) w-full lg:w-auto text-center">
							{isUploading ? 'Загрузка...' : 'Загрузить'}
						</span>
					</label>
				</div>
				{error && <p className="text-xs text-red-400 mt-1 font-medium">{error}</p>}
			</div>
		);
	}
);
