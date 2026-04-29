import { User } from 'lucide-react';
import { JSX } from 'react';
import { TeamMember } from '../model/types';

interface TeamMemberCardProps {
	member: TeamMember;
	getAvatarUrl: (path: string) => string;
}

const TelegramIcon = ({ size = 15 }: { size?: number }): JSX.Element => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
		<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
	</svg>
);

export const TeamMemberCard = ({ member, getAvatarUrl }: TeamMemberCardProps): JSX.Element => (
	<div className="flex flex-col items-center gap-3 text-center">
		<div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-(--color-brand-accent-strong) ring-offset-2 ring-offset-(--color-bg-primary)">
			{member.avatar ? (
				<img src={getAvatarUrl(member.avatar)} alt={member.name} className="h-full w-full object-cover" />
			) : (
				<div className="flex h-full w-full items-center justify-center bg-(--color-brand-brown-muted)">
					<User size={36} className="text-(--color-text-secondary)" />
				</div>
			)}
		</div>

		<div className="mt-1">
			<p className="text-[16px] font-bold leading-snug text-(--color-text-primary)">{member.name}</p>
			<p className="mt-1 text-[13px] font-medium text-(--color-text-secondary)">{member.position}</p>
		</div>

		{member.telegram ? (
			<a
				href={`https://t.me/${member.telegram.replace('@', '')}`}
				target="_blank"
				rel="noreferrer"
				aria-label={`Telegram ${member.name}`}
				className="flex w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-brown) px-4 py-2 text-[13px] font-semibold text-white transition-[transform,background-color] duration-150 hover:scale-[1.02] hover:bg-(--color-brand-brown-strong)">
				<TelegramIcon />
				Написать
			</a>
		) : (
			<span
				aria-label="Telegram недоступен"
				className="flex w-full cursor-default items-center justify-center gap-2 rounded-full bg-(--color-brand-brown-muted) px-4 py-2 text-[13px] font-semibold text-(--color-text-secondary) opacity-50">
				<TelegramIcon />
				Написать
			</span>
		)}
	</div>
);
