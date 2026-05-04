import { JSX } from 'react';
import { Campaign, CampaignCard } from '../../../../../entities/campaign';

type CampaignsGridSectionProps = {
	campaigns: Campaign[];
	onDonateClick: (campaign: Campaign) => void;
};

export const CampaignsGridSection = ({ campaigns, onDonateClick }: CampaignsGridSectionProps): JSX.Element => {
	return (
		<section aria-labelledby="campaigns-grid-title" className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-3">
				<h2 id="campaigns-grid-title" className="text-2xl font-bold text-(--color-text-primary)">
					Актуальные сборы
				</h2>
				<span className="rounded-full bg-(--color-brand-brown-soft) px-3 py-1.5 text-xs font-semibold text-(--color-text-secondary)">
					{campaigns.length} активных
				</span>
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
				{campaigns.map((campaign) => (
					<CampaignCard key={campaign.id} campaign={campaign} onDonateClick={onDonateClick} />
				))}
			</div>
		</section>
	);
};
