import { ArrowRight, HeartHandshake } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { UrgentCampaignCard, useCampaignsQuery } from '../../../entities/campaign';
import { CampaignDonationModal, useCampaignDonation } from '../../../features/campaign-donation';
import { CampaignDetailModal, useCampaignDetail } from '../../../features/campaign-detail';
import { ROUTES } from '../../../shared/config/routes';
import { useInView } from '../../../shared/lib/use-in-view';

const slogans = [
	'Каждый рубль — это шаг к новой жизни',
	'Они верят в людей. Оправдайте их доверие',
	'Маленький жест — огромное спасение'
];

export const UrgentCampaignsSection = (): JSX.Element => {
	const { ref: headerRef, inView: headerInView } = useInView();

	const campaignsQuery = useCampaignsQuery();
	const campaigns = (campaignsQuery.data ?? []).slice(0, 6);

	const detail = useCampaignDetail();
	const donation = useCampaignDonation();

	return (
		<section className="w-full px-4 md:px-12 xl:px-12 pb-24 mx-auto max-w-[1920px]">
			<div ref={headerRef as React.RefObject<HTMLDivElement>} className="mb-10">
				<div
					style={{
						opacity: headerInView ? 1 : 0,
						transform: headerInView ? 'translateY(0)' : 'translateY(32px)',
						transition:
							'opacity 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
					}}
					className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
					<div>
						<div className="inline-flex items-center gap-2 bg-(--color-brand-brown-soft) text-(--color-brand-accent) text-sm font-bold px-4 py-2 rounded-full mb-4">
							<HeartHandshake className="w-4 h-4" />
							Срочные сборы
						</div>
						<h2 className="text-[36px] md:text-[44px] font-bold text-(--color-text-primary) leading-tight tracking-tight">
							Им нужна твоя
							<br />
							<span className="text-(--color-brand-accent)">помощь прямо сейчас</span>
						</h2>
					</div>

					<Link
						to={ROUTES.campaigns}
						className="inline-flex items-center gap-2 text-(--color-text-primary) font-semibold text-base hover:text-(--color-brand-accent) transition-colors group shrink-0 mb-1">
						Все сборы
						<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
					</Link>
				</div>

				<div
					style={{
						opacity: headerInView ? 1 : 0,
						transform: headerInView ? 'translateY(0)' : 'translateY(20px)',
						transition:
							'opacity 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 150ms, transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 150ms'
					}}
					className="mt-4 flex flex-wrap gap-3">
					{slogans.map((s, i) => (
						<span
							key={i}
							className="text-base text-(--color-text-secondary) font-medium px-4 py-2 bg-(--color-brand-brown-soft) rounded-full">
							{s}
						</span>
					))}
				</div>
			</div>

			{campaignsQuery.isPending && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[0, 1, 2].map((i) => (
						<div key={i} className="rounded-[32px] bg-(--color-brand-brown-soft) animate-pulse h-[480px]" />
					))}
				</div>
			)}

			{campaignsQuery.isError && (
				<div className="rounded-[32px] bg-(--color-brand-brown-soft) p-10 text-center">
					<p className="text-xl font-semibold text-(--color-text-primary)">Не удалось загрузить сборы</p>
					<p className="text-base text-(--color-text-secondary) mt-2">Попробуйте обновить страницу</p>
				</div>
			)}

			{!campaignsQuery.isPending && !campaignsQuery.isError && campaigns.length === 0 && (
				<div className="rounded-[32px] bg-(--color-brand-brown-soft) p-10 text-center">
					<p className="text-xl font-semibold text-(--color-text-primary)">
						Сейчас нет активных срочных сборов
					</p>
					<p className="text-base text-(--color-text-secondary) mt-2">
						Мы обновим страницу, как только появятся новые
					</p>
				</div>
			)}

			{campaigns.length > 0 && (
				<div
					className={`grid grid-cols-1 gap-6 ${
						campaigns.length === 1
							? 'md:grid-cols-1 max-w-lg'
							: campaigns.length === 2
								? 'md:grid-cols-2'
								: 'md:grid-cols-2 lg:grid-cols-3'
					}`}>
					{campaigns.map((campaign, i) => (
						<UrgentCampaignCard
							key={campaign.id}
							campaign={campaign}
							delay={i * 150}
							featured={campaigns.length === 3 && i === 0}
							onDetailClick={detail.open}
							onDonateClick={donation.openForCampaign}
						/>
					))}
				</div>
			)}

			<CampaignDetailModal
				campaign={detail.campaign}
				open={detail.isOpen}
				onClose={detail.close}
				onDonateClick={donation.openForCampaign}
			/>

			<CampaignDonationModal
				open={donation.isOpen}
				campaign={donation.selectedCampaign}
				amountRub={donation.amountRub}
				onAmountChange={donation.setAmountRub}
				onClose={donation.close}
			/>
		</section>
	);
};
