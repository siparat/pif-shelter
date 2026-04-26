import { UserRole } from '@pif/shared';
import { Loader2, Search, Shield, UserIcon, UserPlus } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTeamUsers } from '../../../../entities/admin-user';
import { useSession } from '../../../../entities/session/model/hooks';
import { UserBannedToggle } from '../../../../features/user-banned';
import { InviteVolunteerModal } from '../../../../features/user-invitation';
import { UserRoleSelect } from '../../../../features/user-role';
import { ROUTES } from '../../../../shared/config';
import { getUserTelegramLink } from '../../../../shared/lib';
import { Button, Checkbox, EmptyState, ErrorState, Input, PageTitle } from '../../../../shared/ui';

const ROLE_LABELS: Record<UserRole, string> = {
	[UserRole.ADMIN]: 'Администратор',
	[UserRole.SENIOR_VOLUNTEER]: 'Старший волонтёр',
	[UserRole.VOLUNTEER]: 'Волонтёр',
	[UserRole.GUARDIAN]: 'Опекун'
};

const FILTERS: { value: UserRole | 'all'; label: string }[] = [
	{ value: 'all', label: 'Все' },
	{ value: UserRole.ADMIN, label: 'Админы' },
	{ value: UserRole.SENIOR_VOLUNTEER, label: 'Старшие' },
	{ value: UserRole.VOLUNTEER, label: 'Волонтёры' }
];

export const UsersPage = (): JSX.Element => {
	const { data: session } = useSession();
	const canView = session?.user.role === UserRole.ADMIN;
	const [includeGuardians, setIncludeGuardians] = useState(false);
	const usersQuery = useTeamUsers({ enabled: canView, includeGuardians });
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

	const filteredUsers = useMemo(() => {
		const query = search.trim().toLowerCase();
		return (usersQuery.data ?? []).filter((user) => {
			const roleMatch = roleFilter === 'all' || user.role === roleFilter;
			if (!roleMatch) {
				return false;
			}
			if (!query) {
				return true;
			}
			return [user.name, user.email, user.telegram, user.position].join(' ').toLowerCase().includes(query);
		});
	}, [usersQuery.data, roleFilter, search]);

	if (!canView) {
		return (
			<ErrorState
				description="Раздел управления ролями доступен только администратору."
				onRetry={() => void usersQuery.refetch()}
			/>
		);
	}

	if (usersQuery.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (usersQuery.isError) {
		return (
			<ErrorState
				description={usersQuery.error?.message ?? 'Не удалось загрузить пользователей команды.'}
				onRetry={() => void usersQuery.refetch()}
			/>
		);
	}

	return (
		<div className="space-y-5 pb-10">
			<PageTitle title="Команда" subtitle="Управление участниками системы">
				<Button className="mt-0 w-full sm:w-auto px-4 py-2" onClick={() => setIsInviteModalOpen(true)}>
					<UserPlus size={16} />
					Пригласить волонтёра
				</Button>
			</PageTitle>

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-3 md:p-4 space-y-3">
				<Checkbox
					checked={includeGuardians}
					onChange={(event) => setIncludeGuardians(event.target.checked)}
					label="Показывать опекунов"
					description="По умолчанию список скрыт, чтобы не смешивать команду и опекунов."
				/>
				<Input
					small
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Поиск по имени, email, Telegram, должности"
					Icon={Search}
				/>
				<div className="flex gap-2 overflow-x-auto pb-1">
					{FILTERS.map((filter) => (
						<button
							key={filter.value}
							type="button"
							onClick={() => setRoleFilter(filter.value)}
							className={[
								'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors',
								roleFilter === filter.value
									? 'border-(--color-brand-orange) text-(--color-brand-orange) bg-(--color-brand-orange)/10'
									: 'border-(--color-border) text-(--color-text-secondary) bg-(--color-bg-primary)'
							].join(' ')}>
							{filter.label}
						</button>
					))}
				</div>
			</div>

			{filteredUsers.length === 0 ? (
				<EmptyState
					title="Никого не нашли"
					description="Сбросьте фильтр или измените поисковый запрос."
					actionLabel="Сбросить фильтры"
					onAction={() => {
						setSearch('');
						setRoleFilter('all');
					}}
				/>
			) : (
				<div className="space-y-3">
					{filteredUsers.map((user) => (
						<div
							key={user.id}
							className={[
								'rounded-2xl border p-4 flex gap-5',
								user.role === UserRole.GUARDIAN
									? 'border-amber-500/30 bg-amber-500/5'
									: 'border-(--color-border) bg-(--color-bg-secondary)'
							].join(' ')}>
							<div className="shrink-0 rounded-full overflow-hidden w-16 h-16 bg-(--color-bg-primary) flex items-center justify-center">
								{user.avatar ? (
									<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
								) : (
									<UserIcon size={16} />
								)}
							</div>
							<div className="space-y-3 w-full">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<Link
											to={ROUTES.user.replace(':id', user.id)}
											className="text-base font-semibold hover:text-(--color-brand-orange) transition-colors wrap-break-word">
											{user.name}
										</Link>
										<p className="text-xs text-(--color-text-secondary) break-all">{user.email}</p>
									</div>
									<div className="inline-flex items-center gap-1 rounded-full border border-(--color-border) px-2.5 py-1 text-xs text-(--color-text-secondary)">
										<Shield size={12} />
										{ROLE_LABELS[user.role]}
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
									<div>
										<p className="text-xs text-(--color-text-secondary)">Должность</p>
										<p>{user.position || '—'}</p>
									</div>
									<div>
										<p className="text-xs text-(--color-text-secondary)">Telegram</p>
										<a
											href={getUserTelegramLink(user.telegram)}
											target="_blank"
											rel="noopener noreferrer"
											className="underline hover:text-(--color-brand-orange) transition-colors">
											{user.telegram}
										</a>
									</div>
								</div>

								{user.role === UserRole.GUARDIAN && (
									<Link
										to={ROUTES.guardian.replace(':id', user.id)}
										className="inline-flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 underline">
										Открыть профиль опекуна
									</Link>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
									<UserRoleSelect userId={user.id} currentRole={user.role} />
									<div className="flex items-end">
										<UserBannedToggle
											userId={user.id}
											banned={user.banned}
											targetRole={user.role}
											variant={user.role === UserRole.GUARDIAN ? 'guardian' : 'user'}
											className="w-full justify-center py-2.5 text-sm"
										/>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{isInviteModalOpen && <InviteVolunteerModal onClose={() => setIsInviteModalOpen(false)} />}
		</div>
	);
};

export default UsersPage;
