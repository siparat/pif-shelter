import { JSX } from 'react';
import { DonationFormSection, DonationsFeedSection } from '../../../../../widgets/donations';

export const DonationsSections = (): JSX.Element => {
	return (
		<section
			id="donations"
			className="py-24 px-4 md:px-12 xl:px-12 max-w-[1920px] mx-auto grid min-w-0 grid-cols-1 gap-8 sm:gap-10 min-[1400px]:grid-cols-12 min-[1400px]:items-start min-[1400px]:gap-8">
			<div className="flex min-w-0 flex-col gap-6 min-[1400px]:col-span-5">
				<DonationFormSection />
			</div>
			<div className="min-w-0 min-[1400px]:col-span-7 h-full">
				<DonationsFeedSection />
			</div>
		</section>
	);
};
