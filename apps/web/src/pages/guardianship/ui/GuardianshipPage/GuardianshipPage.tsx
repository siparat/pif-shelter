import { JSX } from 'react';
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
		<GuardianshipHero />
		<HowItWorksSection />
		<BenefitsSection />
		<PricingSection />
		<FaqSection />
		<GuardianshipCta />
	</div>
);

export default GuardianshipPage;
