import { UserRole } from '@pif/shared';
import { AlertTriangle, Calendar, Mail, MessageCircle } from 'lucide-react';
import { JSX } from 'react';
import { GuardianProfileUser } from '../../../../entities/guardian';
import { TelegramUnreachableToggle } from '../../../../features/user-telegram-unreachable';
import { getUserTelegramLink } from '../../../../shared/lib';
import { Badge } from '../../../../shared/ui';

interface Props {
	user: GuardianProfileUser;
}

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

const formatDate = (iso: string | null): string => {
	if (!iso) {
		return '—';
	}
	return new Date(iso).toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});
};
const getInitials = (name: string): string => {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('');
};

export const GuardianProfileCard = ({ user }: Props): JSX.Element => {
	return (
		<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6">
			<div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
				<div className="flex items-center gap-4 md:flex-col md:items-center md:gap-3">
					{user.image ? (
						<img
							src={user.image}
							alt={user.name}
							width={96}
							height={96}
							className="w-24 h-24 rounded-full object-cover"
						/>
					) : (
						<div className="w-24 h-24 rounded-full bg-(--color-brand-orange)/20 text-(--color-brand-orange) flex items-center justify-center text-2xl font-semibold">
							{getInitials(user.name)}
						</div>
					)}
					<div className="md:text-center">
						<p className="text-xl font-semibold">{user.name}</p>
						<div className="mt-1">
							<Badge color={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
						</div>
					</div>
				</div>

				<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
					<div className="flex items-start gap-2">
						<Mail size={16} className="mt-0.5 text-(--color-text-secondary) shrink-0" />
						<div className="min-w-0">
							<p className="text-(--color-text-secondary) text-xs">Email</p>
							<p className="truncate">{user.email ?? '—'}</p>
						</div>
					</div>

					<div className="flex items-start gap-2">
						<MessageCircle size={16} className="mt-0.5 text-(--color-text-secondary) shrink-0" />
						<div className="min-w-0 flex-1">
							<p className="text-(--color-text-secondary) text-xs">Telegram</p>
							<a
								href={getUserTelegramLink(user.telegram)}
								target="_blank"
								rel="noopener noreferrer"
								className="underline">
								{user.telegram ?? '—'}
							</a>
							{user.telegramUnreachable && (
								<p className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-300">
									<AlertTriangle size={12} />
									Недоступен — бот заблокирован
								</p>
							)}
							<div className="mt-2">
								<TelegramUnreachableToggle userId={user.id} isUnreachable={user.telegramUnreachable} />
							</div>
						</div>
					</div>

					<div className="flex items-start gap-2">
						<Calendar size={16} className="mt-0.5 text-(--color-text-secondary) shrink-0" />
						<div className="min-w-0">
							<p className="text-(--color-text-secondary) text-xs">Зарегистрирован</p>
							<p>{formatDate(user.createdAt)}</p>
						</div>
					</div>

					{user.telegramChatId && (
						<div className="flex items-start gap-2">
							<MessageCircle size={16} className="mt-0.5 text-(--color-text-secondary) shrink-0" />
							<div className="min-w-0">
								<p className="text-(--color-text-secondary) text-xs">Chat ID</p>
								<p className="font-mono text-xs truncate">{user.telegramChatId}</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
