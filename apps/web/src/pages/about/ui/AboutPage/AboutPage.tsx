import { JSX } from 'react';
import { useTeamQuery } from '../../../../entities/team';
import { PageMeta } from '../../../../shared/ui/page-meta/PageMeta';
import { shelterFinanceYears } from '../../../../shared/config/about';
import {
	FinanceReportsSection,
	HistorySection,
	MissionSection,
	ShelterMapSection,
	TeamSection,
	TimelineSection
} from './sections';

const AboutPage = (): JSX.Element => {
	const { data: teamMembers } = useTeamQuery();

	return (
		<div className="flex flex-col gap-16 md:gap-24">
			<PageMeta
				title="О приюте"
				description="История, миссия и команда приюта ПИФ. Узнайте, как мы помогаем бездомным животным найти любящий дом."
			/>
			<HistorySection />
			<MissionSection />
			<ShelterMapSection />
			<TimelineSection />
			<TeamSection teamMembers={teamMembers ?? []} />
			<FinanceReportsSection years={shelterFinanceYears} />
		</div>
	);
};

export default AboutPage;
