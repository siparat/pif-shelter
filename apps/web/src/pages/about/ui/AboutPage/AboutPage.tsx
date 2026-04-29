import { JSX } from 'react';
import { useTeamQuery } from '../../../../entities/team';
import { shelterFinanceYears } from '../../../../shared/config/about';
import { FinanceReportsSection, HistorySection, TeamSection, TimelineSection } from './sections';

const AboutPage = (): JSX.Element => {
	const { data: teamMembers } = useTeamQuery();

	return (
		<div className="flex flex-col gap-16 md:gap-24">
			<HistorySection />
			<TimelineSection />
			<TeamSection teamMembers={teamMembers ?? []} />
			<FinanceReportsSection years={shelterFinanceYears} />
		</div>
	);
};

export default AboutPage;
