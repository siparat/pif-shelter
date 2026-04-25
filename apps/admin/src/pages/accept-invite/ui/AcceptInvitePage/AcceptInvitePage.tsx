import { zodResolver } from '@hookform/resolvers/zod';
import { acceptInvitationRequestSchema } from '@pif/contracts';
import { ALLOW_IMAGE_EXT, IMAGE_MIME_TYPES } from '@pif/shared';
import { Lock, Loader2, User } from 'lucide-react';
import { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { getUploadUrl, uploadFileToS3 } from '../../../../entities/animal/api/media.api';
import { acceptInvitation } from '../../../../features/auth/accept-invite/api/accept-invitation';
import { useUploader } from '../../../../features/upload/model/hooks';
import { Uploader } from '../../../../features/upload/ui/Uploader';
import { getErrorMessage } from '../../../../shared/api';
import { getMediaUrl } from '../../../../shared/lib';
import { Button, ErrorState, Input } from '../../../../shared/ui';

const tokenSchema = z.uuid('Некорректный токен приглашения');

const acceptInviteFormSchema = acceptInvitationRequestSchema
	.omit({ token: true })
	.extend({
		passwordConfirm: z.string().min(1, 'Подтвердите пароль')
	})
	.refine((value) => value.password === value.passwordConfirm, {
		path: ['passwordConfirm'],
		message: 'Пароли не совпадают'
	});

type AcceptInviteFormValues = z.infer<typeof acceptInviteFormSchema>;

export const AcceptInvitePage = (): JSX.Element => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const tokenParam = searchParams.get('token') ?? '';
	const parsedToken = tokenSchema.safeParse(tokenParam);
	const { ref: uploaderRef, uploadedUrl, isUploading, setUploadedUrl, setIsUploading } = useUploader();

	const {
		register,
		handleSubmit,
		setValue,
		clearErrors,
		formState: { errors, isSubmitting }
	} = useForm<AcceptInviteFormValues>({
		resolver: zodResolver(acceptInviteFormSchema),
		defaultValues: {
			fullName: '',
			telegram: '',
			password: '',
			passwordConfirm: '',
			avatarKey: ''
		}
	});

	const uploadAvatar = async (file: File): Promise<{ url: string } | void> => {
		try {
			clearErrors('avatarKey');
			const extension = file.name.split('.').pop()?.toLowerCase();
			if (!extension || !ALLOW_IMAGE_EXT.includes(extension as (typeof ALLOW_IMAGE_EXT)[number])) {
				toast.error('Разрешены только изображения: png, jpeg, jpg, webp, avif.');
				return;
			}

			const uploadData = await getUploadUrl({
				ext: extension as (typeof ALLOW_IMAGE_EXT)[number],
				type: 'image',
				space: 'users'
			});
			await uploadFileToS3(uploadData, file);
			setValue('avatarKey', uploadData.data.key, { shouldDirty: true, shouldValidate: true });
			toast.success('Аватар загружен');
			return { url: getMediaUrl(uploadData.data.key) };
		} catch (error) {
			toast.error(await getErrorMessage(error));
		}
	};

	const onSubmit = async (values: AcceptInviteFormValues): Promise<void> => {
		if (!parsedToken.success) {
			toast.error(parsedToken.error.issues[0]?.message ?? 'Некорректный токен приглашения');
			return;
		}
		try {
			await acceptInvitation({
				token: parsedToken.data,
				fullName: values.fullName,
				telegram: values.telegram,
				password: values.password,
				avatarKey: values.avatarKey
			});
			toast.success('Регистрация завершена. Войдите в систему.');
			navigate('/login');
		} catch (error) {
			toast.error(await getErrorMessage(error));
		}
	};

	if (!parsedToken.success) {
		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-(--color-bg-primary) p-4">
				<div className="w-full max-w-lg">
					<ErrorState
						description="Ссылка приглашения некорректна или повреждена."
						onRetry={() => navigate('/login')}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-(--color-bg-primary) p-4">
			<div className="w-full max-w-lg p-6 md:p-8 bg-(--color-bg-secondary) rounded-2xl border border-(--color-border) shadow-pif-lg">
				<div className="flex flex-col gap-2 mb-6">
					<h1 className="text-2xl md:text-3xl font-bold text-(--color-text-primary)">Принять приглашение</h1>
					<p className="text-(--color-text-secondary)">
						Заполните профиль и подтвердите регистрацию по ссылке из письма.
					</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<Input
						{...register('fullName')}
						Icon={User}
						error={errors.fullName?.message}
						label="ФИО"
						placeholder="Иван Иванов"
					/>
					<Input
						{...register('telegram')}
						error={errors.telegram?.message}
						label="Telegram"
						placeholder="@username"
					/>
					<Input
						{...register('password')}
						Icon={Lock}
						error={errors.password?.message}
						label="Пароль"
						type="password"
						placeholder="Минимум 8 символов"
					/>
					<Input
						{...register('passwordConfirm')}
						Icon={Lock}
						error={errors.passwordConfirm?.message}
						label="Повторите пароль"
						type="password"
						placeholder="Повторите пароль"
					/>
					<Uploader
						{...register('avatarKey')}
						title="Аватар профиля"
						error={errors.avatarKey?.message}
						accept={Object.values(IMAGE_MIME_TYPES).join(',')}
						onUpload={uploadAvatar}
						ref={uploaderRef}
						setIsUploading={setIsUploading}
						setUploadedUrl={setUploadedUrl}
						uploadedUrl={uploadedUrl}
						isUploading={isUploading}
					/>

					<Button type="submit" isLoading={isSubmitting || isUploading}>
						{isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
						Подтвердить приглашение
					</Button>
				</form>
			</div>
		</div>
	);
};

export default AcceptInvitePage;
