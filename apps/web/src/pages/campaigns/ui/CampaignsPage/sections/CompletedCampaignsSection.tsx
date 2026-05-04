import { JSX } from 'react';
import { Campaign, CampaignCard } from '../../../../../entities/campaign';

type CompletedCampaignsSectionProps = {
	campaigns: Campaign[];
};

export const CompletedCampaignsSection = ({ campaigns }: CompletedCampaignsSectionProps): JSX.Element => {
	return (
		<section aria-labelledby="completed-campaigns-title" className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-3">
				<h2 id="completed-campaigns-title" className="text-2xl font-bold text-(--color-text-primary)">
					Завершённые сборы
				</h2>
				<span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
					{campaigns.length} завершено
				</span>
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
				{campaigns.map((campaign) => (
					<CampaignCard key={campaign.id} campaign={campaign} onDonateClick={() => null} />
				))}
			</div>
		</section>
	);
};
