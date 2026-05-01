import { useMemo, useState } from 'react';
import { Campaign } from '../../../entities/campaign';

export const useCampaignDonation = (): {
	isOpen: boolean;
	selectedCampaign: Campaign | null;
	amountRub: number;
	openForCampaign: (campaign: Campaign) => void;
	close: () => void;
} => {
	const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [amountRub, setAmountRub] = useState(700);

	const openForCampaign = (campaign: Campaign): void => {
		setSelectedCampaign(campaign);
		setIsOpen(true);
		setAmountRub(700);
	};

	const close = (): void => {
		setIsOpen(false);
	};

	return useMemo(
		() => ({
			isOpen,
			selectedCampaign,
			amountRub,
			setAmountRub,
			openForCampaign,
			close
		}),
		[amountRub, isOpen, selectedCampaign]
	);
};
