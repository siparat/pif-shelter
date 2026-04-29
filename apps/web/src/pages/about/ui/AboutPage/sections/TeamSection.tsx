import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { TeamMember, TeamMemberCard } from '../../../../../entities/team';
import { ROUTES } from '../../../../../shared/config/routes';
import { getMediaUrl } from '../../../../../shared/lib/get-media-url';

interface TeamSectionProps {
	teamMembers: TeamMember[];
}

export const TeamSection = ({ teamMembers }: TeamSectionProps): JSX.Element => {
	const admin = teamMembers.find((member) => member.telegram);
	const volunteerHref = admin ? `https://t.me/${admin.telegram.replace('@', '')}` : undefined;

	return (
		<section>
			<h2 className="section-title mb-8">Команда</h2>

			<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{teamMembers.map((member) => (
					<TeamMemberCard key={member.id} member={member} getAvatarUrl={getMediaUrl} />
				))}
			</div>

			<div className="mt-10 flex flex-col items-center gap-4 text-center">
				<p className="text-[15px] font-semibold text-(--color-text-secondary)">
					Хочешь стать частью команды? Мы тебя ждём!
				</p>
				{volunteerHref ? (
					<a
						href={volunteerHref}
						target="_blank"
						rel="noreferrer"
						className="inline-flex h-11 items-center justify-center rounded-full bg-(--color-brand-brown) px-8 text-[15px] font-semibold text-(--color-text-on-dark) transition-[transform,background-color] duration-150 hover:scale-[1.02] hover:bg-(--color-brand-brown-strong)">
						Стать волонтёром
					</a>
				) : (
					<Link
						to={ROUTES.help}
						className="inline-flex h-11 items-center justify-center rounded-full bg-(--color-brand-brown) px-8 text-[15px] font-semibold text-(--color-text-on-dark) transition-[transform,background-color] duration-150 hover:scale-[1.02] hover:bg-(--color-brand-brown-strong)">
						Стать волонтёром
					</Link>
				)}
			</div>
		</section>
	);
};
