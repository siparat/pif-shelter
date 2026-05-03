import { useState } from 'react';
import { Campaign } from '../../../entities/campaign';

export const useCampaignDetail = (): {
	campaign: Campaign | null;
	isOpen: boolean;
	open: (campaign: Campaign) => void;
	close: () => void;
} => {
	const [campaign, setCampaign] = useState<Campaign | null>(null);

	const open = (c: Campaign): void => setCampaign(c);
	const close = (): void => setCampaign(null);

	return { campaign, isOpen: campaign !== null, open, close };
};
