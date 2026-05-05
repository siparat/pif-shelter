import { JSX } from 'react';
import { PageMeta } from '../../../../shared/ui/page-meta/PageMeta';
import {
	BenefitsSection,
	FaqSection,
	GuardianshipCta,
	GuardianshipHero,
	HowItWorksSection,
	PricingSection
} from './sections';

const GuardianshipPage = (): JSX.Element => (
	<div className="flex flex-col gap-5">
		<PageMeta
			title="Опекунство"
			description="Станьте опекуном животного в приюте ПИФ. Ежемесячная поддержка конкретного питомца: фото, видео и дневник его жизни для вас."
		/>
		<GuardianshipHero />
		<HowItWorksSection />
		<BenefitsSection />
		<PricingSection />
		<FaqSection />
		<GuardianshipCta />
	</div>
);

export default GuardianshipPage;
