import { UserRole } from '@pif/shared';
import { ArrowLeft, Link2, Loader2, Mail, User as UserIcon } from 'lucide-react';
import { JSX } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../../../../entities/session/model/hooks';
import { useAdminUser } from '../../../../entities/admin-user';
import { UserBannedToggle } from '../../../../features/user-banned';
import { ROUTES } from '../../../../shared/config';
import { getUserTelegramLink } from '../../../../shared/lib';
import { Badge, Button, ErrorState, PageTitle } from '../../../../shared/ui';

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
	const canView = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SENIOR_VOLUNTEER;
	const query = useAdminUser(id, { enabled: Boolean(id) && canView });

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
						<UserIcon size={18} className="text-(--color-text-secondary)" />
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
					<div className="flex items-start gap-2">
						<Mail size={16} className="mt-0.5 text-(--color-text-secondary) shrink-0" />
						<div>
							<p className="text-(--color-text-secondary) text-xs">Email</p>
							<p className="truncate">{user.email}</p>
						</div>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Должность</p>
						<p>{user.position || '—'}</p>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Telegram</p>
						<a
							href={getUserTelegramLink(user.telegram)}
							className="underline"
							target="_blank"
							rel="noopener noreferrer">
							{user.telegram}
						</a>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Регистрация</p>
						<p>{new Date(user.createdAt).toLocaleString('ru-RU')}</p>
					</div>
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
