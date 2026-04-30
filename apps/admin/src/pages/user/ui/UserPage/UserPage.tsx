import { setUserProfileRequestSchema } from '@pif/contracts';
import { ALLOW_IMAGE_EXT, UPLOAD_MAX_BYTES, UserRole } from '@pif/shared';
import { ArrowLeft, Link2, Loader2, User as UserIcon } from 'lucide-react';
import { ChangeEvent, JSX, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getUploadUrl, uploadFileToS3 } from '../../../../entities/animal/api/media.api';
import { useAdminUser, useSetUserAvatarMutation, useSetUserProfileMutation } from '../../../../entities/admin-user';
import { useSession } from '../../../../entities/session/model/hooks';
import { UserBannedToggle } from '../../../../features/user-banned';
import { UserRoleSelect } from '../../../../features/user-role';
import { getErrorMessage } from '../../../../shared/api';
import { ROUTES } from '../../../../shared/config';
import { getMediaUrl, getUserTelegramLink } from '../../../../shared/lib';
import { Badge, Button, ErrorState, Input, PageTitle } from '../../../../shared/ui';

const ROLE_LABELS: Record<UserRole, string> = {
	[UserRole.ADMIN]: 'Администратор',
	[UserRole.SENIOR_VOLUNTEER]: 'Старший волонтёр',
	[UserRole.VOLUNTEER]: 'Волонтёр',
	[UserRole.GUARDIAN]: 'Опекун'
};

const ROLE_COLORS: Record<UserRole, string> = {
	[UserRole.ADMIN]: '#ef4444',
	[UserRole.SENIOR_VOLUNTEER]: '#8b5cf6',
	[UserRole.VOLUNTEER]: '#22c55e',
	[UserRole.GUARDIAN]: '#f97316'
};

