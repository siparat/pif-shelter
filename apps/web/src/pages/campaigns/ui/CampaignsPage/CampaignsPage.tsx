import { JSX } from 'react';
import { useCampaignsQuery } from '../../../../entities/campaign';
import { CampaignDonationModal, useCampaignDonation } from '../../../../features/campaign-donation';
import { CampaignsGridSection, CampaignsHeroSection, CampaignTrustSection } from './sections';

export const CampaignsPage = (): JSX.Element => {
	const donation = useCampaignDonation();
	const campaignsQuery = useCampaignsQuery();
	const campaigns = campaignsQuery.data ?? [];

	return (
		<>
			<div className="flex flex-col gap-8 pb-8 md:gap-10">
				<CampaignsHeroSection
					onDonateNow={() => campaigns[0] && donation.openForCampaign(campaigns[0])}
					canDonateNow={campaigns.length > 0}
				/>
				{campaignsQuery.isPending ? (
					<section className="rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
						Загружаем срочные сборы...
					</section>
				) : null}
				{campaignsQuery.isError ? (
					<section className="rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center">
						<p className="text-(--color-text-primary)">Не удалось загрузить сборы. Попробуйте позже.</p>
					</section>
				) : null}
				{!campaignsQuery.isPending && !campaignsQuery.isError && campaigns.length === 0 ? (
					<section className="rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
						Сейчас нет активных срочных сборов. Мы обновим страницу, как только появятся новые.
					</section>
				) : null}
				{campaigns.length > 0 ? (
					<CampaignsGridSection campaigns={campaigns} onDonateClick={donation.openForCampaign} />
				) : null}
				<CampaignTrustSection />
			</div>
			<CampaignDonationModal
				open={donation.isOpen}
				campaign={donation.selectedCampaign}
				amountRub={donation.amountRub}
				onAmountChange={donation.setAmountRub}
				onClose={donation.close}
			/>
		</>
	);
};

export default CampaignsPage;
