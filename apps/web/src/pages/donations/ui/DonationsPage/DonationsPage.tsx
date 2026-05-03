import { JSX, useState } from 'react';
import {
	DonationsHeroSection,
	DonationsHelpMode,
	FaqSection,
	MaterialHelpSection,
	TrustAndShareSection
} from './sections';
import { DonationsFeedSection, DonationFormSection } from '../../../../widgets/donations';

const DonationsPage = (): JSX.Element => {
	const [helpMode, setHelpMode] = useState<DonationsHelpMode>('money');

	return (
		<div className="flex flex-col gap-10 sm:gap-12 md:gap-16 lg:gap-20">
			<DonationsHeroSection mode={helpMode} onModeChange={setHelpMode} />

			{helpMode === 'money' ? (
				<div className="grid min-w-0 grid-cols-1 gap-8 sm:gap-10 min-[1400px]:grid-cols-12 min-[1400px]:items-start min-[1400px]:gap-8">
					<div className="flex min-w-0 flex-col gap-6 min-[1400px]:col-span-5">
						<DonationFormSection />
					</div>
					<div className="min-w-0 min-[1400px]:col-span-7 h-full">
						<DonationsFeedSection />
					</div>
				</div>
			) : (
				<MaterialHelpSection />
			)}

			<TrustAndShareSection />
			<FaqSection />
		</div>
	);
};

export default DonationsPage;