export const UserPage = (): JSX.Element => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: session } = useSession();
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [profileForm, setProfileForm] = useState({ name: '', email: '', position: '', telegram: '' });
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const canView = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SENIOR_VOLUNTEER;
	const canUploadAvatar = session?.user.role === UserRole.ADMIN;
	const canEditProfile = session?.user.role === UserRole.ADMIN;
	const query = useAdminUser(id, { enabled: Boolean(id) && canView });
	const setUserAvatarMutation = useSetUserAvatarMutation();
	const setUserProfileMutation = useSetUserProfileMutation();
	const userData = query.data;

	useEffect(() => {
		if (!userData) {
			return;
		}
		setProfileForm({
			name: userData.name,
			email: userData.email,
			position: userData.position,
			telegram: userData.telegram
		});
	}, [userData]);

	if (!id) {
		return <ErrorState description="Некорректный идентификатор пользователя." onRetry={() => navigate(-1)} />;
	}

	if (!canView) {
		return (
			<ErrorState
				description="Просмотр карточки пользователя доступен администратору и старшему волонтёру."
				onRetry={() => navigate(-1)}
			/>
		);
	}

	if (query.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (query.isError || !query.data) {
		return (
			<ErrorState
				description={query.error?.message ?? 'Не удалось загрузить пользователя.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	const user = query.data;

	const isProfileDirty =
		profileForm.name.trim() !== user.name ||
		profileForm.email.trim() !== user.email ||
		profileForm.position.trim() !== user.position ||
		profileForm.telegram.trim() !== user.telegram;

	const onAvatarInputChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
		const file = event.target.files?.[0];
		event.target.value = '';

		if (!file || !canUploadAvatar || !id) {
			return;
		}

		const extension = file.name.split('.').pop()?.toLowerCase();
		if (!extension || !ALLOW_IMAGE_EXT.includes(extension as (typeof ALLOW_IMAGE_EXT)[number])) {
			toast.error('Разрешены только изображения: png, jpeg, jpg, webp, avif.');
			return;
		}
		if (file.size > (UPLOAD_MAX_BYTES.users.image ?? 2 * 1024 * 1024)) {
			toast.error('Файл слишком большой. Максимальный размер аватарки: 2 МБ.');
			return;
		}

		try {
			setIsUploadingAvatar(true);
			const uploadData = await getUploadUrl({
				ext: extension as (typeof ALLOW_IMAGE_EXT)[number],
				type: 'image',
				space: 'users'
			});
			await uploadFileToS3(uploadData, file);
			await setUserAvatarMutation.mutateAsync({ userId: id, avatarKey: uploadData.data.key });
			toast.success('Аватарка обновлена');
		} catch (error) {
			toast.error(await getErrorMessage(error));
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const onSaveProfile = async (): Promise<void> => {
		if (!id || !canEditProfile || !isProfileDirty) {
			return;
		}

		const parsed = setUserProfileRequestSchema.safeParse({
			name: profileForm.name,
			email: profileForm.email,
			position: profileForm.position,
			telegram: profileForm.telegram
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? 'Некорректные данные профиля');
			return;
		}

		try {
			await setUserProfileMutation.mutateAsync({
				userId: id,
				name: parsed.data.name,
				email: parsed.data.email,
				position: parsed.data.position,
				telegram: parsed.data.telegram
			});
			toast.success('Профиль обновлён');
		} catch (error) {
			toast.error(await getErrorMessage(error));
		}
	};

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title={user.name} subtitle="Профиль пользователя и блокировка доступа.">
				<Button
					type="button"
					appearance="ghost"
					className="mt-0 md:w-auto px-6 py-2"
					onClick={() => navigate(-1)}>
					<ArrowLeft size={16} />
					Назад
				</Button>
			</PageTitle>

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-4">
				<div className="flex flex-wrap items-center gap-2 justify-between">
					<div className="flex items-center gap-2">
						<Badge color={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
						{user.banned && (
							<span className="rounded-full px-2 py-1 text-xs font-semibold bg-red-500/25 text-red-200">
								Вход заблокирован
							</span>
						)}
					</div>
					{user.role === UserRole.GUARDIAN && (
						<Link
							to={ROUTES.guardian.replace(':id', user.id)}
							className="inline-flex items-center gap-1.5 text-sm text-(--color-brand-orange) hover:underline">
							<Link2 size={14} />
							Профиль опекуна
						</Link>
					)}
				</div>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/png,image/jpeg,image/webp,image/avif"
					className="hidden"
					disabled={isUploadingAvatar || setUserAvatarMutation.isPending}
					onChange={(event) => void onAvatarInputChange(event)}
				/>

				<div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
					<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-4 flex flex-col items-center text-center gap-3">
						{canUploadAvatar ? (
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploadingAvatar || setUserAvatarMutation.isPending}
								className="relative rounded-full overflow-hidden w-24 h-24 bg-(--color-bg-secondary) flex items-center justify-center border border-(--color-border) hover:border-(--color-brand-orange) transition-colors disabled:opacity-70 disabled:cursor-wait"
								title="Нажмите, чтобы изменить аватарку">
								{user.image ? (
									<img
										src={getMediaUrl(user.image)}
										alt={user.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<UserIcon size={20} />
								)}
								{isUploadingAvatar || setUserAvatarMutation.isPending ? (
									<span className="absolute inset-0 bg-black/40 flex items-center justify-center">
										<Loader2 size={18} className="animate-spin text-white" />
									</span>
								) : null}
							</button>
						) : (
							<div className="rounded-full overflow-hidden w-24 h-24 bg-(--color-bg-secondary) flex items-center justify-center border border-(--color-border)">
								{user.image ? (
									<img
										src={getMediaUrl(user.image)}
										alt={user.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<UserIcon size={20} />
								)}
							</div>
						)}
						<div className="space-y-1">
							<p className="font-semibold leading-tight">{user.name}</p>
							{canUploadAvatar ? (
								<p className="text-xs text-(--color-text-secondary)">Нажмите на аватар для изменения</p>
							) : null}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
						<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
							<p className="text-(--color-text-secondary) text-xs">Имя</p>
							{canEditProfile ? (
								<Input
									small
									value={profileForm.name}
									onChange={(event) =>
										setProfileForm((prev) => ({ ...prev, name: event.target.value }))
									}
								/>
							) : (
								<p className="mt-0.5">{user.name}</p>
							)}
						</div>
						<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
							<p className="text-(--color-text-secondary) text-xs">Email</p>
							{canEditProfile ? (
								<Input
									small
									type="email"
									value={profileForm.email}
									onChange={(event) =>
										setProfileForm((prev) => ({ ...prev, email: event.target.value }))
									}
								/>
							) : (
								<p className="truncate mt-0.5">{user.email}</p>
							)}
						</div>
						<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
							<p className="text-(--color-text-secondary) text-xs">Должность</p>
							{canEditProfile ? (
								<Input
									small
									value={profileForm.position}
									onChange={(event) =>
										setProfileForm((prev) => ({ ...prev, position: event.target.value }))
									}
								/>
							) : (
								<p className="mt-0.5">{user.position || '—'}</p>
							)}
						</div>
						<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
							<p className="text-(--color-text-secondary) text-xs">Telegram</p>
							{canEditProfile ? (
								<Input
									small
									value={profileForm.telegram}
									onChange={(event) =>
										setProfileForm((prev) => ({ ...prev, telegram: event.target.value }))
									}
								/>
							) : (
								<a
									href={getUserTelegramLink(user.telegram)}
									className="underline mt-0.5 inline-block"
									target="_blank"
									rel="noopener noreferrer">
									{user.telegram}
								</a>
							)}
						</div>
						<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
							<p className="text-(--color-text-secondary) text-xs">Регистрация</p>
							<p className="mt-0.5">{new Date(user.createdAt).toLocaleString('ru-RU')}</p>
						</div>
					</div>
				</div>

				{canEditProfile ? (
					<div className="pt-2 border-t border-(--color-border) flex justify-end">
						<Button
							type="button"
							className="px-5 py-2 md:w-auto"
							disabled={!isProfileDirty}
							isLoading={setUserProfileMutation.isPending}
							onClick={() => void onSaveProfile()}>
							Сохранить профиль
						</Button>
					</div>
				) : null}

				<div className="pt-2 border-t border-(--color-border) space-y-2">
					<UserRoleSelect userId={user.id} currentRole={user.role} className="max-w-sm" />
				</div>

				<div className="pt-2 border-t border-(--color-border) space-y-2">
					<p className="text-sm font-medium">Блокировка</p>
					<p className="text-xs text-(--color-text-secondary) max-w-2xl">
						Пользователь не сможет войти в личный кабинет, пока блокировка активна.
					</p>
					<UserBannedToggle userId={user.id} banned={user.banned} targetRole={user.role} variant="user" />
				</div>
			</div>
		</div>
	);
};

export default UserPage;
