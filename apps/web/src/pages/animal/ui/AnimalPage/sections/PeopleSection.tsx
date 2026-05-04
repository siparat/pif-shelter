import { GuardianshipStatusEnum } from '@pif/shared';
import { HeartHandshake, Send, ShieldCheck, User } from 'lucide-react';
import { JSX } from 'react';
import { useGuardianshipByAnimalQuery } from '../../../../../entities/guardianship';
import { TeamMember, useTeamQuery } from '../../../../../entities/team';
import { getMediaUrl } from '../../../../../shared/lib/get-media-url';

type PeopleSectionProps = {
	animalId: string;
	curatorId: string | null;
};

const PersonRow = ({
	role,
	icon: Icon,
	avatarUrl,
	name,
	subtitle,
	telegram
}: {
	role: string;
	icon: typeof User;
	avatarUrl: string | null;
	name: string;
	subtitle: string;
	telegram?: string | null;
}): JSX.Element => (
	<div className="flex items-center gap-4">
		<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-(--color-border-soft) bg-(--color-brand-brown-soft)">
			{avatarUrl ? (
				<img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
			) : (
				<div className="flex h-full w-full items-center justify-center">
					<User className="h-6 w-6 text-(--color-text-secondary)" />
				</div>
			)}
			<span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-(--color-brand-accent) text-white shadow-sm">
				<Icon className="h-3 w-3" />
			</span>
		</div>

		<div className="min-w-0 flex-1">
			<p className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary)">{role}</p>
			<p className="truncate text-base font-bold text-(--color-text-primary)">{name}</p>
			<p className="truncate text-xs text-(--color-text-secondary)">{subtitle}</p>
		</div>

		{telegram && (
			<a
				href={`https://t.me/${telegram.replace('@', '')}`}
				target="_blank"
				rel="noreferrer"
				aria-label={`Написать ${name} в Telegram`}
				className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-brand-brown) text-white transition-[transform,background-color] hover:scale-105 hover:bg-(--color-brand-brown-strong)">
				<Send className="h-4 w-4" />
			</a>
		)}
	</div>
);

export const PeopleSection = ({ animalId, curatorId }: PeopleSectionProps): JSX.Element | null => {
	const { data: team } = useTeamQuery();
	const { data: guardianship } = useGuardianshipByAnimalQuery(animalId);

	const curator: TeamMember | undefined = curatorId ? team?.find((m) => m.id === curatorId) : undefined;
	const hasActiveGuardian = guardianship && guardianship.status === GuardianshipStatusEnum.ACTIVE;

	if (!curator && !hasActiveGuardian) {
		return null;
	}

	return (
		<section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{curator && (
				<div className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-5">
					<PersonRow
						role="Куратор"
						icon={ShieldCheck}
						avatarUrl={curator.avatar ? getMediaUrl(curator.avatar) : null}
						name={curator.name}
						subtitle={curator.position || 'Волонтёр приюта'}
						telegram={curator.telegram}
					/>
				</div>
			)}

			{hasActiveGuardian && (
				<div className="rounded-3xl border border-(--color-brand-accent)/30 bg-linear-to-br from-(--color-brand-accent)/5 to-transparent p-5">
					<PersonRow
						role="Опекун"
						icon={HeartHandshake}
						avatarUrl={guardianship.guardian.avatar ? getMediaUrl(guardianship.guardian.avatar) : null}
						name={guardianship.guardian.name?.trim() || 'Анонимный опекун'}
						subtitle={`С ${new Date(guardianship.guardian.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`}
					/>
				</div>
			)}
		</section>
	);
};
